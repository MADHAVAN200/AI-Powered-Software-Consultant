import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Boxes, Sparkles, Wand2, Download, Share2, Play, CheckCircle2, GitBranch,
  Layers, Database, Plug, Cloud, ShieldCheck, Cpu, Activity, Network,
  Server, Radio, GitCompare, FileDown, Upload, RefreshCw, Bot, Send,
  TrendingUp, DollarSign, Zap, AlertTriangle, Workflow,
  ChevronRight, Search, Eye, PlusCircle,
} from "lucide-react";



import { PageHeader } from "@/routes/_authenticated/route";

import { useCurrentProject } from "@/hooks/use-current-project";
import { StatCard } from "@/components/ui-blocks";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { ERDiagram, type ERTable, type ERRelation } from "@/components/er-diagram";
import {
  generateFromText,
  diagramFromServices,
  diagramFromEvents,
  SAMPLE_INPUTS,
  type GeneratedDiagram,
} from "@/lib/diagram-generator";

/* ============================================================================
   Simulated ER schema for the AI Consultant SaaS
   ========================================================================= */

const ER_TABLES: ERTable[] = [
  { name: "users", schema: "auth", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "email", type: "citext", kind: "unique" },
    { name: "full_name", type: "text" },
    { name: "created_at", type: "timestamptz" },
  ]},
  { name: "organizations", schema: "public", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "name", type: "text" },
    { name: "plan", type: "text" },
    { name: "owner_id", type: "uuid", kind: "fk", fkTo: "users.id" },
  ]},
  { name: "projects", schema: "public", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "org_id", type: "uuid", kind: "fk", fkTo: "organizations.id" },
    { name: "name", type: "text" },
    { name: "status", type: "text" },
    { name: "created_by", type: "uuid", kind: "fk", fkTo: "users.id" },
    { name: "created_at", type: "timestamptz" },
  ]},
  { name: "project_members", schema: "public", columns: [
    { name: "project_id", type: "uuid", kind: "pk" },
    { name: "user_id", type: "uuid", kind: "pk" },
    { name: "role", type: "project_role" },
  ]},
  { name: "requirements", schema: "public", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "project_id", type: "uuid", kind: "fk", fkTo: "projects.id" },
    { name: "title", type: "text" },
    { name: "priority", type: "int" },
    { name: "status", type: "text" },
  ]},
  { name: "documents", schema: "public", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "project_id", type: "uuid", kind: "fk", fkTo: "projects.id" },
    { name: "title", type: "text" },
    { name: "content_md", type: "text" },
    { name: "version", type: "int" },
  ]},
  { name: "architectures", schema: "public", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "project_id", type: "uuid", kind: "fk", fkTo: "projects.id" },
    { name: "version", type: "text" },
    { name: "diagram_json", type: "jsonb" },
    { name: "score", type: "int" },
  ]},
  { name: "ai_reviews", schema: "public", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "architecture_id", type: "uuid", kind: "fk", fkTo: "architectures.id" },
    { name: "summary", type: "text" },
    { name: "score", type: "int" },
    { name: "created_at", type: "timestamptz" },
  ]},
  { name: "embeddings", schema: "vectors", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "document_id", type: "uuid", kind: "fk", fkTo: "documents.id" },
    { name: "embedding", type: "vector(1536)" },
  ]},
  { name: "activity_log", schema: "public", columns: [
    { name: "id", type: "uuid", kind: "pk" },
    { name: "project_id", type: "uuid", kind: "fk", fkTo: "projects.id" },
    { name: "actor_id", type: "uuid", kind: "fk", fkTo: "users.id" },
    { name: "event", type: "text" },
    { name: "at", type: "timestamptz" },
  ]},
];

const ER_RELATIONS: ERRelation[] = [
  { from: "users", to: "organizations", kind: "1-N", label: "owns" },
  { from: "organizations", to: "projects", kind: "1-N", label: "has" },
  { from: "users", to: "projects", kind: "1-N", label: "creates" },
  { from: "projects", to: "project_members", kind: "1-N", label: "members" },
  { from: "users", to: "project_members", kind: "1-N", label: "belongs" },
  { from: "projects", to: "requirements", kind: "1-N", label: "contains" },
  { from: "projects", to: "documents", kind: "1-N", label: "has" },
  { from: "projects", to: "architectures", kind: "1-N", label: "versions" },
  { from: "architectures", to: "ai_reviews", kind: "1-N", label: "reviewed" },
  { from: "documents", to: "embeddings", kind: "1-N", label: "embedded" },
  { from: "projects", to: "activity_log", kind: "1-N", label: "logs" },
  { from: "users", to: "activity_log", kind: "1-N", label: "actor" },
];

