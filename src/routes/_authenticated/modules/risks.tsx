import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bot, Sparkles, Send, Upload, Search, Shield, Zap, Activity, AlertTriangle,
  GitBranch, FileText, Link2, RefreshCw, Download, CheckCircle2, Clock,
  TrendingUp, TrendingDown, Layers, Gauge, ShieldCheck, Filter, Building2,
  Cpu, Database, Cloud, Plug, Scale, Users, ClipboardList, Target, PlusCircle,
  History, BarChart3, Wand2, XCircle,
} from "lucide-react";

import { PageHeader } from "@/routes/_authenticated/route";
import { useCurrentProject } from "@/hooks/use-current-project";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/modules/risks")({
  component: RisksPage,
});

/* ============================================================================
   Simulated data — AI Risk Consultant
   ========================================================================= */

const PROJECT = {
  name: "AI Software Consultant",
  version: "v2.1",
  overall: 18,           // %
  health: 88,            // %
  critical: 2,
  high: 5,
  medium: 12,
  low: 21,
  open: 27,
  resolved: 31,
  trend: -6,             // % change vs last sprint
  mitigation: 82,        // %
  compliance: 91,
  security: 89,
};

const METRICS = [
  { label: "Overall Risk", value: `${PROJECT.overall}%`, hint: "Low risk", icon: Gauge },
  { label: "Project Health", value: `${PROJECT.health}%`, hint: "+3 vs last sprint", icon: Activity },
  { label: "Critical Risks", value: PROJECT.critical, hint: "SLA breach", icon: AlertTriangle },
  { label: "High Risks", value: PROJECT.high, hint: "Action needed", icon: TrendingUp },
  { label: "Medium Risks", value: PROJECT.medium, hint: "Monitor", icon: Target },
  { label: "Low Risks", value: PROJECT.low, hint: "Acceptable", icon: CheckCircle2 },
  { label: "Open", value: PROJECT.open, hint: `${PROJECT.resolved} resolved`, icon: ClipboardList },
  { label: "Mitigation", value: `${PROJECT.mitigation}%`, hint: "on track", icon: ShieldCheck },
  { label: "Trend", value: `${PROJECT.trend}%`, hint: "risk score", icon: TrendingDown },
];

type Category = "Business" | "Technical" | "Security" | "Architecture" | "Infrastructure" | "Compliance" | "Dependency" | "Database" | "API" | "UI/UX";
type Severity = "Critical" | "High" | "Medium" | "Low";
type Probability = "High" | "Medium" | "Low";
type Status = "Open" | "In Progress" | "Mitigated" | "Accepted" | "Closed";

interface Risk {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  probability: Probability;
  impact: Severity;
  owner: string;
  status: Status;
  module: string;
  req: string;
  due: string;
  rpn: number; // Risk Priority Number
}

