import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  GitBranch, GitPullRequest, GitCommit, GitMerge, Github, Bot, Sparkles,
  FileCode, Folder, Users, ShieldCheck, Package, Rocket, Activity,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, Send, RefreshCw,
  Search, Bug, Zap, FileText, Boxes,
  PlayCircle, Layers, Radio, ChevronRight,
} from "lucide-react";

import { PageHeader } from "@/routes/_authenticated/route";
import { useCurrentProject } from "@/hooks/use-current-project";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/modules/repository")({
  component: RepositoryPage,
});

/* ============================================================================
   Simulated data — AI Software Consultant repository
   ========================================================================= */

const REPO = {
  name: "ai-software-consultant",
  org: "aristotle-labs",
  provider: "GitHub Enterprise",
  defaultBranch: "main",
  release: "v2.3.1",
  lastCommit: "2 hours ago",
  status: "Active",
  health: 92,
  url: "https://github.com/aristotle-labs/ai-software-consultant",
  languages: [
    { name: "TypeScript", pct: 42, color: "bg-blue-500" },
    { name: "Python", pct: 28, color: "bg-yellow-500" },
    { name: "Go", pct: 12, color: "bg-cyan-500" },
    { name: "Rust", pct: 8, color: "bg-orange-500" },
    { name: "Shell", pct: 6, color: "bg-emerald-500" },
    { name: "Other", pct: 4, color: "bg-muted-foreground" },
  ],
};

const METRICS = [
  { label: "Health Score", value: `${REPO.health}%`, hint: "+3 vs last week", icon: Activity },
  { label: "Repositories", value: 4, hint: "1 primary · 3 services", icon: Github },
  { label: "Active Branches", value: 15, hint: "3 stale", icon: GitBranch },
  { label: "Open PRs", value: 8, hint: "3 need review", icon: GitPullRequest },
  { label: "Open Issues", value: 27, hint: "4 critical", icon: Bug },
  { label: "Contributors", value: 18, hint: "12 active", icon: Users },
  { label: "Build Status", value: "Passing", hint: "CI green · 4m 12s", icon: CheckCircle2 },
  { label: "Release", value: REPO.release, hint: "shipped 3d ago", icon: Rocket },
  { label: "Test Coverage", value: "84%", hint: "target 85%", icon: PlayCircle },
  { label: "Security Score", value: "A-", hint: "2 medium risks", icon: ShieldCheck },
  { label: "Docs Coverage", value: "76%", hint: "12 modules missing", icon: FileText },
  { label: "Dep Health", value: "Good", hint: "5 upgrades", icon: Package },
];

const FOLDERS = [
  { name: "frontend", tech: "React 19 · TS", owner: "Web Team", health: 94, complexity: "Med", docs: "Good", purpose: "TanStack Start app" },
  { name: "backend", tech: "Node.js 22", owner: "Core Team", health: 91, complexity: "High", docs: "Good", purpose: "REST + GraphQL APIs" },
  { name: "ai-services", tech: "Python FastAPI", owner: "AI Team", health: 88, complexity: "High", docs: "Partial", purpose: "LangGraph agents, RAG" },
  { name: "database", tech: "SQL · Prisma", owner: "Data Team", health: 96, complexity: "Low", docs: "Excellent", purpose: "Migrations & schema" },
  { name: "infrastructure", tech: "Terraform · Helm", owner: "Platform", health: 89, complexity: "Med", docs: "Partial", purpose: "AWS EKS + RDS" },
  { name: "docs", tech: "MDX · Nextra", owner: "DevRel", health: 82, complexity: "Low", docs: "Good", purpose: "Product & API docs" },
  { name: "tests", tech: "Vitest · Playwright", owner: "QA", health: 87, complexity: "Med", docs: "Partial", purpose: "Unit + E2E suites" },
  { name: "deployment", tech: "ArgoCD · GH Actions", owner: "Platform", health: 93, complexity: "Med", docs: "Good", purpose: "CD pipelines" },
  { name: "scripts", tech: "Bash · Node", owner: "Core Team", health: 78, complexity: "Low", docs: "Sparse", purpose: "Dev utilities" },
  { name: "configs", tech: "YAML · TOML", owner: "Platform", health: 90, complexity: "Low", docs: "Good", purpose: "Env & tool configs" },
];

