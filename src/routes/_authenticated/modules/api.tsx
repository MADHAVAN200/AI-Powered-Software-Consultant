import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plug, Bot, Sparkles, Send, Upload, Search, Shield, Zap, Activity,
  GitBranch, FileText, Link2, RefreshCw, Download, Copy, Share2,
  CheckCircle2, AlertTriangle, Clock, TrendingUp, Layers, KeyRound,
  Gauge, PlayCircle, ShieldCheck, Globe, Server, Lock, Filter,
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

export const Route = createFileRoute("/_authenticated/modules/api")({
  component: APIPage,
});

/* ============================================================================
   Simulated data — AI API Consultant
   ========================================================================= */

const PROJECT = {
  name: "AI Software Consultant",
  version: "v2.1",
  status: "Production",
  health: 94,
  security: 91,
  performance: 89,
  docs: 86,
  reviewScore: 93,
  total: 84,
  rest: 72,
  graphql: 8,
  webhooks: 4,
  active: 78,
  deprecated: 6,
  avgLatency: 180,
  availability: 99.98,
  errorRate: 0.42,
};

const METRICS = [
  { label: "Total APIs", value: PROJECT.total, hint: "12 modules", icon: Plug },
  { label: "Active APIs", value: PROJECT.active, hint: `${PROJECT.deprecated} deprecated`, icon: CheckCircle2 },
  { label: "Health Score", value: `${PROJECT.health}%`, hint: "+2 vs last week", icon: Activity },
  { label: "Security Score", value: `${PROJECT.security}%`, hint: "OWASP API Top 10", icon: Shield },
  { label: "Performance", value: `${PROJECT.performance}%`, hint: `${PROJECT.avgLatency}ms avg`, icon: Zap },
  { label: "Availability", value: `${PROJECT.availability}%`, hint: "30d uptime", icon: Server },
  { label: "Error Rate", value: `${PROJECT.errorRate}%`, hint: "5xx + 4xx", icon: AlertTriangle },
  { label: "Docs Coverage", value: `${PROJECT.docs}%`, hint: "OpenAPI 3.1", icon: FileText },
  { label: "AI Review", value: `${PROJECT.reviewScore}%`, hint: "REST compliance", icon: Sparkles },
];

const MODULES = [
  "Authentication", "Users", "Projects", "Requirements", "Architecture",
  "Repository", "Database", "Reports", "Notifications", "Administration", "AI Services",
];

type ApiStatus = "production" | "beta" | "deprecated" | "draft";
type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiEndpoint {
  method: ApiMethod;
  path: string;
  module: string;
  version: string;
  status: ApiStatus;
  owner: string;
  env: "production" | "staging" | "dev";
  auth: "JWT" | "OAuth" | "API Key" | "None";
  req: string;
  tables: string[];
  latency: number;
  usage: string;
  errorRate: number;
}

