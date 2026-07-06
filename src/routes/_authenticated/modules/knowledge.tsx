import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bot, Sparkles, Send, Upload, Search, Library, FileText, Link2, Download,
  CheckCircle2, TrendingUp, Layers, Filter, Database, Cloud, Plug, Users,
  History, BarChart3, Wand2, Network, BookOpen, GitBranch, Lightbulb,
  Compass, GraduationCap, Brain, MessageSquare, Share2, RefreshCw,
  PlusCircle, ExternalLink, Star, Eye, Clock, Tag, Github, FolderTree,
  Cpu, ShieldCheck, Target, ClipboardList, FileSearch, Zap,
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

export const Route = createFileRoute("/_authenticated/modules/knowledge")({
  component: KnowledgePage,
});

/* ============================================================================
   Simulated data — AI Knowledge Hub
   ========================================================================= */

const PROJECT = {
  name: "AI Software Consultant",
  coverage: 94,
  freshness: 88,
  confidence: 91,
  sources: 18,
  documents: 12481,
  entities: 48932,
  relationships: 215000,
  questions: 3241,
  gaps: 12,
  contributors: 34,
  health: "Excellent",
};

const METRICS = [
  { label: "Knowledge Coverage", value: `${PROJECT.coverage}%`, hint: "of SDLC artifacts", icon: Compass },
  { label: "Connected Sources", value: PROJECT.sources, hint: "Repos, docs, chats", icon: Plug },
  { label: "AI Confidence", value: `${PROJECT.confidence}%`, hint: "grounded answers", icon: Brain },
  { label: "Indexed Documents", value: PROJECT.documents.toLocaleString(), hint: "vectors + graph", icon: FileText },
  { label: "Entities", value: PROJECT.entities.toLocaleString(), hint: "in graph", icon: Network },
  { label: "Relationships", value: `${(PROJECT.relationships / 1000).toFixed(0)}k`, hint: "edges", icon: GitBranch },
  { label: "Questions Answered", value: PROJECT.questions.toLocaleString(), hint: "last 30 days", icon: MessageSquare },
  { label: "Knowledge Gaps", value: PROJECT.gaps, hint: "AI-detected", icon: Target },
  { label: "Active Contributors", value: PROJECT.contributors, hint: "this month", icon: Users },
];

const SOURCES = [
  { name: "GitHub", kind: "Repository", docs: 4210, status: "Synced", icon: Github },
  { name: "Confluence", kind: "Wiki", docs: 1820, status: "Synced", icon: BookOpen },
  { name: "Notion", kind: "Docs", docs: 940, status: "Synced", icon: FileText },
  { name: "Jira", kind: "Issues", docs: 3120, status: "Synced", icon: ClipboardList },
  { name: "Google Drive", kind: "Files", docs: 812, status: "Syncing", icon: Cloud },
  { name: "SharePoint", kind: "Files", docs: 604, status: "Synced", icon: Cloud },
  { name: "Slack", kind: "Chats", docs: 480, status: "Synced", icon: MessageSquare },
  { name: "MS Teams", kind: "Chats", docs: 315, status: "Synced", icon: MessageSquare },
  { name: "Figma", kind: "Design", docs: 96, status: "Synced", icon: Layers },
  { name: "AWS S3", kind: "Storage", docs: 84, status: "Synced", icon: Database },
];

const RECENT_QA = [
  { q: "How does authentication work in the Payroll module?", src: 12, conf: 96 },
  { q: "Which services depend on Notifications?", src: 8, conf: 92 },
  { q: "Explain the attendance approval workflow", src: 14, conf: 94 },
  { q: "What changed between release v2.0 and v2.1?", src: 22, conf: 89 },
  { q: "Summarize the API contract for /leave/approve", src: 6, conf: 97 },
  { q: "Find similar projects to HR-Cloud", src: 4, conf: 84 },
];

type Category =
  | "Business" | "Technical" | "Architecture" | "API" | "Database" | "Security"
  | "Testing" | "Deployment" | "Research" | "Meeting Notes" | "Best Practices"
  | "Playbooks" | "Runbooks" | "FAQs" | "Troubleshooting";

interface Article {
  id: string;
  title: string;
  category: Category;
  owner: string;
  version: string;
  views: number;
  updated: string;
  tags: string[];
  aiSummary: string;
}

