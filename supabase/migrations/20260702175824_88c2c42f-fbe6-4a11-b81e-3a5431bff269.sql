
-- Roles enum + table (kept separate from profiles for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.project_role AS ENUM ('owner', 'editor', 'reviewer', 'viewer');
CREATE TYPE public.artifact_kind AS ENUM (
  'srs','brd','prd','user_stories','tech_design','api_docs','architecture_doc',
  'database_doc','deployment_guide','user_manual',
  'architecture_review','repo_review','uiux_review','database_review','api_review',
  'test_cases','risk_analysis','security_review','knowledge_note'
);

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage their own profile"
  ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tech_stack TEXT[] DEFAULT '{}',
  repo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- project_members
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role project_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Helper: is caller a member of the project?
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = _project_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.projects WHERE id = _project_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.project_role_of(_project_id UUID, _user_id UUID)
RETURNS project_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role FROM public.project_members WHERE project_id = _project_id AND user_id = _user_id),
    CASE WHEN EXISTS(SELECT 1 FROM public.projects WHERE id = _project_id AND owner_id = _user_id)
         THEN 'owner'::project_role ELSE NULL END
  )
$$;

-- Projects policies
CREATE POLICY "Members can view projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.is_project_member(id, auth.uid()));
CREATE POLICY "Authenticated can create projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update project"
  ON public.projects FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can delete project"
  ON public.projects FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Auto-add owner as project_member on project insert
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_add_owner_member AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();

-- project_members policies
CREATE POLICY "Members can view team"
  ON public.project_members FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Owner can manage members"
  ON public.project_members FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()))
  WITH CHECK (EXISTS(SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()));

-- artifacts (unified table for all generated/reviewed items)
CREATE TABLE public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind artifact_kind NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.artifacts(project_id, kind);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artifacts TO authenticated;
GRANT ALL ON public.artifacts TO service_role;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read artifacts"
  ON public.artifacts FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Editors can create artifacts"
  ON public.artifacts FOR INSERT TO authenticated
  WITH CHECK (public.project_role_of(project_id, auth.uid()) IN ('owner','editor','reviewer'));
CREATE POLICY "Editors can update artifacts"
  ON public.artifacts FOR UPDATE TO authenticated
  USING (public.project_role_of(project_id, auth.uid()) IN ('owner','editor'))
  WITH CHECK (public.project_role_of(project_id, auth.uid()) IN ('owner','editor'));
CREATE POLICY "Owner/editor can delete artifacts"
  ON public.artifacts FOR DELETE TO authenticated
  USING (public.project_role_of(project_id, auth.uid()) IN ('owner','editor'));

-- quality_scores (latest snapshot per project)
CREATE TABLE public.quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirements INTEGER NOT NULL DEFAULT 0,
  architecture INTEGER NOT NULL DEFAULT 0,
  documentation INTEGER NOT NULL DEFAULT 0,
  security INTEGER NOT NULL DEFAULT 0,
  ui INTEGER NOT NULL DEFAULT 0,
  database INTEGER NOT NULL DEFAULT 0,
  apis INTEGER NOT NULL DEFAULT 0,
  testing INTEGER NOT NULL DEFAULT 0,
  maintainability INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ON public.quality_scores(project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_scores TO authenticated;
GRANT ALL ON public.quality_scores TO service_role;
ALTER TABLE public.quality_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view scores"
  ON public.quality_scores FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Editors can upsert scores"
  ON public.quality_scores FOR ALL TO authenticated
  USING (public.project_role_of(project_id, auth.uid()) IN ('owner','editor'))
  WITH CHECK (public.project_role_of(project_id, auth.uid()) IN ('owner','editor'));

-- activity_log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.activity_log(project_id, created_at DESC);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view activity"
  ON public.activity_log FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Members can log activity"
  ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (public.is_project_member(project_id, auth.uid()) AND actor_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_touch_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER trg_touch_projects BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER trg_touch_artifacts BEFORE UPDATE ON public.artifacts
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER trg_touch_scores BEFORE UPDATE ON public.quality_scores
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Auto-create profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
