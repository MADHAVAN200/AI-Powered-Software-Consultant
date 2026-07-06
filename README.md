# Aristotle — AI Software Consultant Platform

Aristotle is an **AI-powered Software Consulting & SDLC Intelligence Platform**. It functions as an always-on team of specialized AI consultants (Business Analyst, Architect, Security Auditor, DevOps Engineer, QA, DBA, API Consultant, Risk Advisor, and SRE) that continuously analyze project artifacts and keep the entire Software Development Life Cycle (SDLC) **traceable, explainable, and governable**.

Every module is connected end-to-end:

```
Requirements ──> Architecture ──> Repository ──> Database ──> API ──> UI/UX
     └──> Test Cases ──> Risk Analysis ──> Documentation ──> Knowledge Hub
     └──> Security Audit ──> DevOps & CI/CD ──> Performance & SRE
```

Whenever a requirement changes, the platform maps and explains exactly which database schemas, API contracts, unit tests, code files, documentation pages, and deployment pipelines are affected.

---

## Table of Contents

1. [Key Capabilities](#key-capabilities)
2. [Platform Modules](#platform-modules)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment & Secrets](#environment--secrets)
8. [Authentication & Roles](#authentication--roles)
9. [Database & Row-Level Security](#database--row-level-security)
10. [AI Integration & Embeddings](#ai-integration--embeddings)
11. [Deployment](#deployment)
12. [Roadmap](#roadmap)

---

## Key Capabilities

Unlike wiki platforms or task trackers that store static files, Aristotle is an active reasoning platform:

- **Continuous Consultation** — Every module includes a contextual AI assistant grounded in active project files to answer design, testing, database, and security queries.
- **Automated Generation** — Requirements, ERDs, OpenAPI specs, test plans, risk tables, and onboarding runbooks are generated and kept in sync.
- **Traceability Engine** — Connects specifications directly to components, code, schemas, APIs, tests, and deployments to prevent architectural drift.
- **Governance & Posture Monitoring** — Tracks compliance posture, security alerts, code technical debt, RPN scores, and API style guides in real-time.
- **Organizational Memory** — Captures architectural decisions, reviews, and logs to ensure institutional knowledge outlives individual team changes.

---

## Platform Modules

The platform is divided into **15 specialized modules** organized inside a single unified workspace. Each module features a summary dashboard, a filterable items register, custom AI assistants, and visual tracing diagrams:

| Module | Role | Core Functions |
|---|---|---|
| **Overview** | Workspace Dashboard | Health scoring, delivery signals, system compliance posture, and AI audit logs. |
| **Requirements** | AI Business Analyst | capturing functional & NFRs, user story generation, MoSCoW/RICE priority scoring, and requirements RTM. |
| **Documentation** | AI Technical Writer | Generating living specifications (BRD, SRS, HLD, LLD), runbooks, and changelogs synced directly with git history. |
| **Architecture** | AI Solution Architect | Designing pattern recommendations, scaling evaluation, component dependency graphs, and ADRs. |
| **Repository** | AI Code Consultant | Static analysis of PRs, identifying complexity hotspots, cataloging tech debt, and natural-language codebase walkthroughs. |
| **UI / UX** | AI Design Consultant | WCAG accessibility checks, heuristic consistency, contrast audits, and tracing views to requirements. |
| **Database** | AI Data Architect | Visual ER diagrams, normal form analysis (1NF-3NF), indexing/query advisor, and migration impact assessments. |
| **API** | AI API Governance | REST & GraphQL contract design, OpenAPI drafting, breaking-change static checks, and lint rule enforcement. |
| **Test Cases** | AI QA Consultant | Unit, integration, E2E, and regression test plan generation, flaky test triaging, and defect analytics. |
| **Risk Analysis** | AI Risk Consultant | RPN mapping, automated risk registers, probability-impact heatmaps, and mitigation tracking. |
| **Security Audit** | AI Security Consultant | SAST scans, OWASP Top 10 mapping, secret detection, and dependency package vulnerability audits. |
| **Performance & SRE** | AI SRE Consultant | Bottleneck profiling, database slow-query suggestions, cloud cache/CDN architecture, and scaling guidelines. |
| **DevOps & CI/CD** | AI DevOps Architect | Pipeline linting, Docker & Terraform config reviews, infrastructure cost optimization, and CI/CD script generators. |
| **Knowledge Hub** | Enterprise Second Brain | Hybrid semantic search (RAG), project knowledge graphs, decision matrices, and onboarding briefings. |
| **Assistant** | Cross-Module Copilot | Conversation panel with full multi-module context for complex cross-cutting queries. |
| **Team** | Governance Manager | Role assignments, workload capacities, RACI matrix builders, and change approval workflows. |

---

## Architecture

Aristotle is a edge-optimized **full-stack TanStack Start** application designed for fast startup, utilizing server functions for secure backend logic and PostgreSQL for structured data and vector embeddings.

```
┌─────────────────────────────────────────────────────────────┐
│  Browser Client (React 19 + TanStack Router + Tailwind v4)   │
│  ─ Layout shells, sidebars, interactive RAG drawers         │
└──────────────┬──────────────────────────────────────────────┘
               │ useServerFn (Type-safe RPC over HTTP)
┌──────────────▼──────────────────────────────────────────────┐
│  TanStack Start Server (Vite 6 + Edge Worker Runtime)       │
│  ─ requireSupabaseAuth middleware, endpoint validators      │
│  ─ Public endpoints under /api/public/* (signature-verified)│
└──────┬───────────────────────────┬──────────────────────────┘
       │                           │
┌──────▼────────────┐    ┌─────────▼──────────────────────────┐
│  Supabase DB      │    │  AI Engine (Gemini / OpenAI API)   │
│  ─ PostgreSQL     │    │  ─ Chat models (Gemini 2.5 Flash)  │
│  ─ Row-Level Sec  │    │  ─ Embeddings (Gemini Embeddings)  │
│  ─ pgvector RAG   │    └────────────────────────────────────┘
└───────────────────┘
```

### Architectural Safeguards
- **Server Functions**: All database mutations and external integrations go through `createServerFn` handlers to prevent clients from executing raw queries or modifying DB contexts directly.
- **Row-Level Security (RLS)**: Enforced on all Postgres tables. Authorization uses user roles stored in `user_roles` with recursive-safe policy execution.
- **Public API Isolation**: Endpoints in `/api/public/` require cryptographic signature validation for incoming webhooks or triggers.

---

## Tech Stack

- **Framework**: TanStack Start v1 (React 19, Server-Side Rendering, edge adapter)
- **Tooling/Bundler**: Vite 6 (stable dev server, lightningcss)
- **Styling**: Tailwind CSS v4 (native `@import` architecture, design token variables in `src/styles.css`)
- **Components**: Radix UI primitives, custom `font-display` typography, `lucide-react` icons
- **State Management**: TanStack Query (cached route loaders, query invalidation)
- **Database**: PostgreSQL (Supabase) with `pgvector` for similarity calculations
- **Authentication**: Supabase Auth (JWT payload validation on server functions)

---

## Project Structure

```
src/
├─ routes/
│  ├─ __root.tsx                  # Root layout, HTML skeleton, toaster UI
│  ├─ index.tsx                   # Landing page, Project Health Card, Module list
│  ├─ auth.tsx, login.tsx         # Auth entry points
│  ├─ _authenticated/
│  │  ├─ route.tsx                # Auth gate and sidebar/header layout shell
│  │  ├─ dashboard.tsx            # Portfolio dashboard
│  │  ├─ projects.$projectId.tsx  # Project summary & quality metrics
│  │  └─ modules/
│  │     ├─ requirements.tsx      # Business Analyst
│  │     ├─ documentation.tsx     # Tech Writer
│  │     ├─ architecture.tsx      # Architect
│  │     ├─ repository.tsx        # Code Consultant
│  │     ├─ uiux.tsx              # UIUX Auditor
│  │     ├─ database.tsx          # DBA
│  │     ├─ api.tsx               # API Auditor
│  │     ├─ tests.tsx             # QA Consultant
│  │     ├─ risks.tsx             # Risk Advisor
│  │     ├─ knowledge.tsx         # Second Brain
│  │     ├─ assistant.tsx         # Chat drawer
│  │     └─ team.tsx              # Team & RACI
│  └─ api/public/*                # External webhooks
├─ components/                    # Reusable components & blocks
├─ hooks/                         # React hooks (current project state, auth context)
├─ lib/                           # *.functions.ts (server RPCs), demo mock content
├─ integrations/supabase/         # Supabase client interfaces
├─ styles.css                     # Main stylesheet (Tailwind v4 tokens)
└─ start.ts                       # SSR entry configuration & middleware
```

---

## Getting Started

### 1. Prerequisites
- Node.js version 20.19+ or 22.12+ (or compatible environment running v22.11.0+)
- A PostgreSQL database with the `pgvector` extension enabled
- A Gemini API key (or OpenAI compatible endpoint API key)

### 2. Setup Environment Variables
Create a `.env` file in the root directory:
```env
# Client-side (accessible in browser)
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"

# Server-side
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# AI Configuration
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Installation & Local Run
```bash
# Install dependencies
npm install

# Start the local development server (runs at http://localhost:8080)
npm start

# Run the production build compilation
npm run build
```

The dev server will automatically load a seeded mock project ("TaskFlow") so you can explore all modules immediately.

---

## Authentication & Roles

User sessions are handled via standard Supabase JWT validation. Routes wrapped in `src/routes/_authenticated/` enforce login checks via the `requireSupabaseAuth` middleware. 

Permissions are mapped to these workspace roles:
- **Owner**: Complete read/write access, user management.
- **Architect**: Can modify design patterns, database schemas, and documentation.
- **Developer**: Can write code reviews, inspect APIs, and query database advisors.
- **QA**: Can generate and manage test cases, execute regressions.
- **Consultant**: Can run risk registers, security audits, and heuristic audits.
- **Viewer**: Read-only access across modules.

---

## Database & Row-Level Security

PostgreSQL tables enforce Row-Level Security policies. Below is the standard migration layout for storing project deliverables:

```sql
-- Enable Vector support
create extension if not exists vector;

-- Documents table for RAG embeddings
create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  content text not null,
  embedding vector(3072) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- HNSW Index for fast similarity queries
create index on documents using hnsw (embedding vector_cosine_ops);

-- Turn on RLS
alter table documents enable row level security;

-- Enforce project membership policy
create policy "Users can view documents in their projects"
  on documents for select
  using (is_project_member(project_id, auth.uid()));
```

---

## AI Integration & Embeddings

All generative AI features (chat, specification generation, code reviews, schema advisors) are routed through server functions and query the model specified in environment variables:

- **Chat & Reasoning Model**: `google/gemini-2.5-flash` or similar OpenAI-compatible model.
- **Embeddings Model**: `google/gemini-embedding-001` (producing 3072-dimension vectors).

RAG searches calculate cosine similarity using Postgres functions, returning cited items directly to the UI panel.

---

## Deployment

Aristotle compiles to standard production bundles that can be hosted on serverless runtimes or static node backends:

- **Cloudflare Pages / Workers**: Fits the TanStack Start edge deployment profile using the cloudflare adapter.
- **Standard Node Server**: Can be run locally or inside a Docker container via the standard node entrypoints.

---

## Roadmap

- [ ] **Collaborative Canvas**: Real-time collaborative editing on system architecture diagrams.
- [ ] **Continuous Integration Integrations**: Direct GitHub/GitLab action integrations to audit code dynamically on every push.
- [ ] **Cost Audit Reports**: AI cost forecasting based on Terraform config and cloud footprint logs.
- [ ] **Multi-Project Graphs**: Dependency and risk impact checks across a portfolio of multiple repositories.
