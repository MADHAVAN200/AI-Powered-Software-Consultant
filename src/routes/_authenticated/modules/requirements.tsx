import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Sparkles, FileText, Plus, Trash2, Wand2, BookOpen, Download, RefreshCw,
  CheckCircle2, AlertTriangle, GitBranch, Users, MessageSquare, ClipboardList,
} from "lucide-react";

import { useCurrentProject } from "@/hooks/use-current-project";

import { PageHeader } from "@/routes/_authenticated/route";
import { EmptyState, StatCard } from "@/components/ui-blocks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  getRequirementsWorkspace, upsertOverview, upsertStakeholder, deleteStakeholder,
  upsertRequirement, deleteRequirement, upsertStory, deleteStory,
  upsertAcceptance, deleteAcceptance, upsertNfr, deleteNfr,
  upsertApproval, addComment,
  aiGenerateOverview, aiGenerateRequirements, aiRequirementToStories,
  aiAcceptanceCriteria, aiFullAnalysis, aiRefineRequirement, exportRequirementsDoc,
} from "@/lib/requirements.functions";

export const Route = createFileRoute("/_authenticated/modules/requirements")({
  component: RequirementsPage,
});

const PRIORITIES = ["critical", "high", "medium", "low"] as const;
const COMPLEXITIES = ["easy", "medium", "hard"] as const;
const BIZ_VALUES = ["high", "medium", "low"] as const;
const STATUSES = ["draft", "review", "approved", "rejected", "implemented"] as const;
const CATEGORIES = ["functional", "non_functional", "business"] as const;
const STORY_STATUSES = ["draft", "ready", "in_progress", "done", "blocked"] as const;
const NFR_CATEGORIES = [
  "performance", "security", "scalability", "availability", "accessibility",
  "localization", "maintainability", "compliance", "monitoring", "logging",
  "backup", "recovery", "encryption",
] as const;
const APPROVAL_STAGES = [
  "business_review", "technical_review", "architecture_review", "qa_review", "client_approval",
] as const;

function priorityBadge(p: string) {
  const cls: Record<string, string> = {
    critical: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
    high: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
    medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
    low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  };
  return <Badge variant="outline" className={cls[p] ?? ""}>{p}</Badge>;
}
function statusBadge(s: string) {
  const cls: Record<string, string> = {
    draft: "bg-muted", review: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    rejected: "bg-red-500/15 text-red-700 dark:text-red-300",
    implemented: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  };
  return <Badge variant="outline" className={cls[s] ?? ""}>{s}</Badge>;
}

