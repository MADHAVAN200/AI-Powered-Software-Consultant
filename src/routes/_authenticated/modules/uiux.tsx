import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Palette, Bot, Sparkles, Send, Upload, RefreshCw, Search, Eye, Accessibility,
  Layout, Layers, Smartphone, Tablet, Monitor, Route as RouteIcon, GitBranch,
  Type, Component, Grid3x3, ImageIcon, FileText, CheckCircle2, AlertTriangle,
  Clock, TrendingUp, Zap, MousePointer2, ChevronRight, Figma, PenTool,
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

export const Route = createFileRoute("/_authenticated/modules/uiux")({
  component: UiUxPage,
});

/* ============================================================================
   Simulated data — AI UI/UX Design Consultant
   ========================================================================= */

const PROJECT = {
  platform: "Enterprise HRMS",
  designSystem: "Material Design 3",
  status: "In Review",
  ui: 88,
  ux: 84,
  a11y: 86,
  responsive: 91,
  consistency: 94,
  overall: 92,
  screens: 48,
  components: 132,
  dsCoverage: 78,
  pendingReviews: 6,
  suggestions: 24,
};

const METRICS = [
  { label: "Overall Design", value: `${PROJECT.overall}%`, hint: "+4 vs last review", icon: Sparkles },
  { label: "UI Score", value: `${PROJECT.ui}%`, hint: "visual quality", icon: Eye },
  { label: "UX Score", value: `${PROJECT.ux}%`, hint: "usability", icon: MousePointer2 },
  { label: "Accessibility", value: `${PROJECT.a11y}%`, hint: "WCAG 2.2 AA", icon: Accessibility },
  { label: "Responsive", value: `${PROJECT.responsive}%`, hint: "6 breakpoints", icon: Smartphone },
  { label: "Consistency", value: `${PROJECT.consistency}%`, hint: "design tokens", icon: Grid3x3 },
  { label: "Components Reviewed", value: PROJECT.components, hint: "of 148 total", icon: Component },
  { label: "Design System Coverage", value: `${PROJECT.dsCoverage}%`, hint: "tokens applied", icon: Layers },
  { label: "Pending Reviews", value: PROJECT.pendingReviews, hint: "2 critical", icon: Clock },
  { label: "AI Suggestions", value: PROJECT.suggestions, hint: "8 high impact", icon: Bot },
  { label: "Screens", value: PROJECT.screens, hint: "12 flows", icon: Layout },
  { label: "Design Maturity", value: "A-", hint: "mature system", icon: TrendingUp },
];

const UPLOADS = [
  { name: "HRMS · Dashboard v3", type: "Figma", module: "Dashboard", designer: "A. Silva", version: "v3.2", status: "reviewed", updated: "2h", req: "REQ-102", story: "US-014" },
  { name: "Employee Directory", type: "Figma", module: "People", designer: "M. Chen", version: "v2.1", status: "in review", updated: "5h", req: "REQ-118", story: "US-022" },
  { name: "Payroll Wizard", type: "Adobe XD", module: "Payroll", designer: "R. Kapoor", version: "v1.4", status: "pending", updated: "1d", req: "REQ-155", story: "US-031" },
  { name: "Leave Approval Mobile", type: "Sketch", module: "Mobile", designer: "P. Nair", version: "v2.0", status: "reviewed", updated: "1d", req: "REQ-142", story: "US-040" },
  { name: "Onboarding Screens", type: "PNG", module: "Onboarding", designer: "L. Ortiz", version: "v1.0", status: "in review", updated: "3d", req: "REQ-120", story: "US-011" },
  { name: "Reports Portal", type: "Website URL", module: "Analytics", designer: "S. Ito", version: "live", status: "reviewed", updated: "6d", req: "REQ-138", story: "US-050" },
];