const ENDPOINTS: ApiEndpoint[] = [
  { method: "POST", path: "/api/v1/auth/login", module: "Authentication", version: "v1", status: "production", owner: "Backend Team", env: "production", auth: "JWT", req: "REQ-001", tables: ["users", "sessions"], latency: 120, usage: "1.2M/mo", errorRate: 0.2 },
  { method: "POST", path: "/api/v1/auth/refresh", module: "Authentication", version: "v1", status: "production", owner: "Backend Team", env: "production", auth: "JWT", req: "REQ-002", tables: ["sessions"], latency: 45, usage: "3.4M/mo", errorRate: 0.1 },
  { method: "GET", path: "/api/v1/users/:id", module: "Users", version: "v1", status: "production", owner: "Backend Team", env: "production", auth: "JWT", req: "REQ-011", tables: ["users", "profiles"], latency: 88, usage: "820K/mo", errorRate: 0.3 },
  { method: "PATCH", path: "/api/v1/users/:id", module: "Users", version: "v1", status: "production", owner: "Backend Team", env: "production", auth: "JWT", req: "REQ-013", tables: ["users"], latency: 105, usage: "142K/mo", errorRate: 0.4 },
  { method: "POST", path: "/api/v1/projects", module: "Projects", version: "v1", status: "production", owner: "Backend Team", env: "production", auth: "JWT", req: "REQ-024", tables: ["projects"], latency: 210, usage: "48K/mo", errorRate: 0.5 },
  { method: "GET", path: "/api/v1/projects", module: "Projects", version: "v1", status: "production", owner: "Backend Team", env: "production", auth: "JWT", req: "REQ-025", tables: ["projects", "members"], latency: 156, usage: "620K/mo", errorRate: 0.2 },
  { method: "GET", path: "/api/v1/projects/:id/health", module: "Projects", version: "v1", status: "production", owner: "Platform Team", env: "production", auth: "JWT", req: "REQ-031", tables: ["projects", "metrics"], latency: 320, usage: "220K/mo", errorRate: 0.9 },
  { method: "POST", path: "/api/v1/requirements", module: "Requirements", version: "v1", status: "production", owner: "AI Team", env: "production", auth: "JWT", req: "REQ-041", tables: ["requirements"], latency: 240, usage: "38K/mo", errorRate: 0.4 },
  { method: "POST", path: "/api/v1/architecture/review", module: "Architecture", version: "v1", status: "beta", owner: "AI Team", env: "staging", auth: "JWT", req: "REQ-052", tables: ["reviews"], latency: 1420, usage: "12K/mo", errorRate: 1.8 },
  { method: "GET", path: "/api/v1/repository/scan", module: "Repository", version: "v1", status: "production", owner: "Platform Team", env: "production", auth: "JWT", req: "REQ-061", tables: ["repos", "scans"], latency: 890, usage: "42K/mo", errorRate: 1.1 },
  { method: "POST", path: "/api/v1/database/schema/generate", module: "Database", version: "v1", status: "production", owner: "AI Team", env: "production", auth: "JWT", req: "REQ-071", tables: ["schemas"], latency: 720, usage: "22K/mo", errorRate: 0.6 },
  { method: "GET", path: "/api/v1/reports/:id", module: "Reports", version: "v1", status: "production", owner: "Analytics Team", env: "production", auth: "JWT", req: "REQ-081", tables: ["reports"], latency: 210, usage: "180K/mo", errorRate: 0.3 },
  { method: "POST", path: "/api/v1/notifications/subscribe", module: "Notifications", version: "v1", status: "production", owner: "Platform Team", env: "production", auth: "API Key", req: "REQ-091", tables: ["subscriptions"], latency: 95, usage: "260K/mo", errorRate: 0.2 },
  { method: "DELETE", path: "/api/v0/users/:id/legacy", module: "Users", version: "v0", status: "deprecated", owner: "Backend Team", env: "production", auth: "API Key", req: "REQ-014", tables: ["users_legacy"], latency: 145, usage: "8K/mo", errorRate: 3.4 },
  { method: "POST", path: "/api/v2/ai/consult", module: "AI Services", version: "v2", status: "beta", owner: "AI Team", env: "staging", auth: "OAuth", req: "REQ-101", tables: ["ai_sessions"], latency: 2100, usage: "14K/mo", errorRate: 2.2 },
];

/* ------------------------------ Documentation --------------------------- */

interface DocSpec {
  format: "OpenAPI" | "Swagger" | "Postman" | "Markdown" | "HTML" | "PDF";
  file: string;
  size: string;
  updated: string;
  coverage: number;
}

const DOCS_SPECS: DocSpec[] = [
  { format: "OpenAPI", file: "openapi.v2.1.yaml", size: "184 KB", updated: "2h ago", coverage: 92 },
  { format: "Swagger", file: "swagger.json", size: "212 KB", updated: "2h ago", coverage: 92 },
  { format: "Postman", file: "aristotle.postman_collection.json", size: "96 KB", updated: "1d ago", coverage: 88 },
  { format: "Markdown", file: "api-reference.md", size: "48 KB", updated: "4h ago", coverage: 79 },
  { format: "HTML", file: "api-reference.html", size: "1.2 MB", updated: "4h ago", coverage: 79 },
  { format: "PDF", file: "api-reference.pdf", size: "3.4 MB", updated: "1w ago", coverage: 72 },
];

/* ------------------------------ Security --------------------------------- */

const SECURITY_CHECKS = [
  { name: "OAuth 2.0 + PKCE on all auth endpoints", status: "pass", severity: "critical" },
  { name: "JWT signature validation (RS256)", status: "pass", severity: "critical" },
  { name: "Refresh token rotation", status: "pass", severity: "high" },
  { name: "Rate limiting (per-IP + per-token)", status: "warn", severity: "high", note: "Missing on /api/v1/reports/*" },
  { name: "CORS allowlist configured", status: "pass", severity: "medium" },
  { name: "Input validation with Zod / OpenAPI", status: "warn", severity: "high", note: "12 endpoints unvalidated" },
  { name: "OWASP API #1 Broken Object-Level Auth", status: "pass", severity: "critical" },
  { name: "OWASP API #2 Broken Authentication", status: "pass", severity: "critical" },
  { name: "OWASP API #3 Excessive Data Exposure", status: "warn", severity: "high", note: "users response leaks email hash" },
  { name: "OWASP API #4 Lack of Resources / Rate Limiting", status: "warn", severity: "high" },
  { name: "OWASP API #7 Security Misconfiguration", status: "pass", severity: "medium" },
  { name: "PII masking on logs and traces", status: "pass", severity: "high" },
  { name: "Deprecated endpoints require sunset headers", status: "bad", severity: "medium", note: "/api/v0/users/:id/legacy" },
];