const ARTICLES: Article[] = [
  { id: "KB-201", title: "Authentication & JWT rotation strategy", category: "Security", owner: "Backend Team", version: "v3.2", views: 812, updated: "2d ago", tags: ["auth","jwt","security"], aiSummary: "Explains rotation windows, refresh flow, and revocation lists across services." },
  { id: "KB-202", title: "Attendance workflow — end to end", category: "Business", owner: "HR Product", version: "v2.4", views: 1204, updated: "5h ago", tags: ["attendance","workflow"], aiSummary: "Punch-in → validation → manager approval → payroll sync. Includes edge cases." },
  { id: "KB-203", title: "PostgreSQL vs MongoDB — decision log", category: "Architecture", owner: "Arch Board", version: "v1.0", views: 640, updated: "3w ago", tags: ["adr","postgres"], aiSummary: "ACID and reporting requirements favored PostgreSQL. Migration notes attached." },
  { id: "KB-204", title: "Payroll API contract & error codes", category: "API", owner: "Platform", version: "v4.1", views: 902, updated: "1d ago", tags: ["api","payroll"], aiSummary: "REST endpoints, idempotency headers, and standardized error envelopes." },
  { id: "KB-205", title: "Incident runbook — production 5xx spike", category: "Runbooks", owner: "DevOps", version: "v2.0", views: 445, updated: "6d ago", tags: ["runbook","sre"], aiSummary: "Triage steps, dashboards to open, and rollback procedure." },
  { id: "KB-206", title: "Frontend accessibility playbook", category: "Best Practices", owner: "UI Guild", version: "v1.3", views: 388, updated: "2w ago", tags: ["a11y","ui"], aiSummary: "WCAG 2.1 AA checklist mapped to component library." },
  { id: "KB-207", title: "Testing pyramid & flaky-test protocol", category: "Testing", owner: "QA", version: "v1.6", views: 512, updated: "4d ago", tags: ["testing","qa"], aiSummary: "Unit/integration/e2e ratios, quarantine policy, and retry rules." },
  { id: "KB-208", title: "Kubernetes rollout & canary strategy", category: "Deployment", owner: "DevOps", version: "v2.2", views: 356, updated: "1w ago", tags: ["k8s","deploy"], aiSummary: "Progressive delivery via Argo Rollouts with SLO-based promotion." },
];

const CATEGORIES: Category[] = [
  "Business","Technical","Architecture","API","Database","Security","Testing",
  "Deployment","Research","Meeting Notes","Best Practices","Playbooks","Runbooks","FAQs","Troubleshooting",
];

const GRAPH_ENTITIES = [
  { k: "Projects", n: 24, icon: FolderTree },
  { k: "Modules", n: 86, icon: Layers },
  { k: "Requirements", n: 412, icon: ClipboardList },
  { k: "APIs", n: 318, icon: Plug },
  { k: "DB Tables", n: 142, icon: Database },
  { k: "Microservices", n: 38, icon: Cpu },
  { k: "Developers", n: 96, icon: Users },
  { k: "Business Domains", n: 12, icon: Compass },
  { k: "Technologies", n: 54, icon: Zap },
  { k: "Documents", n: 12481, icon: FileText },
  { k: "Risks", n: 68, icon: ShieldCheck },
  { k: "Releases", n: 41, icon: GitBranch },
];

const GRAPH_CHAIN = [
  "Requirement", "Attendance Service", "Attendance API", "Attendance DB",
  "Attendance UI", "Attendance Test Cases", "Deployment", "Production Release",
];

const RESEARCH_NOTES = [
  { t: "Vector DB comparison — pgvector vs Qdrant vs Weaviate", tag: "Technology Evaluation", updated: "2d ago" },
  { t: "OpenAI vs Anthropic vs Gemini for RAG grounding", tag: "AI Research", updated: "1w ago" },
  { t: "Attendance market landscape (India, MENA)", tag: "Market Research", updated: "3w ago" },
  { t: "Event-driven vs orchestration for payroll", tag: "Architecture Research", updated: "5d ago" },
  { t: "Competitor teardown — Keka, Zoho People, Darwinbox", tag: "Competitive Analysis", updated: "4d ago" },
];

