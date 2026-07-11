import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireLocalAuth } from "./auth-middleware";
import { groqChat, groqJson } from "./groq.server";

const ARTIFACT_KINDS = [
  "srs", "brd", "prd", "user_stories", "tech_design", "api_docs", "architecture_doc",
  "database_doc", "deployment_guide", "user_manual",
  "architecture_review", "repo_review", "uiux_review", "database_review", "api_review",
  "test_cases", "risk_analysis", "security_review", "knowledge_note",
] as const;

const DOC_PROMPTS: Record<string, { title: string; system: string }> = {
  srs: {
    title: "Software Requirements Specification",
    system: `You are a senior business analyst. Produce a rigorous IEEE-830-style SRS in Markdown.
Include: 1. Introduction (Purpose, Scope, Definitions), 2. Overall Description (Perspective, Functions, User Classes, Assumptions),
3. Functional Requirements (numbered FR-1..FR-n with description, priority, acceptance criteria),
4. Non-Functional Requirements (Performance, Security, Reliability, Usability, Scalability),
5. External Interface Requirements, 6. Data Requirements, 7. Constraints, 8. Open Questions.
Be concrete and complete. Use tables where helpful.`,
  },
  brd: {
    title: "Business Requirements Document",
    system: `You are a senior business analyst. Produce a BRD in Markdown covering:
Executive Summary, Business Objectives, Stakeholders, Business Processes (as-is/to-be),
Business Requirements (numbered BR-n), Success Metrics/KPIs, Assumptions, Constraints, Risks.`,
  },
  prd: {
    title: "Product Requirements Document",
    system: `You are a senior product manager. Produce a PRD in Markdown covering:
Problem, Goals & Non-Goals, Personas, User Journeys, Feature List (P0/P1/P2),
Detailed Feature Specs, UX Requirements, Analytics/Success Metrics, Rollout Plan, Open Questions.`,
  },
  user_stories: {
    title: "User Stories & Acceptance Criteria",
    system: `You are a senior agile coach. Produce a comprehensive backlog in Markdown.
Group stories by Epic. For each story: ID (US-n), title, "As a … I want … so that …",
acceptance criteria in Given/When/Then, priority (Must/Should/Could), story points estimate.`,
  },
  tech_design: {
    title: "Technical Design Document",
    system: `You are a senior architect. Produce a TDD in Markdown covering: Overview, Architecture Diagram (ASCII),
Component Responsibilities, Data Model, Key Sequence Flows, APIs, Third-Party Integrations,
Deployment Topology, Security, Observability, Trade-offs.`,
  },
  api_docs: {
    title: "API Documentation",
    system: `You are a senior API designer. Produce full REST API documentation in Markdown.
For each endpoint: Method + Path, Summary, Auth, Request (headers/params/body schema),
Response (status codes, body schema), Errors, Examples. Group by resource.`,
  },
  architecture_doc: {
    title: "Architecture Documentation",
    system: `You are a senior software architect. Produce architecture docs in Markdown:
Context (C4 L1), Containers (C4 L2), Components (C4 L3), Data Flow, Deployment,
Cross-cutting Concerns (auth, logging, caching, secrets), Scalability & Performance strategy.`,
  },
  database_doc: {
    title: "Database Documentation",
    system: `You are a senior data engineer. Produce database docs in Markdown:
ER overview (textual), Tables (columns with types + constraints), Relationships,
Indexing strategy, Partitioning, Migration approach, Backup & Retention.`,
  },
  deployment_guide: {
    title: "Deployment Guide",
    system: `You are a senior DevOps engineer. Produce a deployment guide in Markdown:
Prerequisites, Environments, Infra-as-Code overview, CI/CD pipeline (stages), Secrets management,
Zero-downtime deploy strategy, Rollback, Health checks, Monitoring & Alerting hooks.`,
  },
  user_manual: {
    title: "User Manual",
    system: `You are a senior technical writer. Produce a user manual in Markdown:
Getting Started, Core Features (step-by-step with screenshots described), FAQs, Troubleshooting, Glossary.`,
  },
};