export const Route = createFileRoute("/_authenticated/modules/architecture")({
  component: ArchitecturePage,
});

/* ============================================================================
   Simulated diverse project data — an AI Consultant SaaS with microservices,
   AI layer, event-driven flows, multi-cloud.
   ========================================================================= */

const OVERVIEW = {
  version: "v4.2.1",
  health: 91,
  deployment: "Kubernetes on AWS EKS (multi-AZ)",
  cloud: "AWS (primary) · GCP (AI workloads)",
  status: "Production",
  style: "Event-Driven Microservices",
  stack: {
    Frontend: ["React 19", "TanStack Start", "Tailwind v4", "Flutter (mobile)"],
    Backend: ["Node.js 22", "Python FastAPI", "Go (edge)"],
    Database: ["PostgreSQL 16", "Redis 7", "MongoDB", "pgvector"],
    "AI Layer": ["LangGraph", "OpenAI GPT-4.1", "Gemini 2.5", "Groq Llama-3.3"],
    Infrastructure: ["AWS EKS", "RDS Aurora", "S3", "CloudFront", "SQS", "MSK"],
    Monitoring: ["Prometheus", "Grafana", "Loki", "Sentry"],
    "CI / CD": ["GitHub Actions", "Docker", "ArgoCD", "Terraform"],
  },
  scores: { scalability: 88, security: 93, performance: 86, maintainability: 82, cost: 78 },
  cost: { monthly: 8420, trend: -6.2 },
};

const METRICS = [
  { label: "Health Score", value: `${OVERVIEW.health}%`, hint: "+3 vs last version", icon: Activity },
  { label: "Services", value: 14, hint: "12 prod · 2 staging", icon: Boxes },
  { label: "APIs", value: 63, hint: "REST · GraphQL · gRPC", icon: Plug },
  { label: "Databases", value: 6, hint: "3 SQL · 2 NoSQL · 1 vector", icon: Database },
  { label: "Infra Components", value: 42, hint: "across 3 regions", icon: Server },
  { label: "Event Queues", value: 9, hint: "Kafka · SQS · Redis Streams", icon: Radio },
  { label: "Integrations", value: 18, hint: "Stripe, Slack, Jira …", icon: Network },
  { label: "Cost / month", value: `$${OVERVIEW.cost.monthly.toLocaleString()}`, hint: `${OVERVIEW.cost.trend}% MoM`, icon: DollarSign },
];

const SERVICES = [
  { name: "API Gateway", tech: "Kong", type: "Edge", deps: ["Auth", "Rate Limiter"], health: 99, scale: "Auto (2-20)", db: "—", owner: "Platform" },
  { name: "Auth Service", tech: "Node.js · JWT · OAuth", type: "Sync", deps: ["Postgres", "Redis", "SES"], health: 98, scale: "HPA 3-10", db: "Postgres", owner: "Security" },
  { name: "User Service", tech: "Node.js", type: "Sync", deps: ["Postgres", "Auth"], health: 97, scale: "HPA 2-8", db: "Postgres", owner: "Core" },
  { name: "Project Service", tech: "Node.js", type: "Sync", deps: ["Postgres", "S3"], health: 96, scale: "HPA 3-12", db: "Postgres", owner: "Core" },
  { name: "Requirement Service", tech: "Python FastAPI", type: "Sync", deps: ["Postgres", "AI Agent"], health: 94, scale: "HPA 2-8", db: "Postgres", owner: "AI" },
  { name: "Documentation Service", tech: "Node.js", type: "Sync", deps: ["Postgres", "S3", "AI Agent"], health: 95, scale: "HPA 2-6", db: "Postgres", owner: "AI" },
  { name: "Architecture Service", tech: "Python FastAPI", type: "Async", deps: ["MongoDB", "LangGraph"], health: 92, scale: "HPA 2-6", db: "Mongo", owner: "AI" },
  { name: "AI Agent Orchestrator", tech: "LangGraph · Python", type: "Async", deps: ["Vector DB", "Kafka"], health: 90, scale: "HPA 4-24", db: "pgvector", owner: "AI" },
  { name: "Workflow Engine", tech: "Temporal", type: "Async", deps: ["Postgres", "Kafka"], health: 93, scale: "HPA 3-9", db: "Postgres", owner: "Platform" },
  { name: "Notification Service", tech: "Go", type: "Async", deps: ["SQS", "SES", "FCM"], health: 99, scale: "HPA 2-6", db: "Redis", owner: "Platform" },
  { name: "Analytics Service", tech: "Python", type: "Async", deps: ["ClickHouse", "Kafka"], health: 91, scale: "HPA 2-10", db: "ClickHouse", owner: "Data" },
  { name: "Billing Service", tech: "Node.js · Stripe", type: "Sync", deps: ["Postgres", "Stripe"], health: 97, scale: "HPA 2-4", db: "Postgres", owner: "Growth" },
  { name: "Review Service", tech: "Python", type: "Async", deps: ["AI Agent", "Postgres"], health: 89, scale: "HPA 2-6", db: "Postgres", owner: "AI" },
  
];