const RISKS: Risk[] = [
  { id: "RISK-024", title: "JWT token expiry misconfiguration", category: "Security", severity: "High", probability: "Medium", impact: "High", owner: "Backend Team", status: "Open", module: "Auth", req: "REQ-002", due: "2026-07-14", rpn: 72 },
  { id: "RISK-025", title: "Missing API rate limiting on /login", category: "API", severity: "Critical", probability: "High", impact: "Critical", owner: "Backend Team", status: "In Progress", module: "API", req: "REQ-002", due: "2026-07-10", rpn: 96 },
  { id: "RISK-026", title: "Dashboard aggregate query — N+1", category: "Technical", severity: "High", probability: "High", impact: "High", owner: "A. Roy", status: "Open", module: "UI", req: "REQ-060", due: "2026-07-18", rpn: 81 },
  { id: "RISK-027", title: "Single-region deployment", category: "Infrastructure", severity: "High", probability: "Low", impact: "Critical", owner: "DevOps", status: "Open", module: "Infra", req: "REQ-105", due: "2026-08-01", rpn: 60 },
  { id: "RISK-028", title: "GDPR data retention policy missing", category: "Compliance", severity: "Critical", probability: "Medium", impact: "Critical", owner: "Legal + Data", status: "Open", module: "Data", req: "REQ-201", due: "2026-07-20", rpn: 90 },
  { id: "RISK-029", title: "Outdated Next.js patch (CVE)", category: "Dependency", severity: "Medium", probability: "High", impact: "Medium", owner: "Platform", status: "In Progress", module: "Repo", req: "—", due: "2026-07-09", rpn: 54 },
  { id: "RISK-030", title: "requirements table lacks FK cascade rules", category: "Database", severity: "High", probability: "Medium", impact: "High", owner: "J. Alvarez", status: "In Progress", module: "DB", req: "REQ-041", due: "2026-07-15", rpn: 72 },
  { id: "RISK-031", title: "Onboarding scope creep (Q3)", category: "Business", severity: "Medium", probability: "High", impact: "Medium", owner: "PM Office", status: "Open", module: "Program", req: "—", due: "2026-07-30", rpn: 45 },
  { id: "RISK-032", title: "No circuit breaker between services", category: "Architecture", severity: "High", probability: "Medium", impact: "High", owner: "Arch Board", status: "Open", module: "Arch", req: "REQ-090", due: "2026-07-22", rpn: 72 },
  { id: "RISK-033", title: "Accessibility gaps on Settings screen", category: "UI/UX", severity: "Medium", probability: "Medium", impact: "Medium", owner: "R. Patel", status: "Open", module: "UI", req: "REQ-070", due: "2026-07-25", rpn: 36 },
  { id: "RISK-034", title: "Backup restore untested (12+ months)", category: "Infrastructure", severity: "Critical", probability: "Low", impact: "Critical", owner: "DevOps", status: "Open", module: "Infra", req: "REQ-110", due: "2026-07-31", rpn: 60 },
  { id: "RISK-035", title: "Third-party OCR vendor lock-in", category: "Business", severity: "Medium", probability: "Medium", impact: "High", owner: "Procurement", status: "Accepted", module: "Vendor", req: "—", due: "—", rpn: 40 },
];

const CATEGORY_META: Record<Category, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  Business: { icon: Building2, tone: "bg-primary/10 text-primary" },
  Technical: { icon: Cpu, tone: "bg-secondary text-secondary-foreground" },
  Security: { icon: Shield, tone: "bg-destructive/10 text-destructive" },
  Architecture: { icon: Layers, tone: "bg-primary/10 text-primary" },
  Infrastructure: { icon: Cloud, tone: "bg-secondary text-secondary-foreground" },
  Compliance: { icon: Scale, tone: "bg-warning/20 text-warning-foreground" },
  Dependency: { icon: Plug, tone: "bg-secondary text-secondary-foreground" },
  Database: { icon: Database, tone: "bg-secondary text-secondary-foreground" },
  API: { icon: Plug, tone: "bg-secondary text-secondary-foreground" },
  "UI/UX": { icon: Users, tone: "bg-secondary text-secondary-foreground" },
};

const TECH_METRICS = [
  { label: "Technical Debt", score: 34, hint: "Lower is better" },
  { label: "Maintainability", score: 82, hint: "SonarQube grade A" },
  { label: "Scalability", score: 74, hint: "Load tested 2k RPS" },
  { label: "Complexity", score: 41, hint: "Cyclomatic avg 7.2" },
  { label: "Architecture Quality", score: 88, hint: "Board approved" },
];

const BUSINESS_PREDICTIONS = [
  { k: "Cost increase (90d)", v: "+4%", tone: "warning" as const },
  { k: "Delivery delay risk", v: "Low", tone: "success" as const },
  { k: "Feature risk", v: "Medium", tone: "warning" as const },
  { k: "Business value impact", v: "High", tone: "primary" as const },
];

