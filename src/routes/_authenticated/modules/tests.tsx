import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bot, Sparkles, Send, Upload, Search, Shield, Zap, Activity, Bug,
  GitBranch, FileText, Link2, RefreshCw, Download, PlayCircle, CheckCircle2,
  AlertTriangle, Clock, TrendingUp, Layers, Gauge, ShieldCheck, Filter,
  ClipboardList, Beaker, Workflow, Target, XCircle, PauseCircle, ListChecks,
  Cpu, History, BarChart3, Wand2,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/modules/tests")({
  component: TestsPage,
});

/* ============================================================================
   Simulated data — AI QA Consultant
   ========================================================================= */

const PROJECT = {
  name: "AI Software Consultant",
  version: "v2.1",
  total: 1248,
  executed: 1042,
  passed: 979,
  failed: 41,
  blocked: 22,
  pending: 206,
  coverage: 92,
  passRate: 94,
  failRate: 4,
  automationCoverage: 68,
  defects: 87,
  critical: 3,
  qualityScore: 95,
};

const METRICS = [
  { label: "Total Test Cases", value: PROJECT.total, hint: "11 categories", icon: ClipboardList },
  { label: "Executed", value: PROJECT.executed, hint: `${PROJECT.pending} pending`, icon: PlayCircle },
  { label: "Passed", value: PROJECT.passed, hint: `${PROJECT.passRate}% pass`, icon: CheckCircle2 },
  { label: "Failed", value: PROJECT.failed, hint: `${PROJECT.failRate}% fail`, icon: XCircle },
  { label: "Blocked", value: PROJECT.blocked, hint: "env / data", icon: PauseCircle },
  { label: "Coverage", value: `${PROJECT.coverage}%`, hint: "requirement→test", icon: Target },
  { label: "Automation", value: `${PROJECT.automationCoverage}%`, hint: "Cypress + Pytest", icon: Cpu },
  { label: "Defects", value: PROJECT.defects, hint: `${PROJECT.critical} critical`, icon: Bug },
  { label: "AI QA Score", value: `${PROJECT.qualityScore}%`, hint: "Release ready", icon: Sparkles },
];

const CATEGORIES = [
  "Functional", "UI", "API", "Database", "Integration", "Regression",
  "Performance", "Security", "Accessibility", "Compatibility", "UAT",
] as const;

type Category = typeof CATEGORIES[number];
type Priority = "P0" | "P1" | "P2" | "P3";
type Risk = "High" | "Medium" | "Low";
type Status = "Passed" | "Failed" | "Blocked" | "Pending" | "Draft";

interface TestCase {
  id: string;
  title: string;
  module: string;
  category: Category;
  req: string;
  story: string;
  priority: Priority;
  risk: Risk;
  status: Status;
  automated: boolean;
  tester: string;
  env: "prod" | "staging" | "dev";
  lastRun: string;
  steps: number;
}