const DATABASES = [
  { name: "aristotle-core (Postgres)", purpose: "Users, projects, auth", size: "42 GB", tables: 38, replicas: 2, backup: "PITR · 30d" },
  { name: "aristotle-ai (Postgres)", purpose: "Requirements, docs, reviews", size: "128 GB", tables: 54, replicas: 3, backup: "PITR · 30d" },
  { name: "aristotle-vectors (pgvector)", purpose: "Embeddings, RAG", size: "310 GB", tables: 4, replicas: 2, backup: "Daily" },
  { name: "aristotle-cache (Redis)", purpose: "Sessions, rate limits", size: "8 GB", tables: 0, replicas: 3, backup: "AOF" },
  { name: "aristotle-events (MongoDB)", purpose: "Event log, audits", size: "76 GB", tables: 12, replicas: 3, backup: "Daily" },
  { name: "aristotle-analytics (ClickHouse)", purpose: "Product analytics", size: "512 GB", tables: 22, replicas: 2, backup: "Daily" },
];

const APIS = [
  { path: "/v1/auth/login", method: "POST", auth: "Public", rate: "10/min", latency: 42 },
  { path: "/v1/projects", method: "GET", auth: "JWT", rate: "60/min", latency: 88 },
  { path: "/v1/requirements/generate", method: "POST", auth: "JWT", rate: "5/min", latency: 2400 },
  { path: "/v1/architecture/review", method: "POST", auth: "JWT", rate: "3/min", latency: 4800 },
  { path: "/v1/docs/:id", method: "GET", auth: "JWT", rate: "120/min", latency: 65 },
  { path: "/graphql", method: "POST", auth: "JWT", rate: "100/min", latency: 110 },
  { path: "/ws/agent", method: "WS", auth: "JWT", rate: "—", latency: 12 },
  { path: "/webhooks/stripe", method: "POST", auth: "HMAC", rate: "—", latency: 180 },
];

const EVENTS = [
  { topic: "project.created", publisher: "Project Service", consumers: ["Notification", "Analytics", "AI Orchestrator"], broker: "Kafka" },
  { topic: "requirement.updated", publisher: "Requirement Service", consumers: ["Documentation", "Architecture"], broker: "Kafka" },
  { topic: "architecture.reviewed", publisher: "Architecture Service", consumers: ["Notification", "Review"], broker: "Kafka" },
  { topic: "doc.generated", publisher: "Documentation Service", consumers: ["Notification"], broker: "SQS" },
  { topic: "billing.invoice", publisher: "Billing Service", consumers: ["Notification", "Analytics"], broker: "SNS" },
  { topic: "agent.step", publisher: "AI Orchestrator", consumers: ["Analytics", "Review"], broker: "Redis Streams" },
];

const SECURITY = {
  score: 93,
  critical: 0,
  medium: 3,
  low: 7,
  items: [
    { area: "Authentication", status: "ok", note: "OAuth 2.1 + JWT · MFA enforced for admins" },
    { area: "Encryption", status: "ok", note: "TLS 1.3 in transit · AES-256 at rest (KMS)" },
    { area: "Secrets", status: "ok", note: "AWS Secrets Manager · rotation 30d" },
    { area: "IAM", status: "warn", note: "3 roles with over-broad S3 access — tighten to bucket-level" },
    { area: "Rate Limiting", status: "ok", note: "Kong plugin per-route" },
    { area: "OWASP Top 10", status: "warn", note: "A05 misconfig: verbose errors in staging" },
    { area: "Compliance", status: "ok", note: "SOC 2 Type II · GDPR · HIPAA-ready" },
    { area: "Audit Logs", status: "ok", note: "Immutable · 400d retention" },
  ],
};


