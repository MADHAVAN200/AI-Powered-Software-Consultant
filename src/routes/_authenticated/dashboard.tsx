import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceOverview } from "@/lib/projects.functions";
import { PageHeader } from "@/routes/_authenticated/route";
import { StatCard, EmptyState, ScoreBadge } from "@/components/ui-blocks";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { ArrowRight, FolderKanban, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

const KIND_COLORS = ["hsl(var(--primary))", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444"];
const HEALTH_COLORS: Record<string, string> = {
  Excellent: "#10b981", Good: "#3b82f6", "At Risk": "#f59e0b", Critical: "#ef4444",
};

function Dashboard() {
  const fetch = useServerFn(getWorkspaceOverview);
  const { data, isLoading } = useQuery({ queryKey: ["workspace-overview"], queryFn: () => fetch() });

  const projects = data?.projects ?? [];
  const totals = data?.totals ?? { projectCount: 0, artifactCount: 0, avgHealth: null, atRisk: 0 };
  const recent = data?.recentArtifacts ?? [];
  const artifactsByKind = data?.artifactsByKind ?? [];
  const healthBuckets = data?.healthBuckets ?? [];
  const activity = data?.activity ?? [];
  const dimAverages = data?.dimAverages ?? {};

  const dimData = Object.entries(dimAverages).map(([k, v]) => ({ dim: k.slice(0, 4), value: v as number }));

  return (
    <>
      <PageHeader
        title="Workspace"
        description="Overview across every project you have access to. Open a project to work with its AI modules."
        action={<NewProjectDialog />}
      />
      <div className="w-full flex-1 px-8 py-8">
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Projects" value={totals.projectCount} />
          <StatCard label="Artifacts" value={totals.artifactCount} />
          <StatCard label="Avg. health" value={totals.avgHealth ?? "—"} hint="Across scored projects" />
          <StatCard label="At risk" value={totals.atRisk} hint="Health < 60" />
        </div>

        {/* Analytics */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Activity — last 14 days</h3>
              <span className="text-xs text-muted-foreground">Artifacts created</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="actArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#actArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-sm font-medium">Project health</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthBuckets} dataKey="count" nameKey="label" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {healthBuckets.map((b) => (
                      <Cell key={b.label} fill={HEALTH_COLORS[b.label] ?? "#888"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-sm font-medium">Artifacts by type</h3>
            <div className="h-56">
              {artifactsByKind.length === 0 ? (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">No artifacts yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={artifactsByKind} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="kind" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {artifactsByKind.map((_, i) => (<Cell key={i} fill={KIND_COLORS[i % KIND_COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium">Quality dimensions — workspace average</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="dim" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Projects grid */}
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">Projects</h2>
          {isLoading ? (
            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Loading…</div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first project to start generating documentation and reviews."
              action={<NewProjectDialog />}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-medium">{p.name}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description || "No description"}</div>
                    </div>
                    <ScoreBadge score={p.health} />
                  </div>
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.tech_stack.slice(0, 4).map((t: string) => (
                        <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-mono text-secondary-foreground">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}</span>
                    <span className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {recent.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">Recent activity</h2>
            <div className="overflow-hidden rounded-xl border bg-card">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b px-5 py-3 last:border-0 hover:bg-surface">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{a.title}</span>
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">{a.kind}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(a.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <ScoreBadge score={a.score} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
