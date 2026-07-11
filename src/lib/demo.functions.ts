import { createServerFn } from "@tanstack/react-start";
import { requireLocalAuth } from "./auth-middleware";
import { db } from "./db";
import { DEMO_PROJECT, DEMO_ARTIFACTS, DEMO_SCORES } from "./demo-content";

const PROJECT_1_ID = "d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1";
const PROJECT_2_ID = "d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2";

function adaptArtifactForProject2(art: typeof DEMO_ARTIFACTS[number]) {
  let content = art.content_md;
  // Replace titles and descriptions
  content = content.replace(/TaskFlow/g, "Mano Portal");
  content = content.replace(/taskflow/g, "mano-portal");
  content = content.replace(/collaborative project management/g, "construction operations & portal management");
  content = content.replace(/engineering teams/g, "administrative & contractor teams");
  content = content.replace(/sprint|sprints/g, "milestone schedule");
  content = content.replace(/Kanban board|Kanban boards/g, "field inspection workflows");
  content = content.replace(/GitHub/g, "internal site databases");
  content = content.replace(/Google OAuth/g, "Azure AD SSO");
  content = content.replace(/board/g, "operations module");
  content = content.replace(/card|cards/g, "compliance records");

  const title = art.title.replace(/TaskFlow/g, "Mano Portal");
  
  return {
    ...art,
    title,
    content_md: content,
  };
}