/* ------------------------------ Testing --------------------------------- */

const TEST_SUITES = [
  { type: "Functional", total: 214, pass: 208, fail: 6, coverage: 94, time: "42s" },
  { type: "Regression", total: 156, pass: 152, fail: 4, coverage: 88, time: "1m 12s" },
  { type: "Integration", total: 88, pass: 82, fail: 6, coverage: 79, time: "2m 04s" },
  { type: "Contract", total: 62, pass: 61, fail: 1, coverage: 96, time: "18s" },
  { type: "Load", total: 12, pass: 11, fail: 1, coverage: 100, time: "8m 30s" },
  { type: "Performance", total: 24, pass: 21, fail: 3, coverage: 92, time: "6m 12s" },
  { type: "Smoke", total: 18, pass: 18, fail: 0, coverage: 100, time: "9s" },
];

/* --------------------------- Performance --------------------------------- */

const TOP_SLOW = [
  { path: "POST /api/v2/ai/consult", latency: 2100, calls: "14K/mo", trend: "▲" },
  { path: "POST /api/v1/architecture/review", latency: 1420, calls: "12K/mo", trend: "▲" },
  { path: "GET /api/v1/repository/scan", latency: 890, calls: "42K/mo", trend: "▼" },
  { path: "POST /api/v1/database/schema/generate", latency: 720, calls: "22K/mo", trend: "◆" },
  { path: "GET /api/v1/projects/:id/health", latency: 320, calls: "220K/mo", trend: "▼" },
];

const LATENCY_SPARK = [140, 155, 148, 172, 168, 190, 180, 176, 195, 182, 178, 180];

/* --------------------------- Review verdicts ----------------------------- */

const REVIEW_DIMENSIONS = [
  { name: "Naming Standards", score: 96, verdict: "Excellent" },
  { name: "REST Compliance", score: 94, verdict: "Excellent" },
  { name: "Consistency", score: 88, verdict: "Good" },
  { name: "Error Handling", score: 74, verdict: "Needs Improvement" },
  { name: "Versioning", score: 92, verdict: "Excellent" },
  { name: "Security", score: 86, verdict: "Good" },
  { name: "Scalability", score: 90, verdict: "Excellent" },
  { name: "Documentation", score: 79, verdict: "Needs Improvement" },
  { name: "Performance", score: 89, verdict: "Good" },
  { name: "Validation", score: 82, verdict: "Good" },
];

const RECOMMENDATIONS = [
  { icon: AlertTriangle, tone: "warn" as const, title: "Standardize error responses", body: "Adopt RFC 7807 problem+json across all endpoints. 18 endpoints still return ad-hoc { message } shapes." },
  { icon: Layers, tone: "warn" as const, title: "Implement cursor pagination", body: "GET /projects and /reports return unbounded arrays. Add cursor + limit params before v2.2." },
  { icon: ShieldCheck, tone: "info" as const, title: "Add request validation to 12 endpoints", body: "Enforce OpenAPI schema at gateway. AI can auto-generate zod validators from the spec." },
  { icon: Zap, tone: "info" as const, title: "Enable response caching for /projects/:id/health", body: "60s TTL would drop origin traffic by ~78% at current usage." },
  { icon: Clock, tone: "warn" as const, title: "Sunset headers on v0", body: "Deprecated endpoints must return Sunset + Link: alternate to guide consumers." },
];

/* --------------------------- Analytics ---------------------------------- */

const MOST_USED = [
  { path: "POST /api/v1/auth/refresh", calls: "3.4M/mo" },
  { path: "POST /api/v1/auth/login", calls: "1.2M/mo" },
  { path: "GET /api/v1/users/:id", calls: "820K/mo" },
  { path: "GET /api/v1/projects", calls: "620K/mo" },
  { path: "POST /api/v1/notifications/subscribe", calls: "260K/mo" },
];
const LEAST_USED = [
  { path: "DELETE /api/v0/users/:id/legacy", calls: "8K/mo" },
  { path: "POST /api/v2/ai/consult", calls: "14K/mo" },
  { path: "GET /api/v1/reports/exports/csv", calls: "6K/mo" },
];
const VERSION_USAGE = [
  { v: "v2", pct: 12 }, { v: "v1", pct: 84 }, { v: "v0", pct: 4 },
];
const CONSUMERS = [
  { name: "Web App", calls: "4.8M/mo", pct: 62 },
  { name: "Mobile iOS", calls: "1.6M/mo", pct: 21 },
  { name: "Mobile Android", calls: "0.9M/mo", pct: 12 },
  { name: "Partner Integrations", calls: "0.4M/mo", pct: 5 },
];

