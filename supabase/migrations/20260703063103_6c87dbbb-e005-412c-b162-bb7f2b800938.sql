
-- Enums
CREATE TYPE public.req_priority AS ENUM ('critical','high','medium','low');
CREATE TYPE public.req_complexity AS ENUM ('easy','medium','hard');
CREATE TYPE public.req_business_value AS ENUM ('high','medium','low');
CREATE TYPE public.req_status AS ENUM ('draft','review','approved','rejected','implemented');
CREATE TYPE public.req_category AS ENUM ('functional','non_functional','business');
CREATE TYPE public.story_status AS ENUM ('draft','ready','in_progress','done','blocked');
CREATE TYPE public.approval_stage AS ENUM ('business_review','technical_review','architecture_review','qa_review','client_approval');
CREATE TYPE public.approval_status AS ENUM ('pending','approved','rejected','changes_requested');
CREATE TYPE public.nfr_category AS ENUM ('performance','security','scalability','availability','accessibility','localization','maintainability','compliance','monitoring','logging','backup','recovery','encryption');

-- Touch trigger fn already exists: public.tg_touch_updated_at()

-- ================= project_overview =================
CREATE TABLE public.project_overview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  client_name text,
  business_domain text,
  industry text,
  project_type text,
  expected_users text,
  expected_traffic text,
  tech_preference text,
  methodology text,
  timeline text,
  budget text,
  risk_level text,
  problem_statement text,
  current_challenges text,
  business_opportunity text,
  expected_outcome text,
  ai_consultant_summary text,
  priority public.req_priority DEFAULT 'medium',
  status text DEFAULT 'active',
  version text DEFAULT '1.0.0',
  progress int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_overview TO authenticated;
GRANT ALL ON public.project_overview TO service_role;
ALTER TABLE public.project_overview ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read overview" ON public.project_overview FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write overview" ON public.project_overview FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_project_overview_touch BEFORE UPDATE ON public.project_overview FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ================= stakeholders =================
CREATE TABLE public.stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role text NOT NULL,
  person_name text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stakeholders TO authenticated;
GRANT ALL ON public.stakeholders TO service_role;
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read stakeholders" ON public.stakeholders FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write stakeholders" ON public.stakeholders FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_stakeholders_touch BEFORE UPDATE ON public.stakeholders FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ================= requirements =================
CREATE TABLE public.requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  priority public.req_priority DEFAULT 'medium',
  complexity public.req_complexity DEFAULT 'medium',
  business_value public.req_business_value DEFAULT 'medium',
  status public.req_status DEFAULT 'draft',
  category public.req_category DEFAULT 'functional',
  module text,
  business_rule text,
  inputs text,
  outputs text,
  validation text,
  ai_estimated_effort text,
  tags text[] DEFAULT '{}',
  version int DEFAULT 1,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, code)
);
CREATE INDEX idx_requirements_project ON public.requirements(project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirements TO authenticated;
GRANT ALL ON public.requirements TO service_role;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read reqs" ON public.requirements FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write reqs" ON public.requirements FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_requirements_touch BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ================= requirement_dependencies =================
CREATE TABLE public.requirement_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  depends_on_id uuid NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requirement_id, depends_on_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirement_dependencies TO authenticated;
GRANT ALL ON public.requirement_dependencies TO service_role;
ALTER TABLE public.requirement_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read deps" ON public.requirement_dependencies FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write deps" ON public.requirement_dependencies FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- ================= user_stories =================
CREATE TABLE public.user_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES public.requirements(id) ON DELETE SET NULL,
  code text NOT NULL,
  as_role text NOT NULL,
  i_want text NOT NULL,
  so_that text,
  priority public.req_priority DEFAULT 'medium',
  sprint text,
  epic text,
  status public.story_status DEFAULT 'draft',
  story_points int,
  risk text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stories TO authenticated;
GRANT ALL ON public.user_stories TO service_role;
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read stories" ON public.user_stories FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write stories" ON public.user_stories FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_stories_touch BEFORE UPDATE ON public.user_stories FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ================= acceptance_criteria =================
CREATE TABLE public.acceptance_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES public.requirements(id) ON DELETE CASCADE,
  story_id uuid REFERENCES public.user_stories(id) ON DELETE CASCADE,
  given_text text NOT NULL,
  when_text text NOT NULL,
  then_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acceptance_criteria TO authenticated;
GRANT ALL ON public.acceptance_criteria TO service_role;
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read ac" ON public.acceptance_criteria FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write ac" ON public.acceptance_criteria FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_ac_touch BEFORE UPDATE ON public.acceptance_criteria FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ================= non_functional_requirements =================
CREATE TABLE public.non_functional_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category public.nfr_category NOT NULL,
  metric text NOT NULL,
  target_value text,
  description text,
  priority public.req_priority DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.non_functional_requirements TO authenticated;
GRANT ALL ON public.non_functional_requirements TO service_role;
ALTER TABLE public.non_functional_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read nfr" ON public.non_functional_requirements FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write nfr" ON public.non_functional_requirements FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_nfr_touch BEFORE UPDATE ON public.non_functional_requirements FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ================= ai_analyses =================
CREATE TABLE public.ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  quality_score int,
  completeness_score int,
  ambiguities jsonb DEFAULT '[]',
  conflicts jsonb DEFAULT '[]',
  duplicates jsonb DEFAULT '[]',
  missing_items jsonb DEFAULT '[]',
  business_impact jsonb DEFAULT '{}',
  effort_estimation jsonb DEFAULT '{}',
  tech_suggestions jsonb DEFAULT '[]',
  architecture_recommendation text,
  risks jsonb DEFAULT '[]',
  raw jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_analyses TO authenticated;
GRANT ALL ON public.ai_analyses TO service_role;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read ai" ON public.ai_analyses FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write ai" ON public.ai_analyses FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- ================= requirement_versions =================
CREATE TABLE public.requirement_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  version int NOT NULL,
  snapshot jsonb NOT NULL,
  change_summary text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirement_versions TO authenticated;
GRANT ALL ON public.requirement_versions TO service_role;
ALTER TABLE public.requirement_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read versions" ON public.requirement_versions FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write versions" ON public.requirement_versions FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- ================= approvals =================
CREATE TABLE public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES public.requirements(id) ON DELETE CASCADE,
  stage public.approval_stage NOT NULL,
  reviewer_id uuid REFERENCES auth.users(id),
  reviewer_name text,
  status public.approval_status DEFAULT 'pending',
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approvals TO authenticated;
GRANT ALL ON public.approvals TO service_role;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read approvals" ON public.approvals FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write approvals" ON public.approvals FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_approvals_touch BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ================= requirement_comments =================
CREATE TABLE public.requirement_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  author_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirement_comments TO authenticated;
GRANT ALL ON public.requirement_comments TO service_role;
ALTER TABLE public.requirement_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read comments" ON public.requirement_comments FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write comments" ON public.requirement_comments FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- ================= requirement_attachments =================
CREATE TABLE public.requirement_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size int,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirement_attachments TO authenticated;
GRANT ALL ON public.requirement_attachments TO service_role;
ALTER TABLE public.requirement_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read attachments" ON public.requirement_attachments FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write attachments" ON public.requirement_attachments FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
