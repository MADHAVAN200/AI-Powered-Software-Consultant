import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sparkles, FileText, BookOpen, Boxes, GitBranch, Palette, Database, Plug,
  TestTubes, AlertTriangle, Library, MessageSquare, Users, ArrowRight,
  ShieldCheck, LayoutDashboard, Settings, Activity
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aristotle — AI-powered SDLC platform for software teams" },
      { name: "description", content: "Generate SRS, review architecture, audit repos, design APIs, analyze UX, and manage risk — AI modules across the entire software lifecycle." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: FileText,
    title: "Requirements",
    tagline: "AI Business Analyst",
    desc: "Capture, analyze, prioritize, and trace functional and non-functional requirements. Instantly generates business requirements documents (BRD), software requirements specifications (SRS), user stories, Gherkin acceptance criteria, and requirement-to-test traceability matrices.",
    capabilities: ["Natural-language brief parsing", "Gherkin story & criteria generator", "MoSCoW / RICE prioritization", "Full requirement traceability"],
  },
  {
    icon: BookOpen,
    title: "Documentation",
    tagline: "AI Technical Writer",
    desc: "Automatically write and continuously maintain living documentation synced directly to your repository. Generates detailed High-Level Designs (HLD), Low-Level Designs (LLD), operations runbooks, API references, onboarding wikis, and release notes from your commit history.",
    capabilities: ["Git-synced living markdown specs", "Architectural HLD & LLD blueprints", "Runbook & release guide generator", "Interactive document version diffs"],
  },
  {
    icon: Boxes,
    title: "Architecture",
    tagline: "AI Solution Architect",
    desc: "Propose software design patterns, model component graphs, map dependencies, and evaluate architectural trade-offs. The AI scores scalability, modularity, cost-efficiency, and resilience while auto-generating interactive C4/UML architecture diagrams.",
    capabilities: ["C4 Model container & component diagrams", "Pattern recommendation & trade-offs", "Scalability & modularity assessment", "Automated ADR documentation"],
  },
  {
    icon: GitBranch,
    title: "Repository",
    tagline: "AI Code Consultant",
    desc: "Analyze pull requests, map codebase structures, isolate technical debt, and discover complexity hotspots. The AI explains complex modules in plain English, highlights code smell patterns, and acts as a continuous review agent for code submissions.",
    capabilities: ["Dependency & flow mapping", "Semantic code explanations", "Complexity & hot-spot analysis", "Automated PR reviews & feedback"],
  },
  {
    icon: Palette,
    title: "UI / UX",
    tagline: "AI Design Consultant",
    desc: "Audit component structures, layout responsiveness, heuristic compliance, and accessibility criteria (WCAG 2.1 AA/AAA). Traces frontend components and views directly back to requirements and stories to prevent feature drift.",
    capabilities: ["WCAG accessibility verification", "Heuristic layout & contrast check", "Design system consistency audits", "User story to view validation"],
  },
  {
    icon: Database,
    title: "Database",
    tagline: "AI Data Architect",
    desc: "Plan ER diagrams, review normalization structures (1NF to 3NF), recommend query indexes, and write performant schemas. Runs impact analysis on any proposed schema migration to alert you about breaking changes in queries or code.",
    capabilities: ["ER diagram & schema design", "Normalization & index optimization", "Query execution plan advisor", "Migration impact reports"],
  },
  {
    icon: Plug,
    title: "API",
    tagline: "AI API Consultant & Governance",
    desc: "Design, document, and govern REST and GraphQL contracts. Features automatic OpenAPI specification drafting, breaking-change static analysis, enterprise API style guide linting, and client SDK template generation.",
    capabilities: ["OpenAPI & GraphQL schema design", "Breaking-change static detection", "API style guide linting & scoring", "Client SDK template generation"],
  },
  {
    icon: TestTubes,
    title: "Test Cases",
    tagline: "AI QA Consultant",
    desc: "Draft comprehensive QA plans, unit tests, end-to-end integration flows, edge-case regression scenarios, and performance scripts. Prioritizes test execution, matches coverage to requirements, and triages flaky suites.",
    capabilities: ["Unit, integration & E2E scripts", "Requirements coverage mapping", "Flaky test triaging & analytics", "Defect regression test plans"],
  },
  {
    icon: AlertTriangle,
    title: "Risk Analysis",
    tagline: "AI Risk Consultant",
    desc: "Identify, registry, and mitigate project, business, security, and architectural risks. Automatically scores risk factors using Risk Priority Numbers (RPN) and plots them on a live, interactive probability-impact heat map.",
    capabilities: ["RPN registry & classification", "Probability × impact heat mapping", "Compliance and security audit logs", "AI-guided mitigation strategies"],
  },
  {
    icon: ShieldCheck,
    title: "Security Audit",
    tagline: "AI Security Consultant",
    desc: "Continuously audit configuration files, third-party dependencies, and codebase practices for vulnerabilities. Identifies hardcoded secrets, maps project posture against OWASP Top 10, and generates remediation scripts.",
    capabilities: ["OWASP Top 10 vulnerability check", "Hardcoded secrets & keys detection", "Dependency CVE vulnerability scan", "Remodeling threat analysis"],
  },
  {
    icon: LayoutDashboard,
    title: "Performance & SRE",
    tagline: "AI Performance Engineer",
    desc: "Assess server response footprints, database query latencies, and browser load times. Highlights performance bottlenecks, suggests backend cache positions, and suggests cloud auto-scaling configs.",
    capabilities: ["Response footprint analysis", "Database slow-query profiling", "Cache & CDN placement recommendations", "Cloud auto-scaling guidelines"],
  },
  {
    icon: Settings,
    title: "DevOps & CI/CD",
    tagline: "AI DevOps Architect",
    desc: "Review infrastructure-as-code files (Docker, Kubernetes, Terraform) and CI/CD pipelines. Recommends performance and security hardening guidelines, cost-efficiency measures, and automates script creation.",
    capabilities: ["CI/CD pipeline script generation", "IaC (Terraform/Docker) security lint", "Cloud resource cost estimation", "Build optimization recommendations"],
  },
  {
    icon: Library,
    title: "Knowledge Hub",
    tagline: "Enterprise Knowledge Brain",
    desc: "The organization's second brain. Combines semantic knowledge graphs and vector databases to index specifications, discussions, codebase decisions, and documentation. Keeps the entire team in sync with onboarding briefings.",
    capabilities: ["Multi-source semantic search (RAG)", "Interactive project knowledge graph", "Onboarding summary generator", "Decision record (ADR) history"],
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    tagline: "Cross-Module Copilot",
    desc: "A conversational agent with context spanning every single module. Query the assistant about code compliance to database constraints, requirements details, or historical architectural trade-offs, and receive cited answers.",
    capabilities: ["Cross-module contextual query", "Grounded citations for answers", "Automated code/doc refactoring", "Interactive workflow actions"],
  },
  {
    icon: Users,
    title: "Team & Governance",
    tagline: "Governance Control Center",
    desc: "Establish roles, define RACI matrices for project items, balance workload capacities, and monitor revision histories. Everything generated by the platform is traceable, subject to audit logs, and requires explicit user sign-offs.",
    capabilities: ["Role-based access & RBAC logs", "Live RACI matrix builder", "Change approval workflows", "Full compliance audit trails"],
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">Aristotle</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button size="sm">Open workspace</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Powered by Groq — Llama 3.3 70B
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl">
            The AI architect, reviewer and QA<br />for your entire SDLC.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Aristotle doesn't write your code. It reviews your architecture, generates your specs,
            audits your repos, scores your quality, and answers questions across every artifact —
            so your team ships better software, faster.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/login">
              <Button size="lg" className="gap-2">Explore the demo project <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <a href="#features"><Button size="lg" variant="outline">See what it does</Button></a>
          </div>
        </div>

        {/* Project Health Card */}
        <div className="mx-auto mt-16 max-w-3xl rounded-xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project health</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-foreground">87</span>
                <span className="text-sm font-normal text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-9">
            {[
              { label: "Reqs", score: 92 },
              { label: "Arch", score: 88 },
              { label: "Docs", score: 79 },
              { label: "Sec", score: 71 },
              { label: "UI", score: 84 },
              { label: "DB", score: 90 },
              { label: "API", score: 86 },
              { label: "Test", score: 74 },
              { label: "Maint", score: 83 },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border bg-surface/50 p-3 text-center transition-colors hover:bg-surface">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</div>
                <div className="mt-1.5 text-lg font-bold text-foreground">{m.score}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl">Fifteen AI modules. One workspace.</h2>
            <p className="mt-3 text-muted-foreground">
              Every stage of the software lifecycle, reviewed by an AI expert trained to think like your best senior engineer.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group grid gap-6 md:grid-cols-3 rounded-xl border bg-card p-8 md:p-10 transition-shadow hover:shadow-md"
              >
                {/* Overview Info (Left 2/3) */}
                <div className="md:col-span-2 flex items-start gap-5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {f.tagline}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{f.desc}</p>
                  </div>
                </div>

                {/* Key Capabilities (Right 1/3) */}
                <div className="border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 flex flex-col justify-start">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Capabilities
                  </span>
                  <ul className="mt-3 space-y-2.5">
                    {f.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span className="leading-tight">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Aristotle</div>
          <div>Built for software teams.</div>
        </div>
      </footer>
    </div>
  );
}