const BRANCHES = [
  { name: "main", author: "release-bot", commits: 2418, updated: "2h", merge: "Protected", deploy: "prod", tasks: 0, status: "healthy", kind: "main" },
  { name: "develop", author: "M. Chen", commits: 2506, updated: "40m", merge: "Auto", deploy: "staging", tasks: 12, status: "healthy", kind: "dev" },
  { name: "release/v2.4.0", author: "R. Kapoor", commits: 2489, updated: "6h", merge: "Manual", deploy: "canary", tasks: 4, status: "healthy", kind: "release" },
  { name: "feature/agent-graph-v2", author: "A. Silva", commits: 47, updated: "3h", merge: "Draft PR", deploy: "preview-142", tasks: 3, status: "healthy", kind: "feature" },
  { name: "feature/pgvector-rag", author: "P. Nair", commits: 62, updated: "1d", merge: "In review", deploy: "preview-138", tasks: 2, status: "healthy", kind: "feature" },
  { name: "feature/billing-portal", author: "L. Ortiz", commits: 24, updated: "2d", merge: "Conflicts", deploy: "—", tasks: 5, status: "warn", kind: "feature" },
  { name: "hotfix/auth-jwt-clock-skew", author: "S. Ito", commits: 3, updated: "5h", merge: "Approved", deploy: "—", tasks: 1, status: "healthy", kind: "hotfix" },
  { name: "experimental/wasm-parser", author: "D. Volkov", commits: 118, updated: "12d", merge: "Stale", deploy: "—", tasks: 0, status: "stale", kind: "experimental" },
];

const PRS = [
  { id: 412, title: "Add pgvector RAG pipeline for requirements", author: "P. Nair", reviewer: "M. Chen", files: 24, add: 812, del: 143, status: "open", approvals: 1, req: "REQ-142" },
  { id: 411, title: "Refactor agent orchestrator to LangGraph 0.4", author: "A. Silva", reviewer: "R. Kapoor", files: 38, add: 1420, del: 890, status: "open", approvals: 0, req: "REQ-138" },
  { id: 410, title: "Fix JWT clock skew handling in auth middleware", author: "S. Ito", reviewer: "M. Chen", files: 3, add: 42, del: 18, status: "open", approvals: 2, req: "BUG-903" },
  { id: 409, title: "Stripe billing portal + webhook idempotency", author: "L. Ortiz", reviewer: "R. Kapoor", files: 17, add: 604, del: 88, status: "draft", approvals: 0, req: "REQ-155" },
  { id: 408, title: "Migrate documents table to jsonb content_md", author: "K. Osei", reviewer: "P. Nair", files: 6, add: 210, del: 96, status: "merged", approvals: 2, req: "REQ-140" },
  { id: 407, title: "Add per-tenant rate limits on gateway", author: "M. Chen", reviewer: "S. Ito", files: 9, add: 188, del: 22, status: "merged", approvals: 3, req: "REQ-133" },
  { id: 406, title: "Retire legacy /v0/architecture endpoints", author: "R. Kapoor", reviewer: "A. Silva", files: 14, add: 12, del: 640, status: "closed", approvals: 1, req: "TECH-42" },
];

const COMMITS = [
  { sha: "8f2ac1e", author: "P. Nair", date: "2h", msg: "feat(rag): pgvector index + hybrid search", req: "REQ-142", impact: "AI Layer", files: 12 },
  { sha: "b1c9430", author: "S. Ito", date: "5h", msg: "fix(auth): tolerate 30s JWT clock skew", req: "BUG-903", impact: "Auth", files: 3 },
  { sha: "4d81a72", author: "A. Silva", date: "8h", msg: "refactor(agent): LangGraph 0.4 nodes", req: "REQ-138", impact: "AI Orchestrator", files: 18 },
  { sha: "aa47f10", author: "M. Chen", date: "1d", msg: "chore(deps): bump fastify to 5.1", req: "—", impact: "Backend", files: 2 },
  { sha: "17ee902", author: "L. Ortiz", date: "1d", msg: "feat(billing): stripe customer portal", req: "REQ-155", impact: "Billing", files: 9 },
  { sha: "3c0b118", author: "K. Osei", date: "2d", msg: "feat(docs): jsonb content storage", req: "REQ-140", impact: "Docs", files: 6 },
  { sha: "d55e1a4", author: "R. Kapoor", date: "3d", msg: "release: v2.3.1", req: "—", impact: "Release", files: 1 },
];

