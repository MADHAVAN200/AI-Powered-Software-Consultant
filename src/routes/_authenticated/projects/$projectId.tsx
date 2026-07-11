import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getProject } from "@/lib/projects.functions";
import { useCurrentProject } from "@/hooks/use-current-project";
import { PageHeader } from "@/routes/_authenticated/route";
import { FileText, ArrowRight, CheckCircle2, AlertTriangle, Layers, Target, BarChart3, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectDetail,
});

// ── Chart palette ─────────────────────────────────────────────────────────────
const CHART_PALETTE = ["#818cf8", "#34d399", "#fb923c", "#f472b6", "#38bdf8", "#a78bfa", "#facc15", "#4ade80"];
const axisStyle = { fontSize: 11, fill: "var(--color-muted-foreground)" };

// ── Custom tooltip ─────────────────────────────────────────────────────────────
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

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, hint, icon: Icon, accent = false,
}: {
  label: string; value: React.ReactNode; hint?: string;
  icon?: React.ComponentType<{ className?: string }>; accent?: boolean;
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

// ── Score pill ─────────────────────────────────────────────────────────────────
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

// ── Dimension progress bar ─────────────────────────────────────────────────────
function DimBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#38bdf8" : "#f87171";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium capitalize text-foreground">{label}</span>
        <span className="text-[11px] font-bold tabular-nums text-muted-foreground">{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Scores = {
  requirements: number; architecture: number; documentation: number; security: number;
  ui: number; database: number; apis: number; testing: number; maintainability: number;
};
type Artifact = { id: string; kind: string; title: string; score: number | null; created_at?: string; updated_at: string };

const DIMS = ["requirements", "architecture", "documentation", "security", "ui", "database", "apis", "testing", "maintainability"] as const;

// ── Project Detail Page ───────────────────────────────────────────────────────
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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading project…</div>
      </div>
    );
  }

  const { project, scores, artifacts } = data;
  const s = scores ?? { requirements: 0, architecture: 0, documentation: 0, security: 0, ui: 0, database: 0, apis: 0, testing: 0, maintainability: 0 };
  const vals = DIMS.map((k) => s[k]);
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

  // Derived KPIs
  const scoredArtifacts = (artifacts as Artifact[]).filter((a: Artifact) => a.score != null);
  const avgArtifactScore = scoredArtifacts.length
    ? Math.round(scoredArtifacts.reduce((sum: number, a: Artifact) => sum + (a.score ?? 0), 0) / scoredArtifacts.length)
    : null;
  const highScoreDims = vals.filter((v) => v >= 80).length;
  const atRiskDims    = vals.filter((v) => v < 60).length;

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

      <div className="w-full flex-1 space-y-8 px-8 py-8">
        {/* ── Primary KPIs ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Overall Health"    value={overall || "—"}          hint="Average of 9 dimensions"  icon={Target}     accent />
          <KpiCard label="Artifacts"         value={artifacts.length}         hint="Documents generated"      icon={Layers} />
          <KpiCard label="Avg. Artifact Score" value={avgArtifactScore ?? "—"} hint="Across scored artifacts"  icon={BarChart3} />
          <KpiCard label="Stack Size"        value={(project.tech_stack ?? []).length} hint="Technologies used"  icon={Zap} />
        </div>

        {/* ── Secondary KPIs ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Excellent Dimensions" value={highScoreDims}  hint="Dimensions scoring ≥ 80"  icon={CheckCircle2} />
          <KpiCard label="At-Risk Dimensions"   value={atRiskDims}     hint="Dimensions scoring < 60"   icon={AlertTriangle} />
          <KpiCard label="Project Status"       value={project.status ?? "Active"} hint="Current status"    icon={Shield} />
        </div>

        {/* ── Analytics ── */}
        <ProjectAnalytics scores={s} artifacts={artifacts} />

        {/* ── Artifacts list ── */}
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Artifacts</h2>
          {artifacts.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card p-12 text-center">
              <div className="rounded-2xl bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">No artifacts yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Generate documentation or run a review to see it here.</p>
              </div>
              <Link to="/modules/documentation"><Button size="sm">Generate documentation</Button></Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-card">
              {(artifacts as Artifact[]).map((a: Artifact, i: number) => (
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
                  <div className="flex items-center gap-3">
                    <ScorePill score={a.score} />
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Project Analytics section ─────────────────────────────────────────────────
function ProjectAnalytics({ scores, artifacts }: { scores: Scores; artifacts: Artifact[] }) {
  const radar = DIMS.map((k) => ({ dim: k.slice(0, 4), fullDim: k, value: scores[k] ?? 0 }));

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

  const DIM_LABELS: Record<string, string> = {
    requirements: "Requirements", architecture: "Architecture", documentation: "Documentation",
    security: "Security", ui: "UI / UX", database: "Database", apis: "APIs",
    testing: "Testing", maintainability: "Maintainability",
  };

  return (
    <div className="space-y-4">
      {/* Row 1: radar + activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Quality Radar" subtitle="All 9 dimensions">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} stroke="var(--color-border)" axisLine={false} />
                <Radar dataKey="value" name="Score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} dot={{ r: 3, fill: "#818cf8" } as any} />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Artifact Activity" subtitle="Last 14 days" cols={2}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="gradProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" name="Artifacts" stroke="#34d399" strokeWidth={2.5} fill="url(#gradProj)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: dimension progress bars + artifacts by type */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Dimension Scores" subtitle="Progress per area" cols={2}>
          <div className="grid gap-3 sm:grid-cols-2">
            {DIMS.map((k) => (
              <DimBar key={k} label={DIM_LABELS[k] ?? k} score={scores[k] ?? 0} />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Artifacts by Type" subtitle="Distribution">
          <div className="h-56">
            {kinds.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No artifacts yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kinds} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="kind" tick={{ ...axisStyle, fontSize: 10 }} width={72} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Count" radius={[0, 6, 6, 0]}>
                    {kinds.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