const LEARNING_PATHS = [
  { name: "Backend Engineer — Level 2", progress: 72, items: 14 },
  { name: "Cloud & Kubernetes Essentials", progress: 40, items: 10 },
  { name: "Secure Coding (OWASP Top 10)", progress: 88, items: 9 },
  { name: "Design Systems & Accessibility", progress: 55, items: 8 },
  { name: "AI for Consultants — RAG & Agents", progress: 30, items: 12 },
];

const DECISIONS = [
  {
    id: "ADR-014", title: "Use PostgreSQL instead of MongoDB",
    reason: "Strong ACID, complex joins, better reporting",
    approved: "Architecture Review Board", date: "2026-04-11",
    tradeoffs: "Horizontal scaling requires more effort",
  },
  {
    id: "ADR-015", title: "Adopt pgvector for embeddings",
    reason: "Single database, transactional guarantees, HNSW performance",
    approved: "Data Platform", date: "2026-05-02",
    tradeoffs: "Requires 3072-dim column sizing per model",
  },
  {
    id: "ADR-016", title: "Move notifications to event-driven Kafka topic",
    reason: "Decouple producers, retry semantics, replay",
    approved: "Arch Board", date: "2026-05-28",
    tradeoffs: "Ops overhead of Kafka cluster",
  },
];

const MEMORY_ITEMS = [
  { who: "A. Roy", what: "Suggested moving rate-limiting to gateway", when: "Sprint 42 review" },
  { who: "J. Alvarez", what: "Flagged FK cascade risk on requirements table", when: "DB review" },
  { who: "R. Patel", what: "Proposed accessibility audit before v2.2", when: "Design review" },
  { who: "PM Office", what: "Deferred multi-region rollout to Q4", when: "Portfolio sync" },
  { who: "Legal", what: "Requested GDPR retention policy doc", when: "Compliance sync" },
];

const ANALYTICS = {
  topArticles: ARTICLES.slice(0, 5),
  topics: [
    { k: "Authentication", n: 412 },
    { k: "Payroll", n: 388 },
    { k: "Attendance", n: 322 },
    { k: "Deployments", n: 260 },
    { k: "APIs", n: 244 },
    { k: "Database", n: 210 },
  ],
  growth: [12, 18, 22, 28, 34, 41, 55, 62, 74, 88, 96, 108],
};

const VERSIONS = [
  { v: "v3.4", date: "2026-07-01", added: 42, updated: 118, note: "AI-generated wikis for 8 modules." },
  { v: "v3.3", date: "2026-06-14", added: 31, updated: 96, note: "Knowledge graph rebuilt with new entity linker." },
  { v: "v3.2", date: "2026-05-28", added: 27, updated: 74, note: "Semantic search hybrid re-ranking." },
];