const ISSUES = [
  { id: "BUG-903", title: "Auth fails when device clock drifts > 15s", priority: "critical", assignee: "S. Ito", sprint: "S-24", status: "in progress", label: "Bug", req: "REQ-011" },
  { id: "BUG-912", title: "Doc generator truncates long markdown", priority: "high", assignee: "K. Osei", sprint: "S-24", status: "in review", label: "Bug", req: "REQ-140" },
  { id: "ENH-084", title: "Add branch protection audit trail", priority: "medium", assignee: "M. Chen", sprint: "S-25", status: "open", label: "Enhancement", req: "REQ-118" },
  { id: "TECH-42", title: "Retire legacy v0 architecture endpoints", priority: "medium", assignee: "R. Kapoor", sprint: "S-24", status: "done", label: "Technical Debt", req: "TECH-42" },
  { id: "RES-19", title: "Evaluate LlamaIndex vs LangGraph for RAG", priority: "low", assignee: "P. Nair", sprint: "S-25", status: "open", label: "Research", req: "—" },
  { id: "BUG-921", title: "Race in websocket agent stream on reconnect", priority: "critical", assignee: "A. Silva", sprint: "S-24", status: "open", label: "Bug", req: "REQ-138" },
];

const RELEASES = [
  { v: "v2.3.1", date: "2026-07-03", env: "prod", status: "current", features: 4, fixes: 7, approvals: "R. Kapoor" },
  { v: "v2.3.0", date: "2026-06-21", env: "prod", status: "shipped", features: 11, fixes: 9, approvals: "R. Kapoor" },
  { v: "v2.4.0-rc.1", date: "2026-07-08", env: "canary", status: "upcoming", features: 8, fixes: 3, approvals: "pending" },
  { v: "v2.2.4", date: "2026-05-14", env: "prod", status: "archived", features: 2, fixes: 12, approvals: "M. Chen" },
];

const CODE_REVIEW = {
  score: 92,
  areas: [
    { k: "Architecture", v: 94, tone: "excellent" },
    { k: "Documentation", v: 76, tone: "good" },
    { k: "Security", v: 68, tone: "needs" },
    { k: "Technical Debt", v: 88, tone: "excellent" },
    { k: "Maintainability", v: 91, tone: "excellent" },
    { k: "SOLID", v: 84, tone: "good" },
    { k: "Modularity", v: 87, tone: "good" },
    { k: "Naming", v: 90, tone: "excellent" },
  ],
  suggestions: [
    { sev: "high", item: "Missing docs on 12 API endpoints in ai-services." },
    { sev: "high", item: "Two components > 800 lines — split RequirementsWorkspace." },
    { sev: "med",  item: "Unused module scripts/legacy-migrate/ — safe to delete." },
    { sev: "med",  item: "Duplicate JWT parsing between gateway and auth service." },
    { sev: "low",  item: "Deep folder nesting in backend/domain/*/services/*." },
    { sev: "high", item: "Missing tests for billing webhook idempotency path." },
    { sev: "med",  item: "Verbose error responses in staging leak stack traces." },
  ],
};

const AI_ANALYSIS = {
  summary: "AI Software Consultant is a multi-tenant SaaS that helps teams generate SDLC artifacts (requirements, architecture, docs, test cases) using orchestrated LLM agents. It runs an event-driven microservices topology on AWS EKS with pgvector-backed RAG.",
  stack: ["React 19", "TanStack Start", "Node.js 22", "Python FastAPI", "Postgres 16", "pgvector", "Redis", "Kafka", "AWS EKS"],
  progress: 78,
  risks: [
    { sev: "high", item: "Single-region deployment — add DR to us-west-2." },
    { sev: "med",  item: "AI Orchestrator has no circuit breaker on model calls." },
    { sev: "med",  item: "12 API endpoints lack OpenAPI schemas." },
  ],
  faqs: [
    { q: "What does this project do?", a: "Generates and reviews SDLC artifacts using an AI agent graph, integrated with Git, Jira and Slack." },
    { q: "Explain the authentication flow", a: "OAuth 2.1 at the gateway → JWT issued by Auth service → validated per-request by middleware with 30s clock skew tolerance." },
    { q: "Which module handles notifications?", a: "services/notification (Go) fans out to SES, FCM and Slack via SQS." },
    { q: "Which services are unused?", a: "services/legacy-architecture-v0 has zero inbound traffic in the last 30 days." },
    { q: "Which APIs are missing documentation?", a: "12 endpoints in ai-services (see AI Review → Suggestions) have no OpenAPI schema." },
  ],
};

