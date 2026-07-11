import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireLocalAuth } from "./auth-middleware";
import { groqChat, groqJson } from "./groq.server";

const uuid = z.string().uuid();

const PRIORITY = z.enum(["critical", "high", "medium", "low"]);
const COMPLEXITY = z.enum(["easy", "medium", "hard"]);
const BIZ_VALUE = z.enum(["high", "medium", "low"]);
const REQ_STATUS = z.enum(["draft", "review", "approved", "rejected", "implemented"]);
const CATEGORY = z.enum(["functional", "non_functional", "business"]);
const STORY_STATUS = z.enum(["draft", "ready", "in_progress", "done", "blocked"]);
const NFR_CATEGORY = z.enum([
  "performance", "security", "scalability", "availability", "accessibility",
  "localization", "maintainability", "compliance", "monitoring", "logging",
  "backup", "recovery", "encryption",
]);
const APPROVAL_STAGE = z.enum([
  "business_review", "technical_review", "architecture_review", "qa_review", "client_approval",
]);
const APPROVAL_STATUS = z.enum(["pending", "approved", "rejected", "changes_requested"]);

// ================= Overview =================
export const getRequirementsWorkspace = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ project_id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const pid = data.project_id;
    const [
      overview, stakeholders, requirements, stories, ac, nfr, analysis, versions, approvals, comments,
    ] = await Promise.all([
      s.from("project_overview").select("*").eq("project_id", pid).maybeSingle(),
      s.from("stakeholders").select("*").eq("project_id", pid).order("created_at"),
      s.from("requirements").select("*").eq("project_id", pid).order("code"),
      s.from("user_stories").select("*").eq("project_id", pid).order("code"),
      s.from("acceptance_criteria").select("*").eq("project_id", pid).order("created_at"),
      s.from("non_functional_requirements").select("*").eq("project_id", pid).order("category"),
      s.from("ai_analyses").select("*").eq("project_id", pid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      s.from("requirement_versions").select("*").eq("project_id", pid).order("created_at", { ascending: false }).limit(50),
      s.from("approvals").select("*").eq("project_id", pid).order("created_at", { ascending: false }),
      s.from("requirement_comments").select("*").eq("project_id", pid).order("created_at", { ascending: false }).limit(100),
    ]);
    return {
      overview: overview.data ?? null,
      stakeholders: stakeholders.data ?? [],
      requirements: requirements.data ?? [],
      stories: stories.data ?? [],
      acceptance_criteria: ac.data ?? [],
      nfrs: nfr.data ?? [],
      analysis: analysis.data ?? null,
      versions: versions.data ?? [],
      approvals: approvals.data ?? [],
      comments: comments.data ?? [],
    };
  });