const TESTS: TestCase[] = [
  { id: "TC-001", title: "Login with valid credentials", module: "Auth", category: "Functional", req: "REQ-001", story: "US-014", priority: "P0", risk: "High", status: "Passed", automated: true, tester: "M. Chen", env: "staging", lastRun: "2h ago", steps: 6 },
  { id: "TC-002", title: "Login with invalid password", module: "Auth", category: "Functional", req: "REQ-001", story: "US-014", priority: "P0", risk: "High", status: "Passed", automated: true, tester: "M. Chen", env: "staging", lastRun: "2h ago", steps: 5 },
  { id: "TC-003", title: "SQL injection on login form", module: "Auth", category: "Security", req: "REQ-002", story: "US-014", priority: "P0", risk: "High", status: "Passed", automated: true, tester: "AI Runner", env: "staging", lastRun: "1h ago", steps: 4 },
  { id: "TC-004", title: "Rate limiting on /login", module: "Auth", category: "Security", req: "REQ-002", story: "US-014", priority: "P1", risk: "Medium", status: "Failed", automated: true, tester: "AI Runner", env: "staging", lastRun: "1h ago", steps: 8 },
  { id: "TC-005", title: "Create project — happy path", module: "Projects", category: "Functional", req: "REQ-024", story: "US-030", priority: "P0", risk: "High", status: "Passed", automated: true, tester: "L. Kim", env: "staging", lastRun: "3h ago", steps: 9 },
  { id: "TC-006", title: "Project name boundary (255 chars)", module: "Projects", category: "Functional", req: "REQ-024", story: "US-030", priority: "P2", risk: "Low", status: "Passed", automated: false, tester: "L. Kim", env: "dev", lastRun: "1d ago", steps: 4 },
  { id: "TC-007", title: "GET /api/projects contract", module: "API", category: "API", req: "REQ-024", story: "US-030", priority: "P1", risk: "Medium", status: "Passed", automated: true, tester: "AI Runner", env: "staging", lastRun: "40m ago", steps: 3 },
  { id: "TC-008", title: "Requirements table FK integrity", module: "Database", category: "Database", req: "REQ-041", story: "US-052", priority: "P1", risk: "Medium", status: "Passed", automated: true, tester: "AI Runner", env: "staging", lastRun: "6h ago", steps: 5 },
  { id: "TC-009", title: "Dashboard renders < 2s (P95)", module: "UI", category: "Performance", req: "REQ-060", story: "US-071", priority: "P1", risk: "Medium", status: "Failed", automated: true, tester: "AI Runner", env: "staging", lastRun: "3h ago", steps: 3 },
  { id: "TC-010", title: "Keyboard nav across sidebar", module: "UI", category: "Accessibility", req: "REQ-070", story: "US-082", priority: "P2", risk: "Low", status: "Blocked", automated: false, tester: "R. Patel", env: "dev", lastRun: "2d ago", steps: 7 },
  { id: "TC-011", title: "Concurrent edits on same requirement", module: "Requirements", category: "Integration", req: "REQ-018", story: "US-025", priority: "P1", risk: "High", status: "Pending", automated: false, tester: "unassigned", env: "staging", lastRun: "—", steps: 6 },
  { id: "TC-012", title: "500 concurrent users on /projects", module: "API", category: "Performance", req: "REQ-090", story: "US-101", priority: "P1", risk: "High", status: "Passed", automated: true, tester: "AI Runner", env: "staging", lastRun: "12h ago", steps: 4 },
];

const DEFECTS = [
  { id: "BUG-214", title: "Rate limit resets too aggressively on retry", severity: "High", priority: "P1", module: "Auth", tc: "TC-004", req: "REQ-002", dev: "S. Novak", status: "In progress", root: "Redis TTL rounding" },
  { id: "BUG-215", title: "Dashboard LCP regression on cold load", severity: "Medium", priority: "P1", module: "UI", tc: "TC-009", req: "REQ-060", dev: "A. Roy", status: "Open", root: "Un-split vendor bundle" },
  { id: "BUG-216", title: "FK cascade removes requirement history", severity: "Critical", priority: "P0", module: "Database", tc: "TC-008", req: "REQ-041", dev: "J. Alvarez", status: "In review", root: "ON DELETE CASCADE misuse" },
  { id: "BUG-217", title: "GraphQL /projects returns null on empty tag", severity: "Low", priority: "P3", module: "API", tc: "TC-007", req: "REQ-024", dev: "unassigned", status: "Triaged", root: "Nullable resolver" },
];

const COVERAGE = [
  { label: "Requirements", covered: 118, total: 128 },
  { label: "User Stories", covered: 142, total: 160 },
  { label: "APIs", covered: 74, total: 84 },
  { label: "Database tables", covered: 22, total: 26 },
  { label: "UI Screens", covered: 41, total: 48 },
  { label: "Security controls", covered: 34, total: 36 },
];

const AUTOMATION = [
  { tool: "Cypress", suites: 24, tests: 412, passing: 96, lastRun: "22m ago" },
  { tool: "Playwright", suites: 12, tests: 168, passing: 94, lastRun: "1h ago" },
  { tool: "Pytest", suites: 30, tests: 520, passing: 98, lastRun: "35m ago" },
  { tool: "JUnit", suites: 8, tests: 96, passing: 92, lastRun: "3h ago" },
  { tool: "Postman", suites: 6, tests: 74, passing: 97, lastRun: "55m ago" },
];

const PERF = [
  { scenario: "Login flow", vusers: 500, p95: 420, rps: 820, cpu: 62, status: "Healthy" },
  { scenario: "List projects", vusers: 500, p95: 610, rps: 640, cpu: 71, status: "Watch" },
  { scenario: "Create requirement", vusers: 200, p95: 890, rps: 210, cpu: 78, status: "Watch" },
  { scenario: "Dashboard aggregate", vusers: 300, p95: 1420, rps: 180, cpu: 84, status: "Risk" },
];