const SECURITY_CHECKS = [
  { name: "Authentication", pass: true },
  { name: "Authorization (RBAC)", pass: true },
  { name: "Encryption in transit / rest", pass: true },
  { name: "OWASP A03 Injection", pass: false },
  { name: "OWASP A01 Broken Access Control", pass: true },
  { name: "API Security (rate limit, auth)", pass: false },
  { name: "Secrets management (Vault)", pass: true },
  { name: "Sensitive data classification", pass: true },
  { name: "Compliance (GDPR/SOC2)", pass: false },
];

const ARCH_RECOMMENDATIONS = [
  "Introduce load balancer in front of API tier",
  "Add Redis cache for /projects list endpoint",
  "Split notifications service from monolith",
  "Enable auto scaling for worker pool",
  "Implement circuit breaker between projects → repo",
  "Add read replica for reporting queries",
];

const INFRA_ISSUES = [
  { name: "Resource exhaustion (peak)", severity: "High" },
  { name: "CPU > 80% on api-2", severity: "Medium" },
  { name: "Storage 78% on primary", severity: "Medium" },
  { name: "Missing monitoring on cache", severity: "High" },
  { name: "No auto-scaling on workers", severity: "High" },
  { name: "Single-region deployment", severity: "Critical" },
];

const COMPLIANCE = [
  { std: "GDPR", score: 88, gaps: 3 },
  { std: "SOC 2", score: 92, gaps: 1 },
  { std: "ISO 27001", score: 84, gaps: 5 },
  { std: "HIPAA", score: 79, gaps: 6 },
  { std: "PCI DSS", score: 90, gaps: 2 },
  { std: "OWASP ASVS", score: 86, gaps: 4 },
];

const DEPENDENCIES = [
  { name: "next", cur: "14.2.3", latest: "15.1.0", issue: "Outdated", severity: "Medium" },
  { name: "axios", cur: "1.6.2", latest: "1.7.9", issue: "CVE-2024-39338", severity: "High" },
  { name: "lodash", cur: "4.17.20", latest: "4.17.21", issue: "Prototype pollution", severity: "High" },
  { name: "stripe", cur: "12.0.0", latest: "16.2.0", issue: "Deprecated API", severity: "Medium" },
  { name: "aws-sdk", cur: "2.1400", latest: "3.x", issue: "EOL v2", severity: "High" },
  { name: "moment", cur: "2.29.4", latest: "—", issue: "Maintenance mode", severity: "Low" },
];

const AI_ASSESSMENT = [
  { area: "Requirements clarity", score: 92, note: "10 requirements need acceptance criteria." },
  { area: "Architecture resilience", score: 78, note: "No circuit breaker; single-region." },
  { area: "Repository health", score: 85, note: "Debt hotspot: /packages/api/handlers." },
  { area: "Database integrity", score: 81, note: "3 tables missing FK cascade rules." },
  { area: "API security", score: 74, note: "Rate limits missing on 2 public endpoints." },
  { area: "UI/UX quality", score: 88, note: "Accessibility gaps on Settings." },
  { area: "Test coverage", score: 92, note: "10 requirements have no linked tests." },
  { area: "Deployment readiness", score: 83, note: "Backup restore untested for 12+ months." },
];

const MITIGATIONS = [
  { risk: "RISK-025", plan: "Implement API gateway rate limits (per-IP, per-token).", owner: "Backend Team", status: "In Progress", progress: 60, due: "2026-07-10" },
  { risk: "RISK-028", plan: "Publish GDPR data retention & deletion policy; automate purges.", owner: "Legal + Data", status: "Open", progress: 20, due: "2026-07-20" },
  { risk: "RISK-032", plan: "Add resilience4j circuit breakers on projects→repo.", owner: "Arch Board", status: "Open", progress: 15, due: "2026-07-22" },
  { risk: "RISK-034", plan: "Quarterly DR drill; automate restore validation.", owner: "DevOps", status: "In Progress", progress: 45, due: "2026-07-31" },
  { risk: "RISK-030", plan: "Migration to add FK cascade rules on requirements.", owner: "J. Alvarez", status: "In Progress", progress: 70, due: "2026-07-15" },
];