const OverviewInput = z.object({
  project_id: uuid,
  client_name: z.string().max(200).optional().nullable(),
  business_domain: z.string().max(200).optional().nullable(),
  industry: z.string().max(200).optional().nullable(),
  project_type: z.string().max(200).optional().nullable(),
  expected_users: z.string().max(200).optional().nullable(),
  expected_traffic: z.string().max(200).optional().nullable(),
  tech_preference: z.string().max(500).optional().nullable(),
  methodology: z.string().max(200).optional().nullable(),
  timeline: z.string().max(200).optional().nullable(),
  budget: z.string().max(200).optional().nullable(),
  risk_level: z.string().max(200).optional().nullable(),
  problem_statement: z.string().max(4000).optional().nullable(),
  current_challenges: z.string().max(4000).optional().nullable(),
  business_opportunity: z.string().max(4000).optional().nullable(),
  expected_outcome: z.string().max(4000).optional().nullable(),
  ai_consultant_summary: z.string().max(4000).optional().nullable(),
  priority: PRIORITY.optional(),
  status: z.string().max(50).optional(),
  version: z.string().max(50).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

export const upsertOverview = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => OverviewInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.db
      .from("project_overview")
      .upsert(data, { onConflict: "project_id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ================= Stakeholders =================
export const upsertStakeholder = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) =>
    z.object({
      id: uuid.optional(),
      project_id: uuid,
      role: z.string().min(1).max(100),
      person_name: z.string().min(1).max(200),
      email: z.string().email().max(200).optional().or(z.literal("")).nullable(),
      notes: z.string().max(1000).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const payload = { ...data, email: data.email || null };
    const q = data.id
      ? context.db.from("stakeholders").update(payload).eq("id", data.id).select("*").single()
      : context.db.from("stakeholders").insert(payload).select("*").single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteStakeholder = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("stakeholders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= Requirements =================
const RequirementInput = z.object({
  id: uuid.optional(),
  project_id: uuid,
  code: z.string().min(1).max(50).optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(6000).optional().nullable(),
  priority: PRIORITY.optional(),
  complexity: COMPLEXITY.optional(),
  business_value: BIZ_VALUE.optional(),
  status: REQ_STATUS.optional(),
  category: CATEGORY.optional(),
  module: z.string().max(200).optional().nullable(),
  business_rule: z.string().max(2000).optional().nullable(),
  inputs: z.string().max(2000).optional().nullable(),
  outputs: z.string().max(2000).optional().nullable(),
  validation: z.string().max(2000).optional().nullable(),
  ai_estimated_effort: z.string().max(200).optional().nullable(),
  tags: z.array(z.string().max(50)).max(30).optional(),
});

async function nextRequirementCode(db: any, projectId: string): Promise<string> {
  const { data } = await db
    .from("requirements")
    .select("code")
    .eq("project_id", projectId)
    .order("code", { ascending: false })
    .limit(200);
  let max = 0;
  for (const r of data ?? []) {
    const m = /REQ-(\d+)/i.exec(r.code ?? "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `REQ-${String(max + 1).padStart(3, "0")}`;
}

export const upsertRequirement = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => RequirementInput.parse(i))
  .handler(async ({ data, context }) => {
    const s = context.db;
    if (data.id) {
      // snapshot prior version
      const { data: prev } = await s.from("requirements").select("*").eq("id", data.id).single();
      if (prev) {
        await s.from("requirement_versions").insert({
          project_id: prev.project_id,
          requirement_id: prev.id,
          version: prev.version ?? 1,
          snapshot: prev,
          change_summary: "Auto snapshot before edit",
          created_by: context.userId,
        });
      }
      const { data: row, error } = await s.from("requirements")
        .update({ ...data, version: (prev?.version ?? 1) + 1 })
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const code = data.code || await nextRequirementCode(s, data.project_id);
    const { data: row, error } = await s.from("requirements")
      .insert({ ...data, code, created_by: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteRequirement = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("requirements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= User Stories =================
async function nextStoryCode(db: any, projectId: string): Promise<string> {
  const { data } = await db
    .from("user_stories")
    .select("code")
    .eq("project_id", projectId)
    .order("code", { ascending: false })
    .limit(200);
  let max = 0;
  for (const r of data ?? []) {
    const m = /US-(\d+)/i.exec(r.code ?? "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `US-${String(max + 1).padStart(3, "0")}`;
}

export const upsertStory = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) =>
    z.object({
      id: uuid.optional(),
      project_id: uuid,
      requirement_id: uuid.optional().nullable(),
      code: z.string().max(50).optional(),
      as_role: z.string().min(1).max(200),
      i_want: z.string().min(1).max(1000),
      so_that: z.string().max(1000).optional().nullable(),
      priority: PRIORITY.optional(),
      sprint: z.string().max(100).optional().nullable(),
      epic: z.string().max(200).optional().nullable(),
      status: STORY_STATUS.optional(),
      story_points: z.number().int().min(0).max(100).optional().nullable(),
      risk: z.string().max(500).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = context.db;
    if (data.id) {
      const { data: row, error } = await s.from("user_stories").update(data).eq("id", data.id).select("*").single();
      if (error) throw new Error(error.message);
      return row;
    }
    const code = data.code || await nextStoryCode(s, data.project_id);
    const { data: row, error } = await s.from("user_stories").insert({ ...data, code }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteStory = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("user_stories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= Acceptance Criteria =================
export const upsertAcceptance = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) =>
    z.object({
      id: uuid.optional(),
      project_id: uuid,
      requirement_id: uuid.optional().nullable(),
      story_id: uuid.optional().nullable(),
      given_text: z.string().min(1).max(1000),
      when_text: z.string().min(1).max(1000),
      then_text: z.string().min(1).max(1000),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = context.db;
    const q = data.id
      ? s.from("acceptance_criteria").update(data).eq("id", data.id).select("*").single()
      : s.from("acceptance_criteria").insert(data).select("*").single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteAcceptance = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("acceptance_criteria").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= NFRs =================
export const upsertNfr = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) =>
    z.object({
      id: uuid.optional(),
      project_id: uuid,
      category: NFR_CATEGORY,
      metric: z.string().min(1).max(200),
      target_value: z.string().max(200).optional().nullable(),
      description: z.string().max(2000).optional().nullable(),
      priority: PRIORITY.optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = context.db;
    const q = data.id
      ? s.from("non_functional_requirements").update(data).eq("id", data.id).select("*").single()
      : s.from("non_functional_requirements").insert(data).select("*").single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteNfr = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("non_functional_requirements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= Approvals =================
export const upsertApproval = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) =>
    z.object({
      id: uuid.optional(),
      project_id: uuid,
      requirement_id: uuid.optional().nullable(),
      stage: APPROVAL_STAGE,
      reviewer_name: z.string().max(200).optional().nullable(),
      status: APPROVAL_STATUS.optional(),
      comments: z.string().max(2000).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = context.db;
    const q = data.id
      ? s.from("approvals").update(data).eq("id", data.id).select("*").single()
      : s.from("approvals").insert({ ...data, reviewer_id: context.userId }).select("*").single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteApproval = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("approvals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= Comments =================
export const addComment = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) =>
    z.object({
      project_id: uuid,
      requirement_id: uuid,
      body: z.string().min(1).max(4000),
      author_name: z.string().max(200).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.db.from("requirement_comments")
      .insert({ ...data, author_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ================= AI: generate consultant summary =================
export const aiGenerateOverview = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ project_id: uuid, brief: z.string().min(20).max(6000) }).parse(i))
  .handler(async ({ data, context }) => {
    const result = await groqJson<{
      client_name: string; business_domain: string; industry: string; project_type: string;
      expected_users: string; expected_traffic: string; tech_preference: string; methodology: string;
      timeline: string; budget: string; risk_level: string; problem_statement: string;
      current_challenges: string; business_opportunity: string; expected_outcome: string;
      ai_consultant_summary: string; priority: "critical"|"high"|"medium"|"low";
    }>([
      { role: "system", content:
        "You are a senior AI Business Analyst and Solution Consultant. Extract project overview fields from the brief. Return STRICT JSON with all keys: client_name, business_domain, industry, project_type, expected_users, expected_traffic, tech_preference, methodology, timeline, budget, risk_level, problem_statement, current_challenges, business_opportunity, expected_outcome, ai_consultant_summary (2-4 sentence executive summary), priority (one of critical/high/medium/low). Use empty strings when unknown, never null." },
      { role: "user", content: data.brief },
    ], { temperature: 0.3 });

    const { data: row, error } = await context.db.from("project_overview")
      .upsert({ project_id: data.project_id, ...result }, { onConflict: "project_id" })
      .select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

// ================= AI: generate requirements from brief =================
export const aiGenerateRequirements = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ project_id: uuid, brief: z.string().min(20).max(6000), count: z.number().int().min(3).max(25).optional() }).parse(i))
  .handler(async ({ data, context }) => {
    const count = data.count ?? 10;
    const result = await groqJson<{
      requirements: Array<{
        title: string; description: string;
        priority: "critical"|"high"|"medium"|"low";
        complexity: "easy"|"medium"|"hard";
        business_value: "high"|"medium"|"low";
        category: "functional"|"non_functional"|"business";
        module: string; business_rule: string; inputs: string; outputs: string; validation: string;
        ai_estimated_effort: string;
      }>;
    }>([
      { role: "system", content: `You are a senior AI Business Analyst. Generate exactly ${count} well-scoped software requirements for the described project. Return STRICT JSON with a single key "requirements" — array of ${count} objects with keys: title, description, priority (critical|high|medium|low), complexity (easy|medium|hard), business_value (high|medium|low), category (functional|non_functional|business), module, business_rule, inputs, outputs, validation, ai_estimated_effort (e.g. "3 days"). Be specific and enterprise-grade.` },
      { role: "user", content: data.brief },
    ], { temperature: 0.4, max_tokens: 6000 });

    const s = context.db;
    const startCode = await nextRequirementCode(s, data.project_id);
    const startNum = parseInt(startCode.replace(/\D/g, ""), 10);
    const rows = (result.requirements ?? []).map((r, idx) => ({
      project_id: data.project_id,
      code: `REQ-${String(startNum + idx).padStart(3, "0")}`,
      title: r.title,
      description: r.description,
      priority: r.priority,
      complexity: r.complexity,
      business_value: r.business_value,
      category: r.category,
      module: r.module,
      business_rule: r.business_rule,
      inputs: r.inputs,
      outputs: r.outputs,
      validation: r.validation,
      ai_estimated_effort: r.ai_estimated_effort,
      status: "draft" as const,
      created_by: context.userId,
    }));
    if (rows.length === 0) return [];
    const { data: inserted, error } = await s.from("requirements").insert(rows).select("*");
    if (error) throw new Error(error.message);
    return inserted ?? [];
  });

// ================= AI: convert requirement -> stories =================
export const aiRequirementToStories = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ requirement_id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const { data: req, error } = await s.from("requirements").select("*").eq("id", data.requirement_id).single();
    if (error) throw new Error(error.message);
    const result = await groqJson<{
      stories: Array<{ as_role: string; i_want: string; so_that: string; priority: "critical"|"high"|"medium"|"low"; story_points: number; risk: string; }>;
    }>([
      { role: "system", content: "You are a senior agile coach. Convert the requirement into 2-5 detailed user stories. Return STRICT JSON {stories:[{as_role,i_want,so_that,priority,story_points,risk}]}." },
      { role: "user", content: `Title: ${req.title}\n\nDescription: ${req.description}\n\nBusiness rule: ${req.business_rule ?? ""}` },
    ], { temperature: 0.4 });

    const start = await nextStoryCode(s, req.project_id);
    const startNum = parseInt(start.replace(/\D/g, ""), 10);
    const rows = (result.stories ?? []).map((st, idx) => ({
      project_id: req.project_id,
      requirement_id: req.id,
      code: `US-${String(startNum + idx).padStart(3, "0")}`,
      as_role: st.as_role, i_want: st.i_want, so_that: st.so_that,
      priority: st.priority, story_points: st.story_points, risk: st.risk,
      status: "draft" as const,
    }));
    if (rows.length === 0) return [];
    const { data: ins, error: e2 } = await s.from("user_stories").insert(rows).select("*");
    if (e2) throw new Error(e2.message);
    return ins ?? [];
  });

// ================= AI: generate acceptance criteria =================
export const aiAcceptanceCriteria = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ requirement_id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const { data: req, error } = await s.from("requirements").select("*").eq("id", data.requirement_id).single();
    if (error) throw new Error(error.message);
    const result = await groqJson<{ criteria: Array<{ given: string; when: string; then: string }> }>([
      { role: "system", content: "You are a senior QA lead. Produce 3-5 Gherkin acceptance criteria for the requirement. Return STRICT JSON {criteria:[{given,when,then}]}." },
      { role: "user", content: `Title: ${req.title}\n\nDescription: ${req.description}` },
    ], { temperature: 0.3 });
    const rows = (result.criteria ?? []).map((c) => ({
      project_id: req.project_id, requirement_id: req.id,
      given_text: c.given, when_text: c.when, then_text: c.then,
    }));
    if (rows.length === 0) return [];
    const { data: ins, error: e2 } = await s.from("acceptance_criteria").insert(rows).select("*");
    if (e2) throw new Error(e2.message);
    return ins ?? [];
  });

// ================= AI: full analysis =================
export const aiFullAnalysis = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ project_id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const [{ data: reqs }, { data: nfrs }, { data: overview }] = await Promise.all([
      s.from("requirements").select("code,title,description,priority,category,module").eq("project_id", data.project_id),
      s.from("non_functional_requirements").select("category,metric,target_value").eq("project_id", data.project_id),
      s.from("project_overview").select("*").eq("project_id", data.project_id).maybeSingle(),
    ]);
    const context_str = `PROJECT OVERVIEW:\n${JSON.stringify(overview ?? {}, null, 2)}\n\nREQUIREMENTS (${reqs?.length ?? 0}):\n${(reqs ?? []).map((r: any) => `- [${r.code}] (${r.priority}/${r.category}) ${r.title}: ${r.description ?? ""}`).join("\n")}\n\nNFRs:\n${(nfrs ?? []).map((n: any) => `- ${n.category}: ${n.metric} = ${n.target_value ?? ""}`).join("\n")}`;

    const result = await groqJson<{
      quality_score: number; completeness_score: number;
      ambiguities: Array<{ code?: string; text: string; recommendation: string }>;
      conflicts: Array<{ a: string; b: string; reason: string }>;
      duplicates: Array<{ codes: string[]; reason: string }>;
      missing_items: string[];
      business_impact: { business_value: string; risk: string; development_cost: string; timeline: string; priority: string };
      effort_estimation: { frontend: string; backend: string; database: string; devops: string; qa: string; documentation: string };
      tech_suggestions: string[];
      architecture_recommendation: string;
      risks: Array<{ area: string; severity: string; description: string; mitigation: string }>;
    }>([
      { role: "system", content: "You are a senior AI Solution Consultant, Business Analyst and Software Architect. Analyze the requirements set and return STRICT JSON with keys: quality_score (0-100), completeness_score (0-100), ambiguities (array of {code,text,recommendation}), conflicts (array of {a,b,reason}), duplicates (array of {codes[],reason}), missing_items (array of strings — e.g. Audit Logs, Notifications, Reports), business_impact ({business_value,risk,development_cost,timeline,priority}), effort_estimation ({frontend,backend,database,devops,qa,documentation}), tech_suggestions (array), architecture_recommendation (one of: Monolith, Microservices, Serverless, Event Driven — with 1-line rationale), risks (array of {area,severity,description,mitigation})." },
      { role: "user", content: context_str },
    ], { temperature: 0.2, max_tokens: 5000 });

    const { data: row, error } = await s.from("ai_analyses").insert({
      project_id: data.project_id,
      quality_score: result.quality_score,
      completeness_score: result.completeness_score,
      ambiguities: result.ambiguities,
      conflicts: result.conflicts,
      duplicates: result.duplicates,
      missing_items: result.missing_items,
      business_impact: result.business_impact,
      effort_estimation: result.effort_estimation,
      tech_suggestions: result.tech_suggestions,
      architecture_recommendation: result.architecture_recommendation,
      risks: result.risks,
      raw: result,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

// ================= AI: improve/simplify/explain requirement =================
export const aiRefineRequirement = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({
    requirement_id: uuid,
    action: z.enum(["improve", "simplify", "rewrite", "explain", "estimate", "detect_missing"]),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const { data: req, error } = await s.from("requirements").select("*").eq("id", data.requirement_id).single();
    if (error) throw new Error(error.message);

    const prompts: Record<string, string> = {
      improve: "Rewrite this requirement to be clearer, more testable, and enterprise-grade. Return improved title and description only.",
      simplify: "Simplify this requirement to plain business language. Return improved title and description only.",
      rewrite: "Rewrite this requirement in formal IEEE-830 style. Return improved title and description only.",
      explain: "Explain this requirement in 2-3 sentences for a non-technical stakeholder.",
      estimate: "Estimate development effort (frontend/backend/qa) and complexity. Return a concise summary.",
      detect_missing: "List missing information, edge cases, and validations for this requirement.",
    };
    const reply = await groqChat([
      { role: "system", content: `You are a senior Business Analyst. ${prompts[data.action]}` },
      { role: "user", content: `Title: ${req.title}\n\nDescription: ${req.description ?? ""}` },
    ], { temperature: 0.3, max_tokens: 1500 });
    return { text: reply };
  });

// ================= Export SRS / BRD =================
export const exportRequirementsDoc = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((i: unknown) => z.object({ project_id: uuid, kind: z.enum(["srs", "brd"]) }).parse(i))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const [{ data: overview }, { data: reqs }, { data: nfrs }, { data: stories }, { data: ac }] = await Promise.all([
      s.from("project_overview").select("*").eq("project_id", data.project_id).maybeSingle(),
      s.from("requirements").select("*").eq("project_id", data.project_id).order("code"),
      s.from("non_functional_requirements").select("*").eq("project_id", data.project_id).order("category"),
      s.from("user_stories").select("*").eq("project_id", data.project_id).order("code"),
      s.from("acceptance_criteria").select("*").eq("project_id", data.project_id),
    ]);
    const md = buildDocMd(data.kind, overview, reqs ?? [], nfrs ?? [], stories ?? [], ac ?? []);
    const title = data.kind === "srs" ? "Software Requirements Specification" : "Business Requirements Document";
    const { data: row, error } = await s.from("artifacts").insert({
      project_id: data.project_id,
      created_by: context.userId,
      kind: data.kind,
      title,
      content_md: md,
      metadata: { generated_from: "requirements_module" },
    }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

function buildDocMd(kind: "srs" | "brd", overview: any, reqs: any[], nfrs: any[], stories: any[], ac: any[]): string {
  const lines: string[] = [];
  const title = kind === "srs" ? "Software Requirements Specification" : "Business Requirements Document";
  lines.push(`# ${title}\n`);
  if (overview) {
    lines.push(`## Project Overview\n`);
    lines.push(`- **Client:** ${overview.client_name ?? ""}`);
    lines.push(`- **Domain:** ${overview.business_domain ?? ""}`);
    lines.push(`- **Industry:** ${overview.industry ?? ""}`);
    lines.push(`- **Timeline:** ${overview.timeline ?? ""}`);
    lines.push(`- **Budget:** ${overview.budget ?? ""}\n`);
    if (overview.ai_consultant_summary) lines.push(`### Executive Summary\n${overview.ai_consultant_summary}\n`);
    if (overview.problem_statement) lines.push(`### Problem Statement\n${overview.problem_statement}\n`);
    if (overview.expected_outcome) lines.push(`### Expected Outcome\n${overview.expected_outcome}\n`);
  }
  lines.push(`## Functional Requirements\n`);
  for (const r of reqs.filter((x) => x.category !== "non_functional")) {
    lines.push(`### ${r.code} — ${r.title}`);
    lines.push(`- **Priority:** ${r.priority} | **Complexity:** ${r.complexity} | **Value:** ${r.business_value}`);
    if (r.module) lines.push(`- **Module:** ${r.module}`);
    if (r.description) lines.push(`\n${r.description}\n`);
    if (r.business_rule) lines.push(`- **Business rule:** ${r.business_rule}`);
    const criteria = ac.filter((c: any) => c.requirement_id === r.id);
    if (criteria.length) {
      lines.push(`\n**Acceptance criteria:**`);
      for (const c of criteria) lines.push(`- Given ${c.given_text}, When ${c.when_text}, Then ${c.then_text}`);
    }
    lines.push("");
  }
  lines.push(`## Non-Functional Requirements\n`);
  for (const n of nfrs) {
    lines.push(`- **${n.category}** — ${n.metric}${n.target_value ? `: **${n.target_value}**` : ""}${n.description ? ` — ${n.description}` : ""}`);
  }
  lines.push(`\n## User Stories\n`);
  for (const st of stories) {
    lines.push(`- **${st.code}** — As a ${st.as_role}, I want ${st.i_want}${st.so_that ? `, so that ${st.so_that}` : ""}. _(${st.priority}, ${st.story_points ?? "?"} pts)_`);
  }
  return lines.join("\n");
}