const REVIEW_PROMPTS: Record<string, { title: string; system: string }> = {
  architecture_review: {
    title: "Architecture Review",
    system: `You are a principal software architect. Review the provided architecture description.
Return Markdown with sections: Executive Summary, Strengths, Concerns (Critical/High/Medium/Low),
Design Patterns Applied, Missing Patterns, Scalability, Maintainability, Security Risks, Recommendations (numbered, actionable),
and end with a JSON block: \`\`\`json {"score": 0-100} \`\`\`.`,
  },
  repo_review: {
    title: "Repository Review",
    system: `You are a principal engineer reviewing a repository (metadata provided). Assess:
Folder Structure, Architecture Quality, Technical Debt, Complexity Hotspots, Naming Conventions,
Duplicate Logic Risks, Security Vulnerabilities to check, Missing Documentation, Dependency Issues.
Return Markdown. End with \`\`\`json {"score": 0-100} \`\`\`.`,
  },
  uiux_review: {
    title: "UI/UX Review",
    system: `You are a senior product designer. Review the described UI. Evaluate:
Accessibility (WCAG), Consistency, UX Heuristics (Nielsen), Color Contrast, Typography, Navigation,
Responsiveness, Component Reuse. Return Markdown with prioritized findings.
End with \`\`\`json {"score": 0-100} \`\`\`.`,
  },
  database_review: {
    title: "Database Review",
    system: `You are a senior data architect. Review the provided schema/ER description. Evaluate:
Normalization, Relationships, Indexing, Constraints, Query performance risks, Naming.
Return Markdown with prioritized recommendations. End with \`\`\`json {"score": 0-100} \`\`\`.`,
  },
  api_review: {
    title: "API Review",
    system: `You are a senior API designer. Review the provided API spec/description. Evaluate:
Naming, Response Consistency, Authentication, Error Handling, Performance, Versioning, Documentation quality.
Return Markdown. End with \`\`\`json {"score": 0-100} \`\`\`.`,
  },
  test_cases: {
    title: "AI-Generated Test Cases",
    system: `You are a senior QA lead. Given the feature/API description, generate:
- Functional test cases (table: ID, Title, Preconditions, Steps, Expected)
- Edge cases
- Regression suggestions
- API test cases (with sample payloads)
- UI test cases
- Integration scenarios
- Performance scenarios
Return Markdown.`,
  },
  risk_analysis: {
    title: "Project Risk Analysis",
    system: `You are a senior program manager. Analyze the project context and return Markdown:
Risk Register table (ID, Category, Description, Likelihood 1-5, Impact 1-5, Score, Mitigation, Owner).
Categories: Schedule, Security, Requirements, Resources, Deployment, Technical.
End with \`\`\`json {"score": 0-100, "top_risks": ["...","..."]} \`\`\` where score = overall project health (100 = safest).`,
  },
  security_review: {
    title: "Security Review",
    system: `You are a senior application security engineer. Review the provided system/API context. Cover:
AuthN, AuthZ, Secrets Exposure, OWASP Top 10 (per item), Dependency Vulnerability risks,
API Security, Infra Configuration. Return Markdown with severity-tagged findings and remediation.
End with \`\`\`json {"score": 0-100} \`\`\`.`,
  },
};