/* --------------------------- Versions ---------------------------------- */

const VERSIONS = [
  { v: "v2.1", when: "2026-06-14", status: "Production", breaking: 0, deprecations: 2, notes: "Added /ai/consult streaming, cursor pagination on /projects." },
  { v: "v2.0", when: "2026-04-02", status: "Production", breaking: 3, deprecations: 5, notes: "Auth rewrite to OAuth 2.0 + PKCE. /users response shape updated." },
  { v: "v1.1", when: "2025-11-18", status: "Deprecated", breaking: 0, deprecations: 1, notes: "Introduced /projects/:id/health. Minor payload additions." },
  { v: "v1", when: "2025-06-01", status: "Deprecated", breaking: 0, deprecations: 0, notes: "Initial public API." },
  { v: "v0", when: "2024-12-10", status: "Sunset 2026-12", breaking: 0, deprecations: 4, notes: "Internal-only preview endpoints. Sunset scheduled." },
];

/* --------------------------- Sample req/res ------------------------------ */

const SAMPLE_REQ = `POST /api/v1/auth/login HTTP/1.1
Host: api.aristotle.dev
Content-Type: application/json
Accept: application/json

{
  "email": "dev@aristotle.dev",
  "password": "••••••••"
}`;

const SAMPLE_RES = `HTTP/1.1 200 OK
Content-Type: application/json
X-Request-Id: 8f2c1e7a-...
Cache-Control: no-store

{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "rt_9f2c...",
  "expires_in": 3600,
  "user": {
    "id": "u_142",
    "email": "dev@aristotle.dev",
    "role": "developer"
  }
}`;

const INTEGRATIONS = {
  gateways: ["Kong", "Apigee", "AWS API Gateway", "Azure API Management", "NGINX"],
  testing: ["Postman", "Bruno", "Insomnia"],
  docs: ["Swagger", "OpenAPI", "Redoc"],
  monitoring: ["Prometheus", "Grafana", "Datadog", "New Relic"],
};

const AI_ACTIONS = [
  "Explain API", "Review API", "Generate Documentation", "Validate Request",
  "Validate Response", "Security Audit", "Performance Review", "Compare Versions",
  "Generate Test Cases", "Generate Mock Data", "Generate Error Responses",
  "Explain Auth Flow",
];

/* ============================================================================
   Component
   ========================================================================= */

