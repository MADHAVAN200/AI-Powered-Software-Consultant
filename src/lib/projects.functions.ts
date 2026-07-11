import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireLocalAuth } from "./auth-middleware";

const CreateProjectInput = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  tech_stack: z.array(z.string()).max(30).optional().default([]),
  repo_url: z.string().url().optional().or(z.literal("")).optional(),
});

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => CreateProjectInput.parse(input))
  .handler(async ({ data, context }) => {
    const { db, userId } = context;
    const { data: project, error } = await db
      .from("projects")
      .insert({
        owner_id: userId,
        name: data.name,
        description: data.description || null,
        tech_stack: data.tech_stack ?? [],
        repo_url: data.repo_url || null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    // Seed default quality score row
    await db.from("quality_scores").insert({ project_id: project.id }).select();
    return project;
  });

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.db
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getProject = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [{ data: project, error }, { data: scores }, { data: artifacts }] = await Promise.all([
      context.db.from("projects").select("*").eq("id", data.id).single(),
      context.db.from("quality_scores").select("*").eq("project_id", data.id).maybeSingle(),
      context.db
        .from("artifacts")
        .select("id, kind, title, score, created_at, updated_at")
        .eq("project_id", data.id)
        .order("updated_at", { ascending: false })
        .limit(50),
    ]);
    if (error) throw new Error(error.message);
    return { project, scores: scores ?? null, artifacts: artifacts ?? [] };
  });

export const listArtifacts = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) =>
    z.object({ project_id: z.string().uuid(), kind: z.string().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    let q = context.db
      .from("artifacts")
      .select("*")
      .eq("project_id", data.project_id)
      .order("updated_at", { ascending: false });
    if (data.kind) q = q.eq("kind", data.kind as never);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getArtifact = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.db
      .from("artifacts")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteArtifact = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.db.from("artifacts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getWorkspaceOverview = createServerFn({ method: "GET" })
  .middleware([requireLocalAuth])
  .handler(async ({ context }) => {
    const { db } = context;
    const [{ data: projects }, { data: scores }, { data: artifacts }, { count: totalArtifactCount }] = await Promise.all([
      db.from("projects").select("id, name, description, tech_stack, status, updated_at").order("updated_at", { ascending: false }),
      db.from("quality_scores").select("*"),
      db.from("artifacts").select("id, project_id, kind, title, score, updated_at, created_at").order("updated_at", { ascending: false }).limit(200),
      db.from("artifacts").select("id", { count: "exact", head: true }),
    ]);
    const ps = projects ?? [];
    const ss = scores ?? [];
    const as = artifacts ?? [];
    const dims = ["requirements","architecture","documentation","security","ui","database","apis","testing","maintainability"] as const;
    const scoreByProject = new Map<string, number>();
    const dimAverages: Record<string, number> = {};
    for (const d of dims) dimAverages[d] = 0;
    for (const row of ss) {
      const vals = dims.map((d) => ((row as unknown as Record<string, number | null>)[d] ?? 0));
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / dims.length);
      scoreByProject.set(row.project_id as string, avg);
      for (const d of dims) dimAverages[d] += (row as unknown as Record<string, number | null>)[d] ?? 0;
    }
    if (ss.length) for (const d of dims) dimAverages[d] = Math.round(dimAverages[d] / ss.length);

    const projectHealth = ps.map((p: any) => ({ ...p, health: scoreByProject.get(p.id) ?? null }));
    const healthNums = projectHealth.map((p: any) => p.health).filter((n: any): n is number => typeof n === "number" && n > 0);
    const avgHealth = healthNums.length ? Math.round(healthNums.reduce((a: any, b: any) => a + b, 0) / healthNums.length) : null;
    const atRisk = projectHealth.filter((p: any) => (p.health ?? 100) < 60).length;

    // Artifacts by kind
    const kindMap = new Map<string, number>();
    for (const a of as) kindMap.set(a.kind as string, (kindMap.get(a.kind as string) ?? 0) + 1);
    const artifactsByKind = Array.from(kindMap, ([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count);

    // Health buckets
    const healthBuckets = [
      { label: "Excellent", range: "80-100", count: projectHealth.filter((p: any) => (p.health ?? 0) >= 80).length },
      { label: "Good", range: "60-79", count: projectHealth.filter((p: any) => (p.health ?? 0) >= 60 && (p.health ?? 0) < 80).length },
      { label: "At Risk", range: "40-59", count: projectHealth.filter((p: any) => (p.health ?? 0) >= 40 && (p.health ?? 0) < 60).length },
      { label: "Critical", range: "0-39", count: projectHealth.filter((p: any) => (p.health ?? 100) < 40).length },
    ];

    // Activity last 14 days
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const activity: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = now - i * day;
      const label = new Date(start).toISOString().slice(5, 10);
      const count = as.filter((a: any) => {
        const t = new Date(a.created_at ?? a.updated_at).getTime();
        return t >= start - day / 2 && t < start + day / 2;
      }).length;
      activity.push({ date: label, count });
    }

    return {
      projects: projectHealth,
      totals: {
        projectCount: ps.length,
        artifactCount: totalArtifactCount ?? as.length,
        avgHealth,
        atRisk,
      },
      recentArtifacts: as.slice(0, 8),
      artifactsByKind,
      healthBuckets,
      dimAverages,
      activity,
    };
  });

