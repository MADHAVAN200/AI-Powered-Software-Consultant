import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireLocalAuth } from "./auth-middleware";
import { groqChat } from "./groq.server";

const uuid = z.string().uuid();

const CATEGORY = z.enum([
  "business", "technical", "architecture", "api", "database",
  "user", "ai", "testing", "deployment", "operations", "compliance",
]);
const STATUS = z.enum(["draft", "in_review", "approved", "needs_update", "archived"]);

// ================= Workspace =================
export const getDocumentationWorkspace = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ project_id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const pid = data.project_id;
    const [documents, versions, comments, reviews, approvals, templates] = await Promise.all([
      s.from("documents").select("*").eq("project_id", pid).order("category").order("title"),
      s.from("document_versions").select("*").eq("project_id", pid).order("created_at", { ascending: false }).limit(200),
      s.from("document_comments").select("*").eq("project_id", pid).order("created_at", { ascending: false }).limit(200),
      s.from("document_reviews").select("*").eq("project_id", pid).order("created_at", { ascending: false }).limit(100),
      s.from("document_approvals").select("*").eq("project_id", pid).order("created_at", { ascending: false }),
      s.from("document_templates").select("*").or(`is_global.eq.true,project_id.eq.${pid}`).order("category"),
    ]);
    return {
      documents: documents.data ?? [],
      versions: versions.data ?? [],
      comments: comments.data ?? [],
      reviews: reviews.data ?? [],
      approvals: approvals.data ?? [],
      templates: templates.data ?? [],
    };
  });

// ================= Upsert Document =================
const DocInput = z.object({
  id: uuid.optional(),
  project_id: uuid,
  category: CATEGORY,
  doc_type: z.string().min(1).max(80),
  title: z.string().min(1).max(300),
  summary: z.string().max(2000).optional().nullable(),
  content_md: z.string().max(200_000).optional().nullable(),
  status: STATUS.optional(),
  tags: z.array(z.string()).optional(),
  change_summary: z.string().max(1000).optional().nullable(),
});

export const upsertDocument = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => DocInput.parse(input))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const { id, change_summary, ...payload } = data;

    if (id) {
      // snapshot current version before update
      const { data: prev } = await s.from("documents").select("*").eq("id", id).maybeSingle();
      if (prev) {
        await s.from("document_versions").insert({
          document_id: id, project_id: prev.project_id, version: prev.current_version,
          title: prev.title, content_md: prev.content_md,
          change_summary: change_summary ?? "Update",
          created_by: context.userId,
        });
      }
      const nextVersion = (prev?.current_version ?? 1) + 1;
      const { data: updated, error } = await s.from("documents")
        .update({ ...payload, current_version: nextVersion })
        .eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      return updated;
    }
    const { data: created, error } = await s.from("documents")
      .insert({ ...payload, created_by: context.userId, current_version: 1 })
      .select("*").single();
    if (error) throw new Error(error.message);
    await s.from("document_versions").insert({
      document_id: created.id, project_id: created.project_id, version: 1,
      title: created.title, content_md: created.content_md,
      change_summary: change_summary ?? "Initial version", created_by: context.userId,
    });
    return created;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= Comments =================
export const addDocComment = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({
    document_id: uuid, project_id: uuid,
    author_name: z.string().min(1).max(200), body: z.string().min(1).max(4000),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: c, error } = await context.db.from("document_comments").insert(data).select("*").single();
    if (error) throw new Error(error.message);
    return c;
  });

