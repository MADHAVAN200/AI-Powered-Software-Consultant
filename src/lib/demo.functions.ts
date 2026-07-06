import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEMO_PROJECT, DEMO_ARTIFACTS, DEMO_SCORES } from "./demo-content";

/**
 * Ensures the current (anonymous demo) user has a fully populated demo project.
 * Called once from the app shell after sign-in. Idempotent.
 */
export const ensureDemoProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    // Use admin client to bypass RLS for demo seeding (avoids anon-session RLS quirks).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Already seeded?
    const { data: existing } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("owner_id", userId)
      .limit(1);
    if (existing && existing.length > 0) {
      return { projectId: existing[0].id, created: false };
    }

    // Create project (trigger adds owner as member)
    const { data: project, error: projErr } = await supabaseAdmin
      .from("projects")
      .insert({
        owner_id: userId,
        name: DEMO_PROJECT.name,
        description: DEMO_PROJECT.description,
        tech_stack: DEMO_PROJECT.tech_stack,
        repo_url: DEMO_PROJECT.repo_url,
      })
      .select("*")
      .single();
    if (projErr) throw new Error(projErr.message);

    // Seed artifacts
    const rows = DEMO_ARTIFACTS.map((a) => ({
      project_id: project.id,
      created_by: userId,
      kind: a.kind as never,
      title: a.title,
      content_md: a.content_md,
      score: a.score ?? null,
      metadata: {},
    }));
    const { error: artErr } = await supabaseAdmin.from("artifacts").insert(rows);
    if (artErr) throw new Error(artErr.message);

    // Upsert quality scores
    const { error: scoreErr } = await supabaseAdmin
      .from("quality_scores")
      .upsert({ project_id: project.id, ...DEMO_SCORES }, { onConflict: "project_id" });
    if (scoreErr) throw new Error(scoreErr.message);

    return { projectId: project.id, created: true };
  });