export const ensureDemoProject = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .handler(async ({ context }) => {
    try {
      const { userId } = context;

      // Already seeded both projects?
      const { data: existing } = await db
        .from("projects")
        .select("id")
        .eq("owner_id", userId);

      if (existing && existing.length >= 2) {
        return { projectId: existing[0].id, created: false };
      }

      console.log("[Local DB Seeder] Seeding database for user:", userId);

      // Clear any partial data to ensure clean idempotency
      await db.from("projects").delete().eq("owner_id", userId);
      await db.from("quality_scores").delete().in("project_id", [PROJECT_1_ID, PROJECT_2_ID]);
      await db.from("artifacts").delete().in("project_id", [PROJECT_1_ID, PROJECT_2_ID]);
      await db.from("project_overview").delete().in("project_id", [PROJECT_1_ID, PROJECT_2_ID]);
      await db.from("stakeholders").delete().in("project_id", [PROJECT_1_ID, PROJECT_2_ID]);
      await db.from("requirements").delete().in("project_id", [PROJECT_1_ID, PROJECT_2_ID]);
      await db.from("user_stories").delete().in("project_id", [PROJECT_1_ID, PROJECT_2_ID]);

      // ==========================================
      // SEED PROJECT 1: TaskFlow PM SaaS
      // ==========================================
      const { data: p1, error: p1Err } = await db
        .from("projects")
        .insert({
          id: PROJECT_1_ID,
          owner_id: userId,
          name: DEMO_PROJECT.name,
          description: DEMO_PROJECT.description,
          tech_stack: DEMO_PROJECT.tech_stack,
          repo_url: DEMO_PROJECT.repo_url,
        })
        .select("*")
        .single();
      if (p1Err) throw new Error(p1Err.message);

      // 1. Overview
      await db.from("project_overview").insert({
        id: crypto.randomUUID(),
        project_id: PROJECT_1_ID,
        client_name: "Acme Corporation Solutions",
        business_domain: "Team Collaboration & Productivity",
        industry: "Information Technology",
        project_type: "Web SaaS Application",
        expected_users: "10,000+ monthly active users",
        expected_traffic: "300 requests/sec average, 1000/sec peak",
        tech_preference: "TypeScript, React, Next.js, Node.js, PostgreSQL",
        methodology: "Agile Sprint Scrum",
        timeline: "6 months to Initial Launch",
        budget: "$250,000 USD",
        risk_level: "medium",
        problem_statement: "Modern engineering teams struggle to track product requirements, design components, API schema versions, and automation tests in a single place, causing architectural drift.",
        current_challenges: "API specification and mock environments mismatching, QA code lag on sprint completions, stale onboarding setup runbooks.",
        business_opportunity: "Providing a unified SDLC Intelligence workspace for pair programmers and technical auditors.",
        expected_outcome: "100% traceability from requirement definitions down to running Cypress/Playwright integration tests.",
        ai_consultant_summary: "TaskFlow represents a standard high-scale SaaS architecture. Core focuses are real-time syncing via WebSockets and secure multi-tenant data isolation.",
        priority: "medium",
        status: "active",
        version: "1.0.0",
        progress: 68
      });

      // 2. Stakeholders
      await db.from("stakeholders").insert([
        { id: crypto.randomUUID(), project_id: PROJECT_1_ID, person_name: "Alice Johnson", email: "alice.j@acme.com", role: "Product Director" },
        { id: crypto.randomUUID(), project_id: PROJECT_1_ID, person_name: "Bob Miller", email: "bob.m@acme.com", role: "Chief Solutions Architect" },
        { id: crypto.randomUUID(), project_id: PROJECT_1_ID, person_name: "Charlie Smith", email: "charlie.s@acme.com", role: "Senior QA Lead" }
      ]);

      // 3. Requirements
      const r1Id = crypto.randomUUID();
      const r2Id = crypto.randomUUID();
      const r3Id = crypto.randomUUID();
      await db.from("requirements").insert([
        {
          id: r1Id,
          project_id: PROJECT_1_ID,
          code: "REQ-001",
          title: "Single Sign-On (SSO) Support",
          description: "Integration with SAML 2.0 and Google OAuth identity providers to verify enterprise credentials.",
          priority: "high",
          status: "approved",
          category: "functional",
          module: "Authentication",
          ai_estimated_effort: "5",
          business_value: "high",
          created_by: userId
        },
        {
          id: r2Id,
          project_id: PROJECT_1_ID,
          code: "REQ-002",
          title: "Real-time Board State Syncing",
          description: "WebSocket connection pipeline to sync Kanban columns and card details immediately across active dashboard views.",
          priority: "critical",
          status: "approved",
          category: "functional",
          module: "Board Management",
          ai_estimated_effort: "8",
          business_value: "high",
          created_by: userId
        },
        {
          id: r3Id,
          project_id: PROJECT_1_ID,
          code: "REQ-003",
          title: "Sub-2-second Page Load Latency",
          description: "NFR requirement: Main dashboard and analytics boards must render under 2000 milliseconds for P95 latency requests.",
          priority: "medium",
          status: "review",
          category: "non_functional",
          module: "Performance",
          ai_estimated_effort: "4",
          business_value: "medium",
          created_by: userId
        }
      ]);

      // 4. User Stories
      await db.from("user_stories").insert([
        {
          id: crypto.randomUUID(),
          project_id: PROJECT_1_ID,
          requirement_id: r1Id,
          code: "US-001",
          as_role: "workspace administrator",
          i_want: "to enable SAML 2.0 SSO identity configs",
          so_that: "our corporate teams can sign in safely without separate passwords",
          story_points: 3,
          sprint: "Sprint 4",
          status: "ready"
        },
        {
          id: crypto.randomUUID(),
          project_id: PROJECT_1_ID,
          requirement_id: r2Id,
          code: "US-002",
          as_role: "sprint manager",
          i_want: "to drag columns and cards optimistically on the Kanban board",
          so_that: "updates feel instantaneous and the state is pushed instantly over WebSockets",
          story_points: 5,
          sprint: "Sprint 5",
          status: "in_progress"
        }
      ]);

      // 5. Scores & Artifacts
      await db.from("quality_scores").insert({ project_id: PROJECT_1_ID, ...DEMO_SCORES });

      const p1Artifacts = DEMO_ARTIFACTS.map((a) => ({
        project_id: PROJECT_1_ID,
        created_by: userId,
        kind: a.kind as any,
        title: a.title,
        content_md: a.content_md,
        score: a.score ?? null,
        metadata: {},
      }));
      await db.from("artifacts").insert(p1Artifacts);

      // ==========================================
      // SEED PROJECT 2: Mano Portal Construction Suite
      // ==========================================
      const p2TechStack = [
        "JavaScript", "React 19", "Node.js 22", "Express", "SQLite", "Vite", "TailwindCSS v4", "Docker", "Nginx", "PM2"
      ];
      const { data: p2, error: p2Err } = await db
        .from("projects")
        .insert({
          id: PROJECT_2_ID,
          owner_id: userId,
          name: "Mano Portal — Construction & Ops Portal",
          description: "An integrated administrative and operational portal for Mano Projects Private Limited. Tracks inspections, contractors, milestones, and site material audits. Clean construction workflow analytics dashboard.",
          tech_stack: p2TechStack,
          repo_url: "https://github.com/mano-projects/admin-portal",
        })
        .select("*")
        .single();
      if (p2Err) throw new Error(p2Err.message);

      // 1. Overview
      await db.from("project_overview").insert({
        id: crypto.randomUUID(),
        project_id: PROJECT_2_ID,
        client_name: "Mano Projects Private Limited",
        business_domain: "Construction Management & Site Compliance",
        industry: "Construction & Real Estate",
        project_type: "Internal Operations Portal",
        expected_users: "500+ site inspectors and administrators",
        expected_traffic: "30 requests/sec average, 100/sec peak during shift reports",
        tech_preference: "JavaScript, React, Node.js, Express, SQLite",
        methodology: "Hybrid Kanban & Waterfall Inspections",
        timeline: "4 months Initial Deployment",
        budget: "$120,000 USD",
        risk_level: "low",
        problem_statement: "Field construction safety records, material audit checklists, and subcontractor billing are logged via spreadsheet files, creating invoice delays and safety audit gaps.",
        current_challenges: "Subcontractors reporting offline site updates are prone to error, auditing inspection timelines lacks digital signatures, and invoice approval workflows require manual mail checks.",
        business_opportunity: "Building a lightweight, offline-first responsive portal with automated audit logs.",
        expected_outcome: "Safety inspections reconciled immediately; contractor invoicing cycles reduced from 14 days to 48 hours.",
        ai_consultant_summary: "Mano Portal highlights a site administration suite. Primary technical decisions focus on caching field inputs locally and batch-syncing files once online.",
        priority: "high",
        status: "active",
        version: "1.0.0",
        progress: 80
      });

      // 2. Stakeholders
      await db.from("stakeholders").insert([
        { id: crypto.randomUUID(), project_id: PROJECT_2_ID, person_name: "Madhavan R.", email: "md@manoprojects.com", role: "Managing Director" },
        { id: crypto.randomUUID(), project_id: PROJECT_2_ID, person_name: "Vikram K.", email: "vikram.k@manoprojects.com", role: "Site Engineering Chief" },
        { id: crypto.randomUUID(), project_id: PROJECT_2_ID, person_name: "Sarah Lee", email: "sarah@manoprojects.com", role: "Lead Site Auditor" }
      ]);

      // 3. Requirements
      const r4Id = crypto.randomUUID();
      const r5Id = crypto.randomUUID();
      const r6Id = crypto.randomUUID();
      await db.from("requirements").insert([
        {
          id: r4Id,
          project_id: PROJECT_2_ID,
          code: "REQ-001",
          title: "Field Inspection Forms & Offline Cache",
          description: "Offline-first inspection module to log safety metrics, record concrete/reinforcement audits, and batch-upload on signal recovery.",
          priority: "high",
          status: "approved",
          category: "functional",
          module: "Inspections",
          ai_estimated_effort: "6",
          business_value: "high",
          created_by: userId
        },
        {
          id: r5Id,
          project_id: PROJECT_2_ID,
          code: "REQ-002",
          title: "Subcontractor Invoice Approvals Workflow",
          description: "Three-tier billing approval module mapping logged milestone inspections directly to corresponding payment items.",
          priority: "high",
          status: "approved",
          category: "functional",
          module: "Finance & Billing",
          ai_estimated_effort: "4",
          business_value: "high",
          created_by: userId
        },
        {
          id: r6Id,
          project_id: PROJECT_2_ID,
          code: "REQ-003",
          title: "Geo-tagging and Metadata Inspections Protection",
          description: "NFR requirement: Safety files and images logged on the portal MUST include cryptographically verified geo-tags to guarantee inspection location validity.",
          priority: "critical",
          status: "review",
          category: "non_functional",
          module: "Security",
          ai_estimated_effort: "3",
          business_value: "medium",
          created_by: userId
        }
      ]);

      // 4. User Stories
      await db.from("user_stories").insert([
        {
          id: crypto.randomUUID(),
          project_id: PROJECT_2_ID,
          requirement_id: r4Id,
          code: "US-001",
          as_role: "safety inspector on site",
          i_want: "to compile safety audits while offline",
          so_that: "my records are cached locally and synced seamlessly when back in cellular coverage",
          story_points: 5,
          sprint: "Milestone 2",
          status: "in_progress"
        },
        {
          id: crypto.randomUUID(),
          project_id: PROJECT_2_ID,
          requirement_id: r5Id,
          code: "US-002",
          as_role: "billing administrator",
          i_want: "subcontractor invoices to auto-reconcile against approved inspection tasks",
          so_that: "we prevent manual invoice processing mistakes and accelerate payments",
          story_points: 3,
          sprint: "Milestone 3",
          status: "ready"
        }
      ]);

      // 5. Scores & Artifacts
      const demoScores2 = {
        requirements: 94,
        architecture: 88,
        documentation: 90,
        security: 82,
        ui: 91,
        database: 87,
        apis: 86,
        testing: 84,
        maintainability: 85,
      };
      await db.from("quality_scores").insert({ project_id: PROJECT_2_ID, ...demoScores2 });

      const p2Artifacts = DEMO_ARTIFACTS.map((a) => {
        const adapted = adaptArtifactForProject2(a);
        return {
          project_id: PROJECT_2_ID,
          created_by: userId,
          kind: adapted.kind as any,
          title: adapted.title,
          content_md: adapted.content_md,
          score: adapted.score ?? null,
          metadata: {},
        };
      });
      await db.from("artifacts").insert(p2Artifacts);

      console.log("[Local DB Seeder] Successfully seeded 2 unique projects (TaskFlow & Mano Portal) with diverse records!");

      return { projectId: PROJECT_1_ID, created: true };
    } catch (err) {
      console.error("ensureDemoProject failed:", err);
      throw err;
    }
  });