// -------------- Document generator --------------
export const generateDocument = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) =>
    z.object({
      project_id: z.string().uuid(),
      kind: z.enum(ARTIFACT_KINDS),
      brief: z.string().min(10).max(6000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const spec = DOC_PROMPTS[data.kind] ?? REVIEW_PROMPTS[data.kind];
    if (!spec) throw new Error(`Unsupported kind: ${data.kind}`);

    const content = await groqChat([
      { role: "system", content: spec.system },
      { role: "user", content: data.brief },
    ], { temperature: 0.4, max_tokens: 6000 });

    const score = extractScore(content);

    const { data: row, error } = await context.db
      .from("artifacts")
      .insert({
        project_id: data.project_id,
        created_by: context.userId,
        kind: data.kind,
        title: spec.title,
        content_md: content,
        score,
        metadata: { model: "llama-3.3-70b-versatile", brief: data.brief.slice(0, 500) },
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await context.db.from("activity_log").insert({
      project_id: data.project_id,
      actor_id: context.userId,
      action: "generated",
      target: spec.title,
      metadata: { kind: data.kind, artifact_id: row.id },
    });

    return row;
  });

// -------------- Detect missing requirements --------------
export const analyzeRequirements = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) =>
    z.object({ project_id: z.string().uuid(), requirements_md: z.string().min(20) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const result = await groqJson<{
      missing_functional: string[];
      missing_non_functional: string[];
      ambiguities: string[];
      prioritization: Array<{ requirement: string; moscow: "Must" | "Should" | "Could" | "Won't"; rationale: string }>;
      quality_score: number;
    }>([
      {
        role: "system",
        content:
          "You are a rigorous senior business analyst. Analyze the requirements document and return STRICT JSON with keys: " +
          "missing_functional (array of strings), missing_non_functional (array of strings), ambiguities (array), " +
          "prioritization (array of {requirement, moscow, rationale}), quality_score (0-100 integer).",
      },
      { role: "user", content: data.requirements_md },
    ], { temperature: 0.2 });

    const md = renderAnalysisMd(result);

    const { data: row, error } = await context.db
      .from("artifacts")
      .insert({
        project_id: data.project_id,
        created_by: context.userId,
        kind: "srs",
        title: "Requirements Analysis",
        content_md: md,
        score: result.quality_score,
        metadata: { analysis: result },
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// -------------- Project assistant chat --------------
export const projectChat = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) =>
    z.object({
      project_id: z.string().uuid(),
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })).min(1),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Pull recent artifacts as lightweight context
    const { data: arts } = await context.db
      .from("artifacts")
      .select("kind, title, content_md")
      .eq("project_id", data.project_id)
      .order("updated_at", { ascending: false })
      .limit(6);

    const ctx = (arts ?? [])
      .map((a: any) => `### ${a.title} (${a.kind})\n${(a.content_md ?? "").slice(0, 1200)}`)
      .join("\n\n");

    const reply = await groqChat([
      {
        role: "system",
        content:
          "You are an AI Project Assistant for a software team. Answer questions about their project. " +
          "Use the provided project artifacts as ground truth. Be concise, technical, and actionable. " +
          "If information is missing, say so explicitly.\n\n---\nPROJECT CONTEXT:\n" + (ctx || "(no artifacts yet)"),
      },
      ...data.messages,
    ], { temperature: 0.3, max_tokens: 1500 });

    return { reply };
  });

// -------------- Recompute quality scores from latest artifacts --------------
export const recomputeQualityScores = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ project_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: arts } = await context.db
      .from("artifacts")
      .select("kind, score")
      .eq("project_id", data.project_id);

    const buckets: Record<string, number[]> = {
      requirements: [], architecture: [], documentation: [], security: [],
      ui: [], database: [], apis: [], testing: [], maintainability: [],
    };
    for (const a of arts ?? []) {
      if (a.score == null) continue;
      const k = a.kind;
      if (["srs", "brd", "prd", "user_stories"].includes(k)) buckets.requirements.push(a.score);
      else if (k === "architecture_review" || k === "architecture_doc" || k === "tech_design") { buckets.architecture.push(a.score); buckets.maintainability.push(a.score); }
      else if (["api_docs", "architecture_doc", "database_doc", "deployment_guide", "user_manual", "tech_design"].includes(k)) buckets.documentation.push(a.score);
      else if (k === "security_review") buckets.security.push(a.score);
      else if (k === "uiux_review") buckets.ui.push(a.score);
      else if (k === "database_review") buckets.database.push(a.score);
      else if (k === "api_review") buckets.apis.push(a.score);
      else if (k === "test_cases") buckets.testing.push(a.score);
      else if (k === "repo_review") { buckets.maintainability.push(a.score); buckets.architecture.push(a.score); }
    }
    const avg = (xs: number[]) => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
    const scores = {
      project_id: data.project_id,
      requirements: avg(buckets.requirements),
      architecture: avg(buckets.architecture),
      documentation: avg(buckets.documentation),
      security: avg(buckets.security),
      ui: avg(buckets.ui),
      database: avg(buckets.database),
      apis: avg(buckets.apis),
      testing: avg(buckets.testing),
      maintainability: avg(buckets.maintainability),
    };
    await context.db.from("quality_scores").upsert(scores, { onConflict: "project_id" });
    return scores;
  });

// -------- helpers --------
function extractScore(md: string): number | null {
  const m = md.match(/```json\s*([\s\S]*?)\s*```/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[1]);
    if (typeof j.score === "number") return Math.max(0, Math.min(100, Math.round(j.score)));
  } catch { /* ignore */ }
  return null;
}

function renderAnalysisMd(r: {
  missing_functional: string[]; missing_non_functional: string[]; ambiguities: string[];
  prioritization: Array<{ requirement: string; moscow: string; rationale: string }>; quality_score: number;
}) {
  const bullet = (arr: string[]) => arr.length ? arr.map((x) => `- ${x}`).join("\n") : "_None detected._";
  const table = r.prioritization?.length
    ? `| Requirement | MoSCoW | Rationale |\n|---|---|---|\n` +
      r.prioritization.map((p) => `| ${p.requirement.replace(/\|/g, "\\|")} | **${p.moscow}** | ${p.rationale.replace(/\|/g, "\\|")} |`).join("\n")
    : "_No prioritization returned._";
  return `# Requirements Analysis

**Quality score:** \`${r.quality_score}/100\`

## Missing functional requirements
${bullet(r.missing_functional ?? [])}

## Missing non-functional requirements
${bullet(r.missing_non_functional ?? [])}

## Ambiguities
${bullet(r.ambiguities ?? [])}

## Prioritization
${table}
`;
}