function APIPage() {
  const { current } = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);
  const [q, setQ] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi — I'm the AI API Consultant. Ask me to review endpoints, generate an OpenAPI spec, audit OWASP API Top 10, or draft test cases." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [designerPrompt, setDesignerPrompt] = useState(
    "Design a paginated GET /api/v1/projects endpoint with cursor pagination, filter by status, JWT auth, and RFC 7807 error responses.",
  );

  const projectName = current?.name ?? "AI Software Consultant";

  const filtered = useMemo(
    () =>
      ENDPOINTS.filter((e) =>
        (e.path.toLowerCase().includes(q.toLowerCase()) || e.module.toLowerCase().includes(q.toLowerCase())) &&
        (moduleFilter === "all" || e.module === moduleFilter) &&
        (methodFilter === "all" || e.method === methodFilter),
      ),
    [q, moduleFilter, methodFilter],
  );

  const sendChat = (text?: string) => {
    const t = (text ?? chatInput).trim();
    if (!t) return;
    setChat((c) => [
      ...c,
      { role: "user", text: t },
      { role: "ai", text: `Working on "${t}"… I'll cross-reference the spec, catalog, security policies and traffic patterns and share findings shortly.` },
    ]);
    setChatInput("");
  };

  return (
    <>
      <PageHeader
        title="API"
        description="AI API Consultant — design, review, secure, document and monitor APIs across the SDLC."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Import OpenAPI</Button>
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Bot className="h-4 w-4" /> AI Consultant
            </Button>
            <Button size="sm"><Sparkles className="h-4 w-4" /> AI Review</Button>
          </div>
        }
      />

      <div className="w-full px-8 py-6 space-y-6">
        {/* Project overview */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Field label="Project" value={projectName} />
              <Field label="API Version" value={PROJECT.version} />
              <Field
                label="Status"
                value={<Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">{PROJECT.status}</Badge>}
              />
              <Field label="Docs Status" value={<Badge variant="outline">OpenAPI 3.1 · {PROJECT.docs}% coverage</Badge>} />
              <ScoreField label="API Health" value={PROJECT.health} />
              <ScoreField label="Security Score" value={PROJECT.security} />
              <ScoreField label="Performance Score" value={PROJECT.performance} />
              <ScoreField label="Documentation" value={PROJECT.docs} />
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <TabsList className="inline-flex w-max min-w-full gap-1">
              {[
                ["overview", "Overview"],
                ["catalog", "API Catalog"],
                ["designer", "API Designer"],
                ["docs", "Documentation"],
                ["reqres", "Request & Response"],
                ["testing", "API Testing"],
                ["security", "API Security"],
                ["perf", "Performance & Monitoring"],
                ["review", "AI API Review"],
                ["analytics", "API Analytics"],
                ["versions", "Version History"],
              ].map(([v, l]) => (
                <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {METRICS.map((m) => (
                <Card key={m.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
                      <m.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-1 font-display text-2xl">{m.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{m.hint}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">AI API Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    <strong>{PROJECT.total} APIs</strong> across {MODULES.length} modules — {PROJECT.rest} REST, {PROJECT.graphql} GraphQL, {PROJECT.webhooks} webhooks.
                    Overall score <strong>{PROJECT.reviewScore}%</strong>. Focus areas: standardize error responses, add validation to 12 endpoints,
                    and sunset <code className="mx-1">/api/v0</code>.
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <SummaryCell label="REST" value={String(PROJECT.rest)} />
                    <SummaryCell label="GraphQL" value={String(PROJECT.graphql)} />
                    <SummaryCell label="Webhooks" value={String(PROJECT.webhooks)} />
                    <SummaryCell label="Avg Latency" value={`${PROJECT.avgLatency}ms`} />
                    <SummaryCell label="Availability" value={`${PROJECT.availability}%`} />
                    <SummaryCell label="Overall" value={`${PROJECT.reviewScore}%`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Integrations</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <IntGroup label="Gateways" items={INTEGRATIONS.gateways} connected="Kong" />
                  <IntGroup label="Testing" items={INTEGRATIONS.testing} connected="Postman" />
                  <IntGroup label="Docs" items={INTEGRATIONS.docs} connected="OpenAPI" />
                  <IntGroup label="Monitoring" items={INTEGRATIONS.monitoring} connected="Datadog" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">SDLC Traceability</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {["Requirements", "Architecture", "Database", "Repository", "API", "Testing", "Deployment"].map((s, i, arr) => (
                    <span key={s} className="flex items-center gap-2">
                      <Badge variant="outline" className={s === "API" ? "bg-primary text-primary-foreground border-primary" : ""}>{s}</Badge>
                      {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Every endpoint is linked to a requirement, an architecture component, database tables and a repository module — traced end-to-end.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CATALOG */}
          <TabsContent value="catalog" className="mt-4 space-y-4">
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 p-3">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search endpoints or modules…" className="pl-8" />
                </div>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All modules</SelectItem>
                    {MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    {(["GET", "POST", "PUT", "PATCH", "DELETE"] as ApiMethod[]).map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline"><Filter className="h-4 w-4" /> Advanced</Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {filtered.map((e) => (
                <Card key={`${e.method}-${e.path}`}>
                  <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12">
                    <div className="md:col-span-5">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={e.method} />
                        <code className="truncate font-mono text-sm">{e.path}</code>
                        <StatusBadge status={e.status} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {e.module} · {e.version} · {e.owner} · <span className="uppercase">{e.env}</span>
                      </div>
                    </div>
                    <div className="md:col-span-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground"><KeyRound className="h-3 w-3" /> Auth: {e.auth}</div>
                      <div className="flex items-center gap-1 text-muted-foreground"><Link2 className="h-3 w-3" /> {e.req}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {e.tables.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    </div>
                    <div className="md:col-span-2 text-xs">
                      <div className="text-muted-foreground">Latency</div>
                      <div className="font-mono text-sm">{e.latency}ms</div>
                      <div className="text-muted-foreground">Usage</div>
                      <div className="font-mono text-sm">{e.usage}</div>
                    </div>
                    <div className="md:col-span-2 flex items-start justify-end gap-1">
                      <Button size="sm" variant="outline"><PlayCircle className="h-3.5 w-3.5" /> Try</Button>
                      <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5" /> Docs</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">No endpoints match those filters.</div>
              )}
            </div>
          </TabsContent>

          {/* DESIGNER */}
          <TabsContent value="designer" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Design a new endpoint</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {["REST", "GraphQL", "gRPC", "WebSocket", "Webhook"].map((k) => (
                      <Badge key={k} variant="outline" className="text-[11px]">{k}</Badge>
                    ))}
                  </div>
                  <Textarea rows={5} value={designerPrompt} onChange={(e) => setDesignerPrompt(e.target.value)} className="text-sm" />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm"><Sparkles className="h-4 w-4" /> Generate Spec</Button>
                    <Button size="sm" variant="outline"><Bot className="h-4 w-4" /> Suggest Endpoints</Button>
                    <Button size="sm" variant="outline">Naming Convention</Button>
                    <Button size="sm" variant="outline">Response Structure</Button>
                    <Button size="sm" variant="outline">Validation Rules</Button>
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
{`# Generated OpenAPI (excerpt)
paths:
  /api/v1/projects:
    get:
      summary: List projects (cursor paginated)
      parameters:
        - in: query
          name: cursor
          schema: { type: string }
        - in: query
          name: limit
          schema: { type: integer, default: 20, maximum: 100 }
        - in: query
          name: status
          schema: { type: string, enum: [active, archived] }
      security: [{ bearerAuth: [] }]
      responses:
        '200': { $ref: '#/components/responses/ProjectPage' }
        '400': { $ref: '#/components/responses/Problem' }
        '401': { $ref: '#/components/responses/Problem' }`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Design Checklist</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    "Endpoint follows /api/v{n}/{resource} convention",
                    "Uses correct HTTP verb + status codes",
                    "Auth scheme declared (JWT/OAuth/API Key)",
                    "Pagination for list endpoints",
                    "Idempotency for POST where applicable",
                    "Errors use RFC 7807 problem+json",
                    "Rate limit + quota declared",
                    "Deprecation + Sunset headers set",
                  ].map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DOCUMENTATION */}
          <TabsContent value="docs" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MiniStat label="Coverage" value={`${PROJECT.docs}%`} tone="warn" />
              <MiniStat label="Undocumented Endpoints" value="12" tone="warn" />
              <MiniStat label="Broken Examples" value="3" tone="bad" />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {DOCS_SPECS.map((d) => (
                <Card key={d.format}>
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{d.format}</span>
                        <Badge variant="outline" className="text-[10px]">{d.coverage}% coverage</Badge>
                      </div>
                      <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{d.file}</div>
                      <div className="text-xs text-muted-foreground">{d.size} · updated {d.updated}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Download</Button>
                      <Button size="sm" variant="outline"><Copy className="h-3.5 w-3.5" /> Copy</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">AI Documentation Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm"><Sparkles className="h-4 w-4" /> Generate Documentation</Button>
                <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4" /> Update Documentation</Button>
                <Button size="sm" variant="outline"><Search className="h-4 w-4" /> Find Missing Docs</Button>
                <Button size="sm" variant="outline">Improve Descriptions</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REQ / RES */}
          <TabsContent value="reqres" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">POST /api/v1/auth/login</CardTitle>
                  <div className="mt-1 text-xs text-muted-foreground">JWT · Authentication module · REQ-001</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"><PlayCircle className="h-3.5 w-3.5" /> Try it</Button>
                  <Button size="sm" variant="outline"><Sparkles className="h-3.5 w-3.5" /> Validate</Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Request</div>
                  <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">{SAMPLE_REQ}</pre>
                </div>
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Response · 200 OK</div>
                  <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">{SAMPLE_RES}</pre>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">AI Assistants</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">Validate Payload</Button>
                <Button size="sm" variant="outline">Detect Missing Fields</Button>
                <Button size="sm" variant="outline">Better Response Structure</Button>
                <Button size="sm"><Sparkles className="h-4 w-4" /> Generate Sample Data</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TESTING */}
          <TabsContent value="testing" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MiniStat label="Total Tests" value={String(TEST_SUITES.reduce((s, t) => s + t.total, 0))} />
              <MiniStat label="Passing" value={String(TEST_SUITES.reduce((s, t) => s + t.pass, 0))} tone="ok" />
              <MiniStat label="Failing" value={String(TEST_SUITES.reduce((s, t) => s + t.fail, 0))} tone="bad" />
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Test Suites</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {TEST_SUITES.map((t) => (
                  <div key={t.type} className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-6 md:items-center">
                    <div className="md:col-span-2 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t.type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Total {t.total}</div>
                    <div className="text-xs text-emerald-600">Pass {t.pass}</div>
                    <div className="text-xs text-rose-600">Fail {t.fail}</div>
                    <div className="flex items-center gap-2">
                      <Progress value={t.coverage} className="h-1.5 w-24" />
                      <span className="text-xs text-muted-foreground">{t.coverage}% · {t.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">AI Testing Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm"><Sparkles className="h-4 w-4" /> Generate Test Cases</Button>
                <Button size="sm" variant="outline">Generate Edge Cases</Button>
                <Button size="sm" variant="outline">Invalid Payload Tests</Button>
                <Button size="sm" variant="outline">Suggest Improvements</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <MiniStat label="Critical" value={String(SECURITY_CHECKS.filter((c) => c.status === "bad" && c.severity === "critical").length)} tone="bad" />
              <MiniStat label="Warnings" value={String(SECURITY_CHECKS.filter((c) => c.status === "warn").length)} tone="warn" />
              <MiniStat label="Passed" value={String(SECURITY_CHECKS.filter((c) => c.status === "pass").length)} tone="ok" />
              <MiniStat label="Security Score" value={`${PROJECT.security}%`} />
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Security Checks</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {SECURITY_CHECKS.map((c) => (
                  <div key={c.name} className="flex items-start justify-between gap-3 rounded-md border p-3">
                    <div className="flex items-start gap-2">
                      {c.status === "pass" ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600" />
                        : c.status === "warn" ? <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600" />
                        : <AlertTriangle className="h-4 w-4 mt-0.5 text-rose-600" />}
                      <div className="min-w-0">
                        <div className="text-sm">{c.name}</div>
                        {c.note && <div className="text-xs text-muted-foreground">{c.note}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{c.severity}</Badge>
                      <SecStatus status={c.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">AI Security Suggestions</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {["Enable rate limiting on /reports/*", "Mask email hash in /users responses", "Reduce JWT expiry to 15m + refresh rotation", "Add zod validation to 12 endpoints", "Add Sunset headers to /api/v0"].map((s) => (
                  <div key={s} className="flex items-start gap-2 rounded-md border p-3 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground mt-0.5" /> {s}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERFORMANCE */}
          <TabsContent value="perf" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Response Time" value={`${PROJECT.avgLatency}ms`} />
              <MiniStat label="Throughput" value="8.4k rps" />
              <MiniStat label="Availability" value={`${PROJECT.availability}%`} tone="ok" />
              <MiniStat label="Error Rate" value={`${PROJECT.errorRate}%`} tone="warn" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Latency (last 12h)</CardTitle></CardHeader>
                <CardContent>
                  <Sparkline values={LATENCY_SPARK} />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>min 140ms</span><span>avg {PROJECT.avgLatency}ms</span><span>p95 240ms</span><span>max 320ms</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Traffic Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {CONSUMERS.map((c) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-xs"><span>{c.name}</span><span className="text-muted-foreground">{c.calls}</span></div>
                      <Progress value={c.pct} className="mt-1 h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Top Slow APIs</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {TOP_SLOW.map((s) => (
                  <div key={s.path} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <code className="truncate font-mono text-xs">{s.path}</code>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{s.calls}</span>
                      <span className="font-mono">{s.latency}ms</span>
                      <span>{s.trend}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">AI Performance Suggestions</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {["Detect Bottlenecks", "Caching Suggestions", "Pagination Recommendation", "Compression Recommendation"].map((s) => (
                  <div key={s} className="flex items-start gap-2 rounded-md border p-3 text-sm">
                    <Zap className="h-4 w-4 text-muted-foreground mt-0.5" /> {s}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVIEW */}
          <TabsContent value="review" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">API Quality Score</CardTitle>
                  <div className="mt-1 text-xs text-muted-foreground">AI-driven Senior API Architect review</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl">{PROJECT.reviewScore}%</div>
                  <VerdictBadge v="Excellent" />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {REVIEW_DIMENSIONS.map((d) => (
                  <div key={d.name} className="rounded-md border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{d.name}</span>
                      <span className="font-mono">{d.score}%</span>
                    </div>
                    <Progress value={d.score} className="mt-2 h-1.5" />
                    <div className="mt-2"><VerdictBadge v={d.verdict} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {RECOMMENDATIONS.map((r) => (
                  <div key={r.title} className="flex items-start gap-3 rounded-md border p-3">
                    <r.icon className={`mt-0.5 h-4 w-4 ${r.tone === "warn" ? "text-amber-600" : "text-sky-600"}`} />
                    <div>
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.body}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Requests / month" value="7.8M" />
              <MiniStat label="Peak Traffic" value="14k rps" />
              <MiniStat label="Success Rate" value="99.58%" tone="ok" />
              <MiniStat label="Consumers" value="4" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Most Used</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {MOST_USED.map((m) => (
                    <div key={m.path} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                      <code className="font-mono text-xs truncate">{m.path}</code>
                      <span className="text-xs text-muted-foreground">{m.calls}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Least Used</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {LEAST_USED.map((m) => (
                    <div key={m.path} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                      <code className="font-mono text-xs truncate">{m.path}</code>
                      <span className="text-xs text-muted-foreground">{m.calls}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Version Usage</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {VERSION_USAGE.map((v) => (
                    <div key={v.v}>
                      <div className="flex justify-between text-xs"><span>{v.v}</span><span className="text-muted-foreground">{v.pct}%</span></div>
                      <Progress value={v.pct} className="mt-1 h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Consumer Analytics</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {CONSUMERS.map((c) => (
                    <div key={c.name} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                      <span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-muted-foreground" /> {c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.calls} · {c.pct}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* VERSIONS */}
          <TabsContent value="versions" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Version Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {VERSIONS.map((v, i, arr) => (
                    <span key={v.v} className="flex items-center gap-2">
                      <Badge variant="outline" className={i === 0 ? "bg-primary text-primary-foreground border-primary" : ""}>{v.v}</Badge>
                      {i < arr.length - 1 && <span className="text-muted-foreground">←</span>}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {VERSIONS.map((v) => (
                <Card key={v.v}>
                  <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-6 md:items-center">
                    <div className="flex items-center gap-2">
                      <GitCommitIcon />
                      <span className="font-display text-lg">{v.v}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{v.when}</div>
                    <div><Badge variant="outline">{v.status}</Badge></div>
                    <div className="text-xs">Breaking: <span className={v.breaking ? "text-rose-600" : "text-emerald-600"}>{v.breaking}</span></div>
                    <div className="text-xs">Deprecations: <span className="text-amber-700">{v.deprecations}</span></div>
                    <div className="md:col-span-6 text-xs text-muted-foreground">{v.notes}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Consultant Sheet */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> AI API Consultant</SheetTitle>
            <SheetDescription className="text-xs">Design, review, secure, document and monitor your APIs.</SheetDescription>
          </SheetHeader>
          <div className="border-b p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Quick actions</div>
            <div className="flex flex-wrap gap-1.5">
              {AI_ACTIONS.map((a) => (
                <Button key={a} variant="outline" size="sm" className="h-7 text-xs" onClick={() => sendChat(a)}>{a}</Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {chat.map((m, i) => (
                <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "ai" ? "bg-muted" : "ml-auto bg-primary text-primary-foreground"}`}>
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Ask the API consultant…"
              />
              <Button size="icon" onClick={() => sendChat()}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ============================================================================
   Helpers
   ========================================================================= */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function ScoreField({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="font-display text-lg">{value}%</span>
        <Progress value={value} className="h-1.5 w-24" />
      </div>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-lg">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "ok" | "warn" | "bad" }) {
  const cls = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-rose-600" : "";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 font-display text-2xl ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function IntGroup({ label, items, connected }: { label: string; items: string[]; connected?: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => (
          <Badge key={i} variant="outline" className={`text-[11px] ${i === connected ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : ""}`}>
            {i}{i === connected ? " · Connected" : ""}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function MethodBadge({ method }: { method: ApiMethod }) {
  const map: Record<ApiMethod, string> = {
    GET: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    POST: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    PUT: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    PATCH: "bg-violet-500/15 text-violet-700 border-violet-500/30",
    DELETE: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  };
  return <Badge variant="outline" className={`font-mono text-[10px] ${map[method]}`}>{method}</Badge>;
}

function StatusBadge({ status }: { status: ApiStatus }) {
  const map: Record<ApiStatus, string> = {
    production: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    beta: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    deprecated: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    draft: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={`capitalize text-[10px] ${map[status]}`}>{status}</Badge>;
}

function SecStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    pass: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    bad: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  };
  const label: Record<string, string> = { pass: "Pass", warn: "Warning", bad: "Fail" };
  return <Badge variant="outline" className={map[status] ?? ""}>{label[status] ?? status}</Badge>;
}

function VerdictBadge({ v }: { v: string }) {
  const map: Record<string, string> = {
    Excellent: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    Good: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    "Needs Improvement": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  };
  return <Badge variant="outline" className={map[v] ?? ""}>{v}</Badge>;
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 100 / (values.length - 1);
  const pts = values.map((v, i) => `${i * w},${100 - ((v - min) / (max - min || 1)) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-24 w-full">
      <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" points={pts} />
      <polyline fill="hsl(var(--primary) / 0.15)" stroke="none" points={`0,100 ${pts} 100,100`} />
    </svg>
  );
}

function GitCommitIcon() {
  return <GitBranch className="h-4 w-4 text-muted-foreground" />;
}