const DEPENDENCIES = [
  { name: "react", ver: "19.0.0", type: "Frontend", license: "MIT", risk: "none", update: "—" },
  { name: "@tanstack/react-start", ver: "1.72.4", type: "Frontend", license: "MIT", risk: "none", update: "1.73.0" },
  { name: "fastify", ver: "5.1.0", type: "Backend", license: "MIT", risk: "none", update: "—" },
  { name: "langgraph", ver: "0.4.2", type: "AI", license: "MIT", risk: "low", update: "0.4.3" },
  { name: "openai", ver: "1.55.0", type: "AI", license: "Apache-2.0", risk: "none", update: "1.60.0" },
  { name: "pg", ver: "8.11.3", type: "Backend", license: "MIT", risk: "medium", update: "8.13.0 (CVE-2025-1041)" },
  { name: "axios", ver: "1.6.7", type: "Frontend", license: "MIT", risk: "high", update: "1.7.9 (CVE-2024-39338)" },
  { name: "redis", ver: "4.6.10", type: "Backend", license: "MIT", risk: "none", update: "4.7.0" },
  { name: "terraform-aws-modules/eks", ver: "20.8.5", type: "Infra", license: "Apache-2.0", risk: "none", update: "20.9.0" },
];

const PIPELINE = [
  { step: "Commit",         status: "ok", time: "—" },
  { step: "Build",          status: "ok", time: "1m 12s" },
  { step: "Static Analysis",status: "ok", time: "42s" },
  { step: "Unit Tests",     status: "ok", time: "1m 48s" },
  { step: "E2E Tests",      status: "warn", time: "3m 04s · 2 flaky" },
  { step: "Security Scan",  status: "ok", time: "58s" },
  { step: "Approval",       status: "wait", time: "manual" },
  { step: "Deploy",         status: "ok", time: "2m 22s" },
  { step: "Monitoring",     status: "ok", time: "live" },
];

const SECURITY = {
  score: 86,
  critical: 0,
  medium: 2,
  low: 5,
  items: [
    { area: "Secrets Scan", status: "ok", note: "No secrets found in tracked files (gitleaks · 30d)" },
    { area: "Dependencies", status: "warn", note: "1 high CVE (axios) · 1 medium CVE (pg)" },
    { area: "AuthN", status: "ok", note: "OAuth 2.1 + JWT · MFA for admins" },
    { area: "AuthZ", status: "ok", note: "RBAC + row-level policies in Postgres" },
    { area: "API Security", status: "warn", note: "12 endpoints lack schema validation" },
    { area: "OWASP Top 10", status: "ok", note: "A01–A10 coverage in security tests" },
    { area: "Compliance", status: "ok", note: "SOC 2 Type II · GDPR" },
  ],
};

const INSIGHTS = {
  commitsPerWeek: [42, 58, 61, 49, 73, 88, 71, 96, 84, 102, 91, 118],
  prTimelineDays: [3.2, 2.8, 2.1, 2.4, 1.9, 1.6, 1.7, 1.4],
  issueResolutionDays: [5.1, 4.6, 4.1, 3.8, 3.4, 3.1, 2.9, 2.7],
  contributors: [
    { name: "M. Chen", commits: 412, prs: 58, reviews: 121 },
    { name: "R. Kapoor", commits: 388, prs: 44, reviews: 138 },
    { name: "A. Silva", commits: 356, prs: 61, reviews: 82 },
    { name: "P. Nair", commits: 302, prs: 47, reviews: 74 },
    { name: "S. Ito", commits: 241, prs: 32, reviews: 96 },
    { name: "L. Ortiz", commits: 198, prs: 28, reviews: 41 },
  ],
};

const AI_ACTIONS = [
  "Explain Repository", "Review Repository", "Compare Branches", "Analyze Dependencies",
  "Review Architecture", "Detect Risks", "Generate Release Notes", "Explain File Structure",
  "Generate Repository Report", "Security Audit", "CI/CD Analysis", "Documentation Coverage",
  "Technical Debt Report",
];

const PROVIDERS = ["GitHub", "GitLab", "Bitbucket", "Azure DevOps", "AWS CodeCommit", "Gitea", "Self-hosted"];

/* ============================================================================
   Component
   ========================================================================= */