const REPORTS = [
  { name: "Executive Risk Report", desc: "One-pager for the steering committee.", icon: FileText },
  { name: "Technical Risk Report", desc: "Debt, complexity, code hotspots.", icon: Cpu },
  { name: "Security Risk Report", desc: "OWASP, IAM, secrets, exposure.", icon: Shield },
  { name: "Compliance Report", desc: "GDPR, SOC 2, ISO 27001 status.", icon: Scale },
  { name: "Architecture Risk Report", desc: "SPOF, coupling, resilience.", icon: Layers },
  { name: "Project Health Report", desc: "Trend, mitigation, forecast.", icon: BarChart3 },
  { name: "Mitigation Progress", desc: "Per-owner progress and blockers.", icon: ShieldCheck },
];

const VERSIONS = [
  { v: "v2.1", date: "2026-06-30", added: 8, closed: 12, note: "Security posture improved. Rate limits in progress." },
  { v: "v2.0", date: "2026-05-14", added: 22, closed: 16, note: "Compliance baseline established (GDPR + SOC 2)." },
  { v: "v1.9", date: "2026-04-02", added: 14, closed: 9, note: "Architecture review — circuit breakers proposed." },
];

const QUICK_ACTIONS = [
  "Run AI risk analysis on latest build",
  "Predict delivery delay for release 2.2",
  "Review architecture for scalability risks",
  "Analyze OWASP top 10 exposure",
  "Score dependency supply chain risk",
  "Generate mitigation plan for RISK-025",
  "Estimate business impact of RISK-028",
  "Compare risk register: v2.0 vs v2.1",
  "Explain RISK-032 in plain English",
  "Draft executive risk summary",
  "Detect single points of failure",
  "Score release readiness",
];

/* ============================================================================
   Small UI helpers
   ========================================================================= */