const SECURITY = [
  { name: "Authentication", pass: true },
  { name: "Authorization (RBAC)", pass: true },
  { name: "Input validation", pass: true },
  { name: "Session management", pass: true },
  { name: "Encryption in transit / rest", pass: true },
  { name: "OWASP A01 Broken Access Control", pass: true },
  { name: "OWASP A02 Cryptographic Failures", pass: true },
  { name: "OWASP A03 Injection", pass: false },
  { name: "OWASP A07 Auth Failures", pass: true },
  { name: "API rate limiting", pass: false },
];

const REVIEW = [
  { area: "Requirement coverage", score: 96, note: "10 requirements need dedicated tests." },
  { area: "Edge case depth", score: 88, note: "Add boundary tests for numeric limits and unicode." },
  { area: "Regression stability", score: 93, note: "Flake rate 1.8% on Cypress suite." },
  { area: "Automation ROI", score: 84, note: "Migrate 12 high-run manual cases to Playwright." },
  { area: "Security scenarios", score: 91, note: "Extend fuzzing on public /api endpoints." },
  { area: "Release readiness", score: 95, note: "Green — proceed to UAT gate." },
];

const REPORTS = [
  { name: "Test Summary Report", desc: "Executed, passed, failed, blocked by module.", icon: ClipboardList },
  { name: "QA Dashboard", desc: "Live pass/fail, coverage, automation.", icon: BarChart3 },
  { name: "Defect Report", desc: "Bugs by severity, module, root cause.", icon: Bug },
  { name: "Automation Report", desc: "Suites, flakiness, run history.", icon: Cpu },
  { name: "Requirement Coverage", desc: "Requirement → test case traceability.", icon: Link2 },
  { name: "Release Readiness", desc: "Gate decision with risks and blockers.", icon: ShieldCheck },
  { name: "Executive QA Report", desc: "One-pager for stakeholders.", icon: FileText },
];

const VERSIONS = [
  { v: "v2.1", date: "2026-06-30", added: 42, updated: 18, removed: 3, note: "Release candidate. Automation +7%." },
  { v: "v2.0", date: "2026-05-14", added: 96, updated: 41, removed: 12, note: "Requirements v2 sync + coverage rebuild." },
  { v: "v1.9", date: "2026-04-02", added: 28, updated: 24, removed: 4, note: "Security suite hardened for OWASP." },
];

const QUICK_ACTIONS = [
  "Generate tests from REQ-024",
  "Generate API tests for /projects",
  "Generate edge cases for Login",
  "Explain BUG-216 root cause",
  "Suggest automation candidates",
  "Analyze failed runs (last 24h)",
  "Score release readiness",
  "Draft UAT scenarios for Projects",
  "Generate DB tests for schema v2.1",
  "Generate accessibility tests for Dashboard",
  "Cluster similar bugs",
  "Recommend regression set for PR #482",
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

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    Passed: "bg-success/15 text-success",
    Failed: "bg-destructive/15 text-destructive",
    Blocked: "bg-warning/20 text-warning-foreground",
    Pending: "bg-muted text-muted-foreground",
    Draft: "bg-secondary text-secondary-foreground",
  };
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

function PriorityBadge({ p }: { p: Priority }) {
  const tone = p === "P0" ? "bg-destructive/15 text-destructive"
    : p === "P1" ? "bg-warning/20 text-warning-foreground"
    : "bg-secondary text-secondary-foreground";
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>{p}</span>;
}