const COLORS = [
  { role: "Primary", hex: "#4F46E5", cls: "bg-indigo-600" },
  { role: "Secondary", hex: "#0EA5E9", cls: "bg-sky-500" },
  { role: "Success", hex: "#16A34A", cls: "bg-emerald-600" },
  { role: "Warning", hex: "#F59E0B", cls: "bg-amber-500" },
  { role: "Error", hex: "#E11D48", cls: "bg-rose-600" },
  { role: "Neutral 900", hex: "#0F172A", cls: "bg-slate-900" },
  { role: "Neutral 500", hex: "#64748B", cls: "bg-slate-500" },
  { role: "Neutral 100", hex: "#F1F5F9", cls: "bg-slate-100" },
];

const TYPOGRAPHY = [
  { role: "Display", family: "Inter", size: "48/56", weight: 700 },
  { role: "H1", family: "Inter", size: "36/44", weight: 700 },
  { role: "H2", family: "Inter", size: "28/36", weight: 600 },
  { role: "H3", family: "Inter", size: "22/30", weight: 600 },
  { role: "Body", family: "Inter", size: "16/24", weight: 400 },
  { role: "Caption", family: "Inter", size: "12/18", weight: 500 },
];

const COMPONENTS = [
  { name: "Button", variants: 6, usage: 412, health: 96, issue: "—" },
  { name: "Input", variants: 4, usage: 288, health: 88, issue: "Inconsistent focus ring" },
  { name: "Card", variants: 3, usage: 174, health: 92, issue: "—" },
  { name: "Table", variants: 2, usage: 42, health: 78, issue: "Row density varies" },
  { name: "Dialog", variants: 3, usage: 61, health: 90, issue: "—" },
  { name: "Toast", variants: 4, usage: 90, health: 84, issue: "Missing ARIA live" },
  { name: "Navigation", variants: 2, usage: 12, health: 82, issue: "Depth > 3 levels" },
  { name: "Form", variants: 5, usage: 108, health: 86, issue: "Label alignment drift" },
];

const UI_CHECKS = [
  { check: "Visual Hierarchy", score: "Excellent", tone: "ok" },
  { check: "Spacing", score: "Good", tone: "ok" },
  { check: "Typography", score: "Needs Improvement", tone: "warn" },
  { check: "Color Usage", score: "Excellent", tone: "ok" },
  { check: "Alignment", score: "Good", tone: "ok" },
  { check: "Icon Usage", score: "Good", tone: "ok" },
  { check: "Component Reuse", score: "Good", tone: "ok" },
  { check: "White Space", score: "Excellent", tone: "ok" },
  { check: "Branding Consistency", score: "Excellent", tone: "ok" },
  { check: "Layout Consistency", score: "Needs Improvement", tone: "warn" },
];

const UI_SUGGESTIONS = [
  "Increase spacing between dashboard cards from 12px → 16px",
  "Improve button hierarchy — use one primary CTA per view",
  "Standardize form control heights (currently 32/36/40 mixed)",
  "Improve top navigation visibility on scroll",
  "Reduce visual clutter on Reports page (12 filters visible)",
];

const UX_METRICS = [
  { label: "Task Success Rate", value: "87%", tone: "ok" },
  { label: "Avg Completion Time", value: "2m 14s", tone: "ok" },
  { label: "Navigation Complexity", value: "Medium", tone: "warn" },
  { label: "Interaction Efficiency", value: "82%", tone: "ok" },
  { label: "User Friction Score", value: "Low", tone: "ok" },
  { label: "Cognitive Load", value: "Moderate", tone: "warn" },
];

const UX_FLOWS = [
  { flow: "Checkout / Payroll Run", steps: 4, recommend: 3, gain: "18%" },
  { flow: "Employee Onboarding", steps: 7, recommend: 5, gain: "24%" },
  { flow: "Leave Approval", steps: 3, recommend: 3, gain: "0%" },
  { flow: "Report Generation", steps: 6, recommend: 4, gain: "31%" },
];

