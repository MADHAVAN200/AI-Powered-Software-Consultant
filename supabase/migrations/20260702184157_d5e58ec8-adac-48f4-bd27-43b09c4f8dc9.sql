
-- Extend policies to include anon role (anonymous sign-in) for demo mode.
-- All checks still scope to auth.uid(), so users only touch their own rows.

-- projects
DROP POLICY IF EXISTS "Authenticated can create projects" ON public.projects;
CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT TO anon, authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Members can view projects" ON public.projects;
CREATE POLICY "Members can view projects" ON public.projects
  FOR SELECT TO anon, authenticated
  USING (is_project_member(id, auth.uid()));

DROP POLICY IF EXISTS "Owner can update project" ON public.projects;
CREATE POLICY "Owner can update project" ON public.projects
  FOR UPDATE TO anon, authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owner can delete project" ON public.projects;
CREATE POLICY "Owner can delete project" ON public.projects
  FOR DELETE TO anon, authenticated
  USING (owner_id = auth.uid());

-- project_members (needed by add_owner_as_member trigger + reads)
DROP POLICY IF EXISTS "Members can view project members" ON public.project_members;
CREATE POLICY "Members can view project members" ON public.project_members
  FOR SELECT TO anon, authenticated
  USING (is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Owner can manage members" ON public.project_members;
CREATE POLICY "Owner can manage members" ON public.project_members
  FOR ALL TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
  );

-- artifacts
DROP POLICY IF EXISTS "Members can read artifacts" ON public.artifacts;
CREATE POLICY "Members can read artifacts" ON public.artifacts
  FOR SELECT TO anon, authenticated
  USING (is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Editors can create artifacts" ON public.artifacts;
CREATE POLICY "Editors can create artifacts" ON public.artifacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (project_role_of(project_id, auth.uid()) = ANY (ARRAY['owner'::project_role, 'editor'::project_role, 'reviewer'::project_role]));

DROP POLICY IF EXISTS "Editors can update artifacts" ON public.artifacts;
CREATE POLICY "Editors can update artifacts" ON public.artifacts
  FOR UPDATE TO anon, authenticated
  USING (project_role_of(project_id, auth.uid()) = ANY (ARRAY['owner'::project_role, 'editor'::project_role]))
  WITH CHECK (project_role_of(project_id, auth.uid()) = ANY (ARRAY['owner'::project_role, 'editor'::project_role]));

DROP POLICY IF EXISTS "Owner/editor can delete artifacts" ON public.artifacts;
CREATE POLICY "Owner/editor can delete artifacts" ON public.artifacts
  FOR DELETE TO anon, authenticated
  USING (project_role_of(project_id, auth.uid()) = ANY (ARRAY['owner'::project_role, 'editor'::project_role]));

-- quality_scores
DROP POLICY IF EXISTS "Members can view scores" ON public.quality_scores;
CREATE POLICY "Members can view scores" ON public.quality_scores
  FOR SELECT TO anon, authenticated
  USING (is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Editors can upsert scores" ON public.quality_scores;
CREATE POLICY "Editors can upsert scores" ON public.quality_scores
  FOR ALL TO anon, authenticated
  USING (project_role_of(project_id, auth.uid()) = ANY (ARRAY['owner'::project_role, 'editor'::project_role]))
  WITH CHECK (project_role_of(project_id, auth.uid()) = ANY (ARRAY['owner'::project_role, 'editor'::project_role]));

-- activity_log
DROP POLICY IF EXISTS "Members can view activity" ON public.activity_log;
CREATE POLICY "Members can view activity" ON public.activity_log
  FOR SELECT TO anon, authenticated
  USING (is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert activity" ON public.activity_log;
CREATE POLICY "Members can insert activity" ON public.activity_log
  FOR INSERT TO anon, authenticated
  WITH CHECK (is_project_member(project_id, auth.uid()) AND actor_id = auth.uid());

-- profiles (so handle_new_user works and users can read own profile)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO anon, authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