function RepositoryPage() {
  const { current } = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm your AI Repository Analyst. Ask me to review the repo, compare branches, audit dependencies, or generate a release report." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [folderQuery, setFolderQuery] = useState("");
  const [prFilter, setPrFilter] = useState<string>("all");

  const projectName = current?.name ?? "AI Software Consultant";

  const filteredFolders = useMemo(
    () => FOLDERS.filter((f) => f.name.toLowerCase().includes(folderQuery.toLowerCase())),
    [folderQuery],
  );
  const filteredPRs = useMemo(
    () => PRS.filter((p) => prFilter === "all" || p.status === prFilter),
    [prFilter],
  );

  const sendChat = (text?: string) => {
    const t = (text ?? chatInput).trim();
    if (!t) return;
    setChat((c) => [
      ...c,
      { role: "user", text: t },
      { role: "ai", text: `Analyzing "${t}"… I'll cross-reference commits, PRs and architecture and share findings shortly.` },
    ]);
    setChatInput("");
  };

  return (
    <>
      <PageHeader
        title="Repository"
        description="AI Repository Analyst — connect, understand, review and govern your codebase."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Sync</Button>
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Bot className="h-4 w-4" /> AI Analyst
            </Button>
            <Button size="sm"><Sparkles className="h-4 w-4" /> AI Analyze</Button>
          </div>
        }
      />

      <div className="w-full px-8 py-6 space-y-6">
        {/* Repository overview card */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Field label="Project" value={projectName} />
              <Field label="Repository" value={<span className="font-mono">{REPO.org}/{REPO.name}</span>} />
              <Field label="Provider" value={REPO.provider} />
              <Field label="Default Branch" value={<span className="font-mono">{REPO.defaultBranch}</span>} />
              <Field label="Release" value={REPO.release} />
              <Field label="Last Commit" value={REPO.lastCommit} />
              <Field
                label="Health Score"
                value={
                  <span className="flex items-center gap-2">
                    <span className="font-display text-lg">{REPO.health}%</span>
                    <Progress value={REPO.health} className="h-1.5 w-24" />
                  </span>
                }
              />
              <Field
                label="Status"
                value={<Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">{REPO.status}</Badge>}
              />
            </div>

            <Separator className="my-5" />

            <div>
              <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Language distribution</div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                {REPO.languages.map((l) => (
                  <div key={l.name} className={l.color} style={{ width: `${l.pct}%` }} title={`${l.name} ${l.pct}%`} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {REPO.languages.map((l) => (
                  <span key={l.name} className="inline-flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${l.color}`} />
                    {l.name} · {l.pct}%
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <TabsList className="inline-flex w-max min-w-full gap-1">
              {[
                ["overview", "Overview"],
                ["explorer", "Repository Explorer"],
                ["branches", "Branches"],
                ["prs", "Pull Requests"],
                ["commits", "Commits"],
                ["issues", "Issues"],
                ["releases", "Releases"],
                ["review", "Code Review"],
                ["ai", "AI Analysis"],
                ["deps", "Dependencies"],
                ["cicd", "CI/CD"],
                ["security", "Security"],
                ["insights", "Insights"],
              ].map(([v, l]) => (
                <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {COMMITS.slice(0, 6).map((c) => (
                      <li key={c.sha} className="flex items-start gap-3 px-5 py-3 text-sm">
                        <GitCommit className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{c.msg}</div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-mono">{c.sha}</span> · {c.author} · {c.date} · {c.impact}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{c.req}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Integrations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {PROVIDERS.map((p) => (
                    <div key={p} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><Github className="h-4 w-4 text-muted-foreground" /> {p}</span>
                      <Badge variant="outline" className={p === "GitHub" ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : ""}>
                        {p === "GitHub" ? "Connected" : "Available"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EXPLORER */}
          <TabsContent value="explorer" className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={folderQuery} onChange={(e) => setFolderQuery(e.target.value)}
                  placeholder="Filter folders…" className="h-9 pl-8" />
              </div>
              <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" /> Explain structure</Button>
              <Button size="sm" variant="outline"><Layers className="h-4 w-4" /> Architecture map</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredFolders.map((f) => (
                <Card key={f.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm font-medium">/{f.name}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{f.purpose}</p>
                      </div>
                      <ScoreDot value={f.health} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <Meta k="Tech" v={f.tech} />
                      <Meta k="Owner" v={f.owner} />
                      <Meta k="Complexity" v={f.complexity} />
                      <Meta k="Docs" v={f.docs} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 text-xs"><FileCode className="h-3 w-3" /> Explain</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs"><Boxes className="h-3 w-3" /> Map</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs"><Package className="h-3 w-3" /> Deps</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs"><FileText className="h-3 w-3" /> Docs</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* BRANCHES */}
          <TabsContent value="branches" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline"><GitMerge className="h-4 w-4" /> Compare</Button>
              <Button size="sm" variant="outline"><AlertTriangle className="h-4 w-4" /> Detect conflicts</Button>
              <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" /> Suggest cleanup</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Branch</th>
                      <th className="px-4 py-2">Author</th>
                      <th className="px-4 py-2">Commits</th>
                      <th className="px-4 py-2">Updated</th>
                      <th className="px-4 py-2">Merge</th>
                      <th className="px-4 py-2">Deploy</th>
                      <th className="px-4 py-2">Tasks</th>
                      <th className="px-4 py-2">Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {BRANCHES.map((b) => (
                      <tr key={b.name}>
                        <td className="px-4 py-2 font-mono text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                            {b.name}
                            <BranchKindBadge kind={b.kind} />
                          </span>
                        </td>
                        <td className="px-4 py-2">{b.author}</td>
                        <td className="px-4 py-2">{b.commits}</td>
                        <td className="px-4 py-2 text-muted-foreground">{b.updated}</td>
                        <td className="px-4 py-2">{b.merge}</td>
                        <td className="px-4 py-2 text-muted-foreground">{b.deploy}</td>
                        <td className="px-4 py-2">{b.tasks}</td>
                        <td className="px-4 py-2">
                          {b.status === "healthy" && <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Healthy</Badge>}
                          {b.status === "warn" && <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30">Conflicts</Badge>}
                          {b.status === "stale" && <Badge variant="outline" className="bg-muted text-muted-foreground">Stale</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PULL REQUESTS */}
          <TabsContent value="prs" className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={prFilter} onValueChange={setPrFilter}>
                <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="merged">Merged</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" /> Review PR</Button>
              <Button size="sm" variant="outline"><AlertTriangle className="h-4 w-4" /> Risk analysis</Button>
              <Button size="sm" variant="outline"><Users className="h-4 w-4" /> Suggest reviewers</Button>
              <Button size="sm" variant="outline"><Zap className="h-4 w-4" /> Breaking changes</Button>
            </div>

            <div className="grid gap-3">
              {filteredPRs.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">#{p.id}</span>
                          <span className="font-medium">{p.title}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {p.author} → {p.reviewer} · {p.files} files ·
                          <span className="text-emerald-600"> +{p.add}</span>
                          <span className="text-rose-600"> −{p.del}</span>
                          · linked <span className="font-mono">{p.req}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <PRStatus status={p.status} />
                        <div className="text-[11px] text-muted-foreground">{p.approvals} approval{p.approvals === 1 ? "" : "s"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* COMMITS */}
          <TabsContent value="commits" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" /> Explain commit</Button>
              <Button size="sm" variant="outline"><TrendingUp className="h-4 w-4" /> Track feature</Button>
              <Button size="sm" variant="outline"><AlertTriangle className="h-4 w-4" /> Large changes</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {COMMITS.map((c) => (
                    <li key={c.sha} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-3 text-sm">
                      <GitCommit className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{c.msg}</div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono">{c.sha}</span> · {c.author} · {c.date} · {c.files} files · {c.impact}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{c.req}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ISSUES */}
          <TabsContent value="issues" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" /> Classify</Button>
              <Button size="sm" variant="outline"><Bug className="h-4 w-4" /> Duplicate detection</Button>
              <Button size="sm" variant="outline"><TrendingUp className="h-4 w-4" /> Priority AI</Button>
              <Button size="sm" variant="outline"><AlertTriangle className="h-4 w-4" /> Root cause</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Label</th>
                      <th className="px-4 py-2">Priority</th>
                      <th className="px-4 py-2">Assignee</th>
                      <th className="px-4 py-2">Sprint</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Req</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ISSUES.map((i) => (
                      <tr key={i.id}>
                        <td className="px-4 py-2 font-mono text-xs">{i.id}</td>
                        <td className="px-4 py-2">{i.title}</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{i.label}</Badge></td>
                        <td className="px-4 py-2"><PriorityBadge p={i.priority} /></td>
                        <td className="px-4 py-2">{i.assignee}</td>
                        <td className="px-4 py-2 text-muted-foreground">{i.sprint}</td>
                        <td className="px-4 py-2 capitalize">{i.status}</td>
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{i.req}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RELEASES */}
          <TabsContent value="releases" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" /> Generate release notes</Button>
              <Button size="sm" variant="outline"><AlertTriangle className="h-4 w-4" /> Risk analysis</Button>
              <Button size="sm" variant="outline"><CheckCircle2 className="h-4 w-4" /> Deployment checklist</Button>
              <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4" /> Rollback plan</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {RELEASES.map((r) => (
                <Card key={r.v}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Rocket className="h-4 w-4 text-muted-foreground" />
                          <span className="font-display text-lg">{r.v}</span>
                          <ReleaseStatus status={r.status} />
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{r.date} · {r.env} · approved by {r.approvals}</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <Stat n={r.features} label="Features" />
                      <Stat n={r.fixes} label="Fixes" />
                      <Stat n={0} label="Known issues" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CODE REVIEW */}
          <TabsContent value="review" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader><CardTitle className="text-base">Repository Score</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl">{CODE_REVIEW.score}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <Progress value={CODE_REVIEW.score} className="mt-3 h-2" />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Overall repository quality is excellent. Focus on documentation coverage and security hardening.
                  </p>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Review breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {CODE_REVIEW.areas.map((a) => (
                    <div key={a.k} className="grid grid-cols-[140px_1fr_60px] items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{a.k}</span>
                      <Progress value={a.v} className="h-1.5" />
                      <span className="text-right font-medium">{a.v}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">AI suggestions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {CODE_REVIEW.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <SevDot sev={s.sev} />
                      <span>{s.item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI ANALYSIS */}
          <TabsContent value="ai" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Project summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{AI_ANALYSIS.summary}</p>
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Technology stack</div>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_ANALYSIS.stack.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                  </div>
                </div>
                <div className="grid grid-cols-[140px_1fr_60px] items-center gap-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Progress</span>
                  <Progress value={AI_ANALYSIS.progress} className="h-1.5" />
                  <span className="text-right text-sm font-medium">{AI_ANALYSIS.progress}%</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Risk report</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {AI_ANALYSIS.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <SevDot sev={r.sev} />
                        <span>{r.item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Ask the repository</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {AI_ANALYSIS.faqs.map((f) => (
                      <li key={f.q}>
                        <div className="flex items-center gap-1.5 font-medium">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> {f.q}
                        </div>
                        <div className="pl-5 text-xs text-muted-foreground">{f.a}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DEPENDENCIES */}
          <TabsContent value="deps" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline"><Sparkles className="h-4 w-4" /> Audit</Button>
              <Button size="sm" variant="outline"><TrendingUp className="h-4 w-4" /> Upgrade plan</Button>
              <Button size="sm" variant="outline"><AlertTriangle className="h-4 w-4" /> Conflicts</Button>
              <Button size="sm" variant="outline"><FileText className="h-4 w-4" /> License check</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Package</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Version</th>
                      <th className="px-4 py-2">License</th>
                      <th className="px-4 py-2">Risk</th>
                      <th className="px-4 py-2">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {DEPENDENCIES.map((d) => (
                      <tr key={d.name}>
                        <td className="px-4 py-2 font-mono text-xs">{d.name}</td>
                        <td className="px-4 py-2">{d.type}</td>
                        <td className="px-4 py-2 font-mono text-xs">{d.ver}</td>
                        <td className="px-4 py-2 text-muted-foreground">{d.license}</td>
                        <td className="px-4 py-2"><RiskBadge r={d.risk} /></td>
                        <td className="px-4 py-2 text-muted-foreground">{d.update}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CI/CD */}
          <TabsContent value="cicd" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Pipeline" value="Passing" tone="ok" />
              <MiniStat label="Latest build" value="4m 12s" />
              <MiniStat label="Deployments (7d)" value="18" />
              <MiniStat label="Rollbacks (30d)" value="1" tone="warn" />
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Pipeline</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {PIPELINE.map((s, i) => (
                    <div key={s.step} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1 rounded-lg border bg-card px-3 py-2 text-xs">
                        <StepIcon status={s.status} />
                        <span className="font-medium">{s.step}</span>
                        <span className="text-[10px] text-muted-foreground">{s.time}</span>
                      </div>
                      {i < PIPELINE.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">AI recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><SevDot sev="med" /> Parallelize unit and E2E test jobs — saves ~1m 40s per run.</li>
                  <li className="flex items-start gap-2"><SevDot sev="high" /> Quarantine 2 flaky E2E tests in checkout suite before promoting to prod.</li>
                  <li className="flex items-start gap-2"><SevDot sev="low" /> Cache pip and bun stores — measured 22s speedup.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Security score" value={`${SECURITY.score}`} />
              <MiniStat label="Critical" value={SECURITY.critical} tone={SECURITY.critical ? "bad" : "ok"} />
              <MiniStat label="Medium" value={SECURITY.medium} tone="warn" />
              <MiniStat label="Low" value={SECURITY.low} />
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Findings</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {SECURITY.items.map((s) => (
                    <li key={s.area} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <div className="font-medium">{s.area}</div>
                        <div className="text-xs text-muted-foreground">{s.note}</div>
                      </div>
                      {s.status === "ok"
                        ? <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">OK</Badge>
                        : <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30">Review</Badge>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INSIGHTS */}
          <TabsContent value="insights" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">Commits / week</CardTitle></CardHeader>
                <CardContent><Sparkline values={INSIGHTS.commitsPerWeek} /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">PR merge time (days)</CardTitle></CardHeader>
                <CardContent><Sparkline values={INSIGHTS.prTimelineDays} tone="down" /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Issue resolution (days)</CardTitle></CardHeader>
                <CardContent><Sparkline values={INSIGHTS.issueResolutionDays} tone="down" /></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Top contributors</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Contributor</th>
                      <th className="px-4 py-2">Commits</th>
                      <th className="px-4 py-2">PRs</th>
                      <th className="px-4 py-2">Reviews</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {INSIGHTS.contributors.map((c) => (
                      <tr key={c.name}>
                        <td className="px-4 py-2">{c.name}</td>
                        <td className="px-4 py-2">{c.commits}</td>
                        <td className="px-4 py-2">{c.prs}</td>
                        <td className="px-4 py-2">{c.reviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Analyst side sheet */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent className="flex w-full max-w-md flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> AI Repository Analyst</SheetTitle>
          </SheetHeader>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {AI_ACTIONS.map((a) => (
              <Button key={a} size="sm" variant="outline" className="h-7 text-xs" onClick={() => sendChat(a)}>{a}</Button>
            ))}
          </div>
          <Separator className="my-3" />
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-3">
              {chat.map((m, i) => (
                <div key={i} className={`rounded-lg border p-3 text-sm ${m.role === "user" ? "bg-secondary" : "bg-card"}`}>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{m.role === "user" ? "You" : "AI"}</div>
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3 flex items-center gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask about the repository…"
            />
            <Button size="icon" onClick={() => sendChat()}><Send className="h-4 w-4" /></Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ============================================================================
   Small presentational helpers
   ========================================================================= */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return <div className="text-muted-foreground"><span className="text-foreground/80">{k}:</span> {v}</div>;
}

function ScoreDot({ value }: { value: number }) {
  const tone = value >= 90 ? "bg-emerald-500" : value >= 75 ? "bg-amber-500" : "bg-rose-500";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`inline-block h-2 w-2 rounded-full ${tone}`} /> {value}
    </span>
  );
}

function BranchKindBadge({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    main: "border-emerald-500/30 text-emerald-700 bg-emerald-500/10",
    dev: "border-blue-500/30 text-blue-700 bg-blue-500/10",
    release: "border-violet-500/30 text-violet-700 bg-violet-500/10",
    feature: "border-cyan-500/30 text-cyan-700 bg-cyan-500/10",
    hotfix: "border-rose-500/30 text-rose-700 bg-rose-500/10",
    experimental: "border-amber-500/30 text-amber-700 bg-amber-500/10",
  };
  return <Badge variant="outline" className={`ml-1 text-[9px] uppercase ${map[kind] ?? ""}`}>{kind}</Badge>;
}

function PRStatus({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    open:   { cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", label: "Open" },
    draft:  { cls: "bg-muted text-muted-foreground", label: "Draft" },
    merged: { cls: "bg-violet-500/15 text-violet-700 border-violet-500/30", label: "Merged" },
    closed: { cls: "bg-rose-500/15 text-rose-700 border-rose-500/30", label: "Closed" },
  };
  const s = map[status] ?? map.open;
  return <Badge variant="outline" className={s.cls}>{s.label}</Badge>;
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    critical: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    high: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    medium: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    low: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={`capitalize ${map[p] ?? ""}`}>{p}</Badge>;
}

function ReleaseStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    current: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    shipped: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    upcoming: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    archived: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={`capitalize ${map[status] ?? ""}`}>{status}</Badge>;
}

function RiskBadge({ r }: { r: string }) {
  const map: Record<string, string> = {
    none: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    low: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    medium: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    high: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  };
  return <Badge variant="outline" className={`capitalize ${map[r] ?? ""}`}>{r}</Badge>;
}

function SevDot({ sev }: { sev: string }) {
  const map: Record<string, string> = { high: "bg-rose-500", med: "bg-amber-500", low: "bg-blue-500" };
  return <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${map[sev] ?? "bg-muted-foreground"}`} />;
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-md border py-2">
      <div className="font-display text-lg">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
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

function StepIcon({ status }: { status: string }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  if (status === "wait") return <Clock className="h-4 w-4 text-muted-foreground" />;
  return <Radio className="h-4 w-4 text-muted-foreground" />;
}

function Sparkline({ values, tone = "up" }: { values: number[]; tone?: "up" | "down" }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 240;
  const height = 60;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");
  const stroke = tone === "down" ? "hsl(142 71% 45%)" : "hsl(217 91% 60%)";
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  );
}