const REVIEW = {
  score: 91,
  breakdown: [
    { k: "Scalability", v: 88 },
    { k: "Reliability", v: 92 },
    { k: "Performance", v: 86 },
    { k: "Maintainability", v: 82 },
    { k: "Availability", v: 94 },
    { k: "Cost", v: 78 },
    { k: "Security", v: 93 },
  ],
  debt: [
    { level: "high", item: "Synchronous fan-out from Project Service — move to event bus." },
    { level: "med", item: "Add Redis cache in front of Requirement Service hot reads." },
    { level: "med", item: "Split Notification concerns from User Service." },
    { level: "low", item: "Enable CDN caching on public documentation endpoints." },
    { level: "high", item: "Introduce read replicas for aristotle-ai to offload analytics reads." },
  ],
};

const VERSIONS = [
  { v: "v1.0.0", date: "2024-03-12", author: "R. Kapoor", note: "Monolith launch", status: "archived" },
  { v: "v2.0.0", date: "2024-08-04", author: "AI Architect", note: "Split into 6 microservices", status: "archived" },
  { v: "v3.0.0", date: "2025-01-22", author: "M. Chen", note: "Event-driven via Kafka + Temporal", status: "archived" },
  { v: "v4.0.0", date: "2025-09-10", author: "AI Architect", note: "Hybrid cloud, AI layer on GCP", status: "approved" },
  { v: "v4.2.1", date: "2026-06-28", author: "AI Architect", note: "pgvector, RAG, cost -6%", status: "current" },
];

const AI_ACTIONS = [
  "Generate Architecture", "Improve Architecture", "Generate HLD", "Generate LLD",
  "Generate UML", "Sequence Diagram", "Explain Components",
  "Review Security", "Review Scalability", "Cost Optimization", "Cloud Migration",
  "Technology Recommendation", "Monolith → Microservices", "Generate Documentation",
];

const DIAGRAM_TYPES = [
  "High Level", "Low Level", "Component", "Sequence", "Activity",
  "Class", "ER", "Data Flow", "Network", "Service Graph",
  "Event Flow", "State", "C4 Context", "C4 Container",
];

/* ============================================================================
   Component
   ========================================================================= */

