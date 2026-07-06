import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProject } from "@/lib/projects.functions";
import { recomputeQualityScores } from "@/lib/ai.functions";
import { useCurrentProject } from "@/hooks/use-current-project";

import { PageHeader } from "@/routes/_authenticated/route";
import { EmptyState } from "@/components/ui-blocks";
import { Button } from "@/components/ui/button";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { Gauge, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/modules/quality")({ component: Quality });

const DIMS = ["requirements","architecture","documentation","security","ui","database","apis","testing","maintainability"] as const;

function Quality() {
  const { projectId } = useCurrentProject();
  const getFn = useServerFn(getProject);
  const recompute = useServerFn(recomputeQualityScores);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getFn({ data: { id: projectId! } }),
    enabled: !!projectId,
  });

  const m = useMutation({
    mutationFn: () => recompute({ data: { project_id: projectId! } }),
    onSuccess: () => { toast.success("Scores recomputed"); qc.invalidateQueries({ queryKey: ["project", projectId] }); },
  });

  const s = data?.scores ?? { requirements: 0, architecture: 0, documentation: 0, security: 0, ui: 0, database: 0, apis: 0, testing: 0, maintainability: 0 };
  const overall = Math.round(DIMS.reduce((sum, k) => sum + (s[k] ?? 0), 0) / DIMS.length);
  const chartData = DIMS.map((k) => ({ dim: k[0].toUpperCase() + k.slice(1), score: s[k] ?? 0 }));

  return (
    <>
      <PageHeader
        title="SDLC Quality Score"
        description="One health score across nine dimensions — recomputed from every review and doc in the project."
        action={
          <Button size="sm" variant="outline" onClick={() => m.mutate()} disabled={!projectId || m.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" /> Recompute
          </Button>
        }
      />
      <div className="w-full flex-1 px-8 py-8">
        {!projectId ? (
          <EmptyState icon={Gauge} title="Select a project" description="Pick a project to see its quality profile." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Overall health</div>
              <div className="mt-2 font-display text-6xl">{overall}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
              <div className="mt-6 space-y-1.5 text-left text-sm">
                {DIMS.map((k) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="capitalize text-muted-foreground">{k}</span>
                    <span className="font-mono">{s[k] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                    <Radar dataKey="score" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Scores are computed as the average of AI-generated scores across all artifacts of the relevant kind. Run more reviews to sharpen the signal.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
