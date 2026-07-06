import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getProject } from "@/lib/projects.functions";
import { useCurrentProject } from "@/hooks/use-current-project";
import { PageHeader } from "@/routes/_authenticated/route";
import { StatCard, ScoreBadge, EmptyState } from "@/components/ui-blocks";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectDetail,
});


function ProjectDetail() {
  const { projectId } = Route.useParams();
  const fetch = useServerFn(getProject);
  const { setProjectId } = useCurrentProject();
  const { data, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetch({ data: { id: projectId } }),
  });

  useEffect(() => {
    if (projectId) setProjectId(projectId);
  }, [projectId, setProjectId]);

  if (isLoading || !data) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }
  const { project, scores, artifacts } = data;
  const s = scores ?? { requirements: 0, architecture: 0, documentation: 0, security: 0, ui: 0, database: 0, apis: 0, testing: 0, maintainability: 0 };
  const overall = Math.round(([s.requirements, s.architecture, s.documentation, s.security, s.ui, s.database, s.apis, s.testing, s.maintainability].reduce((a, b) => a + b, 0)) / 9);

  return (
    <>
      <PageHeader
        title={project.name}
        description={project.description || "No description"}
        action={
          <div className="flex gap-2">
            <Link to="/modules/documentation"><Button size="sm" variant="outline">Generate docs</Button></Link>
            <Link to="/modules/architecture"><Button size="sm">Run review</Button></Link>
          </div>
        }
      />
      <div className="w-full flex-1 px-8 py-8">
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Overall health" value={overall || "—"} hint="Average of 9 dimensions" />
          <StatCard label="Artifacts" value={artifacts.length} />
          <StatCard label="Stack" value={(project.tech_stack ?? []).length} />
          <StatCard label="Status" value={project.status ?? "active"} />
        </div>

        <h2 className="mt-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">Quality scores</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-9">
          {(["requirements","architecture","documentation","security","ui","database","apis","testing","maintainability"] as const).map((k) => (
            <div key={k} className="rounded-lg border bg-card p-3 text-center">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div>
              <div className="mt-1 text-lg font-semibold">{s[k]}</div>
            </div>
          ))}
        </div>

        <ProjectAnalytics scores={s} artifacts={artifacts} />


        <h2 className="mt-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">Recent artifacts</h2>
        {artifacts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No artifacts yet"
            description="Generate documentation or run a review to see it here."
            action={<Link to="/modules/documentation"><Button size="sm">Generate documentation</Button></Link>}
          />
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border bg-card">
            {artifacts.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b px-5 py-3 last:border-0 hover:bg-surface">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{a.title}</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">{a.kind}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Updated {formatDistanceToNow(new Date(a.updated_at), { addSuffix: true })}</div>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBadge score={a.score} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const KIND_COLORS = ["hsl(var(--primary))", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444"];

type Scores = { requirements: number; architecture: number; documentation: number; security: number; ui: number; database: number; apis: number; testing: number; maintainability: number };
type Artifact = { id: string; kind: string; title: string; score: number | null; created_at?: string; updated_at: string };

function ProjectAnalytics({ scores, artifacts }: { scores: Scores; artifacts: Artifact[] }) {
  const radar = (["requirements","architecture","documentation","security","ui","database","apis","testing","maintainability"] as const)
    .map((k) => ({ dim: k, value: scores[k] ?? 0 }));

  const kinds = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of artifacts) m.set(a.kind, (m.get(a.kind) ?? 0) + 1);
    return Array.from(m, ([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count);
  }, [artifacts]);

  const activity = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const out: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = now - i * day;
      const label = new Date(start).toISOString().slice(5, 10);
      const count = artifacts.filter((a) => {
        const t = new Date(a.created_at ?? a.updated_at).getTime();
        return t >= start - day / 2 && t < start + day / 2;
      }).length;
      out.push({ date: label, count });
    }
    return out;
  }, [artifacts]);

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border bg-card p-5 lg:col-span-1">
        <h3 className="mb-3 text-sm font-medium">Quality radar</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radar} outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="hsl(var(--border))" />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 lg:col-span-2">
        <h3 className="mb-3 text-sm font-medium">Artifact activity — last 14 days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 lg:col-span-3">
        <h3 className="mb-3 text-sm font-medium">Artifacts by type</h3>
        <div className="h-56">
          {kinds.length === 0 ? (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">No artifacts yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kinds} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="kind" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {kinds.map((_, i) => (<Cell key={i} fill={KIND_COLORS[i % KIND_COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