function Bar({ pct, tone = "primary" }: { pct: number; tone?: "primary" | "success" | "warning" | "destructive" }) {
  const bg = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "destructive" ? "bg-destructive" : "bg-primary";
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className={`h-1.5 rounded-full ${bg}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

/* ============================================================================
   Page
   ========================================================================= */

function TestsPage() {
  const project = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const filtered = useMemo(() => TESTS.filter(t =>
    (cat === "all" || t.category === cat) &&
    (status === "all" || t.status === status) &&
    (query === "" || `${t.id} ${t.title} ${t.module} ${t.req}`.toLowerCase().includes(query.toLowerCase()))
  ), [query, cat, status]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Test Cases — AI QA Consultant"
        description={`Generate, review, execute, and govern the full test suite for ${project.current?.name ?? PROJECT.name}. Traceable across Requirements, APIs, Database, Repository, and UI.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="mr-1 h-4 w-4" /> Import</Button>
            <Button variant="outline" size="sm"><Link2 className="mr-1 h-4 w-4" /> Link Requirements</Button>
            <Button variant="outline" size="sm"><PlayCircle className="mr-1 h-4 w-4" /> Execute</Button>
            <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => setAssistantOpen(true)}>
              <Bot className="mr-1 h-4 w-4" /> AI QA Assistant
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
            <div className="text-xs uppercase text-muted-foreground">Testing Progress</div>
            <div className="mt-1 font-display text-xl">{Math.round((PROJECT.executed / PROJECT.total) * 100)}%</div>
            <Bar pct={(PROJECT.executed / PROJECT.total) * 100} />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Coverage</div>
            <div className="mt-1 font-display text-xl">{PROJECT.coverage}%</div>
            <Bar pct={PROJECT.coverage} tone="success" />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Pass Rate</div>
            <div className="mt-1 font-display text-xl">{PROJECT.passRate}%</div>
            <Bar pct={PROJECT.passRate} tone="success" />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Fail Rate</div>
            <div className="mt-1 font-display text-xl">{PROJECT.failRate}%</div>
            <Bar pct={PROJECT.failRate * 5} tone="destructive" />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">AI QA Score</div>
            <div className="mt-1 font-display text-xl">{PROJECT.qualityScore}%</div>
            <Bar pct={PROJECT.qualityScore} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="inline-flex w-max min-w-full gap-1">
            {[
              ["overview", "Overview"],
              ["repo", "Test Repository"],
              ["gen", "Test Generation"],
              ["exec", "Test Execution"],
              ["cov", "Test Coverage"],
              ["defects", "Defect Management"],
              ["auto", "Automation"],
              ["perf", "Performance Testing"],
              ["sec", "Security Testing"],
              ["review", "AI QA Review"],
              ["reports", "Reports"],
              ["versions", "Version History"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            {METRICS.map(m => <Metric key={m.label} {...m} />)}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm">Execution status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { l: "Passed", v: PROJECT.passed, tone: "success" as const },
                  { l: "Failed", v: PROJECT.failed, tone: "destructive" as const },
                  { l: "Blocked", v: PROJECT.blocked, tone: "warning" as const },
                  { l: "Pending", v: PROJECT.pending, tone: "primary" as const },
                ].map(r => (
                  <div key={r.l} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{r.l}</span>
                      <span className="text-muted-foreground">{r.v} / {PROJECT.total}</span>
                    </div>
                    <Bar pct={(r.v / PROJECT.total) * 100} tone={r.tone} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">AI summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Overall quality: <b>Excellent</b></div>
                <p className="text-muted-foreground">Coverage is strong at {PROJECT.coverage}% with {PROJECT.critical} critical defects. Focus next sprint on edge cases in Requirements and rate-limit regressions in Auth.</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">Ready for UAT</Badge>
                  <Badge variant="secondary">Automation +7%</Badge>
                  <Badge variant="secondary">3 blockers</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Repository */}
        <TabsContent value="repo" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search TC-ID, title, module, requirement…" className="w-72 pl-8" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Passed","Failed","Blocked","Pending","Draft"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">{filtered.length} of {TESTS.length}</div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Module</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Req</th>
                      <th className="p-2">P</th>
                      <th className="p-2">Risk</th>
                      <th className="p-2">Auto</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Last run</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono text-xs">{t.id}</td>
                        <td className="p-2">{t.title}</td>
                        <td className="p-2">{t.module}</td>
                        <td className="p-2"><Badge variant="secondary" className="text-[10px]">{t.category}</Badge></td>
                        <td className="p-2 font-mono text-xs text-muted-foreground">{t.req}</td>
                        <td className="p-2"><PriorityBadge p={t.priority} /></td>
                        <td className="p-2 text-xs">{t.risk}</td>
                        <td className="p-2">{t.automated ? <CheckCircle2 className="h-4 w-4 text-success" /> : <span className="text-xs text-muted-foreground">manual</span>}</td>
                        <td className="p-2"><StatusBadge status={t.status} /></td>
                        <td className="p-2 text-xs text-muted-foreground">{t.lastRun}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generation */}
        <TabsContent value="gen" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wand2 className="h-4 w-4" /> Generate test cases</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select defaultValue="requirement">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requirement">From Requirement</SelectItem>
                      <SelectItem value="story">From User Story</SelectItem>
                      <SelectItem value="api">From API spec</SelectItem>
                      <SelectItem value="db">From DB schema</SelectItem>
                      <SelectItem value="ui">From UI design</SelectItem>
                      <SelectItem value="arch">From Architecture</SelectItem>
                      <SelectItem value="flow">From Workflow diagram</SelectItem>
                      <SelectItem value="rules">From Business rules</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Source ID (e.g., REQ-024, /api/projects, users table)" />
                </div>
                <Textarea rows={4} placeholder="Optional context: acceptance criteria, edge cases to prioritise, environment constraints…" />
                <div className="flex flex-wrap gap-2">
                  {["Positive","Negative","Boundary","Edge","Validation","Error handling","Regression","Integration","API","UI","Database","Accessibility"].map(k =>
                    <Badge key={k} variant="secondary">{k}</Badge>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button><Sparkles className="mr-1 h-4 w-4" /> Generate suite</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Example — Employee Login</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {["Positive login","Invalid password","Empty username","SQL injection","Expired token","Session timeout","Password length validation","Concurrent login","Forgot password","Rate limiting"].map(x => (
                  <div key={x} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {x}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Execution */}
        <TabsContent value="exec" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Runs today" value={38} hint="12 automated" icon={PlayCircle} />
            <Metric label="Avg duration" value="4m 12s" hint="↓ 18s" icon={Clock} />
            <Metric label="Env" value="staging" hint="build 2.1.482" icon={Layers} />
            <Metric label="Queue" value={7} hint="scheduled" icon={ListChecks} />
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Recent runs</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" /> Retry failed</Button>
                <Button size="sm"><PlayCircle className="mr-1 h-4 w-4" /> Run suite</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {TESTS.slice(0, 8).map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                    <span>{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{t.tester}</span>
                    <span>{t.env}</span>
                    <span>{t.lastRun}</span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI insights</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              <div className="rounded border p-3">Suggest next tests: <b>UAT for Projects</b> (coverage gap detected).</div>
              <div className="rounded border p-3">Failure cluster: 3 tests fail on the same Redis TTL path → likely single root cause.</div>
              <div className="rounded border p-3">Retry recommendation: 2 flaky Cypress tests should re-run before flagging.</div>
              <div className="rounded border p-3">Root cause hint for TC-009: LCP regression correlates with PR #482.</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage */}
        <TabsContent value="cov" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {COVERAGE.map(c => {
              const pct = Math.round((c.covered / c.total) * 100);
              return (
                <Card key={c.label}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{c.label}</span>
                      <span className="text-muted-foreground">{c.covered}/{c.total}</span>
                    </div>
                    <Progress value={pct} />
                    <div className="text-xs text-muted-foreground">{pct}% covered</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Workflow className="h-4 w-4" /> Traceability chain</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {["Requirements","User Stories","Architecture","APIs","Database","UI","Test Cases"].map((n, i, a) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="rounded-md border bg-card px-2 py-1">{n}</span>
                    {i < a.length - 1 && <span className="text-muted-foreground">→</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> AI detected gaps</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["REQ-047 has no linked test cases","POST /api/webhooks/deploy is untested","user_sessions table missing integrity tests","Settings screen has no accessibility coverage"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><AlertTriangle className="h-4 w-4 text-warning" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Defects */}
        <TabsContent value="defects" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Open defects" value={PROJECT.defects} hint={`${PROJECT.critical} critical`} icon={Bug} />
            <Metric label="MTTR" value="1.6d" hint="↓ 0.3d" icon={Clock} />
            <Metric label="Reopen rate" value="4%" hint="last 30d" icon={RefreshCw} />
            <Metric label="Duplicate rate" value="6%" hint="AI-detected" icon={Filter} />
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">ID</th><th className="p-2">Title</th><th className="p-2">Severity</th><th className="p-2">Module</th><th className="p-2">Test</th><th className="p-2">Req</th><th className="p-2">Owner</th><th className="p-2">Root cause</th><th className="p-2">Status</th></tr>
                </thead>
                <tbody>
                  {DEFECTS.map(d => (
                    <tr key={d.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">{d.id}</td>
                      <td className="p-2">{d.title}</td>
                      <td className="p-2"><Badge variant={d.severity === "Critical" ? "destructive" : "secondary"}>{d.severity}</Badge></td>
                      <td className="p-2">{d.module}</td>
                      <td className="p-2 font-mono text-xs">{d.tc}</td>
                      <td className="p-2 font-mono text-xs text-muted-foreground">{d.req}</td>
                      <td className="p-2 text-xs">{d.dev}</td>
                      <td className="p-2 text-xs text-muted-foreground">{d.root}</td>
                      <td className="p-2 text-xs">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="auto" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            {AUTOMATION.map(a => (
              <Card key={a.tool}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{a.tool}</div>
                    <Badge variant="secondary" className="text-[10px]">{a.passing}%</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.suites} suites · {a.tests} tests</div>
                  <Bar pct={a.passing} tone={a.passing >= 95 ? "success" : "warning"} />
                  <div className="text-xs text-muted-foreground">Last run {a.lastRun}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI automation coach</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              <div className="rounded border p-3">12 manual regression tests are strong automation candidates (high run frequency, stable UI).</div>
              <div className="rounded border p-3">Generate Playwright scripts for the Projects CRUD flow.</div>
              <div className="rounded border p-3">Reduce flake: rewrite 3 Cypress tests to use network stubs instead of real backend.</div>
              <div className="rounded border p-3">Suite health looks good — automation coverage {PROJECT.automationCoverage}%.</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="perf" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">Scenario</th><th className="p-2">VUsers</th><th className="p-2">P95 (ms)</th><th className="p-2">RPS</th><th className="p-2">CPU %</th><th className="p-2">Status</th></tr>
                </thead>
                <tbody>
                  {PERF.map(p => (
                    <tr key={p.scenario} className="border-b hover:bg-muted/30">
                      <td className="p-2">{p.scenario}</td>
                      <td className="p-2">{p.vusers}</td>
                      <td className="p-2">{p.p95}</td>
                      <td className="p-2">{p.rps}</td>
                      <td className="p-2">{p.cpu}</td>
                      <td className="p-2"><Badge variant={p.status === "Risk" ? "destructive" : p.status === "Watch" ? "secondary" : "default"}>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Gauge className="h-4 w-4" /> AI recommendations</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Add caching on Dashboard aggregate endpoint","Optimize N+1 queries in /api/projects","Enable response compression for JSON > 8KB","Scale worker pool to 6 during peak hours"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><Zap className="h-4 w-4 text-primary" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="sec" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY.map(s => (
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
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> AI-detected issues</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Injection: Fuzz report flagged 2 endpoints missing sanitizer","Rate limiting: /login limiter resets on 4xx retries","XSS: React `dangerouslySetInnerHTML` used in RichNote","Broken auth: refresh token TTL exceeds policy"].map(x =>
                <div key={x} className="flex items-start gap-2 rounded border p-2"><AlertTriangle className="h-4 w-4 text-warning" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI QA Review */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> Senior QA Architect review</CardTitle>
              <Badge className="bg-success/15 text-success">Overall {PROJECT.qualityScore}%</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {REVIEW.map(r => (
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
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Missing tests" value={10} hint="AI suggested" icon={AlertTriangle} />
            <Metric label="Risk-weighted score" value="A" hint="release ready" icon={TrendingUp} />
            <Metric label="Regression impact" value="Low" hint="PRs 470–482" icon={GitBranch} />
          </div>
        </TabsContent>

        {/* Reports */}
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
                    {["PDF","Excel","CSV","Word","PPT"].map(f => <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>)}
                  </div>
                  <Button size="sm" variant="outline" className="w-full"><Download className="mr-1 h-4 w-4" /> Generate</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Versions */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">Version</th><th className="p-2">Date</th><th className="p-2">Added</th><th className="p-2">Updated</th><th className="p-2">Removed</th><th className="p-2">Notes</th></tr>
                </thead>
                <tbody>
                  {VERSIONS.map(v => (
                    <tr key={v.v} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">{v.v}</td>
                      <td className="p-2 text-xs text-muted-foreground">{v.date}</td>
                      <td className="p-2 text-success">+{v.added}</td>
                      <td className="p-2">{v.updated}</td>
                      <td className="p-2 text-destructive">-{v.removed}</td>
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
              {["Test case edits","Execution history","Requirement mapping changes","Defect lifecycle","Automation script updates"].map(x =>
                <div key={x} className="flex items-center gap-2 rounded border p-2"><CheckCircle2 className="h-4 w-4 text-success" /> {x}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI QA Assistant */}
      <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI QA Assistant</SheetTitle>
            <SheetDescription>Generate, review, and analyze test cases, defects, and coverage across the SDLC.</SheetDescription>
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
                <li>• APIs: 84 endpoints</li>
                <li>• DB tables: 26</li>
                <li>• UI screens: 48</li>
                <li>• Repository PRs (7d): 22</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 space-y-2 border-t pt-3">
            <Textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask the AI QA Consultant…" />
            <div className="flex justify-end">
              <Button size="sm"><Send className="mr-1 h-4 w-4" /> Send</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