function Metric({ label, value, hint, icon: Icon }: {
  label: string; value: React.ReactNode; hint?: string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1 font-display text-2xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SeverityBadge({ s }: { s: Severity }) {
  const map: Record<Severity, string> = {
    Critical: "bg-destructive/15 text-destructive",
    High: "bg-warning/20 text-warning-foreground",
    Medium: "bg-secondary text-secondary-foreground",
    Low: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[s]}`}>{s}</span>;
}

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    Open: "bg-destructive/10 text-destructive",
    "In Progress": "bg-primary/10 text-primary",
    Mitigated: "bg-success/15 text-success",
    Accepted: "bg-secondary text-secondary-foreground",
    Closed: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[s]}`}>{s}</span>;
}

function Bar({ pct, tone = "primary" }: { pct: number; tone?: "primary" | "success" | "warning" | "destructive" }) {
  const bg = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "destructive" ? "bg-destructive" : "bg-primary";
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className={`h-1.5 rounded-full ${bg}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

function HeatCell({ p, i }: { p: Probability; i: Severity }) {
  const count = RISKS.filter(r => r.probability === p && r.impact === i).length;
  const level = (p === "High" ? 3 : p === "Medium" ? 2 : 1) + (i === "Critical" ? 3 : i === "High" ? 2 : i === "Medium" ? 1 : 0);
  const tone = level >= 5 ? "bg-destructive/25 text-destructive"
    : level >= 4 ? "bg-warning/30 text-warning-foreground"
    : level >= 2 ? "bg-primary/10 text-primary"
    : "bg-success/15 text-success";
  return <div className={`grid h-14 place-items-center rounded ${tone} text-sm font-semibold`}>{count}</div>;
}

/* ============================================================================
   Page
   ========================================================================= */

function RisksPage() {
  const project = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const filtered = useMemo(() => RISKS.filter(r =>
    (cat === "all" || r.category === cat) &&
    (status === "all" || r.status === status) &&
    (query === "" || `${r.id} ${r.title} ${r.module} ${r.owner}`.toLowerCase().includes(query.toLowerCase()))
  ), [query, cat, status]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Risk Analysis — AI Risk Consultant"
        description={`Continuous risk intelligence for ${project.current?.name ?? PROJECT.name}: identify, score, prioritize, and mitigate across business, technical, security, architecture, infrastructure, and compliance.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="mr-1 h-4 w-4" /> Import</Button>
            <Button variant="outline" size="sm"><PlusCircle className="mr-1 h-4 w-4" /> Add Risk</Button>
            <Button variant="outline" size="sm"><Link2 className="mr-1 h-4 w-4" /> Link Requirements</Button>
            <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => setAssistantOpen(true)}>
              <Bot className="mr-1 h-4 w-4" /> AI Risk Assistant
            </Button>
          </div>
        }
      />

      {/* Project overview strip */}
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-6">
          <div>
            <div className="text-xs uppercase text-muted-foreground">Project</div>
            <div className="mt-1 font-medium">{project.current?.name ?? PROJECT.name}</div>
            <div className="text-xs text-muted-foreground">Build {PROJECT.version}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Overall Risk</div>
            <div className="mt-1 font-display text-xl">{PROJECT.overall}%</div>
            <Bar pct={PROJECT.overall * 3} tone="success" />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Project Health</div>
            <div className="mt-1 font-display text-xl">{PROJECT.health}%</div>
            <Bar pct={PROJECT.health} tone="success" />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Critical Risks</div>
            <div className="mt-1 font-display text-xl">{PROJECT.critical}</div>
            <div className="text-xs text-muted-foreground">{PROJECT.high} high</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Risk Trend</div>
            <div className="mt-1 font-display text-xl">{PROJECT.trend}%</div>
            <div className="text-xs text-success">Improving</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Mitigation</div>
            <div className="mt-1 font-display text-xl">{PROJECT.mitigation}%</div>
            <Bar pct={PROJECT.mitigation} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="inline-flex w-max min-w-full gap-1">
            {[
              ["overview", "Overview"],
              ["register", "Risk Register"],
              ["tech", "Technical Risks"],
              ["biz", "Business Risks"],
              ["sec", "Security Risks"],
              ["arch", "Architecture Risks"],
              ["infra", "Infrastructure Risks"],
              ["comp", "Compliance Risks"],
              ["dep", "Dependency Risks"],
              ["ai", "AI Risk Assessment"],
              ["mit", "Mitigation Plans"],
              ["reports", "Reports"],
              ["versions", "Version History"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            {METRICS.map(m => <Metric key={m.label} {...m} />)}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm">Risk distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { l: "Critical", v: PROJECT.critical, tone: "destructive" as const },
                  { l: "High", v: PROJECT.high, tone: "warning" as const },
                  { l: "Medium", v: PROJECT.medium, tone: "primary" as const },
                  { l: "Low", v: PROJECT.low, tone: "success" as const },
                ].map(r => {
                  const total = PROJECT.critical + PROJECT.high + PROJECT.medium + PROJECT.low;
                  return (
                    <div key={r.l} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{r.l}</span>
                        <span className="text-muted-foreground">{r.v} risks</span>
                      </div>
                      <Bar pct={(r.v / total) * 100} tone={r.tone} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">AI project summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Status: <b>Low risk</b></div>
                <p className="text-muted-foreground">
                  Overall risk {PROJECT.overall}% with {PROJECT.critical} critical and {PROJECT.high} high items.
                  Trend is improving ({PROJECT.trend}% vs last sprint). Focus this week on rate limiting and GDPR retention.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">Mitigation on track</Badge>
                  <Badge variant="secondary">Compliance {PROJECT.compliance}%</Badge>
                  <Badge variant="secondary">Security {PROJECT.security}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Probability × Impact heat map</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-[80px_repeat(4,1fr)] gap-2 text-xs">
                <div />
                {(["Low","Medium","High","Critical"] as Severity[]).map(i => (
                  <div key={i} className="text-center font-medium">{i}</div>
                ))}
                {(["High","Medium","Low"] as Probability[]).flatMap(p => [
                  <div key={`lbl-${p}`} className="flex items-center font-medium">P: {p}</div>,
                  ...(["Low","Medium","High","Critical"] as Severity[]).map(i => (
                    <HeatCell key={`${p}-${i}`} p={p} i={i} />
                  )),
                ])}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Cell value = risks with that probability & impact.</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGISTER */}
        <TabsContent value="register" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search RISK-ID, title, module, owner…" className="w-72 pl-8" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.keys(CATEGORY_META).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Open","In Progress","Mitigated","Accepted","Closed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">{filtered.length} of {RISKS.length}</div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Severity</th>
                      <th className="p-2">Probability</th>
                      <th className="p-2">Impact</th>
                      <th className="p-2">RPN</th>
                      <th className="p-2">Owner</th>
                      <th className="p-2">Req</th>
                      <th className="p-2">Due</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono text-xs">{r.id}</td>
                        <td className="p-2">{r.title}</td>
                        <td className="p-2"><Badge variant="secondary" className="text-[10px]">{r.category}</Badge></td>
                        <td className="p-2"><SeverityBadge s={r.severity} /></td>
                        <td className="p-2 text-xs">{r.probability}</td>
                        <td className="p-2"><SeverityBadge s={r.impact} /></td>
                        <td className="p-2 font-mono text-xs">{r.rpn}</td>
                        <td className="p-2 text-xs">{r.owner}</td>
                        <td className="p-2 font-mono text-xs text-muted-foreground">{r.req}</td>
                        <td className="p-2 text-xs text-muted-foreground">{r.due}</td>
                        <td className="p-2"><StatusBadge s={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNICAL */}
        <TabsContent value="tech" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            {TECH_METRICS.map(m => (
              <Card key={m.label}>
                <CardContent className="p-4 space-y-2">
                  <div className="text-xs uppercase text-muted-foreground">{m.label}</div>
                  <div className="font-display text-2xl">{m.score}</div>
                  <Bar pct={m.score} tone={m.score >= 80 ? "success" : m.score >= 60 ? "primary" : "warning"} />
                  <div className="text-xs text-muted-foreground">{m.hint}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Cpu className="h-4 w-4" /> AI-detected engineering risks</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Technical debt hotspot in /packages/api/handlers","Tight coupling: projects ↔ repo service","Large component: Dashboard.tsx (720 LOC)","Missing docs on 12 public interfaces","Cyclomatic complexity spike in RulesEngine","N+1 query in reporting aggregate","Slow query on requirements search (>800ms)","API version drift between web and mobile clients"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><AlertTriangle className="h-4 w-4 text-warning" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUSINESS */}
        <TabsContent value="biz" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {BUSINESS_PREDICTIONS.map(p => (
              <Card key={p.k}>
                <CardContent className="p-4 space-y-2">
                  <div className="text-xs uppercase text-muted-foreground">{p.k}</div>
                  <div className="font-display text-2xl">{p.v}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Business risk factors</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Scope creep on onboarding Q3","Budget overrun risk on integrations","Requirement changes >20% since kickoff","Stakeholder misalignment on billing UX","Low adoption risk in mid-market segment","Vendor dependency on OCR provider","Schedule delay on marketplace launch","Regulatory shift in EU data residency"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><TrendingUp className="h-4 w-4 text-warning" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="sec" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY_CHECKS.map(s => (
              <div key={s.name} className={`flex items-center justify-between rounded border p-3 text-sm ${s.pass ? "" : "border-destructive/50 bg-destructive/5"}`}>
                <div className="flex items-center gap-2">
                  {s.pass ? <ShieldCheck className="h-4 w-4 text-success" /> : <Shield className="h-4 w-4 text-destructive" />}
                  {s.name}
                </div>
                <Badge variant={s.pass ? "secondary" : "destructive"}>{s.pass ? "Pass" : "Fail"}</Badge>
              </div>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> AI-detected vulnerabilities</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["SQL injection risk on /reports search","XSS via RichNote rendering user HTML","Weak password policy: 6-char minimum","Insecure API: /export without auth","Sensitive data exposure in error responses","IAM: over-privileged deploy role","Hardcoded secret detected in repo scan","JWT rotation policy missing"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><AlertTriangle className="h-4 w-4 text-destructive" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ARCHITECTURE */}
        <TabsContent value="arch" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" /> Architecture risk factors</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Single point of failure: auth service","Scalability limit on reporting DB","Service dependency loop: projects ↔ notifications","Database bottleneck on aggregate queries","Network failure blast radius: entire /api","Event processing: no dead-letter queue","Microservice comms over HTTP (no retries)","High availability: no multi-AZ failover"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><AlertTriangle className="h-4 w-4 text-warning" /> {x}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI recommendations</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {ARCH_RECOMMENDATIONS.map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><Zap className="h-4 w-4 text-primary" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INFRASTRUCTURE */}
        <TabsContent value="infra" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {INFRA_ISSUES.map(i => (
              <Card key={i.name}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{i.name}</div>
                    <SeverityBadge s={i.severity as Severity} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Cloud className="h-4 w-4" /> Coverage checklist</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {[["Servers", true],["Containers", true],["Networking", true],["Storage", false],["Monitoring", false],["Load Balancing", true],["Backups", false],["Disaster Recovery", false],["Cloud Cost controls", true]].map(([n, ok]) => (
                <div key={String(n)} className={`flex items-center justify-between rounded border p-2 ${ok ? "" : "border-warning/50 bg-warning/5"}`}>
                  <div className="flex items-center gap-2">
                    {ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                    {n}
                  </div>
                  <Badge variant={ok ? "secondary" : "outline"}>{ok ? "OK" : "Gap"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="comp" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {COMPLIANCE.map(c => (
              <Card key={c.std}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.std}</div>
                    <Badge variant={c.score >= 90 ? "secondary" : "outline"}>{c.score}%</Badge>
                  </div>
                  <Bar pct={c.score} tone={c.score >= 90 ? "success" : c.score >= 80 ? "primary" : "warning"} />
                  <div className="text-xs text-muted-foreground">{c.gaps} open gaps</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4" /> AI compliance review</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Data retention policy not published (GDPR Art. 5)","Audit logs missing on admin actions","Encryption-at-rest verified for primary DB","Consent capture missing on marketing form","Privacy notice last updated >12 months ago","Access logs retained 90 days (target 365)","Data residency: EU tenant on us-east-1"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><AlertTriangle className="h-4 w-4 text-warning" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEPENDENCIES */}
        <TabsContent value="dep" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">Package</th><th className="p-2">Current</th><th className="p-2">Latest</th><th className="p-2">Issue</th><th className="p-2">Severity</th></tr>
                </thead>
                <tbody>
                  {DEPENDENCIES.map(d => (
                    <tr key={d.name} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">{d.name}</td>
                      <td className="p-2 text-xs">{d.cur}</td>
                      <td className="p-2 text-xs">{d.latest}</td>
                      <td className="p-2 text-xs">{d.issue}</td>
                      <td className="p-2"><SeverityBadge s={d.severity as Severity} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Plug className="h-4 w-4" /> AI supply-chain insights</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["3 packages have known CVEs — upgrade in next sprint","aws-sdk v2 is EOL; migrate to v3 modular clients","1 GPL-licensed transitive dep detected","5 unused dependencies can be removed","Docker base image ubuntu:20.04 nearing EOL","2 third-party APIs report >99.5% SLA — acceptable"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><AlertTriangle className="h-4 w-4 text-warning" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI ASSESSMENT */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI risk consultant review</CardTitle>
              <Badge className="bg-success/15 text-success">Overall {100 - PROJECT.overall}%</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {AI_ASSESSMENT.map(r => (
                <div key={r.area} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{r.area}</span>
                    <span className="text-muted-foreground">{r.score}%</span>
                  </div>
                  <Bar pct={r.score} tone={r.score >= 90 ? "success" : r.score >= 75 ? "primary" : "warning"} />
                  <div className="text-xs text-muted-foreground">{r.note}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Highest Risk" value="API Authentication" hint="RISK-025" icon={AlertTriangle} />
            <Metric label="Probability" value="High" hint="last 30d" icon={TrendingUp} />
            <Metric label="Business Impact" value="Critical" hint="revenue path" icon={Building2} />
            <Metric label="Est. Resolution" value="2 days" hint="Backend Team" icon={Clock} />
          </div>
        </TabsContent>

        {/* MITIGATION */}
        <TabsContent value="mit" className="space-y-4">
          {MITIGATIONS.map(m => (
            <Card key={m.risk}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs">{m.risk}</span>
                  <span className="text-sm font-medium">{m.plan}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary">{m.owner}</Badge>
                    <Badge variant="outline">{m.status}</Badge>
                    <span className="text-xs text-muted-foreground">Due {m.due}</span>
                  </div>
                </div>
                <Progress value={m.progress} />
                <div className="text-xs text-muted-foreground">{m.progress}% complete</div>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wand2 className="h-4 w-4" /> Generate mitigation plan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="Risk ID (e.g., RISK-024)" />
                <Select defaultValue="quick">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick win (under 1 week)</SelectItem>
                    <SelectItem value="std">Standard (1–4 weeks)</SelectItem>
                    <SelectItem value="strategic">Strategic (quarterly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea rows={3} placeholder="Optional context: constraints, owners, dependencies…" />
              <div className="flex justify-end">
                <Button><Sparkles className="mr-1 h-4 w-4" /> Draft plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {REPORTS.map(r => (
              <Card key={r.name}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <r.icon className="h-4 w-4 text-primary" />
                    <div className="font-medium">{r.name}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{r.desc}</div>
                  <div className="flex flex-wrap gap-1">
                    {["PDF","DOCX","Excel","CSV","PPT"].map(f => <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>)}
                  </div>
                  <Button size="sm" variant="outline" className="w-full"><Download className="mr-1 h-4 w-4" /> Generate</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VERSIONS */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">Version</th><th className="p-2">Date</th><th className="p-2">Added</th><th className="p-2">Closed</th><th className="p-2">Notes</th></tr>
                </thead>
                <tbody>
                  {VERSIONS.map(v => (
                    <tr key={v.v} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">{v.v}</td>
                      <td className="p-2 text-xs text-muted-foreground">{v.date}</td>
                      <td className="p-2 text-destructive">+{v.added}</td>
                      <td className="p-2 text-success">-{v.closed}</td>
                      <td className="p-2 text-xs text-muted-foreground">{v.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Change tracking</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Risk register edits","Mitigation progress","Owner reassignments","Requirement linkage changes","Compliance evidence updates"].map(x =>
                <div key={x} className="flex items-center gap-2 rounded border p-2"><CheckCircle2 className="h-4 w-4 text-success" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Risk Assistant */}
      <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Risk Assistant</SheetTitle>
            <SheetDescription>Analyze, predict, and mitigate risks across the SDLC — requirements, architecture, security, compliance, and deployment.</SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4 text-primary" /> Quick actions</div>
              <div className="mt-2 grid grid-cols-1 gap-1.5">
                {QUICK_ACTIONS.map(a => (
                  <button key={a} onClick={() => setPrompt(a)} className="rounded border bg-card px-2 py-1.5 text-left text-xs hover:bg-accent">
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <div className="font-medium">Linked context</div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• Requirements: 128 items</li>
                <li>• Architecture: 24 services</li>
                <li>• APIs: 84 endpoints</li>
                <li>• DB tables: 26</li>
                <li>• Dependencies: 412 packages</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 space-y-2 border-t pt-3">
            <Textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask the AI Risk Consultant…" />
            <div className="flex justify-end">
              <Button size="sm"><Send className="mr-1 h-4 w-4" /> Send</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