const A11Y = {
  score: 86,
  compliance: "WCAG 2.2 AA · 86%",
  critical: 3,
  warnings: 11,
  passed: 142,
  issues: [
    { sev: "high", msg: "Contrast 3.8:1 on secondary buttons — needs 4.5:1", where: "Dashboard header" },
    { sev: "high", msg: "Missing form label association on Payroll date range", where: "Payroll Wizard" },
    { sev: "high", msg: "Focus trap missing in Confirmation dialog", where: "Leave Approval" },
    { sev: "med", msg: "Touch targets 36×36 on mobile filter chips (< 44)", where: "Mobile Directory" },
    { sev: "med", msg: "Alt text missing on 8 illustration images", where: "Onboarding Screens" },
    { sev: "med", msg: "Heading skipped (h1 → h3)", where: "Reports Portal" },
    { sev: "low", msg: "ARIA role redundant on native <button>", where: "Nav bar" },
  ],
  recs: [
    "Increase contrast ratio on secondary buttons to ≥ 4.5:1",
    "Add descriptive labels to icon-only actions (12 found)",
    "Add ARIA roles for custom tab widgets on Reports page",
    "Improve keyboard navigation order in Payroll Wizard",
    "Add visible focus indicators on Card interactive surfaces",
  ],
};

const DEVICES = [
  { name: "Ultra Wide", w: "2560", icon: Monitor, score: 92, issues: 1 },
  { name: "Desktop", w: "1440", icon: Monitor, score: 96, issues: 0 },
  { name: "Laptop", w: "1280", icon: Monitor, score: 94, issues: 1 },
  { name: "Tablet", w: "768", icon: Tablet, score: 89, issues: 3 },
  { name: "Mobile", w: "390", icon: Smartphone, score: 84, issues: 5 },
  { name: "Foldable", w: "344", icon: Smartphone, score: 78, issues: 6 },
];

const RESPONSIVE_ISSUES = [
  "Mobile navbar overlaps content on scroll (390px)",
  "Table horizontal overflow at 768px — enable card view",
  "Hero image not scaling on ultra-wide displays",
  "Filter chip touch targets < 44px on mobile",
  "Font size 12px used for body on mobile — bump to 14px",
];

const FLOWS = [
  { name: "Authentication", screens: ["Login", "MFA", "Reset"], status: "healthy", depth: 3 },
  { name: "Dashboard → Project", screens: ["Dashboard", "Projects", "Project"], status: "healthy", depth: 3 },
  { name: "Requirements", screens: ["List", "Detail", "Edit", "Review"], status: "warn", depth: 4, note: "Duplicate 'Review' step" },
  { name: "Architecture Review", screens: ["Overview", "Diagram", "Review", "Report"], status: "warn", depth: 4, note: "Loops back to Overview" },
  { name: "Repository Analysis", screens: ["Repo", "Branch", "PR", "Report"], status: "healthy", depth: 4 },
  { name: "Reports", screens: ["Reports", "Detail"], status: "healthy", depth: 2 },
];

const AI_RECS = [
  { area: "Navigation", severity: "high", msg: "Merge 'Architecture Review' and 'Architecture Overview' — cognitive overlap", gain: "22%" },
  { area: "UI", severity: "med", msg: "Standardize spacing scale to 4/8/12/16/24/32", gain: "12%" },
  { area: "Accessibility", severity: "high", msg: "Raise secondary button contrast to 4.5:1", gain: "15%" },
  { area: "Responsive", severity: "med", msg: "Introduce card view for tables below 768px", gain: "18%" },
  { area: "Design System", severity: "low", msg: "3 duplicate Card variants — collapse to 2", gain: "6%" },
  { area: "UX", severity: "med", msg: "Reduce Payroll Wizard from 4 to 3 steps", gain: "18%" },
];