const QUICK_ACTIONS = [
  "Explain this architecture",
  "How does authentication work?",
  "Show every API related to Payroll",
  "Explain the attendance workflow",
  "Find similar projects",
  "What changed since the last release?",
  "Summarize the repository",
  "Show unresolved technical debt",
  "Explain this business rule",
  "Which modules depend on Notifications?",
  "Generate onboarding guide for backend engineers",
  "Draft executive summary of the platform",
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

function KnowledgePage() {
  const project = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatQ, setChatQ] = useState("");

  const filteredArticles = useMemo(() => ARTICLES.filter(a =>
    (cat === "all" || a.category === cat) &&
    (query === "" || `${a.id} ${a.title} ${a.owner} ${a.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
  ), [query, cat]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Knowledge Hub — AI Second Brain"
        description={`Enterprise knowledge intelligence for ${project.current?.name ?? PROJECT.name}: RAG, knowledge graph, semantic search, decision intelligence, and organizational memory across the full SDLC.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="mr-1 h-4 w-4" /> Import</Button>
            <Button variant="outline" size="sm"><Plug className="mr-1 h-4 w-4" /> Connect Source</Button>
            <Button variant="outline" size="sm"><Wand2 className="mr-1 h-4 w-4" /> Generate Wiki</Button>
            <Button variant="outline" size="sm"><Network className="mr-1 h-4 w-4" /> Build Graph</Button>
            <Button variant="outline" size="sm"><Download className="mr-1 h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => setAssistantOpen(true)}>
              <Bot className="mr-1 h-4 w-4" /> Ask AI
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
            <div className="text-xs text-muted-foreground">Knowledge Hub</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Coverage</div>
            <div className="mt-1 font-display text-xl">{PROJECT.coverage}%</div>
            <Bar pct={PROJECT.coverage} tone="success" />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Freshness</div>
            <div className="mt-1 font-display text-xl">{PROJECT.freshness}%</div>
            <Bar pct={PROJECT.freshness} />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Sources</div>
            <div className="mt-1 font-display text-xl">{PROJECT.sources}</div>
            <div className="text-xs text-muted-foreground">Connected</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">AI Confidence</div>
            <div className="mt-1 font-display text-xl">{PROJECT.confidence}%</div>
            <Bar pct={PROJECT.confidence} tone="success" />
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Health</div>
            <div className="mt-1 font-display text-xl">{PROJECT.health}</div>
            <div className="text-xs text-success">All sources green</div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="inline-flex w-max min-w-full gap-1">
            {[
              ["overview", "Overview"],
              ["assistant", "AI Assistant"],
              ["kb", "Knowledge Base"],
              ["graph", "Knowledge Graph"],
              ["search", "Semantic Search"],
              ["research", "Research Center"],
              ["learning", "Learning Center"],
              ["decisions", "Decision Intelligence"],
              ["memory", "Collaboration Memory"],
              ["analytics", "Knowledge Analytics"],
              ["versions", "Version History"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {METRICS.map(m => <Metric key={m.label} {...m} />)}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Executive Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Knowledge base coverage is <span className="font-medium text-foreground">excellent (94%)</span> across
                  requirements, architecture, APIs, database, and repository. Freshness dropped 3 points this week
                  because of unresolved runbook updates on the Deployment module.
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• 42 new articles ingested in the last 7 days (auto-generated from PRs and specs).</li>
                  <li>• 12 knowledge gaps detected — mostly around observability and disaster recovery.</li>
                  <li>• Top-searched topic: <span className="text-foreground">"How does authentication work?"</span>.</li>
                  <li>• 3 duplicate articles flagged for merge review.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" /> Recently Learned</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  "Payroll now depends on Notification service",
                  "Introduced pgvector for semantic search",
                  "Attendance approval SLA lowered to 4h",
                  "Argo Rollouts replaced blue/green pipeline",
                ].map(x => (
                  <div key={x} className="flex items-start gap-2 rounded border p-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                    <div className="text-xs">{x}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Plug className="h-4 w-4" /> Connected Sources</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {SOURCES.map(s => (
                  <div key={s.name} className="flex items-center gap-2 rounded border p-2">
                    <s.icon className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">{s.docs.toLocaleString()} · {s.kind}</div>
                    </div>
                    <Badge variant={s.status === "Synced" ? "secondary" : "outline"} className="text-[10px]">{s.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Recent Questions Answered</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {RECENT_QA.map(q => (
                  <div key={q.q} className="rounded border p-2">
                    <div className="text-sm">{q.q}</div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{q.src} sources</span>
                      <span>AI confidence {q.conf}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI ASSISTANT */}
        <TabsContent value="assistant" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card className="flex h-[560px] flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-sm flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> Knowledge Copilot</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="font-medium">You</div>
                  <div className="mt-1 text-muted-foreground">Explain the attendance workflow.</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4 text-primary" /> Knowledge Copilot</div>
                  <div className="mt-2 space-y-2 text-muted-foreground">
                    <p>Attendance follows a 4-stage flow: <span className="text-foreground">punch → validation → manager approval → payroll sync</span>. Location and device fingerprint are validated against the employee's shift schedule.</p>
                    <p>Approvals older than 4h auto-escalate to HR. Payroll sync is idempotent and retries every 15 minutes via the <span className="text-foreground">Attendance → Payroll</span> event topic.</p>
                    <div className="mt-2 rounded border bg-card p-2 text-xs">
                      <div className="font-medium text-foreground">Sources</div>
                      <ul className="mt-1 space-y-0.5">
                        <li>• REQ-041 · Attendance Requirements</li>
                        <li>• KB-202 · Attendance workflow — end to end</li>
                        <li>• ADR-016 · Event-driven Kafka topic</li>
                        <li>• api/attendance/openapi.yaml</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Input value={chatQ} onChange={e => setChatQ(e.target.value)} placeholder="Ask anything about this organization…" />
                  <Button size="sm"><Send className="mr-1 h-4 w-4" /> Send</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Explain architecture","Explain API","Explain DB","Find similar projects","What changed?"].map(x => (
                    <button key={x} onClick={() => setChatQ(x)} className="rounded border bg-card px-2 py-0.5 text-[11px] hover:bg-accent">{x}</button>
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Card>
                <CardHeader><CardTitle className="text-sm">AI understands</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-1 text-xs">
                  {["Requirements","Architecture","Repository","Database","APIs","UI","Documentation","Meetings","Emails","Release Notes"].map(x => (
                    <div key={x} className="flex items-center gap-1 rounded border px-2 py-1"><CheckCircle2 className="h-3 w-3 text-success" /> {x}</div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Try asking</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  {QUICK_ACTIONS.slice(0, 8).map(a => (
                    <button key={a} onClick={() => setChatQ(a)} className="w-full rounded border bg-card px-2 py-1.5 text-left text-xs hover:bg-accent">{a}</button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* KNOWLEDGE BASE */}
        <TabsContent value="kb" className="space-y-4">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-2 p-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles, tags, owners…" className="pl-8" />
              </div>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="w-[180px]"><Filter className="mr-1 h-4 w-4" /><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline"><Wand2 className="mr-1 h-4 w-4" /> Generate Article</Button>
              <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" /> Detect Duplicates</Button>
              <Button size="sm"><PlusCircle className="mr-1 h-4 w-4" /> New Article</Button>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map(a => (
              <Card key={a.id} className="flex flex-col">
                <CardContent className="flex-1 space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono text-muted-foreground">{a.id} · {a.version}</div>
                      <div className="font-medium leading-tight">{a.title}</div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                  </div>
                  <div className="rounded border bg-muted/30 p-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">AI summary: </span>{a.aiSummary}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {a.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]"><Tag className="mr-0.5 h-3 w-3" />{t}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{a.owner}</span>
                    <span className="flex items-center gap-2"><Eye className="h-3 w-3" />{a.views}<Clock className="ml-1 h-3 w-3" />{a.updated}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* KNOWLEDGE GRAPH */}
        <TabsContent value="graph" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {GRAPH_ENTITIES.map(e => (
              <div key={e.k} className="rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between">
                  <e.icon className="h-4 w-4 text-primary" />
                  <span className="font-display text-lg">{e.n.toLocaleString()}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{e.k}</div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Network className="h-4 w-4" /> Traceability example — Attendance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {GRAPH_CHAIN.map((n, i) => (
                  <div key={n} className="flex items-center gap-2">
                    <div className="rounded-md border bg-card px-3 py-1.5">{n}</div>
                    {i < GRAPH_CHAIN.length - 1 && <span className="text-muted-foreground">→</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">AI Graph Capabilities</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-xs">
                {["Entity Linking","Relationship Discovery","Impact Analysis","Dependency Mapping","Knowledge Exploration","Duplicate Detection"].map(x => (
                  <div key={x} className="flex items-center gap-2 rounded border p-2"><Sparkles className="h-3 w-3 text-primary" /> {x}</div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Impact Analysis — sample</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">If we change <span className="font-medium text-foreground">Notification Service</span>, the following are affected:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• 6 APIs (Attendance, Payroll, Leave, Onboarding, Alerts, Chat)</li>
                  <li>• 4 modules with subscribed consumers</li>
                  <li>• 12 open requirements referencing "notify"</li>
                  <li>• 3 runbooks and 1 ADR</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEMANTIC SEARCH */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="relative">
                <FileSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder='Try: "How is leave approval implemented?"' />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {["Projects","Teams","Technologies","Date","Author","Version","Business Domain","Knowledge Type"].map(f => (
                  <Badge key={f} variant="outline" className="cursor-pointer">{f}</Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">Hybrid search: embeddings + knowledge graph + BM25 + metadata boosts.</div>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { k: "Requirements", n: 8, snippet: "REQ-041 — Leave requests follow 2-level approval with escalation…" },
              { k: "Architecture", n: 3, snippet: "Leave uses the shared workflow engine (BPMN) with async approvers…" },
              { k: "Database", n: 2, snippet: "leave_requests(id, employee_id, status, approver_id, decided_at)…" },
              { k: "API", n: 5, snippet: "POST /leave/{id}/approve — idempotent; requires manager role…" },
              { k: "Repository", n: 6, snippet: "services/leave/approval.ts — handleApprove(), publishEvent()…" },
              { k: "Documentation", n: 4, snippet: "KB-210 — Leave Playbook. Escalation matrix and SLA table…" },
              { k: "Test Cases", n: 12, snippet: "TC-441 to TC-452 — happy path + escalation + reject + revoke…" },
              { k: "Related Projects", n: 2, snippet: "HR-Cloud uses same pattern; see ADR-021 (delegated approval)…" },
            ].map(r => (
              <div key={r.k} className="rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{r.k}</div>
                  <Badge variant="secondary" className="text-[10px]">{r.n} results</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.snippet}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* RESEARCH CENTER */}
        <TabsContent value="research" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { k: "Technical Research", icon: Cpu },
              { k: "Business Research", icon: BarChart3 },
              { k: "Competitive Analysis", icon: TrendingUp },
              { k: "Technology Evaluation", icon: Zap },
              { k: "Framework Comparison", icon: Layers },
              { k: "Architecture Research", icon: Network },
              { k: "Market Research", icon: Compass },
              { k: "AI Research", icon: Brain },
            ].map(x => (
              <div key={x.k} className="flex items-center gap-2 rounded-xl border bg-card p-3">
                <x.icon className="h-4 w-4 text-primary" />
                <div className="text-sm">{x.k}</div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Research Notes</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">Title</th><th className="p-2">Type</th><th className="p-2">Updated</th><th className="p-2"></th></tr>
                </thead>
                <tbody>
                  {RESEARCH_NOTES.map(n => (
                    <tr key={n.t} className="border-b hover:bg-muted/30">
                      <td className="p-2">{n.t}</td>
                      <td className="p-2"><Badge variant="secondary" className="text-[10px]">{n.tag}</Badge></td>
                      <td className="p-2 text-xs text-muted-foreground">{n.updated}</td>
                      <td className="p-2 text-right"><Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-2 md:grid-cols-4">
            {["Summarize Papers","Compare Technologies","Generate Reports","Extract Key Insights"].map(x => (
              <Button key={x} variant="outline" size="sm"><Sparkles className="mr-1 h-4 w-4" /> {x}</Button>
            ))}
          </div>
        </TabsContent>

        {/* LEARNING CENTER */}
        <TabsContent value="learning" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {LEARNING_PATHS.map(p => (
              <Card key={p.name}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.name}</div>
                    <Badge variant="secondary" className="text-[10px]">{p.items} items</Badge>
                  </div>
                  <Progress value={p.progress} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress {p.progress}%</span>
                    <Button size="sm" variant="ghost"><GraduationCap className="mr-1 h-4 w-4" /> Continue</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Standards & Guidelines</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              {["Architecture Guides","Coding Standards","API Standards","Security Guidelines","Design Guidelines","Database Standards","Best Practices","Internal Training"].map(x => (
                <div key={x} className="flex items-center gap-2 rounded border p-2"><BookOpen className="h-3 w-3 text-primary" /> {x}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DECISION INTELLIGENCE */}
        <TabsContent value="decisions" className="space-y-4">
          {DECISIONS.map(d => (
            <Card key={d.id}>
              <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_260px]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                    <div className="font-medium">{d.title}</div>
                  </div>
                  <div className="text-sm"><span className="text-muted-foreground">Reason: </span>{d.reason}</div>
                  <div className="text-sm"><span className="text-muted-foreground">Trade-offs: </span>{d.tradeoffs}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Sparkles className="mr-1 h-4 w-4" /> Explain</Button>
                    <Button size="sm" variant="outline"><Layers className="mr-1 h-4 w-4" /> Compare Alternatives</Button>
                    <Button size="sm" variant="outline"><Target className="mr-1 h-4 w-4" /> Impact Analysis</Button>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <div className="text-muted-foreground">Approved by</div>
                  <div className="font-medium">{d.approved}</div>
                  <div className="mt-2 text-muted-foreground">Date</div>
                  <div>{d.date}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* COLLABORATION MEMORY */}
        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> Organizational Memory</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">Who</th><th className="p-2">What</th><th className="p-2">Context</th></tr>
                </thead>
                <tbody>
                  {MEMORY_ITEMS.map(m => (
                    <tr key={m.what} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{m.who}</td>
                      <td className="p-2">{m.what}</td>
                      <td className="p-2 text-xs text-muted-foreground">{m.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div className="grid gap-2 md:grid-cols-4">
            {["Meeting Notes","Sprint Discussions","Architecture Reviews","Code Reviews","Design Reviews","Decision Logs","Email Threads","Chat Discussions"].map(x => (
              <div key={x} className="flex items-center gap-2 rounded border p-2 text-xs"><MessageSquare className="h-3 w-3 text-primary" /> {x}</div>
            ))}
          </div>
        </TabsContent>

        {/* KNOWLEDGE ANALYTICS */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4" /> Most Viewed</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                {ANALYTICS.topArticles.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded border p-2">
                    <div className="truncate">{a.title}</div>
                    <span className="text-xs text-muted-foreground">{a.views}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Popular Topics</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {ANALYTICS.topics.map(t => (
                  <div key={t.k}>
                    <div className="flex items-center justify-between text-sm"><span>{t.k}</span><span className="text-xs text-muted-foreground">{t.n}</span></div>
                    <Bar pct={(t.n / 412) * 100} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Knowledge Growth</CardTitle></CardHeader>
              <CardContent>
                <div className="flex h-32 items-end gap-1">
                  {ANALYTICS.growth.map((v, i) => (
                    <div key={i} className="flex-1 rounded-t bg-primary/70" style={{ height: `${v}%` }} />
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Articles ingested per month (last 12 months)</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { k: "Knowledge Score", v: "92" },
              { k: "AI Usage (30d)", v: "4.8k" },
              { k: "Search Accuracy", v: "94%" },
              { k: "Reuse Ratio", v: "37%" },
            ].map(x => (
              <div key={x.k} className="rounded-xl border bg-card p-4">
                <div className="text-xs uppercase text-muted-foreground">{x.k}</div>
                <div className="mt-1 font-display text-2xl">{x.v}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* VERSION HISTORY */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="p-2">Version</th><th className="p-2">Date</th><th className="p-2">Added</th><th className="p-2">Updated</th><th className="p-2">Notes</th><th className="p-2"></th></tr>
                </thead>
                <tbody>
                  {VERSIONS.map(v => (
                    <tr key={v.v} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono text-xs">{v.v}</td>
                      <td className="p-2 text-xs text-muted-foreground">{v.date}</td>
                      <td className="p-2 text-success">+{v.added}</td>
                      <td className="p-2 text-primary">~{v.updated}</td>
                      <td className="p-2 text-xs text-muted-foreground">{v.note}</td>
                      <td className="p-2 text-right"><Button size="sm" variant="ghost"><History className="mr-1 h-4 w-4" /> Rollback</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Share2 className="h-4 w-4" /> Tracked</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-2">
              {["Article revisions","Decision changes","Research updates","Knowledge graph evolution","Ownership transfers","Source re-syncs"].map(x => (
                <div key={x} className="flex items-center gap-2 rounded border p-2"><CheckCircle2 className="h-4 w-4 text-success" /> {x}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Knowledge Assistant */}
      <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Knowledge Assistant</SheetTitle>
            <SheetDescription>Ask anything about this organization's SDLC — requirements, architecture, APIs, database, repo, docs, and decisions.</SheetDescription>
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
                <li>• {PROJECT.documents.toLocaleString()} indexed documents</li>
                <li>• {PROJECT.entities.toLocaleString()} entities · {(PROJECT.relationships/1000).toFixed(0)}k relationships</li>
                <li>• {PROJECT.sources} connected sources (GitHub, Confluence, Jira, Slack, Drive…)</li>
                <li>• RAG + Knowledge Graph + Hybrid re-ranking</li>
              </ul>
            </div>
          </div>

          <div className="mt-3 space-y-2 border-t pt-3">
            <Textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask the AI Knowledge Assistant…" />
            <div className="flex justify-end">
              <Button size="sm"><Send className="mr-1 h-4 w-4" /> Send</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