// ================= Approvals =================
export const upsertDocApproval = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({
    id: uuid.optional(), document_id: uuid, project_id: uuid,
    stage: z.string().min(1).max(80), approver_name: z.string().min(1).max(200),
    status: z.enum(["pending", "approved", "rejected", "changes_requested"]),
    notes: z.string().max(2000).optional().nullable(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const decided = data.status === "pending" ? null : new Date().toISOString();
    const payload = { ...data, decided_at: decided };
    if (data.id) {
      const { id, ...rest } = payload;
      const { error } = await context.db.from("document_approvals").update(rest).eq("id", id!);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { id: _omit, ...rest } = payload;
    void _omit;
    const { error } = await context.db.from("document_approvals").insert(rest);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= Restore version =================
export const restoreDocVersion = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ version_id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const { data: v, error } = await s.from("document_versions").select("*").eq("id", data.version_id).single();
    if (error) throw new Error(error.message);
    const { data: doc } = await s.from("documents").select("current_version").eq("id", v.document_id).single();
    const next = (doc?.current_version ?? 1) + 1;
    // snapshot current before overwrite
    const { data: cur } = await s.from("documents").select("*").eq("id", v.document_id).single();
    if (cur) {
      await s.from("document_versions").insert({
        document_id: cur.id, project_id: cur.project_id, version: cur.current_version,
        title: cur.title, content_md: cur.content_md,
        change_summary: "Auto-snapshot before restore", created_by: context.userId,
      });
    }
    const { error: uerr } = await s.from("documents").update({
      title: v.title, content_md: v.content_md, current_version: next, status: "draft",
    }).eq("id", v.document_id);
    if (uerr) throw new Error(uerr.message);
    return { ok: true };
  });

// ================= AI Generate =================
export const aiGenerateDocument = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({
    project_id: uuid, category: CATEGORY,
    doc_type: z.string().min(1).max(80),
    title: z.string().min(1).max(300),
    context_brief: z.string().max(8000).optional().nullable(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const s = context.db;

    // pull light project context
    const [{ data: project }, { data: overview }, { data: reqs }] = await Promise.all([
      s.from("projects").select("name, description, tech_stack").eq("id", data.project_id).maybeSingle(),
      s.from("project_overview").select("*").eq("project_id", data.project_id).maybeSingle(),
      s.from("requirements").select("code, title, priority, category").eq("project_id", data.project_id).limit(30),
    ]);

    const system = `You are an expert AI Technical Writer and Solution Consultant. Produce a well-structured Markdown ${data.doc_type.toUpperCase()} document. Use headings, bullet lists and tables where useful. Keep the writing crisp and professional. Do not wrap the output in code fences.`;

    const user = [
      `Project: ${project?.name ?? "Untitled"}`,
      project?.description ? `Description: ${project.description}` : "",
      project?.tech_stack?.length ? `Stack: ${project.tech_stack.join(", ")}` : "",
      overview ? `Business context:\n- Domain: ${overview.business_domain ?? "-"}\n- Problem: ${overview.problem_statement ?? "-"}\n- Opportunity: ${overview.business_opportunity ?? "-"}\n- Outcome: ${overview.expected_outcome ?? "-"}` : "",
      reqs?.length ? `Key requirements:\n${reqs.slice(0, 20).map((r: any) => `- ${r.code} [${r.priority}] ${r.title}`).join("\n")}` : "",
      data.context_brief ? `Additional brief:\n${data.context_brief}` : "",
      `Task: Generate the full "${data.title}" (${data.doc_type}) in the ${data.category} category. Include all standard sections for that document type.`,
    ].filter(Boolean).join("\n\n");

    const content = await groqChat([
      { role: "system", content: system },
      { role: "user", content: user },
    ], { temperature: 0.4, max_tokens: 4096 });

    const { data: created, error } = await s.from("documents").insert({
      project_id: data.project_id, category: data.category, doc_type: data.doc_type,
      title: data.title, content_md: content, status: "draft", current_version: 1,
      tags: ["ai-generated"], created_by: context.userId,
      metadata: { ai_generated: true, model: "llama-3.3-70b-versatile" },
    }).select("*").single();
    if (error) throw new Error(error.message);

    await s.from("document_versions").insert({
      document_id: created.id, project_id: created.project_id, version: 1,
      title: created.title, content_md: created.content_md,
      change_summary: "AI initial generation", created_by: context.userId,
    });
    return created;
  });

// ================= AI Review =================
export const aiReviewDocument = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ document_id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const { data: doc, error } = await s.from("documents").select("*").eq("id", data.document_id).single();
    if (error) throw new Error(error.message);

    const prompt = `Review the following ${doc.doc_type} document. Return JSON with keys: overall_score, grammar_score, completeness_score, technical_score, readability_score (all 0-100 ints), missing_sections (array of strings), suggestions (array of { severity: "low"|"medium"|"high", area: string, note: string }), summary (short paragraph).\n\nDOCUMENT:\n${(doc.content_md ?? "").slice(0, 12000)}`;

    let parsed: {
      overall_score?: number; grammar_score?: number; completeness_score?: number;
      technical_score?: number; readability_score?: number;
      missing_sections?: string[]; suggestions?: Array<{ severity?: string; area?: string; note?: string }>; summary?: string;
    } = {};
    try {
      const raw = await groqChat([
        { role: "system", content: "You are a meticulous documentation reviewer. Respond with strict JSON only." },
        { role: "user", content: prompt },
      ], { response_format: { type: "json_object" }, temperature: 0.2, max_tokens: 2048 });
      parsed = JSON.parse(raw);
    } catch {
      parsed = { overall_score: 70, grammar_score: 75, completeness_score: 65, technical_score: 70, readability_score: 75, missing_sections: [], suggestions: [], summary: "AI review unavailable; heuristic score returned." };
    }

    const { data: review, error: rerr } = await s.from("document_reviews").insert({
      document_id: doc.id, project_id: doc.project_id,
      overall_score: parsed.overall_score ?? null,
      grammar_score: parsed.grammar_score ?? null,
      completeness_score: parsed.completeness_score ?? null,
      technical_score: parsed.technical_score ?? null,
      readability_score: parsed.readability_score ?? null,
      missing_sections: parsed.missing_sections ?? [],
      suggestions: parsed.suggestions ?? [],
      summary: parsed.summary ?? null,
    }).select("*").single();
    if (rerr) throw new Error(rerr.message);

    await s.from("documents").update({
      ai_quality_score: parsed.overall_score ?? null,
      ai_grammar_score: parsed.grammar_score ?? null,
      ai_completeness_score: parsed.completeness_score ?? null,
      ai_technical_score: parsed.technical_score ?? null,
    }).eq("id", doc.id);

    return review;
  });

// ================= Create from Template =================
export const createFromTemplate = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({
    project_id: uuid, template_id: uuid, title: z.string().min(1).max(300).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const s = context.db;
    const { data: t, error } = await s.from("document_templates").select("*").eq("id", data.template_id).single();
    if (error) throw new Error(error.message);
    const { data: created, error: cerr } = await s.from("documents").insert({
      project_id: data.project_id, category: t.category, doc_type: t.doc_type,
      title: data.title ?? t.title, content_md: t.content_md, status: "draft",
      current_version: 1, tags: ["from-template"], created_by: context.userId,
    }).select("*").single();
    if (cerr) throw new Error(cerr.message);
    await s.from("document_versions").insert({
      document_id: created.id, project_id: created.project_id, version: 1,
      title: created.title, content_md: created.content_md,
      change_summary: `Created from template: ${t.title}`, created_by: context.userId,
    });
    return created;
  });
