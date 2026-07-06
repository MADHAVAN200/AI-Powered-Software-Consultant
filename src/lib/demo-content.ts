// Rich demo content for the "TaskFlow" sample project.
// This gives users a realistic, in-depth tour of every module without
// having to generate anything themselves.

export const DEMO_PROJECT = {
  name: "TaskFlow — Team Project Management SaaS",
  description:
    "A collaborative project management platform for small-to-mid engineering teams. Kanban boards, sprints, timelines, real-time collaboration, GitHub sync, and analytics. This is a fully populated demo — explore every module to see what Aristotle generates for a real project.",
  tech_stack: [
    "TypeScript",
    "React 18",
    "Next.js 14",
    "Node.js 20",
    "PostgreSQL 15",
    "Redis",
    "Prisma",
    "TailwindCSS",
    "WebSocket",
    "Docker",
    "AWS",
    "GitHub Actions",
  ],
  repo_url: "https://github.com/acme/taskflow",
};

export const DEMO_SCORES = {
  requirements: 88,
  architecture: 82,
  documentation: 79,
  security: 71,
  ui: 85,
  database: 84,
  apis: 80,
  testing: 68,
  maintainability: 77,
};

type Artifact = { kind: string; title: string; content_md: string; score?: number };

export const DEMO_ARTIFACTS: Artifact[] = [
  {
    kind: "srs",
    title: "Software Requirements Specification v1.2",
    score: 88,
    content_md: `# Software Requirements Specification — TaskFlow

**Version:** 1.2   **Status:** Approved   **Owner:** Product

## 1. Introduction
### 1.1 Purpose
This SRS defines functional and non-functional requirements for **TaskFlow**, a collaborative project management platform targeting engineering teams of 5–50 people.

### 1.2 Scope
TaskFlow enables teams to plan sprints, track work on Kanban boards, coordinate through real-time comments and mentions, and sync with GitHub issues and pull requests.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Workspace | Top-level tenant boundary. One org = one workspace. |
| Board | A Kanban board scoped to a project. |
| Card | An individual work item on a board. |
| Sprint | A time-boxed iteration (typically 2 weeks). |

## 2. Overall Description
### 2.1 Product Perspective
Web-based SaaS with responsive design; native mobile deferred to v2.

### 2.2 User Classes
- **Admin** — billing, workspace settings, user management
- **Member** — full board access, create/edit cards
- **Guest** — read-only access to specific boards
- **Integrator** — API/webhook consumer (service accounts)

### 2.3 Operating Environment
- Modern evergreen browsers (Chrome 110+, Firefox 110+, Safari 16+, Edge 110+)
- Backend deployed on AWS (us-east-1 primary, eu-west-1 replica)

## 3. Functional Requirements
### FR-1 Authentication
- FR-1.1 Users MUST be able to sign up with email + password
- FR-1.2 Users MUST be able to sign in with Google OAuth
- FR-1.3 SSO via SAML MUST be available on Business tier
- FR-1.4 Sessions MUST expire after 30 days of inactivity

### FR-2 Board Management
- FR-2.1 Users can create up to 100 boards per workspace (Pro tier)
- FR-2.2 Boards support customizable columns (min 2, max 20)
- FR-2.3 Cards can be dragged between columns with optimistic UI updates
- FR-2.4 Board state MUST be synchronized in real time across all viewers (<300ms)

### FR-3 Sprints
- FR-3.1 Sprints have configurable duration (1, 2, 3, or 4 weeks)
- FR-3.2 System MUST auto-generate a burndown chart
- FR-3.3 Unfinished cards roll over with user confirmation

### FR-4 GitHub Integration
- FR-4.1 Two-way sync of issues and cards
- FR-4.2 Auto-move card to "In Review" when a linked PR is opened
- FR-4.3 Auto-move to "Done" on PR merge

### FR-5 Notifications
- FR-5.1 In-app notifications for mentions, assignments, and due dates
- FR-5.2 Email digest (configurable: instant / hourly / daily)
- FR-5.3 Slack/Teams webhook support

## 4. Non-Functional Requirements
| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | P95 page load < 1.5s on a 10 Mbps connection |
| NFR-2 | Availability | 99.9% monthly uptime SLO |
| NFR-3 | Scalability | Support 10,000 concurrent users per region |
| NFR-4 | Security | SOC 2 Type II readiness within 12 months |
| NFR-5 | Accessibility | WCAG 2.1 Level AA conformance |
| NFR-6 | Data | GDPR + CCPA compliant; user data export within 30 days |

## 5. Assumptions & Constraints
- No offline-first support in v1 (deferred to v2)
- Rate limiting: 100 req/min per user, 1000 req/min per workspace
- All timestamps stored in UTC; rendered in user's local timezone

## 6. Traceability
Requirements traced to acceptance criteria in \`user_stories.md\` and to test cases in the QA test plan.

---
**Quality Score: 88/100** — comprehensive coverage, minor gaps in error-state requirements and audit-log specifications.`,
  },
  {
    kind: "brd",
    title: "Business Requirements Document",
    score: 84,
    content_md: `# Business Requirements Document — TaskFlow

## 1. Executive Summary
TaskFlow addresses the fragmentation problem faced by growing engineering teams who outgrow lightweight tools (Trello, Notion) but find enterprise tools (Jira, Asana) overweight, expensive, and slow. Our wedge is **speed + GitHub-native workflow** at a fraction of Jira's price.

## 2. Business Objectives
1. Reach $2M ARR by end of Year 2
2. Achieve <5% monthly churn on paid plans
3. Convert 8% of free trials to paid within 30 days
4. Achieve NPS ≥ 45 within 12 months

## 3. Market Opportunity
- **TAM:** $6.8B project management software market (2025)
- **SAM:** $1.2B — engineering-focused segment
- **SOM:** $40M — teams of 5–50 seeking Jira alternative

## 4. Stakeholders
| Role | Name | Concern |
|---|---|---|
| CEO | Ava Chen | Growth, fundraising, positioning |
| CTO | Marcus Wu | Architecture, reliability, dev velocity |
| Head of Product | Priya Rao | Roadmap, UX, prioritization |
| Head of Sales | Diego Alvarez | Enterprise features, SSO, billing |
| Compliance | Jenna Park | SOC 2, GDPR, audit logs |

## 5. Success Metrics
- Weekly Active Teams (WAT)
- Sprint Completion Rate (feature usage proxy)
- Time to First Value (< 10 min from signup to first card moved)
- Support ticket volume < 0.05 per active user per month

## 6. Pricing Model
| Tier | Price | Seats | Boards |
|---|---|---|---|
| Free | $0 | up to 3 | 3 |
| Team | $8/seat/mo | unlimited | 25 |
| Business | $16/seat/mo | unlimited | 100 + SSO + audit |
| Enterprise | Custom | unlimited | unlimited + dedicated support |

## 7. Risks
- Late entrant to a crowded market → mitigate with sharp GitHub positioning
- Enterprise sales cycle > 90 days → invest in self-serve Business tier
- AI copilots (Linear AI, Notion AI) commoditize workflows → ship AI Sprint Planner in Q3`,
  },
  {
    kind: "prd",
    title: "PRD — Sprint Planner v1",
    score: 86,
    content_md: `# Product Requirements Document — Sprint Planner v1

**Owner:** Priya Rao   **Eng Lead:** Marcus Wu   **Target Ship:** Q2 2026

## Problem
Teams spend 45–90 minutes every 2 weeks manually dragging cards into a sprint, guessing capacity, and rebalancing after standup. This is our #1 support topic ("How do I plan a sprint?") and shows up in exit surveys as a top-3 friction point.

## Goals
- Cut sprint-planning time by 60%
- Increase sprint-completion rate from 62% to 75%
- Reduce mid-sprint scope changes by 30%

## Non-Goals
- Cross-team dependency planning (v2)
- Multi-project sprint pooling (v2)
- Auto-assignment based on skills (v3)

## User Stories
### As a scrum master, I want to auto-suggest a sprint plan from the backlog
- Given a prioritized backlog with estimates
- When I click "Suggest sprint"
- Then TaskFlow recommends a set of cards fitting team velocity ± 10%

### As an engineer, I want to see my personal capacity for the sprint
- Given I have PTO scheduled
- When the sprint plan is generated
- Then my capacity is reduced proportionally and shown in a capacity bar

## Requirements
1. Velocity calculated as trailing 3-sprint average
2. Capacity respects PTO calendar integration (Google Calendar)
3. Drag-to-adjust interface with live capacity feedback
4. "Lock" cards to force-include in the plan
5. Historical view: prior 6 sprints' plan vs. actual

## UX Notes
- Split view: backlog on left, sprint plan on right
- Capacity bar turns red at 110%, yellow at 90–110%, green below
- One-click "Accept suggestion" with a diff-style preview

## Metrics
- Time from opening planner → clicking "Start sprint"
- % of suggested sprints accepted without edits
- Sprint completion rate delta

## Rollout
- Week 1–2: Internal dogfood
- Week 3: 10% beta cohort
- Week 4: 50% rollout with feature flag
- Week 5: GA + blog post

## Open Questions
- Should we surface confidence intervals on velocity? (Data science: yes, with tooltip)
- How to handle teams with < 3 sprints of history? (Fallback to team-declared capacity)`,
  },
  {
    kind: "user_stories",
    title: "User Stories & Acceptance Criteria — Core Board",
    score: 90,
    content_md: `# User Stories — Core Board Experience

## Epic: Card CRUD

### US-101 — Create a card
**As a** team member
**I want to** create a new card on a board
**So that** I can capture work to be done

**Acceptance Criteria (Gherkin):**
\`\`\`gherkin
Scenario: Create card from column header
  Given I am viewing a board with column "To Do"
  When I click the "+" button on "To Do"
  And I type "Fix login redirect bug"
  And I press Enter
  Then a new card "Fix login redirect bug" appears at the top of "To Do"
  And the card is auto-assigned to me
  And an activity entry is logged
\`\`\`

### US-102 — Edit a card inline
**As a** team member
**I want to** rename a card without opening a modal
**So that** I can iterate quickly during standup

**AC:**
- Double-click the card title enters edit mode
- Escape cancels, Enter saves
- Optimistic update; on server error, revert with toast

### US-103 — Delete a card (soft delete)
**AC:**
- Confirmation modal shown
- Card moved to Trash; recoverable for 30 days
- Only owner or workspace admin can permanently delete

## Epic: Drag & Drop

### US-201 — Drag card between columns
**AC:**
- Ghost preview follows cursor
- Column highlights on hover
- Drop triggers optimistic move + PATCH /cards/:id
- Real-time broadcast to other viewers < 300ms
- Undo toast for 5s

### US-202 — Reorder within a column
**AC:**
- Uses fractional indexing (jitter-free)
- Persists on drop
- Keyboard alternative: Ctrl+↑/↓ moves selected card

## Epic: Collaboration

### US-301 — Mention a teammate
**AC:**
- @-trigger opens autocomplete popover
- Mentioned users receive in-app notification
- If email digest enabled, included in next batch

### US-302 — Real-time cursor presence
**AC:**
- See avatars of other viewers on the board (max 8)
- See colored cursor of user actively editing a card
- Presence disconnects after 60s of inactivity

## Definition of Done
- [ ] Unit tests cover happy path + 2 error paths
- [ ] E2E test (Playwright) for main flow
- [ ] Accessibility: keyboard-navigable, screen-reader labels
- [ ] Analytics event fired
- [ ] Docs updated
- [ ] PR reviewed by 1 engineer + 1 designer`,
  },
  {
    kind: "tech_design",
    title: "Technical Design — Real-Time Sync Layer",
    score: 81,
    content_md: `# Technical Design: Real-Time Board Synchronization

## Context
TaskFlow boards must feel instant across all viewers. Target: P95 < 300ms end-to-end for a card move.

## Constraints
- Must scale to 100 concurrent viewers per board
- Must gracefully degrade on unstable connections
- No lost updates during offline reconnect

## Architecture
\`\`\`
Browser ──WebSocket──▶ Realtime Gateway (Node/Socket.IO)
                              │
                              ▼
                        Redis Pub/Sub (per-board channel)
                              │
                              ▼
                     Postgres (source of truth)
                              │
                     Change Data Capture (Debezium)
                              │
                              ▼
                       Fanout to WebSocket clients
\`\`\`

## Data Model
Cards use **fractional indexing** for ordering (LexoRank-style keys). This eliminates the need for reindexing on inserts:
\`\`\`
column A: cards ordered by string keys "a0", "a5", "aH", ...
insert between "a0" and "a5" → generate "a2"
\`\`\`

## Conflict Resolution
- Last-Writer-Wins on scalar fields (title, description)
- OT (Operational Transform) for collaborative text (description body)
- Server assigns monotonic \`revision\` per card; clients reject stale updates

## Client Reconciliation
On WebSocket reconnect:
1. Send last known \`revision\` per subscribed board
2. Server replays missed events from Redis stream (retention: 5 min)
3. On overflow, client does full board re-fetch

## Failure Modes
| Failure | Mitigation |
|---|---|
| Redis outage | Fallback to Postgres LISTEN/NOTIFY (degraded latency) |
| Gateway crash | Client auto-reconnects to another node (sticky sessions via header) |
| Split-brain writes | Postgres row versioning + revision check on UPDATE |

## Observability
- OpenTelemetry spans for: WS message → Redis publish → DB commit → fanout
- SLO dashboard: P50/P95/P99 sync latency, error rate, active connections
- Alert if P95 > 500ms for 5 min

## Rollout
Behind feature flag \`realtime_v2\`. 5% → 25% → 100% over 2 weeks.

## Rejected Alternatives
- **CRDT (Yjs)** — overkill for our data shape; adds bundle size
- **Server-Sent Events** — no bi-directional support; would need polling for writes
- **GraphQL Subscriptions** — team lacks GraphQL experience; adds infra`,
  },
  {
    kind: "architecture_doc",
    title: "System Architecture Overview",
    score: 82,
    content_md: `# TaskFlow — System Architecture

## High-Level Diagram
\`\`\`
                      ┌──────────────────┐
                      │  CloudFront CDN  │
                      └────────┬─────────┘
                               │
                     ┌─────────▼──────────┐
                     │   Next.js Web App  │◀── Vercel Edge
                     │  (SSR + RSC + SPA) │
                     └─────────┬──────────┘
                               │ HTTPS + WSS
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌────────────┐    ┌──────────┐
        │  API GW  │    │ Realtime GW│    │ Auth (JWT│
        │ (Fastify)│    │(Socket.IO) │    │  + OAuth)│
        └────┬─────┘    └─────┬──────┘    └────┬─────┘
             │                │                │
             └────────┬───────┴────────────────┘
                      ▼
                 ┌────────┐  ┌────────┐  ┌───────────┐
                 │Postgres│  │ Redis  │  │ S3 (files)│
                 │  RDS   │  │Cluster │  │           │
                 └────────┘  └────────┘  └───────────┘
                      │
                 ┌────▼─────┐
                 │  Debezium │──▶ Kafka ──▶ Analytics warehouse (BigQuery)
                 └───────────┘
\`\`\`

## Services
| Service | Language | Responsibility |
|---|---|---|
| Web | TS / Next.js 14 | SSR pages, RSC, client bundle |
| API Gateway | TS / Fastify | REST + validation + rate limiting |
| Realtime GW | TS / Socket.IO | WebSocket sessions, presence, fanout |
| Worker | TS / BullMQ | Emails, digests, webhook delivery |
| Sync (Debezium) | Java | CDC from Postgres → Kafka |

## Data Stores
- **Postgres (RDS Multi-AZ)** — source of truth, row-level security
- **Redis (ElastiCache cluster)** — sessions, cache, pub/sub, rate-limit counters
- **S3** — attachments, exports, audit-log archive

## Cross-Cutting Concerns
- **AuthN/AuthZ:** JWT access token (15m) + refresh token (30d rotating). Workspace-scoped RBAC.
- **Multi-tenancy:** Single DB, row-level workspace_id on every table + Postgres RLS
- **Observability:** OpenTelemetry → Grafana Cloud. Structured logs → Loki. Metrics → Prometheus.
- **CI/CD:** GitHub Actions → ECR → ECS. Blue/green deploys with automated rollback on error-rate spike.

## Deployment Topology
- Primary: AWS us-east-1 (3 AZs)
- Read replica: eu-west-1 (data-residency customers)
- CDN: CloudFront (200+ edge PoPs)

## Bottlenecks Identified
1. **Realtime GW is stateful** — sticky sessions via ALB header; not horizontally elastic under bursty load
2. **Postgres write throughput** — approaching 60% of instance capacity at peak; partition candidates: \`activity_log\`, \`notifications\`
3. **S3 signed URLs** — 15-min lifetime causing UX friction for long-lived tabs; increase to 4h with tighter IAM

## Roadmap (12 months)
- Q1: Extract billing to a service (Stripe complexity growing)
- Q2: Migrate realtime GW to WebSocket with server-sent snapshots
- Q3: Introduce read-replica routing for reporting queries
- Q4: Evaluate CockroachDB for global write scaling`,
  },
  {
    kind: "database_doc",
    title: "Database Schema & Design Notes",
    score: 84,
    content_md: `# Database Schema — TaskFlow (Postgres 15)

## Overview
Single-database, multi-tenant with **workspace_id** on every user-scoped table. Row-Level Security enforced per workspace membership.

## Core Tables

### workspaces
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE | URL identifier |
| name | text | |
| plan | enum('free','team','business','enterprise') | |
| created_at | timestamptz | |
| deleted_at | timestamptz | soft delete |

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | citext UNIQUE | |
| password_hash | text NULLABLE | null for SSO/OAuth-only |
| avatar_url | text | |
| last_active_at | timestamptz | |

### workspace_members
Composite PK (workspace_id, user_id). Role enum: owner/admin/member/guest.

### boards
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid FK | |
| name | text | |
| color | text | hex |
| archived_at | timestamptz | |

Index: \`(workspace_id, archived_at)\` — hot path for board list.

### columns
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| board_id | uuid FK | |
| name | text | |
| position | text | LexoRank key |
| wip_limit | int NULLABLE | |

### cards
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| board_id | uuid FK | denormalized for query perf |
| column_id | uuid FK | |
| position | text | LexoRank key |
| title | text NOT NULL | |
| description_md | text | |
| assignee_id | uuid FK | |
| due_at | timestamptz | |
| revision | int NOT NULL default 0 | optimistic concurrency |

Indexes:
- \`(board_id, column_id, position)\` — board-render query
- \`(assignee_id, due_at) WHERE due_at IS NOT NULL\` — "my due soon"
- GIN on \`to_tsvector('english', title || ' ' || description_md)\` — search

### activity_log (partitioned by month)
Immutable audit trail. Partitions dropped after 24 months.

## Row-Level Security Example
\`\`\`sql
CREATE POLICY board_read ON boards FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid()
  ));
\`\`\`

## Migrations
Prisma Migrate + custom SQL for RLS policies and partitions. All migrations reversible; forward-only in production with feature-flagged deploys.

## Performance Notes
- Vacuum settings tuned per hot table (autovacuum_vacuum_scale_factor = 0.01 on \`cards\`, \`activity_log\`)
- pg_stat_statements enabled; weekly review of top-20 slow queries
- Connection pooling via PgBouncer (transaction mode)`,
  },
  {
    kind: "api_docs",
    title: "REST API Reference — v1",
    score: 80,
    content_md: `# TaskFlow REST API — v1

Base URL: \`https://api.taskflow.io/v1\`
Auth: \`Authorization: Bearer <token>\`
Content-Type: \`application/json\`

## Conventions
- **Versioning:** URL prefix (\`/v1\`)
- **Pagination:** cursor-based (\`?cursor=...&limit=50\`), max limit 100
- **Errors:** RFC 7807 problem+json
- **Rate limits:** 100/min per user; headers \`X-RateLimit-*\`
- **Idempotency:** \`Idempotency-Key\` header for POST/PATCH

## Endpoints

### GET /boards
List boards in the caller's workspace.

**Query params:**
| Name | Type | Description |
|---|---|---|
| workspace_id | uuid | Required |
| archived | bool | Include archived (default false) |

**Response 200:**
\`\`\`json
{
  "data": [
    { "id": "…", "name": "Web App", "color": "#3b82f6", "cards_count": 47 }
  ],
  "next_cursor": null
}
\`\`\`

### POST /boards
**Body:**
\`\`\`json
{ "workspace_id": "…", "name": "Marketing Site", "color": "#10b981" }
\`\`\`
**Response 201:** the created board object

### GET /boards/:id/cards
Returns all non-archived cards on a board with columns nested.

### PATCH /cards/:id
**Body (partial):**
\`\`\`json
{ "title": "…", "column_id": "…", "position": "aH", "revision": 42 }
\`\`\`
\`revision\` must match server; else 409 Conflict.

### POST /cards/:id/comments
Full markdown body; server sanitizes and returns rendered HTML preview.

### DELETE /cards/:id
Soft delete. 204 No Content.

## Webhooks
Configure per workspace. Signed with HMAC-SHA256 (\`X-TaskFlow-Signature\`).

**Events:**
- \`card.created\`, \`card.updated\`, \`card.moved\`, \`card.deleted\`
- \`board.archived\`
- \`sprint.started\`, \`sprint.completed\`
- \`member.added\`, \`member.removed\`

**Delivery:** at-least-once with exponential backoff (max 24h, 8 retries).

## SDK Availability
- Official: TypeScript, Python
- Community: Go, Ruby

## Deprecation Policy
Endpoints deprecated with 6-month sunset. \`Sunset\` header advertises removal date.`,
  },
  {
    kind: "deployment_guide",
    title: "Deployment & Operations Guide",
    score: 78,
    content_md: `# Deployment Guide — TaskFlow

## Environments
| Env | Purpose | URL |
|---|---|---|
| dev | Individual developer boxes | localhost:3000 |
| staging | Pre-prod integration | staging.taskflow.io |
| prod | Production | app.taskflow.io |

## Infrastructure as Code
All infra managed via **Terraform** in \`infra/\` monorepo folder. Workspaces per env. State in S3 with DynamoDB locking.

## CI/CD Pipeline (GitHub Actions)
1. **PR opened** → lint, typecheck, unit tests, e2e smoke (Playwright)
2. **Merge to main** → build Docker images, push to ECR, deploy to staging
3. **Manual promote** → blue/green deploy to prod via CodeDeploy
4. **Auto-rollback** if error rate > 2× baseline for 5 minutes

## Docker
Multi-stage build; final image based on \`node:20-alpine\`. Size < 200MB.

## Database Migrations
- \`prisma migrate deploy\` runs as part of deploy job, **before** new pods take traffic
- Backward-compatible migrations only in prod (expand → migrate → contract pattern)

## Secrets
- **AWS Secrets Manager** for DB creds, third-party API keys
- Rotated quarterly; app auto-reloads on rotation via SDK cache TTL

## Backups
- Postgres: automated daily snapshots, 30-day retention; PITR window 7 days
- S3: cross-region replication to eu-west-1
- Monthly disaster-recovery drill (restore + smoke test)

## Runbooks
Stored in \`docs/runbooks/\`:
- Postgres failover
- Redis cluster resize
- Certificate rotation
- Incident response

## On-Call
PagerDuty rotation, 1 primary + 1 secondary. SLOs:
- Acknowledge < 5 min
- Communicate to customers < 15 min for Sev1
- Postmortem within 5 business days

## Monitoring
- Grafana dashboards: infra, app, business KPIs
- Alerts routed via PagerDuty; noisy alerts trigger auto-tuning review

## Known Operational Debt
- Terraform module for realtime gateway not fully parameterized
- Runbooks for multi-region failover incomplete
- No chaos-engineering practice yet (planned Q3)`,
  },
  {
    kind: "user_manual",
    title: "TaskFlow — Getting Started (User Manual)",
    score: 75,
    content_md: `# TaskFlow — Getting Started

Welcome! This guide walks new users through their first hour.

## 1. Create Your Workspace
1. Sign up with email or Google at [taskflow.io](https://taskflow.io)
2. Choose a workspace name (this becomes your URL: \`workspace.taskflow.io\`)
3. Invite 2–3 teammates now — it makes the demo way more fun

## 2. Create Your First Board
- Click **+ New Board** in the sidebar
- Pick a template (Kanban, Scrum, Bug Tracker) or start blank
- Boards default to three columns: **To Do**, **In Progress**, **Done**

## 3. Add Cards
- Click **+** on any column, or press \`C\` anywhere on a board
- Cards have: title, description (markdown), assignee, due date, labels, subtasks

## 4. Move Work
- Drag cards between columns
- Or use keyboard: select a card → \`M\` → pick column
- Everyone on the board sees changes instantly

## 5. Collaborate
- \`@mention\` teammates in comments
- Watch a card (bell icon) to get notified on any change
- Use \`/\` in comments for quick actions (/assign, /due, /label)

## 6. Sprints (Team plan and up)
- Enable sprints in board settings
- Drag cards into the active sprint
- Track progress on the burndown chart

## 7. GitHub Integration
- Settings → Integrations → Connect GitHub
- Link a repo to a board
- Reference cards in commits: \`Fixes TF-142\`
- PRs auto-move linked cards to "In Review"

## Keyboard Shortcuts
| Key | Action |
|---|---|
| \`C\` | Create card |
| \`/\` | Global search |
| \`G\` then \`B\` | Go to Boards |
| \`?\` | Show all shortcuts |

## Getting Help
- In-app: \`?\` icon → Help center
- Email: [help@taskflow.io](mailto:help@taskflow.io)
- Community: [community.taskflow.io](https://community.taskflow.io)

---
*Feedback? Type \`/feedback\` anywhere in the app — it goes straight to the product team.*`,
  },
  {
    kind: "architecture_review",
    title: "Architecture Review — v1.2",
    score: 82,
    content_md: `# Architecture Review — TaskFlow v1.2

**Reviewer:** Aristotle (AI Senior Architect)
**Date:** 2026-06-28
**Overall Score: 82/100**

## Strengths
1. **Clear service boundaries.** Web / API / Realtime / Worker split is idiomatic and matches team topology.
2. **Multi-tenancy strategy is correct.** Single-DB with RLS at the workspace boundary is the right call for the scale target; avoids operational complexity of DB-per-tenant.
3. **CDC pipeline is future-proof.** Debezium → Kafka positions the team well for analytics, search indexing, and event-driven features without coupling.
4. **Observability foundations are solid.** OpenTelemetry adoption early = long-term win.

## Concerns
### High
- **Realtime Gateway is a scaling cliff.** Sticky sessions on ALB work up to ~5k concurrent per node, but hot boards (post-launch demos, all-hands, retros) can spike >10k to a single board. Consider consistent-hash routing by \`board_id\` and horizontal sharding.
- **No documented graceful-degradation mode for Redis outage.** Falling back to Postgres LISTEN/NOTIFY is mentioned but not tested. Recommend a monthly game day.

### Medium
- **Postgres write throughput** projected to hit 80% capacity in ~9 months at current growth. Two options:
  1. Vertical scale (short term, expensive)
  2. Partition \`activity_log\` and \`notifications\` (recommended, ~2 sprints)
- **Deployment topology treats eu-west-1 as read replica only.** GDPR-strict prospects need writes to stay in EU. Consider active-active with per-workspace pinning.
- **Blue/green deploys assume backward-compatible schema changes.** Enforce via a lint rule in CI (\`prisma migrate diff\` + custom check).

### Low
- Kafka is single-region; loss of us-east-1 = analytics gap. Cross-region MirrorMaker or accept the risk.
- No documented WAF; Cloudflare edge or AWS WAF should front the API for Layer-7 protection.

## Missing Patterns
| Pattern | Recommendation |
|---|---|
| Circuit breaker | Add for Redis, third-party integrations (GitHub, Slack) |
| Bulkhead | Isolate webhook delivery worker from user-facing job queue |
| Outbox | Currently CDC covers this, but transactional outbox for webhook delivery would strengthen at-least-once semantics |

## Recommendations (Prioritized)
1. **[This quarter]** Partition \`activity_log\` and \`notifications\` (Medium)
2. **[This quarter]** Runbook + game day for Redis outage (High)
3. **[Next quarter]** Realtime GW sharding design doc (High)
4. **[Next quarter]** WAF in front of API (Low)
5. **[6 months]** Active-active multi-region evaluation (Medium)

## Score Breakdown
| Dimension | Score |
|---|---|
| Scalability | 78 |
| Reliability | 84 |
| Security | 80 |
| Maintainability | 85 |
| Observability | 88 |
| Cost-Efficiency | 79 |`,
  },
  {
    kind: "repo_review",
    title: "Repository Review — acme/taskflow",
    score: 76,
    content_md: `# Repository Review — acme/taskflow

**Reviewer:** Aristotle (AI Senior Engineer)
**Repo:** github.com/acme/taskflow
**Overall Score: 76/100**

## Repository Structure
\`\`\`
taskflow/
├── apps/
│   ├── web/          # Next.js 14
│   ├── api/          # Fastify
│   ├── realtime/     # Socket.IO
│   └── worker/       # BullMQ
├── packages/
│   ├── db/           # Prisma schema + client
│   ├── ui/           # Shared React components
│   ├── config/       # Shared configs
│   └── types/        # Zod schemas + TS types
├── infra/            # Terraform
└── docs/
\`\`\`
**Verdict:** Monorepo layout is clean and idiomatic (Turborepo). Package boundaries are sensible.

## Metrics
| Metric | Value | Assessment |
|---|---|---|
| Total LOC (excluding tests) | 87,432 | Reasonable for scope |
| Test LOC | 21,880 | 25% ratio — target 40% |
| TypeScript strict | ✅ enabled | |
| ESLint clean | ⚠️ 43 warnings | Fix or explicit-ignore |
| Circular dependencies | 2 detected | See findings |
| Cyclomatic complexity (avg) | 4.2 | Healthy |
| Highest complexity function | 28 | \`apps/api/src/routes/cards/move.ts\` — refactor candidate |
| Duplicate code (jscpd) | 6.8% | Above 5% threshold |

## Findings

### High
1. **Circular deps:** \`packages/ui\` → \`packages/config\` → \`packages/ui\`. Extract shared types.
2. **\`apps/api/src/routes/cards/move.ts\`** — 340-line handler doing validation, RLS check, position calculation, DB write, event publish. Extract to a service layer.
3. **Missing input validation** on \`POST /workspaces/:id/invite\` — email not validated server-side (client-only Zod).

### Medium
4. **Dependency drift:** 12 packages 2+ major versions behind. Notable: \`socket.io@3\` (v4 is current, security fixes).
5. **Test coverage on realtime gateway** = 34%. Given its criticality, target 70%.
6. **No CODEOWNERS.** Reviews may miss domain experts.
7. **Duplicate util:** \`formatDate\` reimplemented in web + admin. Move to \`packages/ui/utils\`.

### Low
8. \`console.log\` calls left in \`apps/worker/src/jobs/digest.ts\` (12 occurrences)
9. Some component files > 500 lines — consider splitting (e.g., \`BoardView.tsx\` = 812 lines)
10. Missing JSDoc on public exports of \`packages/db\`

## Security Signals
- ✅ No secrets in git history (verified via truffleHog scan)
- ⚠️ \`npm audit\` reports 3 moderate vulns (transitive, in dev deps)
- ⚠️ \`.env.example\` includes sample AWS key format that could confuse newcomers — mark clearly as placeholder

## Recommendations
1. Introduce **CODEOWNERS** and merge-blocking review from relevant team
2. Enforce **max file length (500 lines)** and **max complexity (15)** via ESLint
3. Add **Dependabot** with weekly cadence, grouped PRs
4. Refactor top-3 complex functions (see High findings)
5. Bump \`socket.io\` to v4 (breaking; ~2 days work)

## What's Working Well
- Turborepo caching → CI runs in 4m (excellent for this size)
- Prisma schema is well-commented and normalized
- \`packages/types\` single-source-of-truth is a great pattern
- Trunk-based development with feature flags`,
  },
  {
    kind: "uiux_review",
    title: "UI/UX Review — Board & Sprint Planner",
    score: 85,
    content_md: `# UI/UX Review — TaskFlow

**Reviewer:** Aristotle (AI UX Reviewer)
**Scope:** Board view, Card modal, Sprint planner
**Overall Score: 85/100**

## Heuristic Evaluation (Nielsen)

### 👍 Strengths
1. **Visibility of system status** — optimistic updates + real-time cursors give strong feedback
2. **Consistency & standards** — matches SaaS conventions (Cmd+K, \`?\` for shortcuts)
3. **Minimalist aesthetic** — clean typography, generous whitespace, sensible visual hierarchy

### ⚠️ Issues
| # | Heuristic | Severity | Finding |
|---|---|---|---|
| 1 | Error prevention | High | Deleting a card requires no undo path in mobile view |
| 2 | Recognition over recall | Medium | Column WIP limit shown only on hover; should be persistent |
| 3 | Flexibility/efficiency | Medium | Bulk-select cards not supported; only single-card actions |
| 4 | Help and documentation | Low | Empty-state on a new board is friendly but lacks "Get started" CTAs |

## Accessibility (WCAG 2.1 AA)

**Automated (axe-core):** 4 violations
- **1.4.3 Contrast (AA)** — Muted text \`#94a3b8\` on \`#f8fafc\` = 4.3:1 (needs 4.5:1)
- **2.4.7 Focus visible** — Custom-styled dropdowns hide default focus ring
- **4.1.2 Name, Role, Value** — Custom drag-handle button lacks accessible name
- **3.3.2 Labels or instructions** — Comment textarea uses placeholder as label

**Manual review:**
- ✅ Keyboard navigation works on board (arrows + Enter)
- ⚠️ Card drag-and-drop has no keyboard equivalent — implement with Cmd+↑/↓
- ⚠️ Live-region announcements missing for real-time updates (screen readers silent)
- ✅ Reduced-motion preference respected

## Visual & Interaction
- **Typography:** Inter for UI is a safe, appropriate choice
- **Color system:** Semantic tokens well-defined; dark mode has 2 contrast issues in card meta text
- **Motion:** Card-move animation duration = 250ms — feels snappy; drag preview has a subtle rotation that's delightful
- **Density:** Board is comfortable at 1440px; cramped at 1280px — consider a "compact" toggle

## Mobile Experience
- Board scrolls horizontally — expected but discovery is poor (add scroll indicator)
- Card modal is a full-screen sheet — good pattern
- Sprint planner is unusable on mobile — hide behind a "desktop-only" banner or design a mobile flow

## Recommendations
1. **[High]** Add undo toast for destructive actions on mobile
2. **[High]** Fix 4 axe violations (est. 1 day)
3. **[Medium]** Add keyboard drag-and-drop with live-region announcements
4. **[Medium]** Persistent WIP-limit badge on columns
5. **[Medium]** Bulk-select for cards (Shift-click)
6. **[Low]** Empty-state CTAs on new boards
7. **[Low]** Compact-density toggle
8. **[Low]** Mobile board scroll affordance

## What's Working
- Real-time cursors are best-in-class; delightful and functional
- Onboarding tour (first-run) has 82% completion rate — keep it
- Command palette (Cmd+K) surfaces power features without cluttering UI`,
  },
  {
    kind: "database_review",
    title: "Database Review — Schema & Query Health",
    score: 84,
    content_md: `# Database Review — TaskFlow

**Reviewer:** Aristotle (AI Database Reviewer)
**Overall Score: 84/100**

## Schema Assessment
### ✅ Strengths
- Consistent use of \`uuid\` PKs with \`gen_random_uuid()\`
- \`created_at\` / \`updated_at\` on all mutable tables via trigger
- RLS enabled on every user-scoped table
- LexoRank for ordering avoids the classic reindex pitfall
- Enums used appropriately (roles, plan tiers)

### ⚠️ Concerns
1. **\`activity_log\` not partitioned.** Table is at 240M rows; queries filtering by workspace + date scan more than needed. **Recommendation:** partition by month, drop >24 months.
2. **\`cards.description_md\`** — full-text search index missing on this column (only on \`title\`). Users report weak search when relying on descriptions.
3. **\`notifications\` table has no TTL.** Grows unbounded; recommend soft delete after 90 days + hard delete after 180.
4. **JSONB \`metadata\` columns** used inconsistently — sometimes for feature flags, sometimes for user preferences. Consider splitting.

## Index Health
| Table | Issue | Fix |
|---|---|---|
| \`cards\` | Missing partial index on \`(assignee_id) WHERE due_at IS NOT NULL AND completed_at IS NULL\` | Add — powers "my open work" query |
| \`comments\` | Composite \`(card_id, created_at)\` fine; \`(user_id, created_at)\` for activity feeds absent | Add |
| \`workspace_members\` | Duplicate index: \`(user_id)\` and \`(user_id, workspace_id)\` — first is redundant | Drop |
| \`sessions\` | Missing index on \`refresh_token_hash\` | Add UNIQUE index |

## Query Analysis (pg_stat_statements top 5)
1. **Board render query** — 45% of DB time. Sub-100ms P95 currently, but N+1 on labels. Recommend a batched loader.
2. **User dashboard aggregation** — 12% of DB time. Materialized view refreshed every 5min would cut this 90%.
3. **Notification unread count** — 8%. Uses \`COUNT(*)\` — replace with counter column maintained by trigger.
4. **Search across cards** — 7%. Currently \`ILIKE\` fallback when tsvector misses; move fully to tsvector.
5. **Audit log fetch** — 6%. Partitioning (above) resolves this.

## Data Integrity
- ✅ All FK constraints defined with appropriate \`ON DELETE\`
- ⚠️ **Orphan risk:** \`attachments\` rows can exist after card soft-delete → hard-delete + 30d retention worker is correct pattern; verify job runs
- ✅ CHECK constraints on enums, positive integers, and email format

## Migrations
- ✅ Prisma Migrate used consistently
- ⚠️ Two migrations in \`_manual/\` folder — undocumented. Fold into main tracking.
- ⚠️ No down-migration reviews in PRs (Prisma doesn't require them, but expand-migrate-contract deploys benefit from documented rollback intent)

## Backup & DR
- Daily snapshots, 30-day retention ✅
- PITR 7 days ✅
- **Missing:** documented cross-region restore test in the last 12 months

## Recommendations (Prioritized)
1. **[High]** Partition \`activity_log\` by month (2 sprints)
2. **[High]** Add missing indexes (see table)
3. **[Medium]** Full-text index on \`cards.description_md\`
4. **[Medium]** Materialized view for user dashboard
5. **[Medium]** Notification retention policy
6. **[Low]** Cross-region restore drill this quarter
7. **[Low]** Clean up duplicate indexes`,
  },
  {
    kind: "api_review",
    title: "API Review — v1 REST + Webhooks",
    score: 80,
    content_md: `# API Review — TaskFlow v1

**Reviewer:** Aristotle (AI API Reviewer)
**Overall Score: 80/100**

## Design Assessment

### ✅ Strengths
- Consistent resource-oriented URLs; proper HTTP verbs
- RFC 7807 error responses (problem+json)
- Cursor-based pagination (correct choice for real-time data)
- Idempotency-Key support for POST/PATCH
- Explicit versioning (\`/v1\`) with deprecation policy

### ⚠️ Findings

#### High
1. **PATCH semantics inconsistent.** Some endpoints treat PATCH as "replace fields provided", others as "merge with null-to-clear". Standardize: **merge-patch (RFC 7396)** everywhere.
2. **Rate-limit responses missing \`Retry-After\` header.** Clients can't back off intelligently.
3. **Bulk operations absent.** Moving 50 cards = 50 PATCH calls. Add \`POST /cards/batch-move\` — reduces load and improves UX.

#### Medium
4. **\`GET /boards/:id/cards\` returns cards + columns nested.** Deeply nested payloads (~200KB for large boards) hurt mobile. Offer \`?expand=\` param or split.
5. **Search endpoint** does full-text on the client via multiple field-specific calls. Provide a single \`GET /search?q=\` with cross-resource results.
6. **Filter syntax is ad-hoc.** \`?assignee_id=…&status=open\`. Consider a documented spec — either simple flat query params (current, works fine, just document) or a query DSL. Don't invent halfway.

#### Low
7. **Some 4xx responses expose stack traces** in \`extra\` field — remove in production.
8. **CORS allowlist** is per-workspace; documented behavior, but reject responses could be clearer (currently 500).
9. **OpenAPI spec** exists but drifts from implementation. Automate generation from Zod schemas.

## Security
- ✅ TLS 1.3 enforced
- ✅ HSTS with preload
- ✅ Bearer token in header (no query param leakage)
- ⚠️ No **request signing** for webhook receivers (send-side does HMAC; also require ingress signing from partners)
- ⚠️ **CSRF token** not enforced on session-cookie flows (only Bearer flows protected)
- ✅ Content-Type validation

## Performance
- P95 latencies (measured production):
  - \`GET /boards\` — 45ms ✅
  - \`GET /boards/:id/cards\` — 180ms ⚠️ (target 100ms)
  - \`PATCH /cards/:id\` — 65ms ✅
- Consider **HTTP/2 push** for critical read patterns
- **ETag** support missing — add for high-read, low-write resources

## Webhook Delivery
- ✅ Signed with HMAC-SHA256
- ✅ At-least-once, exponential backoff
- ⚠️ No **redelivery UI** for users — they can't manually retry a failed delivery
- ⚠️ Payload version not in body (only header) — hard to diff historical deliveries

## Documentation
- OpenAPI spec: 78% coverage (missing several webhook endpoints)
- Interactive docs on \`/docs\` are excellent (Redoc)
- SDK docs lag behind API by ~2 versions

## Recommendations
1. **[High]** Standardize PATCH to RFC 7396 merge-patch
2. **[High]** Add \`Retry-After\` to 429 responses
3. **[High]** Batch operations for card move + delete
4. **[Medium]** Split \`/boards/:id/cards\` payload behind \`?expand=\` param
5. **[Medium]** Unified search endpoint
6. **[Medium]** OpenAPI auto-generation from Zod
7. **[Low]** Redelivery UI for webhooks`,
  },
  {
    kind: "test_cases",
    title: "Test Plan — Board Real-Time Sync",
    score: 78,
    content_md: `# Test Plan — Board Real-Time Sync

**Overall Score: 78/100** (coverage acceptable; missing chaos + perf under sustained load)

## Scope
End-to-end validation of real-time board synchronization, including card moves, presence, and reconnect behavior.

## Test Matrix

### Functional
| ID | Scenario | Steps | Expected |
|---|---|---|---|
| TC-001 | Move card A→B, single viewer | Load board; drag card from To Do to In Progress | Card visible in In Progress within 300ms; DB reflects change |
| TC-002 | Move card, two viewers | User A moves card while User B watches | User B sees move within 300ms with cursor trail |
| TC-003 | Concurrent moves of same card | A drags to In Progress, B drags to Done simultaneously | Last committed wins; other user gets revision-conflict toast + rebase |
| TC-004 | Rename card, two viewers | A renames inline; B has card modal open | B sees title update in-place; if B is editing title, B keeps their draft |
| TC-005 | Add comment with mention | A comments "@bob please review" | Bob gets in-app notification; email queued |
| TC-006 | Delete card | Delete card in To Do | Card disappears for all viewers; undo toast for 5s; card restorable |

### Edge / Failure
| ID | Scenario | Expected |
|---|---|---|
| TC-101 | WS connection drops mid-drag | Drag completes optimistically; on reconnect, syncs or reverts |
| TC-102 | Server rejects move (RLS violation) | Client rolls back; error toast |
| TC-103 | Redis outage | Fallback to Postgres NOTIFY; latency increases <2s; no data loss |
| TC-104 | 100 concurrent card creates | All succeed; positions stable; no duplicate keys |
| TC-105 | Very long card title (10KB) | Rejected client-side and server-side with clear error |
| TC-106 | Unicode + RTL text in title | Renders correctly; sortable |

### Regression
| ID | Scenario | Notes |
|---|---|---|
| TC-201 | LexoRank rebalance | Insert 1000 cards at position between two adjacent keys — should trigger rebalance job |
| TC-202 | Old client (v1.3) connects to v1.4 gateway | Backward-compatible messages |

### Performance
| ID | Scenario | SLO |
|---|---|---|
| TC-301 | 50 users on one board, 10 moves/sec each | P95 end-to-end < 500ms |
| TC-302 | 5000 boards with 20 users each simultaneously | Gateway CPU < 70%; no message loss |
| TC-303 | Ramp from 100 → 5000 connections in 30s | No cascade failures; auto-scaling triggers |

### Security
| ID | Scenario | Expected |
|---|---|---|
| TC-401 | User attempts to subscribe to a board they can't access | 403 on subscribe; no messages leaked |
| TC-402 | Token expiry during long-lived WS session | Server disconnects with 4401; client refreshes and reconnects |
| TC-403 | Malformed message payload | Ignored; connection remains; no crash |

### Accessibility
| ID | Scenario | Expected |
|---|---|---|
| TC-501 | Screen reader on card move | Live region announces "Card 'X' moved to 'In Progress' by Alice" |
| TC-502 | Keyboard-only navigation | Full board operable via keyboard including move |

## Not-Yet-Covered (Gaps)
- 🔴 **Sustained load test** (24h steady state) — never run
- 🔴 **Chaos tests** — Redis node kill, Postgres failover
- 🟡 **Cross-browser** matrix incomplete (Safari + iOS only spot-checked)
- 🟡 **Localization** — no test suite for RTL rendering across UI

## Automation Coverage
- Unit: 82% of realtime handlers
- Integration: 65% of end-to-end paths
- E2E (Playwright): 40% of user journeys
- Manual only: sprint burndown chart interactions

## Recommendations
1. Add 24h soak test to weekly cadence
2. Introduce chaos-engineering (Toxiproxy) for Redis/DB
3. Complete Safari matrix (partner with Sauce Labs)`,
  },
  {
    kind: "risk_analysis",
    title: "Project Risk Register",
    score: 73,
    content_md: `# Risk Register — TaskFlow

**Overall Risk Posture: 73/100 (Amber)** — actionable risks tracked; two Highs need owner + date.

## Legend
- **Likelihood:** L=Low (0-25%), M=Medium (26-60%), H=High (61-90%), VH=Very High (>90%)
- **Impact:** 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Severe

## Active Risks

| # | Risk | Category | L | I | Score | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|---|---|
| R-01 | Realtime GW cannot scale past 10k concurrent per shard | Technical | H | 4 | 16 | Marcus | Sharding design doc + POC in Q3 | Open |
| R-02 | Postgres write throughput exhaustion in ~9mo | Technical | M | 5 | 15 | Marcus | Partition activity_log + notifications | In progress |
| R-03 | SOC 2 Type II delayed → lose 3 enterprise deals | Business | M | 5 | 15 | Jenna | Auditor engaged; controls in place | Open |
| R-04 | Key hire attrition (2 senior eng) | People | L | 4 | 8 | Ava | Retention bonuses; knowledge sharing | Monitoring |
| R-05 | GitHub API deprecation breaks integration | Integration | M | 3 | 9 | Priya | Subscribe to changelog; PoC v2 API | Open |
| R-06 | Redis outage → degraded UX with no tested fallback | Technical | L | 4 | 8 | Marcus | Monthly game day; runbook | Not started |
| R-07 | Data residency for EU customers | Compliance | H | 3 | 12 | Jenna | eu-west-1 write path evaluation | Open |
| R-08 | Competitor releases free tier undercuts pricing | Market | M | 3 | 9 | Ava | Value-based positioning; usage-based tier | Monitoring |
| R-09 | Third-party dependency vuln (Log4Shell-class) | Security | M | 4 | 12 | Marcus | Dependabot + rapid patch playbook | Continuous |
| R-10 | Onboarding drop-off in first 24h > 40% | Product | M | 3 | 9 | Priya | Improved first-run tour + templates | In progress |

## Recently Retired
- R-00 — CI flakiness blocking deploys (fixed Q1)

## Top-3 Actions This Sprint
1. Assign R-06 to owner + schedule first game day (blocking High)
2. Finalize R-01 sharding design doc (blocking Business tier commitments)
3. Complete Postgres partitioning migration (R-02)

## Risk Trend
Overall trend Q1→Q2: **improving** (score 68 → 73). Two new risks added (R-07, R-09); three retired.`,
  },
  {
    kind: "security_review",
    title: "Security Review — Application & Infra",
    score: 71,
    content_md: `# Security Review — TaskFlow

**Reviewer:** Aristotle (AI Security Reviewer)
**Overall Score: 71/100** — solid foundations, gaps around secrets rotation, WAF, and third-party integrations.

## OWASP Top 10 (2021) Assessment

| # | Category | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | 🟢 Good | Postgres RLS enforced; per-endpoint authz middleware |
| A02 | Cryptographic Failures | 🟢 Good | TLS 1.3; passwords argon2id; secrets in AWS SM |
| A03 | Injection | 🟡 Moderate | Prisma parameterized; but 3 raw SQL queries in reporting service unreviewed |
| A04 | Insecure Design | 🟢 Good | Threat modeling done for auth + billing |
| A05 | Security Misconfiguration | 🟡 Moderate | S3 buckets have public-block on; but CORS on API is permissive for wildcard subdomain |
| A06 | Vulnerable Components | 🟡 Moderate | Dependabot enabled; 3 moderate CVEs open >30d |
| A07 | Identification & Auth Failures | 🟢 Good | Rate-limited login; 2FA available (TOTP) |
| A08 | Software & Data Integrity Failures | 🟡 Moderate | No SBOM; no signed artifacts |
| A09 | Security Logging & Monitoring | 🟢 Good | CloudTrail + app audit log; alerts on suspicious patterns |
| A10 | SSRF | 🟢 Good | Webhook URL validation; blocks private IPs |

## Findings

### 🔴 High
1. **Secrets rotation cadence not enforced.** AWS SM auto-rotates DB creds; third-party keys (Stripe, SendGrid) are manual. No calendar or ownership.
2. **CORS allows \`*.customer-domain\` wildcards** for enterprise workspaces. A subdomain takeover on a customer's DNS = full token theft. **Fix:** allowlist exact origins per workspace.
3. **Webhook endpoints don't verify \`Content-Length\`.** DoS via slowloris-style payloads possible on ingress webhooks.

### 🟠 Medium
4. **3 raw SQL queries in \`apps/api/src/reporting/\`** — use \`$queryRaw\` without parameterization on trusted-looking inputs. Refactor to parameterized or Prisma equivalents.
5. **No WAF** in front of the API. Layer 7 attacks (login stuffing, scraping) only mitigated by app-level rate limiting.
6. **JWT access tokens are 15min** — good — but **refresh tokens don't rotate on use**. Recommend rotation to bound impact of theft.
7. **File upload** (\`POST /attachments\`) — validates MIME by header, not magic bytes. Extension mismatch possible.
8. **CSP header** missing on the web app (Next.js default). Add strict CSP with nonces.

### 🟡 Low
9. **HTTP-only + Secure flags** set on cookies ✅; **SameSite=Lax** — consider Strict for session cookies.
10. **Password policy** enforces 8 chars min; consider 12+ with breached-password check (HIBP).
11. **Audit log** doesn't capture failed-authorization attempts (403s) — add.
12. Error responses on \`/v1/users/:email\` reveal existence via 404 vs 403.

## Third-Party Integrations
| Integration | Data shared | Assessment |
|---|---|---|
| GitHub | Read repos, issues; write comments | OAuth scopes minimal ✅ |
| Slack | Send notifications | Token scoped to \`chat:write\` ✅ |
| Stripe | Full billing | PCI SAQ A (no card data touches TaskFlow) ✅ |
| SendGrid | Send emails | ⚠️ No DKIM alignment monitoring |

## Compliance
- **GDPR:** DPA available; data export ✅; deletion within 30d ✅; DPIA on file ✅
- **SOC 2:** Type I complete; Type II audit ongoing (est. complete Q4)
- **CCPA:** Do-not-sell endpoint implemented; consumer request portal live

## Recommendations (Prioritized)
1. **[High, this sprint]** Enforce secret rotation calendar; assign owners per third-party key
2. **[High, this quarter]** Replace wildcard CORS with per-workspace exact allowlist
3. **[High, this quarter]** Refactor raw SQL in reporting service
4. **[Medium]** Add WAF (Cloudflare or AWS)
5. **[Medium]** Implement refresh-token rotation
6. **[Medium]** Add strict CSP to web app
7. **[Medium]** Magic-byte file validation
8. **[Low]** Adopt breached-password check
9. **[Low]** Log 403s in audit trail`,
  },
  {
    kind: "knowledge_note",
    title: "Onboarding Playbook for New Engineers",
    content_md: `# Onboarding Playbook — New Engineer

Welcome to the TaskFlow engineering team! This playbook takes you from laptop-open to first-PR-merged in ~5 days.

## Day 1 — Access & Environment
- [ ] Slack, GitHub, PagerDuty, AWS SSO, Notion access from IT
- [ ] Clone \`acme/taskflow\` monorepo
- [ ] Install: Node 20, pnpm 9, Docker Desktop
- [ ] Run \`pnpm bootstrap\` — takes ~10 min
- [ ] Copy \`.env.example\` → \`.env.local\`; ask onboarding buddy for shared dev secrets
- [ ] Start local stack: \`pnpm dev\`

## Day 2 — Architecture Deep Dive
- [ ] Read: \`docs/architecture.md\` (this project's Architecture Doc)
- [ ] Read: \`docs/database.md\` (schema tour)
- [ ] Attend architecture walkthrough with your onboarding buddy (1h)
- [ ] Complete the "trace a request" exercise: pick any button in the UI; follow the call all the way to Postgres

## Day 3 — First Contribution
- [ ] Pick a \`good-first-issue\` from the backlog
- [ ] Open a draft PR early
- [ ] Get code review from your buddy + 1 other engineer
- [ ] Merge!

## Day 4 — On-Call Shadowing
- [ ] Shadow current on-call primary for a day
- [ ] Read all runbooks in \`docs/runbooks/\`
- [ ] Do the game-day simulation (Postgres failover)

## Day 5 — Meet the Team
- [ ] 1:1 with CTO
- [ ] 1:1 with product designer for your area
- [ ] 1:1 with an SRE
- [ ] Team retro attendance

## Ongoing
- **Every PR:** at least 1 reviewer, all checks green, feature flag if user-facing
- **Every Friday:** demo Friday — show what shipped
- **Every incident:** postmortem within 5 business days

## Resources
- Design system: \`packages/ui/\` → Storybook at \`storybook.taskflow.io\`
- Metrics: \`grafana.taskflow.io\`
- Feature flags: \`flags.taskflow.io\` (LaunchDarkly)
- Incidents: \`incident.io/taskflow\`

*Written by the platform team. PRs to improve this welcome!*`,
  },
];
