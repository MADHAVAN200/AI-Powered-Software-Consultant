
-- Enums
DO $$ BEGIN
  CREATE TYPE public.doc_category AS ENUM ('business','technical','architecture','api','database','user','ai','testing','deployment','operations','compliance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.doc_status AS ENUM ('draft','in_review','approved','needs_update','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category public.doc_category NOT NULL,
  doc_type text NOT NULL,
  title text NOT NULL,
  summary text,
  content_md text,
  status public.doc_status NOT NULL DEFAULT 'draft',
  current_version integer NOT NULL DEFAULT 1,
  ai_quality_score integer,
  ai_grammar_score integer,
  ai_completeness_score integer,
  ai_technical_score integer,
  tags text[] DEFAULT '{}',
  linked_artifact_id uuid REFERENCES public.artifacts(id) ON DELETE SET NULL,
  owner_id uuid,
  reviewer_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read documents" ON public.documents FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write documents" ON public.documents FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE INDEX IF NOT EXISTS documents_project_idx ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents(project_id, category);
CREATE TRIGGER trg_documents_touch BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Sections
CREATE TABLE IF NOT EXISTS public.document_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  heading text NOT NULL,
  content_md text,
  status public.doc_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_sections TO authenticated;
GRANT ALL ON public.document_sections TO service_role;
ALTER TABLE public.document_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read sections" ON public.document_sections FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write sections" ON public.document_sections FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_doc_sections_touch BEFORE UPDATE ON public.document_sections FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Versions
CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  content_md text,
  change_summary text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_versions TO authenticated;
GRANT ALL ON public.document_versions TO service_role;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read versions" ON public.document_versions FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write versions" ON public.document_versions FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- Comments
CREATE TABLE IF NOT EXISTS public.document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_comments TO authenticated;
GRANT ALL ON public.document_comments TO service_role;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read doc comments" ON public.document_comments FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write doc comments" ON public.document_comments FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- AI Reviews
CREATE TABLE IF NOT EXISTS public.document_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  overall_score integer,
  grammar_score integer,
  completeness_score integer,
  technical_score integer,
  readability_score integer,
  missing_sections text[] DEFAULT '{}',
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_reviews TO authenticated;
GRANT ALL ON public.document_reviews TO service_role;
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read doc reviews" ON public.document_reviews FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write doc reviews" ON public.document_reviews FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- Approvals
CREATE TABLE IF NOT EXISTS public.document_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage text NOT NULL,
  approver_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_approvals TO authenticated;
GRANT ALL ON public.document_approvals TO service_role;
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read doc approvals" ON public.document_approvals FOR SELECT TO authenticated USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "members write doc approvals" ON public.document_approvals FOR ALL TO authenticated USING (public.is_project_member(project_id, auth.uid())) WITH CHECK (public.is_project_member(project_id, auth.uid()));

-- Templates (project_id nullable => global templates)
CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  category public.doc_category NOT NULL,
  doc_type text NOT NULL,
  title text NOT NULL,
  description text,
  content_md text,
  is_global boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_templates TO authenticated;
GRANT ALL ON public.document_templates TO service_role;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read global or project templates" ON public.document_templates FOR SELECT TO authenticated
  USING (is_global = true OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid())));
CREATE POLICY "write project templates" ON public.document_templates FOR ALL TO authenticated
  USING (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
  WITH CHECK (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_doc_templates_touch BEFORE UPDATE ON public.document_templates FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Seed global templates
INSERT INTO public.document_templates (category, doc_type, title, description, content_md, is_global) VALUES
  ('business','brd','Business Requirement Document (BRD)','Standard BRD outline','# Business Requirement Document\n\n## 1. Executive Summary\n## 2. Business Objectives\n## 3. Scope\n## 4. Stakeholders\n## 5. Business Requirements\n## 6. Assumptions & Constraints\n## 7. Success Metrics\n## 8. Approval', true),
  ('business','prd','Product Requirement Document (PRD)','Standard PRD outline','# PRD\n\n## Vision\n## Personas\n## User Stories\n## Functional Requirements\n## Non-Functional Requirements\n## Milestones\n## Metrics', true),
  ('business','srs','Software Requirement Specification (SRS)','IEEE 830-style SRS','# SRS\n\n## 1. Introduction\n## 2. Overall Description\n## 3. Specific Requirements\n## 4. External Interfaces\n## 5. Design Constraints\n## 6. Appendices', true),
  ('architecture','hld','High Level Design (HLD)','System-wide architecture template','# HLD\n\n## System Overview\n## Architecture Diagram\n## Components\n## Data Flow\n## Integrations\n## Non-Functional Considerations', true),
  ('architecture','lld','Low Level Design (LLD)','Component-level design template','# LLD\n\n## Module Overview\n## Class / Function Design\n## Sequence Diagrams\n## Error Handling\n## Test Considerations', true),
  ('api','api_spec','API Specification','OpenAPI-style outline','# API Spec\n\n## Overview\n## Authentication\n## Endpoints\n## Error Codes\n## Rate Limits\n## Examples', true),
  ('database','db_schema','Database Schema Documentation','ER + table definitions','# Database Documentation\n\n## ER Diagram\n## Tables\n## Relationships\n## Indexes & Constraints\n## Migrations', true),
  ('testing','test_plan','Test Plan','Master test plan template','# Test Plan\n\n## Scope\n## Test Strategy\n## Environments\n## Entry / Exit Criteria\n## Risks\n## Deliverables', true),
  ('deployment','devops_guide','DevOps Guide','Deployment + CI/CD outline','# DevOps Guide\n\n## Environments\n## Pipelines\n## Infrastructure\n## Secrets Management\n## Rollback', true),
  ('operations','sop','Standard Operating Procedure (SOP)','Runbook / SOP outline','# SOP\n\n## Purpose\n## Scope\n## Procedure Steps\n## Roles & Responsibilities\n## Escalation', true),
  ('compliance','gdpr','GDPR Compliance Checklist','GDPR readiness template','# GDPR\n\n## Data Inventory\n## Lawful Basis\n## Subject Rights\n## DPIA\n## Breach Response', true),
  ('compliance','iso27001','ISO 27001 Controls','ISO controls checklist','# ISO 27001\n\n## Context\n## Leadership\n## Planning\n## Support\n## Operation\n## Performance Evaluation\n## Improvement', true),
  ('user','user_manual','User Manual','End-user manual outline','# User Manual\n\n## Getting Started\n## Features\n## FAQ\n## Troubleshooting\n## Support', true),
  ('user','release_notes','Release Notes','Release notes outline','# Release Notes\n\n## Version\n## New Features\n## Improvements\n## Bug Fixes\n## Known Issues', true);