function RequirementsPage() {
  const { current, projectId } = useCurrentProject();
  const qc = useQueryClient();
  const getWorkspace = useServerFn(getRequirementsWorkspace);
  const { data, isLoading } = useQuery({
    queryKey: ["requirements-workspace", projectId],
    queryFn: () => (projectId ? getWorkspace({ data: { project_id: projectId } }) : null),
    enabled: !!projectId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["requirements-workspace", projectId] });

  return (
    <>
      <PageHeader
        title="AI Requirements Engineering"
        description="Capture ideas, refine to enterprise-grade requirements, and prepare the SDLC."
      />
      {!projectId ? (
        <div className="px-8 py-8">
          <EmptyState title="Select a project" description="Pick a project to work on its requirements." icon={FileText} />
        </div>
      ) : isLoading || !data ? (
        <div className="px-8 py-8 text-sm text-muted-foreground">Loading workspace…</div>
      ) : (
        <div className="w-full flex-1 px-8 py-6 space-y-6">
          <OverviewHeader data={data} projectName={current?.name ?? ""} />
          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto -mx-1 px-1 pb-1">
              <TabsList className="inline-flex w-max min-w-full gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="stories">User Stories</TabsTrigger>
                <TabsTrigger value="functional">Functional</TabsTrigger>
                <TabsTrigger value="nfr">Non-Functional</TabsTrigger>
                <TabsTrigger value="ac">Acceptance</TabsTrigger>
                <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                <TabsTrigger value="trace">Traceability</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-4"><OverviewTab data={data} projectId={projectId} onChange={invalidate} /></TabsContent>
            <TabsContent value="requirements" className="mt-4"><RequirementsTab data={data} projectId={projectId} onChange={invalidate} /></TabsContent>
            <TabsContent value="stories" className="mt-4"><StoriesTab data={data} projectId={projectId} onChange={invalidate} /></TabsContent>
            <TabsContent value="functional" className="mt-4"><FunctionalTab data={data} /></TabsContent>
            <TabsContent value="nfr" className="mt-4"><NfrTab data={data} projectId={projectId} onChange={invalidate} /></TabsContent>
            <TabsContent value="ac" className="mt-4"><AcceptanceTab data={data} projectId={projectId} onChange={invalidate} /></TabsContent>
            <TabsContent value="ai" className="mt-4"><AnalysisTab data={data} projectId={projectId} onChange={invalidate} /></TabsContent>
            <TabsContent value="trace" className="mt-4"><TraceabilityTab data={data} /></TabsContent>
            <TabsContent value="versions" className="mt-4"><VersionsTab data={data} /></TabsContent>
            <TabsContent value="approvals" className="mt-4"><ApprovalsTab data={data} projectId={projectId} onChange={invalidate} /></TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}

/* ============= HEADER ============= */
function OverviewHeader({ data, projectName }: { data: any; projectName: string }) {
  const ov = data.overview;
  const reqCount = data.requirements.length;
  const storyCount = data.stories.length;
  const approvedPct = reqCount ? Math.round((data.requirements.filter((r: any) => r.status === "approved").length / reqCount) * 100) : 0;
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <StatCard label="Project" value={projectName || "—"} hint={ov?.business_domain ?? "Set overview →"} />
      <StatCard label="Requirements" value={reqCount} hint={`${approvedPct}% approved`} />
      <StatCard label="User stories" value={storyCount} hint={`${data.acceptance_criteria.length} acceptance criteria`} />
      <StatCard label="Progress" value={`${ov?.progress ?? 0}%`} hint={ov?.status ?? "active"} />
    </div>
  );
}

/* ============= OVERVIEW TAB ============= */
function OverviewTab({ data, projectId, onChange }: any) {
  const qc = useQueryClient();
  const save = useServerFn(upsertOverview);
  const aiGen = useServerFn(aiGenerateOverview);
  const addStake = useServerFn(upsertStakeholder);
  const delStake = useServerFn(deleteStakeholder);
  const [brief, setBrief] = useState("");
  const [f, setF] = useState<any>(data.overview ?? {});
  const saveMut = useMutation({
    mutationFn: () => save({ data: { ...f, project_id: projectId } }),
    onSuccess: () => { toast.success("Overview saved"); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });
  const genMut = useMutation({
    mutationFn: () => aiGen({ data: { project_id: projectId, brief } }),
    onSuccess: (r) => { setF(r); toast.success("AI overview generated"); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });

  const F = ({ k, label, textarea = false }: { k: string; label: string; textarea?: boolean }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {textarea ? (
        <Textarea rows={3} value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      ) : (
        <Input value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Project Information</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <F k="client_name" label="Client Name" />
          <F k="business_domain" label="Business Domain" />
          <F k="industry" label="Industry" />
          <F k="project_type" label="Project Type" />
          <F k="expected_users" label="Expected Users" />
          <F k="expected_traffic" label="Expected Traffic" />
          <F k="tech_preference" label="Technology Preference" />
          <F k="methodology" label="Development Methodology" />
          <F k="timeline" label="Timeline" />
          <F k="budget" label="Budget" />
          <F k="risk_level" label="Risk Level" />
          <div className="space-y-1">
            <Label className="text-xs">Priority</Label>
            <Select value={f.priority ?? "medium"} onValueChange={(v) => setF({ ...f, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><F k="problem_statement" label="Problem Statement" textarea /></div>
          <div className="md:col-span-2"><F k="current_challenges" label="Current Challenges" textarea /></div>
          <div className="md:col-span-2"><F k="business_opportunity" label="Business Opportunity" textarea /></div>
          <div className="md:col-span-2"><F k="expected_outcome" label="Expected Outcome" textarea /></div>
          <div className="md:col-span-2"><F k="ai_consultant_summary" label="AI Consultant Summary" textarea /></div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : "Save overview"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Auto-fill</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Textarea rows={6} placeholder="Paste business idea / brief and let AI extract structured fields…" value={brief} onChange={(e) => setBrief(e.target.value)} />
            <Button className="w-full" onClick={() => genMut.mutate()} disabled={genMut.isPending || brief.length < 20}>
              {genMut.isPending ? "Generating…" : "AI Generate Overview"}
            </Button>
          </CardContent>
        </Card>
        <StakeholdersCard data={data} projectId={projectId} addStake={addStake} delStake={delStake} onChange={onChange} />
      </div>
    </div>
  );
}

function StakeholdersCard({ data, projectId, addStake, delStake, onChange }: any) {
  const [role, setRole] = useState(""); const [person, setPerson] = useState(""); const [email, setEmail] = useState("");
  const add = useMutation({
    mutationFn: () => addStake({ data: { project_id: projectId, role, person_name: person, email } }),
    onSuccess: () => { setRole(""); setPerson(""); setEmail(""); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delStake({ data: { id } }),
    onSuccess: () => onChange(),
  });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Stakeholders</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {data.stakeholders.length === 0 && <p className="text-xs text-muted-foreground">No stakeholders yet.</p>}
        {data.stakeholders.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between rounded border p-2 text-sm">
            <div><span className="font-medium">{s.person_name}</span> <span className="text-muted-foreground">— {s.role}</span></div>
            <Button size="icon" variant="ghost" onClick={() => del.mutate(s.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Role (Product Owner)" value={role} onChange={(e) => setRole(e.target.value)} />
          <Input placeholder="Person name" value={person} onChange={(e) => setPerson(e.target.value)} />
          <Input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-2" />
          <Button className="col-span-2" onClick={() => add.mutate()} disabled={!role || !person}>
            <Plus className="h-4 w-4 mr-1" /> Add stakeholder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============= REQUIREMENTS TAB ============= */
function RequirementsTab({ data, projectId, onChange }: any) {
  const upsert = useServerFn(upsertRequirement);
  const del = useServerFn(deleteRequirement);
  const aiGen = useServerFn(aiGenerateRequirements);
  const aiRefine = useServerFn(aiRefineRequirement);
  const exportDoc = useServerFn(exportRequirementsDoc);

  const [editing, setEditing] = useState<any | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [count, setCount] = useState(10);
  const [aiText, setAiText] = useState<string | null>(null);

  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); onChange(); } });
  const aiGenMut = useMutation({
    mutationFn: () => aiGen({ data: { project_id: projectId, brief, count } }),
    onSuccess: (rows) => { toast.success(`Generated ${rows.length} requirements`); setAiOpen(false); setBrief(""); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });
  const exportMut = useMutation({
    mutationFn: (kind: "srs" | "brd") => exportDoc({ data: { project_id: projectId, kind } }),
    onSuccess: (r) => toast.success(`Exported: ${r.title}`),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { setEditing({ project_id: projectId }); setNewOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New Requirement</Button>
        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Sparkles className="h-4 w-4 mr-1" /> AI Generate Requirements</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>AI Generate Requirements</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Textarea rows={6} placeholder="Describe the product, users, workflows, constraints…" value={brief} onChange={(e) => setBrief(e.target.value)} />
              <div className="flex items-center gap-2">
                <Label>Count</Label>
                <Input type="number" min={3} max={25} value={count} onChange={(e) => setCount(parseInt(e.target.value || "10"))} className="w-24" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => aiGenMut.mutate()} disabled={aiGenMut.isPending || brief.length < 20}>
                {aiGenMut.isPending ? "Generating…" : "Generate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={() => exportMut.mutate("srs")}><Download className="h-4 w-4 mr-1" /> Export SRS</Button>
        <Button variant="outline" onClick={() => exportMut.mutate("brd")}><Download className="h-4 w-4 mr-1" /> Export BRD</Button>
      </div>

      {data.requirements.length === 0 ? (
        <EmptyState title="No requirements yet" description="Create one manually or use AI to generate from a brief." icon={FileText} />
      ) : (
        <div className="grid gap-3">
          {data.requirements.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono">{r.code}</Badge>
                  <span className="font-semibold">{r.title}</span>
                  {priorityBadge(r.priority)}
                  {statusBadge(r.status)}
                  <Badge variant="outline">{r.category}</Badge>
                  {r.module && <Badge variant="outline">📦 {r.module}</Badge>}
                  <span className="ml-auto text-xs text-muted-foreground">v{r.version} · {r.complexity} · value {r.business_value}</span>
                </div>
                {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setNewOpen(true); }}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => delMut.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  <Separator orientation="vertical" className="h-6" />
                  <AiActionButton label="Improve" action="improve" reqId={r.id} aiRefine={aiRefine} onResult={setAiText} />
                  <AiActionButton label="Simplify" action="simplify" reqId={r.id} aiRefine={aiRefine} onResult={setAiText} />
                  <AiActionButton label="Estimate" action="estimate" reqId={r.id} aiRefine={aiRefine} onResult={setAiText} />
                  <AiActionButton label="Detect Missing" action="detect_missing" reqId={r.id} aiRefine={aiRefine} onResult={setAiText} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={newOpen} onOpenChange={setNewOpen}>
        <SheetContent side="right" className="w-full sm:!max-w-[50vw] overflow-y-auto p-6">
          <SheetHeader className="mb-4"><SheetTitle>{editing?.id ? "Edit" : "New"} requirement</SheetTitle></SheetHeader>
          <RequirementForm
            initial={editing}
            onSave={async (payload) => {
              const upsertFn = upsert;
              await upsertFn({ data: { ...payload, project_id: projectId } });
              toast.success("Saved");
              setNewOpen(false);
              onChange();
            }}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={!!aiText} onOpenChange={() => setAiText(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>AI Suggestion</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh] whitespace-pre-wrap text-sm">{aiText}</ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AiActionButton({ label, action, reqId, aiRefine, onResult }: any) {
  const [pending, setPending] = useState(false);
  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={async () => {
      setPending(true);
      try { const r = await aiRefine({ data: { requirement_id: reqId, action } }); onResult(r.text); }
      catch (e: any) { toast.error(e.message); }
      finally { setPending(false); }
    }}>
      <Wand2 className="h-3 w-3 mr-1" /> {label}
    </Button>
  );
}

function RequirementForm({ initial, onSave }: { initial: any; onSave: (v: any) => Promise<void> }) {
  const [v, setV] = useState<any>(initial ?? {});
  const [saving, setSaving] = useState(false);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2 space-y-1"><Label>Title *</Label><Input value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></div>
      <div className="md:col-span-2 space-y-1"><Label>Description</Label><Textarea rows={3} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      <SelectField label="Priority" value={v.priority ?? "medium"} options={PRIORITIES as any} onChange={(x) => setV({ ...v, priority: x })} />
      <SelectField label="Complexity" value={v.complexity ?? "medium"} options={COMPLEXITIES as any} onChange={(x) => setV({ ...v, complexity: x })} />
      <SelectField label="Business Value" value={v.business_value ?? "medium"} options={BIZ_VALUES as any} onChange={(x) => setV({ ...v, business_value: x })} />
      <SelectField label="Status" value={v.status ?? "draft"} options={STATUSES as any} onChange={(x) => setV({ ...v, status: x })} />
      <SelectField label="Category" value={v.category ?? "functional"} options={CATEGORIES as any} onChange={(x) => setV({ ...v, category: x })} />
      <div className="space-y-1"><Label>Module</Label><Input value={v.module ?? ""} onChange={(e) => setV({ ...v, module: e.target.value })} /></div>
      <div className="md:col-span-2 space-y-1"><Label>Business Rule</Label><Textarea rows={2} value={v.business_rule ?? ""} onChange={(e) => setV({ ...v, business_rule: e.target.value })} /></div>
      <div className="space-y-1"><Label>Inputs</Label><Textarea rows={2} value={v.inputs ?? ""} onChange={(e) => setV({ ...v, inputs: e.target.value })} /></div>
      <div className="space-y-1"><Label>Outputs</Label><Textarea rows={2} value={v.outputs ?? ""} onChange={(e) => setV({ ...v, outputs: e.target.value })} /></div>
      <div className="md:col-span-2 space-y-1"><Label>Validation</Label><Textarea rows={2} value={v.validation ?? ""} onChange={(e) => setV({ ...v, validation: e.target.value })} /></div>
      <div className="md:col-span-2 flex justify-end">
        <Button disabled={saving || !v.title} onClick={async () => { setSaving(true); try { await onSave(v); } finally { setSaving(false); } }}>Save requirement</Button>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

/* ============= STORIES TAB ============= */
function StoriesTab({ data, projectId, onChange }: any) {
  const upsert = useServerFn(upsertStory);
  const del = useServerFn(deleteStory);
  const aiConvert = useServerFn(aiRequirementToStories);
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<any>({});
  const [selectedReq, setSelectedReq] = useState<string>("");

  const save = useMutation({ mutationFn: () => upsert({ data: { ...v, project_id: projectId } }), onSuccess: () => { toast.success("Saved"); setOpen(false); onChange(); }, onError: (e: any) => toast.error(e.message) });
  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: onChange });
  const convertMut = useMutation({
    mutationFn: (rid: string) => aiConvert({ data: { requirement_id: rid } }),
    onSuccess: (rows) => { toast.success(`Generated ${rows.length} stories`); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <Button onClick={() => { setV({}); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New Story</Button>
        <div className="flex items-end gap-2">
          <div className="min-w-[240px]">
            <Label className="text-xs">Convert requirement → stories</Label>
            <Select value={selectedReq} onValueChange={setSelectedReq}>
              <SelectTrigger><SelectValue placeholder="Pick a requirement" /></SelectTrigger>
              <SelectContent>{data.requirements.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.code} — {r.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button disabled={!selectedReq || convertMut.isPending} onClick={() => convertMut.mutate(selectedReq)}>
            <Sparkles className="h-4 w-4 mr-1" /> AI Convert
          </Button>
        </div>
      </div>

      {data.stories.length === 0 ? (
        <EmptyState title="No user stories" description="Add stories manually or generate from a requirement." icon={ClipboardList} />
      ) : (
        <div className="grid gap-3">
          {data.stories.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono">{s.code}</Badge>
                  {priorityBadge(s.priority)}
                  <Badge variant="outline">{s.status}</Badge>
                  {s.story_points != null && <Badge variant="outline">{s.story_points} pts</Badge>}
                  {s.sprint && <Badge variant="outline">Sprint: {s.sprint}</Badge>}
                  {s.epic && <Badge variant="outline">Epic: {s.epic}</Badge>}
                  <Button size="icon" variant="ghost" className="ml-auto" onClick={() => delMut.mutate(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <p className="text-sm">
                  <span className="font-medium">As a</span> {s.as_role}, <span className="font-medium">I want</span> {s.i_want}
                  {s.so_that && <>, <span className="font-medium">so that</span> {s.so_that}</>}.
                </p>
                {s.risk && <p className="text-xs text-orange-600">Risk: {s.risk}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:!max-w-[50vw] overflow-y-auto p-6">
          <SheetHeader className="mb-4"><SheetTitle>New user story</SheetTitle></SheetHeader>
          <div className="grid gap-3">
            <div className="space-y-1"><Label>Link to requirement (optional)</Label>
              <Select value={v.requirement_id ?? ""} onValueChange={(x) => setV({ ...v, requirement_id: x })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>{data.requirements.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.code} — {r.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>As a role *</Label><Input value={v.as_role ?? ""} onChange={(e) => setV({ ...v, as_role: e.target.value })} /></div>
            <div className="space-y-1"><Label>I want *</Label><Textarea rows={2} value={v.i_want ?? ""} onChange={(e) => setV({ ...v, i_want: e.target.value })} /></div>
            <div className="space-y-1"><Label>So that</Label><Textarea rows={2} value={v.so_that ?? ""} onChange={(e) => setV({ ...v, so_that: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <SelectField label="Priority" value={v.priority ?? "medium"} options={PRIORITIES as any} onChange={(x) => setV({ ...v, priority: x })} />
              <SelectField label="Status" value={v.status ?? "draft"} options={STORY_STATUSES as any} onChange={(x) => setV({ ...v, status: x })} />
              <div className="space-y-1"><Label>Story Points</Label><Input type="number" value={v.story_points ?? ""} onChange={(e) => setV({ ...v, story_points: parseInt(e.target.value || "0") })} /></div>
              <div className="space-y-1"><Label>Sprint</Label><Input value={v.sprint ?? ""} onChange={(e) => setV({ ...v, sprint: e.target.value })} /></div>
              <div className="space-y-1"><Label>Epic</Label><Input value={v.epic ?? ""} onChange={(e) => setV({ ...v, epic: e.target.value })} /></div>
              <div className="space-y-1"><Label>Risk</Label><Input value={v.risk ?? ""} onChange={(e) => setV({ ...v, risk: e.target.value })} /></div>
            </div>
          </div>
          <div className="mt-4 flex justify-end"><Button disabled={save.isPending || !v.as_role || !v.i_want} onClick={() => save.mutate()}>Save story</Button></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ============= FUNCTIONAL TAB (grouped by module) ============= */
function FunctionalTab({ data }: any) {
  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const r of data.requirements) {
      if (r.category === "non_functional") continue;
      const m = r.module || "Uncategorized";
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(r);
    }
    return Array.from(map.entries());
  }, [data.requirements]);

  if (grouped.length === 0) return <EmptyState title="No functional requirements" description="Assign a module to your requirements to see them grouped here." icon={FileText} />;
  return (
    <div className="grid gap-4">
      {grouped.map(([module, items]) => (
        <Card key={module}>
          <CardHeader><CardTitle className="text-base">{module} <Badge variant="secondary" className="ml-2">{items.length}</Badge></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {items.map((r) => (
              <div key={r.id} className="rounded border p-3 text-sm">
                <div className="flex items-center gap-2"><Badge variant="secondary" className="font-mono">{r.code}</Badge><span className="font-medium">{r.title}</span>{priorityBadge(r.priority)}</div>
                {r.description && <p className="text-muted-foreground mt-1">{r.description}</p>}
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {r.inputs && <div><strong>Inputs:</strong> {r.inputs}</div>}
                  {r.outputs && <div><strong>Outputs:</strong> {r.outputs}</div>}
                  {r.business_rule && <div className="col-span-2"><strong>Rule:</strong> {r.business_rule}</div>}
                  {r.validation && <div className="col-span-2"><strong>Validation:</strong> {r.validation}</div>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ============= NFR TAB ============= */
function NfrTab({ data, projectId, onChange }: any) {
  const upsert = useServerFn(upsertNfr);
  const del = useServerFn(deleteNfr);
  const [v, setV] = useState<any>({ category: "performance" });
  const save = useMutation({ mutationFn: () => upsert({ data: { ...v, project_id: projectId } }), onSuccess: () => { toast.success("Saved"); setV({ category: "performance" }); onChange(); }, onError: (e: any) => toast.error(e.message) });
  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: onChange });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Non-Functional Requirements</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.nfrs.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
          {data.nfrs.map((n: any) => (
            <div key={n.id} className="flex items-center justify-between rounded border p-3 text-sm">
              <div>
                <div className="flex items-center gap-2"><Badge variant="outline">{n.category}</Badge><span className="font-medium">{n.metric}</span>{n.target_value && <Badge variant="secondary">{n.target_value}</Badge>}</div>
                {n.description && <p className="text-xs text-muted-foreground mt-1">{n.description}</p>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => delMut.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Add NFR</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <SelectField label="Category" value={v.category} options={NFR_CATEGORIES as any} onChange={(x) => setV({ ...v, category: x })} />
          <div className="space-y-1"><Label>Metric</Label><Input placeholder="Response time" value={v.metric ?? ""} onChange={(e) => setV({ ...v, metric: e.target.value })} /></div>
          <div className="space-y-1"><Label>Target value</Label><Input placeholder="< 200ms" value={v.target_value ?? ""} onChange={(e) => setV({ ...v, target_value: e.target.value })} /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea rows={2} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
          <Button className="w-full" onClick={() => save.mutate()} disabled={!v.metric}><Plus className="h-4 w-4 mr-1" /> Add NFR</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============= ACCEPTANCE CRITERIA TAB ============= */
function AcceptanceTab({ data, projectId, onChange }: any) {
  const upsert = useServerFn(upsertAcceptance);
  const del = useServerFn(deleteAcceptance);
  const aiAc = useServerFn(aiAcceptanceCriteria);
  const [v, setV] = useState<any>({});
  const save = useMutation({ mutationFn: () => upsert({ data: { ...v, project_id: projectId } }), onSuccess: () => { setV({}); toast.success("Saved"); onChange(); }, onError: (e: any) => toast.error(e.message) });
  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: onChange });
  const aiMut = useMutation({
    mutationFn: (rid: string) => aiAc({ data: { requirement_id: rid } }),
    onSuccess: (rows) => { toast.success(`Generated ${rows.length} criteria`); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Acceptance Criteria (Given / When / Then)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.acceptance_criteria.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
          {data.acceptance_criteria.map((c: any) => {
            const req = data.requirements.find((r: any) => r.id === c.requirement_id);
            return (
              <div key={c.id} className="rounded border p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">{req && <Badge variant="secondary" className="font-mono">{req.code}</Badge>}
                  <Button size="icon" variant="ghost" className="ml-auto" onClick={() => delMut.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <p><strong>Given</strong> {c.given_text}</p>
                <p><strong>When</strong> {c.when_text}</p>
                <p><strong>Then</strong> {c.then_text}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Add criterion</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1"><Label>Requirement</Label>
              <Select value={v.requirement_id ?? ""} onValueChange={(x) => setV({ ...v, requirement_id: x })}>
                <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>{data.requirements.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.code} — {r.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Given</Label><Textarea rows={2} value={v.given_text ?? ""} onChange={(e) => setV({ ...v, given_text: e.target.value })} /></div>
            <div className="space-y-1"><Label>When</Label><Textarea rows={2} value={v.when_text ?? ""} onChange={(e) => setV({ ...v, when_text: e.target.value })} /></div>
            <div className="space-y-1"><Label>Then</Label><Textarea rows={2} value={v.then_text ?? ""} onChange={(e) => setV({ ...v, then_text: e.target.value })} /></div>
            <Button className="w-full" onClick={() => save.mutate()} disabled={!v.given_text || !v.when_text || !v.then_text}>Save</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Generate</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Pick a requirement to auto-generate 3-5 Gherkin criteria.</p>
            {data.requirements.slice(0, 8).map((r: any) => (
              <Button key={r.id} variant="outline" size="sm" className="w-full justify-start" disabled={aiMut.isPending} onClick={() => aiMut.mutate(r.id)}>
                <Sparkles className="h-3 w-3 mr-1" /> {r.code} — {r.title}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============= AI ANALYSIS TAB ============= */
function AnalysisTab({ data, projectId, onChange }: any) {
  const run = useServerFn(aiFullAnalysis);
  const runMut = useMutation({
    mutationFn: () => run({ data: { project_id: projectId } }),
    onSuccess: () => { toast.success("Analysis complete"); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });
  const a = data.analysis;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">AI Consultant Analysis</h3>
          <p className="text-xs text-muted-foreground">Deep review of quality, completeness, conflicts, missing items, effort, tech and architecture.</p>
        </div>
        <Button onClick={() => runMut.mutate()} disabled={runMut.isPending || data.requirements.length === 0}>
          <RefreshCw className={`h-4 w-4 mr-1 ${runMut.isPending ? "animate-spin" : ""}`} /> {a ? "Re-run" : "Run analysis"}
        </Button>
      </div>
      {!a ? (
        <EmptyState title="No analysis yet" description="Add requirements and run AI analysis." icon={Sparkles} />
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <ScoreCard label="Quality Score" value={a.quality_score} />
            <ScoreCard label="Completeness" value={a.completeness_score} />
            <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Architecture</div><div className="font-display text-lg mt-1">{a.architecture_recommendation}</div></CardContent></Card>
          </div>
          <AnalysisList title="Ambiguities" items={a.ambiguities} render={(x: any) => (<><strong>{x.text}</strong><div className="text-xs text-muted-foreground">→ {x.recommendation}</div></>)} icon={AlertTriangle} />
          <AnalysisList title="Conflicts" items={a.conflicts} render={(x: any) => (<><strong>{x.a} vs {x.b}</strong><div className="text-xs text-muted-foreground">{x.reason}</div></>)} icon={AlertTriangle} />
          <AnalysisList title="Duplicates" items={a.duplicates} render={(x: any) => (<><strong>{(x.codes || []).join(", ")}</strong><div className="text-xs text-muted-foreground">{x.reason}</div></>)} icon={AlertTriangle} />
          <Card>
            <CardHeader><CardTitle className="text-base">Missing Requirements</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(a.missing_items ?? []).map((m: string, i: number) => <Badge key={i} variant="outline">{m}</Badge>)}
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Business Impact</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                {Object.entries(a.business_impact ?? {}).map(([k, v]) => <div key={k}><strong className="capitalize">{k.replace(/_/g, " ")}:</strong> {v as string}</div>)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Effort Estimation</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                {Object.entries(a.effort_estimation ?? {}).map(([k, v]) => <div key={k}><strong className="capitalize">{k}:</strong> {v as string}</div>)}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Tech Suggestions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">{(a.tech_suggestions ?? []).map((t: string, i: number) => <Badge key={i}>{t}</Badge>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Risks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(a.risks ?? []).map((r: any, i: number) => (
                <div key={i} className="rounded border p-2 text-sm">
                  <div className="flex items-center gap-2"><Badge variant="outline">{r.area}</Badge><Badge>{r.severity}</Badge></div>
                  <p className="mt-1">{r.description}</p>
                  <p className="text-xs text-muted-foreground mt-1"><strong>Mitigation:</strong> {r.mitigation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1">{value ?? 0}<span className="text-sm text-muted-foreground">/100</span></div>
      <Progress value={value ?? 0} className="mt-2 h-2" />
    </CardContent></Card>
  );
}
function AnalysisList({ title, items, render, icon: Icon }: any) {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4" /> {title} <Badge variant="secondary">{items.length}</Badge></CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((x: any, i: number) => <div key={i} className="rounded border p-2 text-sm">{render(x)}</div>)}
      </CardContent>
    </Card>
  );
}

/* ============= TRACEABILITY TAB ============= */
function TraceabilityTab({ data }: any) {
  if (data.requirements.length === 0) return <EmptyState title="Nothing to trace" description="Add requirements first." icon={GitBranch} />;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Traceability Matrix</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b"><th className="text-left p-2">Requirement</th><th className="text-left p-2">User Stories</th><th className="text-left p-2">Acceptance</th><th className="text-left p-2">Status</th></tr>
            </thead>
            <tbody>
              {data.requirements.map((r: any) => {
                const stories = data.stories.filter((s: any) => s.requirement_id === r.id);
                const ac = data.acceptance_criteria.filter((c: any) => c.requirement_id === r.id);
                return (
                  <tr key={r.id} className="border-b align-top">
                    <td className="p-2"><div className="flex items-center gap-2"><Badge variant="secondary" className="font-mono">{r.code}</Badge><span>{r.title}</span></div></td>
                    <td className="p-2">{stories.length === 0 ? "—" : stories.map((s: any) => <div key={s.id}><Badge variant="outline" className="font-mono mr-1">{s.code}</Badge></div>)}</td>
                    <td className="p-2">{ac.length === 0 ? "—" : `${ac.length} criteria`}</td>
                    <td className="p-2">{statusBadge(r.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============= VERSIONS TAB ============= */
function VersionsTab({ data }: any) {
  if (data.versions.length === 0) return <EmptyState title="No versions yet" description="Editing a requirement snapshots the previous version automatically." icon={GitBranch} />;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Requirement Versions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {data.versions.map((v: any) => (
          <div key={v.id} className="rounded border p-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">{v.snapshot?.code}</Badge>
              <Badge>v{v.version}</Badge>
              <span className="text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
            </div>
            <div className="mt-1"><strong>{v.snapshot?.title}</strong></div>
            {v.change_summary && <div className="text-xs text-muted-foreground">{v.change_summary}</div>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ============= APPROVALS TAB ============= */
function ApprovalsTab({ data, projectId, onChange }: any) {
  const upsert = useServerFn(upsertApproval);
  const [v, setV] = useState<any>({ stage: "business_review", status: "pending" });
  const save = useMutation({ mutationFn: () => upsert({ data: { ...v, project_id: projectId } }), onSuccess: () => { setV({ stage: "business_review", status: "pending" }); toast.success("Saved"); onChange(); }, onError: (e: any) => toast.error(e.message) });
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Approval Workflow</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-3">
            {APPROVAL_STAGES.map((s) => (<Badge key={s} variant="outline">{s.replace(/_/g, " ")}</Badge>))}
          </div>
          {data.approvals.length === 0 && <p className="text-sm text-muted-foreground">No approval records yet.</p>}
          {data.approvals.map((a: any) => {
            const req = data.requirements.find((r: any) => r.id === a.requirement_id);
            return (
              <div key={a.id} className="rounded border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{a.stage.replace(/_/g, " ")}</Badge>
                  <Badge>{a.status}</Badge>
                  {req && <Badge variant="secondary" className="font-mono">{req.code}</Badge>}
                  <span className="ml-auto text-xs text-muted-foreground">{a.reviewer_name ?? "—"}</span>
                </div>
                {a.comments && <p className="mt-1 text-muted-foreground">{a.comments}</p>}
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Record Approval</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1"><Label>Requirement</Label>
            <Select value={v.requirement_id ?? ""} onValueChange={(x) => setV({ ...v, requirement_id: x })}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>{data.requirements.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.code} — {r.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <SelectField label="Stage" value={v.stage} options={APPROVAL_STAGES as any} onChange={(x) => setV({ ...v, stage: x })} />
          <SelectField label="Status" value={v.status} options={["pending", "approved", "rejected", "changes_requested"]} onChange={(x) => setV({ ...v, status: x })} />
          <div className="space-y-1"><Label>Reviewer name</Label><Input value={v.reviewer_name ?? ""} onChange={(e) => setV({ ...v, reviewer_name: e.target.value })} /></div>
          <div className="space-y-1"><Label>Comments</Label><Textarea rows={2} value={v.comments ?? ""} onChange={(e) => setV({ ...v, comments: e.target.value })} /></div>
          <Button className="w-full" onClick={() => save.mutate()}><CheckCircle2 className="h-4 w-4 mr-1" /> Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