const VERSIONS = [
  { v: "v3.2", designer: "A. Silva", date: "2h", changes: "Refined dashboard, dark tokens", approval: "approved", added: 4, removed: 1 },
  { v: "v3.1", designer: "A. Silva", date: "3d", changes: "New KPI cards + spacing", approval: "approved", added: 6, removed: 2 },
  { v: "v3.0", designer: "M. Chen", date: "1w", changes: "Move to Material 3 tokens", approval: "approved", added: 22, removed: 14 },
  { v: "v2.4", designer: "R. Kapoor", date: "3w", changes: "Payroll wizard rework", approval: "revisions", added: 8, removed: 3 },
  { v: "v2.3", designer: "P. Nair", date: "5w", changes: "Mobile leave approval", approval: "approved", added: 5, removed: 0 },
];

const AI_ACTIONS = [
  "Review Design", "Explain Screen", "Analyze UX", "Analyze Accessibility",
  "Compare Designs", "Suggest Improvements", "Generate UX Report", "Generate UI Report",
  "Explain Components", "Recommend Design Patterns", "Generate User Journey", "Detect Inconsistencies",
];

const INTEGRATIONS = ["Figma", "Adobe XD", "Sketch", "Zeplin", "Storybook", "GitHub", "Jira", "Azure DevOps", "Notion", "Confluence"];

/* ============================================================================
   Component
   ========================================================================= */

