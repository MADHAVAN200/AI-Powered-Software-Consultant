import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceOverview } from "@/lib/projects.functions";
import { PageHeader } from "@/routes/_authenticated/route";
import { NewProjectDialog } from "@/components/new-project-dialog";
import {
  ArrowRight, FolderKanban, Layers, BarChart3, ShieldAlert,
  Activity, Zap, TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

// ── Chart palette — vivid but harmonious, works in both light & dark ─────────
const CHART_PALETTE = ["#818cf8", "#34d399", "#fb923c", "#f472b6", "#38bdf8", "#a78bfa", "#facc15", "#4ade80"];

const HEALTH_COLORS: Record<string, string> = {
  Excellent: "#34d399", Good: "#38bdf8", "At Risk": "#fb923c", Critical: "#f87171",
};

// ── CSS-var-safe axis style (no hardcoded colours) ───────────────────────────
const axisStyle = { fontSize: 11, fill: "var(--color-muted-foreground)" };

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2.5 text-xs shadow-xl">
      {label && <div className="mb-1.5 font-semibold text-foreground">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? p.fill ?? "#888" }} />
          <span className="text-muted-foreground">{p.name ?? "value"}:</span>
          <span className="font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, hint, icon: Icon, accent = false, trend,
}: {
  label: string; value: React.ReactNode; hint?: string;
  icon?: React.ComponentType<{ className?: string }>; accent?: boolean; trend?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-md ${
      accent ? "border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card" : "bg-card"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className={`mt-1.5 font-display text-3xl font-bold tracking-tight ${accent ? "text-accent" : "text-foreground"}`}>
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={`shrink-0 rounded-xl p-2.5 ${accent ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-500">
          <TrendingUp className="h-3 w-3" />{trend}
        </div>
      )}
    </div>
  );
}

// ── Chart Card ────────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, cols = 1 }: {
  title: string; subtitle?: string; children: React.ReactNode; cols?: 1 | 2 | 3;
}) {
  const spanClass = cols === 2 ? "lg:col-span-2" : cols === 3 ? "lg:col-span-3" : "";
  return (
    <div className={`rounded-2xl border bg-card p-5 ${spanClass}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <span className="text-[11px] text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Score pill ────────────────────────────────────────────────────────────────
function ScorePill({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
  const cls =
    score >= 80 ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25" :
    score >= 60 ? "bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/25" :
                  "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/25";
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold tabular-nums ${cls}`}>
      {score}
    </span>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function Dashboard() {
  const fetch = useServerFn(getWorkspaceOverview);
  const { data, isLoading } = useQuery({ queryKey: ["workspace-overview"], queryFn: () => fetch() });

  const projects      = data?.projects ?? [];
  const totals        = data?.totals ?? { projectCount: 0, artifactCount: 0, avgHealth: null, atRisk: 0 };
  const recent        = data?.recentArtifacts ?? [];
  const artifactsByKind = data?.artifactsByKind ?? [];
  const healthBuckets = data?.healthBuckets ?? [];
  const activity      = data?.activity ?? [];
  const dimAverages   = data?.dimAverages ?? {};

  const DIM_LABELS: Record<string, string> = {
    requirements: "Reqs", architecture: "Arch", documentation: "Docs",
    security: "Sec", ui: "UI/UX", database: "DB", apis: "APIs",
    testing: "Tests", maintainability: "Maint",
  };
  const dimData = Object.entries(dimAverages).map(([k, v]) => ({
    dim: DIM_LABELS[k] ?? k, value: v as number,
  }));

  // Secondary KPIs
  const total       = healthBuckets.reduce((s: number, b: any) => s + b.count, 0);
  const excellent   = healthBuckets.find((b: any) => b.label === "Excellent")?.count ?? 0;
  const excellentPct = total > 0 ? Math.round((excellent / total) * 100) : 0;
  const topDimEntry = Object.entries(dimAverages).sort(([, a], [, b]) => (b as number) - (a as number))[0];
  const topDimLabel = topDimEntry ? (DIM_LABELS[topDimEntry[0]] ?? topDimEntry[0]) : "—";
  const topDimScore = topDimEntry ? Math.round(topDimEntry[1] as number) : 0;

  return (
    <>
      <PageHeader
        title="Workspace"
        description="Overview across every project you have access to. Open a project to work with its AI modules."
        action={<NewProjectDialog />}
      />

      <div className="w-full flex-1 space-y-8 px-8 py-8">
        {/* ── Primary KPIs ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Projects"    value={totals.projectCount}         hint="All workspaces"           icon={FolderKanban} accent />
          <KpiCard label="Total Artifacts"    value={totals.artifactCount}        hint="Documents generated"      icon={Layers} />
          <KpiCard label="Avg. Quality Score" value={totals.avgHealth ?? "—"}     hint="Across scored projects"   icon={BarChart3} />
          <KpiCard label="At-Risk Projects"   value={totals.atRisk}               hint="Health score < 60"        icon={ShieldAlert} />
        </div>

        {/* ── Secondary KPIs ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Top Dimension"       value={topDimLabel}        hint={topDimScore > 0 ? `Score ${topDimScore}/100` : "No scores yet"} icon={Zap} />
          <KpiCard label="Excellent Projects"  value={`${excellentPct}%`} hint={`${excellent} of ${total} projects scored ≥ 80`}                icon={Activity} />
          <KpiCard label="Artifact Types"      value={artifactsByKind.length} hint="Distinct artifact categories"                               icon={Layers} />
        </div>

        {/* ── Charts ── */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Activity */}
          <ChartCard title="Activity" subtitle="Artifacts created — last 14 days" cols={2}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="gradAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" name="Artifacts" stroke="#818cf8" strokeWidth={2.5} fill="url(#gradAct)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Project health donut */}
          <ChartCard title="Project Health" subtitle="Distribution">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthBuckets.filter((b: any) => b.count > 0)}
                    dataKey="count" nameKey="label"
                    innerRadius={50} outerRadius={78} paddingAngle={3} strokeWidth={0}
                  >
                    {healthBuckets.filter((b: any) => b.count > 0).map((b: any) => (
                      <Cell key={b.label} fill={HEALTH_COLORS[b.label] ?? "#888"} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Quality radar */}
          <ChartCard title="Quality Dimensions" subtitle="Workspace average" cols={2}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dimData} outerRadius="72%">
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} stroke="var(--color-border)" axisLine={false} />
                  <Radar dataKey="value" name="Avg. Score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} dot={{ r: 3, fill: "#818cf8" } as any} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Artifacts by type — horizontal bars */}
          <ChartCard title="Artifacts by Type" subtitle="Count per category">
            <div className="h-64">
              {artifactsByKind.length === 0 ? (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">No artifacts yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={artifactsByKind} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="kind" tick={{ ...axisStyle, fontSize: 10 }} width={70} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Count" radius={[0, 6, 6, 0]}>
                      {artifactsByKind.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        {/* ── Projects grid ── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Projects</h2>
            <NewProjectDialog />
          </div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl border bg-card" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card p-12 text-center">
              <div className="rounded-2xl bg-muted p-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">No projects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create your first project to start generating documentation.</p>
              </div>
              <NewProjectDialog />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p: any) => (
                <Link
                  key={p.id}
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                >
                  {/* Accent left strip on hover */}
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-accent/60 to-accent/10 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description || "No description"}</div>
                    </div>
                    <ScorePill score={p.health} />
                  </div>

                  {/* Health bar */}
                  {p.health != null && (
                    <div className="mt-3">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${p.health}%`,
                            background: p.health >= 80 ? "#34d399" : p.health >= 60 ? "#38bdf8" : "#f87171",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.tech_stack.slice(0, 4).map((t: string) => (
                        <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Updated {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent activity ── */}
        {recent.length > 0 && (
          <div>
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</h2>
            <div className="overflow-hidden rounded-2xl border bg-card">
              {recent.map((a: any, i: number) => (
                <div key={a.id} className="flex items-center justify-between border-b px-5 py-3 last:border-0 hover:bg-muted/30 transition-colors">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{a.title}</span>
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">{a.kind}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(a.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <ScorePill score={a.score} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