function ArchitecturePage() {
  const { current } = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);
  const [selected, setSelected] = useState<null | { kind: string; data: any }>(null);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm your AI Solution Architect. Ask me to generate diagrams, review security, or optimize cost." },
  ]);
  const [chatInput, setChatInput] = useState("");

  const [diagramKind, setDiagramKind] = useState<string>("High Level");
  const [diagramInput, setDiagramInput] = useState<string>(SAMPLE_INPUTS["High Level"]);
  const [diagram, setDiagram] = useState<GeneratedDiagram>(() => generateFromText(SAMPLE_INPUTS["High Level"]));

  const regenerate = (text: string) => {
    setDiagramInput(text);
    try {
      setDiagram(generateFromText(text));
    } catch { /* ignore */ }
  };
  const pickPreset = (name: string) => {
    setDiagramKind(name);
    const sample = SAMPLE_INPUTS[name] ?? `# ${name} Diagram\nComponent A -> Component B -> Component C`;
    regenerate(sample);
  };

  const servicesDiagram = useMemo(() => diagramFromServices(SERVICES), []);
  const eventsDiagram = useMemo(() => diagramFromEvents(EVENTS), []);

  const projectName = current?.name ?? "Aristotle Platform";

  const sendChat = (text?: string) => {
    const t = (text ?? chatInput).trim();
    if (!t) return;
    setChat((c) => [
      ...c,
      { role: "user", text: t },
      { role: "ai", text: `Analyzing "${t}"… I'll propose changes and update the architecture graph shortly.` },
    ]);
    setChatInput("");
  };

  return (
    <>
      <PageHeader
        title="Architecture"
        description="AI Solution Architect — generate, visualize, validate and evolve your system design."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Bot className="h-4 w-4" /> AI Architect
            </Button>
            <Button size="sm">
              <Sparkles className="h-4 w-4" /> Generate
            </Button>
          </div>
        }
      />

      <div className="w-full px-8 py-6 space-y-6">

        {/* Project overview */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <OverviewField label="Project" value={projectName} />
              <OverviewField label="Version" value={OVERVIEW.version} />
              <OverviewField
                label="Health Score"
                value={
                  <span className="flex items-center gap-2">
                    <span className="font-display text-lg">{OVERVIEW.health}%</span>
                    <Progress value={OVERVIEW.health} className="h-1.5 w-24" />
                  </span>
                }
              />
              <OverviewField label="Status" value={<Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30" variant="outline">{OVERVIEW.status}</Badge>} />
              <OverviewField label="Deployment" value={OVERVIEW.deployment} />
              <OverviewField label="Cloud Provider" value={OVERVIEW.cloud} />
              <OverviewField label="Architecture Style" value={OVERVIEW.style} />
              <OverviewField
                label="Technology Stack"
                value={
                  <div className="flex flex-wrap gap-1">
                    {["React", "Node.js", "FastAPI", "Postgres", "Kafka", "EKS"].map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <TabsList className="inline-flex w-max min-w-full gap-1">
              {[
                ["overview", "Overview"],
                ["system", "System"],
                ["services", "Microservices"],
                ["infra", "Infrastructure"],
                ["db", "Database"],
                ["api", "API"],
                ["events", "Events"],
                ["security", "Security"],
                ["review", "AI Review"],
                ["versions", "Versions"],
              ].map(([v, l]) => (
                <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
              ))}
            </TabsList>
          </div>


          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {METRICS.map((m) => (
                <Card key={m.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
                      <m.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-1 font-display text-2xl">{m.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{m.hint}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">AI Generated Summary</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p><b className="text-foreground">{projectName}</b> uses an <b className="text-foreground">Event-Driven Microservice</b> architecture on AWS EKS with a specialized AI plane on GCP. Traffic enters through CloudFront → API Gateway (Kong) → 14 domain services communicating via Kafka + Temporal workflows.</p>
                  <p>The AI layer (LangGraph orchestrator + pgvector RAG) is decoupled from transactional services and horizontally scales up to 24 pods under load. Persistence is polyglot: Postgres for OLTP, ClickHouse for analytics, MongoDB for event log, Redis for cache.</p>
                  <p>Overall health <b className="text-foreground">91%</b>, top opportunity: introduce read replicas for the AI database and move Project fan-out to events.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Quality Scores</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(OVERVIEW.scores).map(([k, v]) => (
                    <div key={k}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{k}</span>
                        <span className="font-medium">{v}%</span>
                      </div>
                      <Progress value={v} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Technology Stack</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(OVERVIEW.stack).map(([group, items]) => (
                    <div key={group} className="rounded-lg border bg-surface p-3">
                      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{group}</div>
                      <div className="flex flex-wrap gap-1">
                        {items.map((i) => <Badge key={i} variant="secondary" className="text-[11px]">{i}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Architecture */}
          <TabsContent value="system" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DIAGRAM_TYPES.filter((d) => SAMPLE_INPUTS[d] || ["High Level","Sequence","Event Flow","ER"].includes(d)).map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={diagramKind === d ? "default" : "outline"}
                  onClick={() => pickPreset(d)}
                  className="gap-1.5"
                >
                  <Workflow className="h-3.5 w-3.5" /> {d}
                </Button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-primary" /> Describe your architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Syntax: <code className="text-foreground">A -&gt; B</code> edge,
                    {" "}<code className="text-foreground">A =&gt; B</code> animated,
                    {" "}<code className="text-foreground">A -&gt; B : label</code>,
                    {" "}<code className="text-foreground">Name | subtitle</code>,
                    {" "}chain <code className="text-foreground">A -&gt; B -&gt; C</code>.
                  </p>
                  <Textarea
                    value={diagramInput}
                    onChange={(e) => regenerate(e.target.value)}
                    className="h-[380px] font-mono text-xs"
                    spellCheck={false}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => regenerate(diagramInput)}>
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAiOpen(true)}>
                      <Bot className="h-3.5 w-3.5" /> Ask AI
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-base">{diagram.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">{diagram.nodes.length} nodes</Badge>
                    <Badge variant="secondary" className="text-[10px]">{diagram.edges.length} edges</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ArchitectureDiagram nodes={diagram.nodes} edges={diagram.edges} height={520} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">High-Level System Flow</CardTitle></CardHeader>
              <CardContent>
                <FlowStrip
                  steps={[
                    { icon: Cloud, label: "Users" },
                    { icon: Zap, label: "CloudFront" },
                    { icon: Network, label: "Load Balancer" },
                    { icon: Plug, label: "API Gateway" },
                    { icon: Boxes, label: "Microservices" },
                    { icon: Cpu, label: "AI Orchestrator" },
                    { icon: Database, label: "Postgres" },
                    { icon: Server, label: "S3" },
                    { icon: Activity, label: "Monitoring" },
                  ]}
                />
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {["Frontend", "Backend", "AI Services", "Auth", "Database", "Cache", "Storage", "Notification", "Queue", "Analytics", "Monitoring", "Logging"].map((c) => (
                <Card key={c} className="cursor-pointer hover:border-primary/50" onClick={() => setSelected({ kind: "component", data: { name: c } })}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{c}</div>
                      <div className="text-xs text-muted-foreground">Click for details</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Microservices */}
          <TabsContent value="services" className="space-y-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Service Dependency Graph</CardTitle></CardHeader>
              <CardContent>
                <ArchitectureDiagram nodes={servicesDiagram.nodes} edges={servicesDiagram.edges} height={440} />
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8 h-9" placeholder="Search services…" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All owners</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline"><Wand2 className="h-4 w-4" /> AI Split</Button>
              <Button size="sm" variant="outline"><PlusCircle className="h-4 w-4" /> Add</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {SERVICES.map((s) => (
                <Card key={s.name} className="cursor-pointer hover:border-primary/50" onClick={() => setSelected({ kind: "service", data: s })}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.tech}</div>
                      </div>
                      <Badge variant="outline" className={s.type === "Async" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}>{s.type}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {s.deps.map((d) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{s.scale}</span>
                      <span className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${s.health > 95 ? "bg-emerald-500" : s.health > 90 ? "bg-amber-500" : "bg-red-500"}`} /> {s.health}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Infrastructure */}
          <TabsContent value="infra" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Infrastructure Topology</CardTitle></CardHeader>
              <CardContent>
                <FlowStrip
                  steps={[
                    { icon: Cloud, label: "Users" },
                    { icon: Zap, label: "CloudFront" },
                    { icon: Network, label: "ALB" },
                    { icon: Plug, label: "API Gateway" },
                    { icon: Boxes, label: "EKS Services" },
                    { icon: Database, label: "Redis" },
                    { icon: Database, label: "Postgres" },
                    { icon: Server, label: "S3" },
                    { icon: Activity, label: "Prometheus" },
                  ]}
                />
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: Network, label: "Load Balancer", value: "AWS ALB · 3 AZ" },
                { icon: Plug, label: "API Gateway", value: "Kong · 12 routes" },
                { icon: Boxes, label: "Kubernetes", value: "EKS 1.30 · 24 nodes" },
                { icon: Server, label: "Storage", value: "S3 · 4 buckets · 2.1 TB" },
                { icon: Zap, label: "CDN", value: "CloudFront · 3 dists" },
                { icon: Cloud, label: "DNS", value: "Route 53 · 8 zones" },
                { icon: Cpu, label: "Cloud Functions", value: "Lambda · 22 fns" },
                { icon: Radio, label: "Queues", value: "MSK · SQS · 9 topics" },
                { icon: ShieldCheck, label: "Secrets", value: "Secrets Manager · rotation 30d" },
                { icon: Activity, label: "Monitoring", value: "Prometheus + Grafana" },
                { icon: GitBranch, label: "Networking", value: "3 VPCs · peered" },
                { icon: ShieldCheck, label: "Firewall", value: "WAF · 34 rules" },
              ].map((c) => (
                <Card key={c.label}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <c.icon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.value}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Cost Optimization</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Recommendation icon={TrendingUp} tone="ok" text="Right-size 4 over-provisioned nodes → save $412/mo" />
                <Recommendation icon={DollarSign} tone="warn" text="Move cold logs to S3 IA → save $180/mo" />
                <Recommendation icon={Zap} tone="ok" text="Reserved instances for Postgres → save $610/mo" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database */}
          <TabsContent value="db" className="space-y-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Database Schema (ER Diagram)</CardTitle>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {ER_TABLES.length} tables · {ER_RELATIONS.length} relations · click and drag to rearrange
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />PK</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />FK</span>
                </div>
              </CardHeader>
              <CardContent>
                <ERDiagram tables={ER_TABLES} relations={ER_RELATIONS} height={620} />
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {DATABASES.map((d) => (
                <Card key={d.name} className="cursor-pointer hover:border-primary/50" onClick={() => setSelected({ kind: "db", data: d })}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">{d.name}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{d.purpose}</div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><div className="text-muted-foreground">Size</div><div className="font-medium">{d.size}</div></div>
                      <div><div className="text-muted-foreground">Tables</div><div className="font-medium">{d.tables}</div></div>
                      <div><div className="text-muted-foreground">Replicas</div><div className="font-medium">{d.replicas}</div></div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Backup: {d.backup}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Database Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Recommendation icon={Database} tone="warn" text="Add composite index on requirements(project_id, status) — 3.2× faster hot query" />
                <Recommendation icon={Database} tone="ok" text="Partition analytics.events by month — improves scan time" />
                <Recommendation icon={AlertTriangle} tone="warn" text="pgvector table hit 78% of disk — plan capacity or ivfflat rebuild" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs */}
          <TabsContent value="api" className="space-y-3">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b">
                    <tr>
                      <th className="text-left px-4 py-2">Endpoint</th>
                      <th className="text-left px-4 py-2">Method</th>
                      <th className="text-left px-4 py-2">Auth</th>
                      <th className="text-left px-4 py-2">Rate Limit</th>
                      <th className="text-left px-4 py-2">p95 Latency</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {APIS.map((a) => (
                      <tr key={a.path} className="border-b hover:bg-accent/50 cursor-pointer" onClick={() => setSelected({ kind: "api", data: a })}>
                        <td className="px-4 py-2 font-mono text-xs">{a.path}</td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{a.method}</Badge></td>
                        <td className="px-4 py-2 text-xs">{a.auth}</td>
                        <td className="px-4 py-2 text-xs">{a.rate}</td>
                        <td className="px-4 py-2 text-xs">{a.latency} ms</td>
                        <td className="px-4 py-2"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="space-y-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Event Flow Graph</CardTitle></CardHeader>
              <CardContent>
                <ArchitectureDiagram nodes={eventsDiagram.nodes} edges={eventsDiagram.edges} height={440} />
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
              {EVENTS.map((e) => (
                <Card key={e.topic} className="cursor-pointer hover:border-primary/50" onClick={() => setSelected({ kind: "event", data: e })}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-sm">{e.topic}</div>
                      <Badge variant="secondary" className="text-[10px]">{e.broker}</Badge>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">Publisher</div>
                    <div className="text-sm">{e.publisher}</div>
                    <div className="mt-2 text-xs text-muted-foreground">Consumers</div>
                    <div className="flex flex-wrap gap-1">
                      {e.consumers.map((c) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <StatCard label="Security Score" value={`${SECURITY.score}%`} hint="OWASP + custom" />
              <StatCard label="Critical" value={SECURITY.critical} hint="No blocking risks" />
              <StatCard label="Medium" value={SECURITY.medium} hint="Address this sprint" />
              <StatCard label="Low" value={SECURITY.low} hint="Tracked in backlog" />
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Security Posture</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {SECURITY.items.map((s) => (
                  <div key={s.area} className="flex items-start gap-3 rounded-md border p-3">
                    {s.status === "ok" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{s.area}</div>
                      <div className="text-xs text-muted-foreground">{s.note}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>


          {/* AI Review */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Overall Architecture Score</div>
                  <div className="font-display text-5xl">{REVIEW.score}%</div>
                  <div className="text-xs text-muted-foreground mt-1">AI Senior Solution Architect</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 max-w-xl">
                  {REVIEW.breakdown.map((b) => (
                    <div key={b.k}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{b.k}</span><span>{b.v}%</span></div>
                      <Progress value={b.v} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Technical Debt & Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {REVIEW.debt.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border p-3">
                    <Badge variant="outline" className={
                      d.level === "high" ? "bg-red-500/10 text-red-600 border-red-500/30" :
                      d.level === "med" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                      "bg-muted"
                    }>{d.level}</Badge>
                    <div className="text-sm">{d.item}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Versions */}
          <TabsContent value="versions" className="space-y-3">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b">
                    <tr>
                      <th className="text-left px-4 py-2">Version</th>
                      <th className="text-left px-4 py-2">Date</th>
                      <th className="text-left px-4 py-2">Author</th>
                      <th className="text-left px-4 py-2">Change</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VERSIONS.map((v) => (
                      <tr key={v.v} className="border-b">
                        <td className="px-4 py-2 font-mono text-xs">{v.v}</td>
                        <td className="px-4 py-2 text-xs">{v.date}</td>
                        <td className="px-4 py-2 text-xs">{v.author}</td>
                        <td className="px-4 py-2 text-xs">{v.note}</td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className={
                            v.status === "current" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                            v.status === "approved" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" :
                            "bg-muted"
                          }>{v.status}</Badge>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Eye className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><GitCompare className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Download className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail sheet — right side, half screen */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:!max-w-[50vw] overflow-y-auto p-6">
          {selected && <DetailPanel kind={selected.kind} data={selected.data} />}
        </SheetContent>
      </Sheet>

      {/* AI Architect sidebar */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="w-full sm:!max-w-[50vw] p-0 flex flex-col">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> AI Solution Architect</SheetTitle>
          </SheetHeader>
          <div className="border-b p-3">
            <div className="text-xs text-muted-foreground mb-2">Quick actions</div>
            <div className="flex flex-wrap gap-1">
              {AI_ACTIONS.map((a) => (
                <Button key={a} variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => sendChat(a)}>{a}</Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {chat.map((m, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm ${m.role === "ai" ? "bg-secondary" : "bg-primary/10 ml-8"}`}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{m.role === "ai" ? "AI Architect" : "You"}</div>
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-3 flex gap-2">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the AI architect…"
              className="min-h-[40px] resize-none"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
            />
            <Button onClick={() => sendChat()}><Send className="h-4 w-4" /></Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ---------- Small helpers ---------- */

function OverviewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function FlowStrip({ steps }: { steps: { icon: any; label: string }[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-surface px-3 py-2 min-w-[92px]">
            <s.icon className="h-4 w-4 text-primary" />
            <div className="text-[11px] font-medium text-center">{s.label}</div>
          </div>
          {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
      ))}
    </div>
  );
}

function Recommendation({ icon: Icon, tone, text }: { icon: any; tone: "ok" | "warn"; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <Icon className={`h-4 w-4 mt-0.5 ${tone === "ok" ? "text-emerald-500" : "text-amber-500"}`} />
      <div className="text-sm">{text}</div>
    </div>
  );
}

function DetailPanel({ kind, data }: { kind: string; data: any }) {
  if (kind === "service") {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Microservice</div>
          <h2 className="font-display text-2xl">{data.name}</h2>
          <div className="text-sm text-muted-foreground">{data.tech}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Type" value={data.type} />
          <Field label="Owner" value={data.owner} />
          <Field label="Scale" value={data.scale} />
          <Field label="Database" value={data.db} />
          <Field label="Health" value={`${data.health}%`} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Dependencies</div>
          <div className="flex flex-wrap gap-1">
            {data.deps.map((d: string) => <Badge key={d} variant="secondary">{d}</Badge>)}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="text-sm font-medium">AI Suggestions</div>
          <Recommendation icon={Zap} tone="ok" text="Add gRPC transport for internal calls to reduce latency by ~35%." />
          <Recommendation icon={AlertTriangle} tone="warn" text="Circuit breaker missing on downstream dependency." />
        </div>
      </div>
    );
  }
  if (kind === "db") {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Database</div>
          <h2 className="font-display text-2xl">{data.name}</h2>
          <div className="text-sm text-muted-foreground">{data.purpose}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Size" value={data.size} />
          <Field label="Tables" value={data.tables} />
          <Field label="Replicas" value={data.replicas} />
          <Field label="Backup" value={data.backup} />
        </div>
      </div>
    );
  }
  if (kind === "api") {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">API Endpoint</div>
          <h2 className="font-display text-xl font-mono">{data.method} {data.path}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Auth" value={data.auth} />
          <Field label="Rate Limit" value={data.rate} />
          <Field label="p95 Latency" value={`${data.latency} ms`} />
        </div>
      </div>
    );
  }
  if (kind === "event") {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Event Topic</div>
          <h2 className="font-display text-xl font-mono">{data.topic}</h2>
          <Badge variant="secondary" className="mt-1">{data.broker}</Badge>
        </div>
        <Field label="Publisher" value={data.publisher} />
        <div>
          <div className="text-xs text-muted-foreground mb-1">Consumers</div>
          <div className="flex flex-wrap gap-1">
            {data.consumers.map((c: string) => <Badge key={c} variant="outline">{c}</Badge>)}
          </div>
        </div>
      </div>
    );
  }
  if (kind === "diagram") {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Diagram</div>
          <h2 className="font-display text-2xl">{data.name} Diagram</h2>
        </div>
        <div className="rounded-lg border bg-surface aspect-video grid place-items-center text-center p-6">
          <div>
            <Workflow className="h-10 w-10 text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">AI-generated {data.name} diagram will render here.</div>
            <Button size="sm" className="mt-3"><Sparkles className="h-4 w-4" /> Generate</Button>
          </div>
        </div>
      </div>
    );
  }
  // component
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Component</div>
        <h2 className="font-display text-2xl">{data.name}</h2>
      </div>
      <div className="text-sm text-muted-foreground">
        Purpose, responsibilities, dependencies, tech, performance and owner metadata for the {data.name} component.
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