function UiUxPage() {
  const { current } = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm your AI Design Consultant. Ask me to review a screen, audit accessibility, compare versions, or generate a UX report." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [uploadQuery, setUploadQuery] = useState("");
  const [uploadFilter, setUploadFilter] = useState<string>("all");

  const projectName = current?.name ?? "AI Software Consultant";

  const filteredUploads = useMemo(
    () => UPLOADS.filter((u) =>
      u.name.toLowerCase().includes(uploadQuery.toLowerCase()) &&
      (uploadFilter === "all" || u.status === uploadFilter),
    ),
    [uploadQuery, uploadFilter],
  );

  const sendChat = (text?: string) => {
    const t = (text ?? chatInput).trim();
    if (!t) return;
    setChat((c) => [
      ...c,
      { role: "user", text: t },
      { role: "ai", text: `Reviewing "${t}"… I'll cross-reference the design system, heuristics and WCAG 2.2 and share findings shortly.` },
    ]);
    setChatInput("");
  };

  return (
    <>
      <PageHeader
        title="UI / UX"
        description="AI Design Consultant — review, audit and govern your product's UI, UX and accessibility."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Upload</Button>
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
              <Field label="Platform" value={PROJECT.platform} />
              <Field label="Design System" value={PROJECT.designSystem} />
              <Field
                label="Review Status"
                value={<Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30">{PROJECT.status}</Badge>}
              />
              <ScoreField label="UI Quality Score" value={PROJECT.ui} />
              <ScoreField label="UX Quality Score" value={PROJECT.ux} />
              <ScoreField label="Accessibility" value={PROJECT.a11y} />
              <ScoreField label="Responsive" value={PROJECT.responsive} />
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <TabsList className="inline-flex w-max min-w-full gap-1">
              {[
                ["overview", "Overview"],
                ["uploads", "Design Uploads"],
                ["system", "Design System"],
                ["ui", "UI Review"],
                ["ux", "UX Review"],
                ["a11y", "Accessibility"],
                ["responsive", "Responsive Analysis"],
                ["flows", "User Flows"],
                ["recs", "AI Recommendations"],
                ["versions", "Design Versioning"],
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
                <CardHeader><CardTitle className="text-base">AI Design Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Enterprise HRMS reviewed across <strong>{PROJECT.screens} screens</strong> and <strong>{PROJECT.components} components</strong>.
                    Design maturity is high with strong branding and hierarchy. Focus areas: typography consistency,
                    Payroll Wizard cognitive load, and mobile touch targets.
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <SummaryCell label="Consistency" value={`${PROJECT.consistency}%`} />
                    <SummaryCell label="Accessibility" value={`${PROJECT.a11y}%`} />
                    <SummaryCell label="Responsive" value={`${PROJECT.responsive}%`} />
                    <SummaryCell label="UI" value={`${PROJECT.ui}%`} />
                    <SummaryCell label="UX" value={`${PROJECT.ux}%`} />
                    <SummaryCell label="Overall" value={`${PROJECT.overall}%`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Integrations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {INTEGRATIONS.slice(0, 6).map((p) => (
                    <div key={p} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><Figma className="h-4 w-4 text-muted-foreground" /> {p}</span>
                      <Badge variant="outline" className={p === "Figma" ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : ""}>
                        {p === "Figma" ? "Connected" : "Available"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UPLOADS */}
          <TabsContent value="uploads" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-72">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={uploadQuery} onChange={(e) => setUploadQuery(e.target.value)} placeholder="Search designs…" className="pl-8" />
              </div>
              <Select value={uploadFilter} onValueChange={setUploadFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="in review">In review</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm"><Figma className="h-4 w-4" /> Connect Figma</Button>
                <Button size="sm"><Upload className="h-4 w-4" /> Upload Design</Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-4">Design</div>
                  <div className="col-span-2">Module</div>
                  <div className="col-span-2">Designer</div>
                  <div className="col-span-1">Version</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Updated</div>
                  <div className="col-span-1">Linked</div>
                </div>
                {filteredUploads.map((u) => (
                  <div key={u.name} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-4">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.type}</div>
                    </div>
                    <div className="col-span-2">{u.module}</div>
                    <div className="col-span-2 text-muted-foreground">{u.designer}</div>
                    <div className="col-span-1 font-mono text-xs">{u.version}</div>
                    <div className="col-span-1"><StatusBadge status={u.status} /></div>
                    <div className="col-span-1 text-xs text-muted-foreground">{u.updated}</div>
                    <div className="col-span-1 flex gap-1">
                      <Badge variant="outline" className="text-[10px]">{u.req}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {["Analyze Design", "Compare Versions", "Extract Components", "Generate Design Summary"].map((a) => (
                <Button key={a} variant="outline" size="sm"><Sparkles className="h-4 w-4" /> {a}</Button>
              ))}
            </div>
          </TabsContent>

          {/* DESIGN SYSTEM */}
          <TabsContent value="system" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">Colors</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {COLORS.map((c) => (
                    <div key={c.role} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <span className={`h-5 w-5 rounded ${c.cls} border`} />
                        {c.role}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{c.hex}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Typography</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {TYPOGRAPHY.map((t) => (
                    <div key={t.role} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><Type className="h-4 w-4 text-muted-foreground" /> {t.role}</span>
                      <span className="font-mono text-xs text-muted-foreground">{t.family} · {t.size} · {t.weight}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Layout</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row k="Grid" v="12 columns · 8pt gutter" />
                  <Row k="Spacing scale" v="4 · 8 · 12 · 16 · 24 · 32 · 48" />
                  <Row k="Radius" v="4 · 8 · 12 · full" />
                  <Row k="Breakpoints" v="sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536" />
                  <Row k="Elevation" v="sm · md · lg · xl (4 tokens)" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Components</CardTitle>
                <Badge variant="outline">DS coverage {PROJECT.dsCoverage}%</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-3">Component</div>
                  <div className="col-span-1">Variants</div>
                  <div className="col-span-2">Usage</div>
                  <div className="col-span-3">Health</div>
                  <div className="col-span-3">AI Issue</div>
                </div>
                {COMPONENTS.map((c) => (
                  <div key={c.name} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-3 flex items-center gap-2"><Component className="h-4 w-4 text-muted-foreground" /> {c.name}</div>
                    <div className="col-span-1">{c.variants}</div>
                    <div className="col-span-2 text-muted-foreground">{c.usage}</div>
                    <div className="col-span-3 flex items-center gap-2"><Progress value={c.health} className="h-1.5 w-24" /> <span className="text-xs">{c.health}%</span></div>
                    <div className="col-span-3 text-xs text-muted-foreground">{c.issue}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {["Component Consistency", "Design Token Usage", "Duplicate Components", "Missing Components"].map((a) => (
                <Button key={a} variant="outline" size="sm"><Sparkles className="h-4 w-4" /> {a}</Button>
              ))}
            </div>
          </TabsContent>

          {/* UI REVIEW */}
          <TabsContent value="ui" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">UI Review Report</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {UI_CHECKS.map((c) => (
                    <div key={c.check} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>{c.check}</span>
                      <Badge variant="outline" className={
                        c.tone === "ok"
                          ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                          : c.tone === "warn"
                          ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
                          : "bg-rose-500/15 text-rose-700 border-rose-500/30"
                      }>{c.score}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">AI Suggestions</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {UI_SUGGESTIONS.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UX REVIEW */}
          <TabsContent value="ux" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {UX_METRICS.map((m) => (
                <MiniStat key={m.label} label={m.label} value={m.value} tone={m.tone as any} />
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">User Flow Analysis</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-5">Flow</div>
                  <div className="col-span-2">Current Steps</div>
                  <div className="col-span-2">Recommended</div>
                  <div className="col-span-3">Est. Improvement</div>
                </div>
                {UX_FLOWS.map((f) => (
                  <div key={f.flow} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-5 flex items-center gap-2"><RouteIcon className="h-4 w-4 text-muted-foreground" /> {f.flow}</div>
                    <div className="col-span-2">{f.steps}</div>
                    <div className="col-span-2">{f.recommend}</div>
                    <div className="col-span-3">
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">▲ {f.gain}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">UX Heuristics (Nielsen)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  {[
                    ["Visibility of system status", "Good"],
                    ["Match between system and real world", "Excellent"],
                    ["User control and freedom", "Needs work"],
                    ["Consistency and standards", "Good"],
                    ["Error prevention", "Good"],
                    ["Recognition over recall", "Excellent"],
                    ["Flexibility and efficiency", "Good"],
                    ["Aesthetic and minimalist", "Excellent"],
                    ["Help users recover from errors", "Needs work"],
                    ["Help and documentation", "Good"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span>{k}</span>
                      <Badge variant="outline" className={v === "Needs work" ? "bg-amber-500/15 text-amber-700 border-amber-500/30" : ""}>{v}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACCESSIBILITY */}
          <TabsContent value="a11y" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Accessibility Score" value={`${A11Y.score}%`} tone="ok" />
              <MiniStat label="Compliance" value={A11Y.compliance.split(" · ")[0]} />
              <MiniStat label="Critical Issues" value={A11Y.critical} tone="bad" />
              <MiniStat label="Passed Checks" value={A11Y.passed} tone="ok" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Accessibility Issues</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {A11Y.issues.map((i, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
                      <SevDot sev={i.sev} />
                      <div className="flex-1">
                        <div>{i.msg}</div>
                        <div className="text-xs text-muted-foreground">{i.where}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">AI Recommendations</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {A11Y.recs.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Accessibility className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RESPONSIVE */}
          <TabsContent value="responsive" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {DEVICES.map((d) => (
                <Card key={d.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{d.name}</div>
                      <d.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-1 font-display text-2xl">{d.score}%</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{d.w}px · {d.issues} issues</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Responsive Findings & Suggestions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {RESPONSIVE_ISSUES.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USER FLOWS */}
          <TabsContent value="flows" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Detected User Flows</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {FLOWS.map((f) => (
                  <div key={f.name} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <GitBranch className="h-4 w-4 text-muted-foreground" /> {f.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Depth {f.depth}</Badge>
                        <Badge variant="outline" className={f.status === "warn" ? "bg-amber-500/15 text-amber-700 border-amber-500/30" : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"}>
                          {f.status === "warn" ? "Needs work" : "Healthy"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      {f.screens.map((s, i) => (
                        <span key={s} className="flex items-center gap-1">
                          <span className="rounded border bg-muted/40 px-2 py-1">{s}</span>
                          {i < f.screens.length - 1 && <ChevronRight className="h-3 w-3" />}
                        </span>
                      ))}
                    </div>
                    {f.note && <div className="mt-2 text-xs text-amber-700">⚠ {f.note}</div>}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Flow Diagnostics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
                  {[
                    ["Broken Flows", 1],
                    ["Missing Screens", 2],
                    ["Dead Ends", 0],
                    ["Unnecessary Steps", 3],
                    ["Looping Navigation", 1],
                  ].map(([k, v]) => (
                    <div key={k as string} className="rounded-md border p-3 text-center">
                      <div className="font-display text-xl">{v as number}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k as string}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI RECOMMENDATIONS */}
          <TabsContent value="recs" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Overall Recommendation</div>
                <div className="mt-1 text-lg font-medium">Navigation complexity is high — merge "Architecture Review" and "Architecture Overview".</div>
                <div className="mt-1 text-sm text-muted-foreground">Estimated usability improvement: <span className="font-medium text-emerald-700">22%</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-2">Area</div>
                  <div className="col-span-2">Severity</div>
                  <div className="col-span-6">Recommendation</div>
                  <div className="col-span-2">Est. Gain</div>
                </div>
                {AI_RECS.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-2">{r.area}</div>
                    <div className="col-span-2"><SeverityBadge sev={r.severity} /></div>
                    <div className="col-span-6">{r.msg}</div>
                    <div className="col-span-2">
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">▲ {r.gain}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* VERSIONING */}
          <TabsContent value="versions" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-1">Version</div>
                  <div className="col-span-2">Designer</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-4">Changes</div>
                  <div className="col-span-2">Approval</div>
                  <div className="col-span-2">Delta</div>
                </div>
                {VERSIONS.map((v) => (
                  <div key={v.v} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-1 font-mono">{v.v}</div>
                    <div className="col-span-2 text-muted-foreground">{v.designer}</div>
                    <div className="col-span-1 text-xs text-muted-foreground">{v.date}</div>
                    <div className="col-span-4">{v.changes}</div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={v.approval === "approved" ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : "bg-amber-500/15 text-amber-700 border-amber-500/30"}>
                        {v.approval}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      <span className="text-emerald-700">+{v.added}</span> · <span className="text-rose-700">−{v.removed}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Version Comparison</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
                <ChangeCell icon={<Component className="h-4 w-4" />} k="Added Components" v="12" tone="ok" />
                <ChangeCell icon={<Component className="h-4 w-4" />} k="Removed Components" v="4" tone="warn" />
                <ChangeCell icon={<Accessibility className="h-4 w-4" />} k="Improved Accessibility" v="+8%" tone="ok" />
                <ChangeCell icon={<Layout className="h-4 w-4" />} k="Layout Changes" v="6 screens" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Consultant Sheet */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> AI Design Consultant</SheetTitle>
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
                placeholder="Ask the design consultant…"
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono text-xs">{v}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    reviewed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    "in review": "bg-amber-500/15 text-amber-700 border-amber-500/30",
    pending: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={`capitalize ${map[status] ?? ""}`}>{status}</Badge>;
}

function SeverityBadge({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    high: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    med: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    low: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  };
  return <Badge variant="outline" className={`capitalize ${map[sev] ?? ""}`}>{sev}</Badge>;
}

function SevDot({ sev }: { sev: string }) {
  const map: Record<string, string> = { high: "bg-rose-500", med: "bg-amber-500", low: "bg-blue-500" };
  return <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${map[sev] ?? "bg-muted-foreground"}`} />;
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

function ChangeCell({ icon, k, v, tone }: { icon: React.ReactNode; k: string; v: string; tone?: "ok" | "warn" }) {
  const cls = tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "";
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">{icon} {k}</div>
      <div className={`mt-1 font-display text-lg ${cls}`}>{v}</div>
    </div>
  );
}
