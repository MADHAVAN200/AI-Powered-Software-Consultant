import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  BookOpen, Plus, Sparkles, Wand2, Trash2, Download, MessageSquare, ShieldCheck,
  GitBranch, FileText, RotateCcw, CheckCircle2, AlertTriangle, ClipboardList,
  Layers, Boxes, Database, Plug, Users, Bot, Search,
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
  getDocumentationWorkspace, upsertDocument, deleteDocument, addDocComment,
  upsertDocApproval, restoreDocVersion, aiGenerateDocument, aiReviewDocument,
  createFromTemplate,
} from "@/lib/documentation.functions";

export const Route = createFileRoute("/_authenticated/modules/documentation")({
  component: DocumentationPage,
});

const CATEGORIES = [
  "business", "technical", "architecture", "api", "database",
  "user", "ai", "testing", "deployment", "operations", "compliance",
] as const;
type Category = (typeof CATEGORIES)[number];

const STATUSES = ["draft", "in_review", "approved", "needs_update", "archived"] as const;
type Status = (typeof STATUSES)[number];

const CATEGORY_ICON: Record<Category, typeof BookOpen> = {
  business: ClipboardList, technical: FileText, architecture: Boxes,
  api: Plug, database: Database, user: Users, ai: Bot, testing: ShieldCheck,
  deployment: Layers, operations: GitBranch, compliance: ShieldCheck,
};

function statusBadge(s: Status | string) {
  const cls: Record<string, string> = {
    draft: "bg-muted text-foreground",
    in_review: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    needs_update: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    archived: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={cls[s] ?? ""}>{s.replace("_", " ")}</Badge>;
}

type Doc = {
  id: string; project_id: string; category: Category; doc_type: string;
  title: string; summary: string | null; content_md: string | null;
  status: Status; current_version: number;
  ai_quality_score: number | null; ai_grammar_score: number | null;
  ai_completeness_score: number | null; ai_technical_score: number | null;
  tags: string[] | null; updated_at: string; created_at: string;
};

function DocumentationPage() {
  const { current, projectId } = useCurrentProject();
  const qc = useQueryClient();
  const load = useServerFn(getDocumentationWorkspace);
  const { data, isLoading } = useQuery({
    queryKey: ["docs", projectId],
    queryFn: () => load({ data: { project_id: projectId! } }),
    enabled: !!projectId,
  });

  const documents = (data?.documents ?? []) as Doc[];
  const versions = data?.versions ?? [];
  const comments = data?.comments ?? [];
  const reviews = data?.reviews ?? [];
  const approvals = data?.approvals ?? [];
  const templates = data?.templates ?? [];

  const stats = useMemo(() => {
    const total = documents.length;
    const approved = documents.filter((d) => d.status === "approved").length;
    const inReview = documents.filter((d) => d.status === "in_review").length;
    const drafts = documents.filter((d) => d.status === "draft").length;
    const needsUpdate = documents.filter((d) => d.status === "needs_update").length;
    const scored = documents.filter((d) => d.ai_quality_score != null);
    const avgScore = scored.length
      ? Math.round(scored.reduce((a, d) => a + (d.ai_quality_score ?? 0), 0) / scored.length)
      : null;
    const coverage = total ? Math.round((approved / Math.max(total, 1)) * 100) : 0;
    return { total, approved, inReview, drafts, needsUpdate, avgScore, coverage };
  }, [documents]);

  const byCategory = useMemo(() => {
    const m = Object.fromEntries(CATEGORIES.map((c) => [c, [] as Doc[]])) as Record<Category, Doc[]>;
    documents.forEach((d) => { m[d.category]?.push(d); });
    return m;
  }, [documents]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["docs", projectId] });

  const upsertFn = useServerFn(upsertDocument);
  const deleteFn = useServerFn(deleteDocument);
  const aiGenFn = useServerFn(aiGenerateDocument);
  const aiRevFn = useServerFn(aiReviewDocument);
  const restoreFn = useServerFn(restoreDocVersion);
  const templateFn = useServerFn(createFromTemplate);
  const commentFn = useServerFn(addDocComment);
  const approvalFn = useServerFn(upsertDocApproval);

  const aiGen = useMutation({
    mutationFn: aiGenFn,
    onSuccess: () => { toast.success("AI generated document"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const aiReview = useMutation({
    mutationFn: aiRevFn,
    onSuccess: () => { toast.success("Review complete"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => { toast.success("Deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const save = useMutation({
    mutationFn: upsertFn,
    onSuccess: () => { toast.success("Saved"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const restore = useMutation({
    mutationFn: restoreFn,
    onSuccess: () => { toast.success("Version restored"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const fromTemplate = useMutation({
    mutationFn: templateFn,
    onSuccess: () => { toast.success("Document created from template"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const addComment = useMutation({
    mutationFn: commentFn,
    onSuccess: () => { toast.success("Comment added"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const upsertAppr = useMutation({
    mutationFn: approvalFn,
    onSuccess: () => { toast.success("Approval updated"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const selectedDoc = documents.find((d: any) => d.id === selectedDocId) ?? null;

  return (
    <>
      <PageHeader
        title="Documentation"
        description="AI-powered documentation lifecycle: generate, review, version, and approve."
      />

      {!projectId ? (
        <div className="px-8 py-8">
          <EmptyState icon={BookOpen} title="Select a project" description="Choose a project to view its documentation workspace." />
        </div>
      ) : isLoading ? (
        <div className="px-8 py-8 text-sm text-muted-foreground">Loading documentation…</div>
      ) : (
        <div className="w-full flex-1 px-8 py-6 space-y-6">
          {/* Project Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <InfoTile label="Project" value={current?.name ?? "—"} />
                <InfoTile label="Progress" value={`${stats.coverage}%`} />
                <InfoTile label="Status" value={stats.approved > 0 ? "Active" : "Setup"} />
                <InfoTile label="Last Updated" value={documents[0]?.updated_at ? new Date(documents.reduce((a, d) => (d.updated_at > a ? d.updated_at : a), documents[0].updated_at)).toLocaleDateString() : "—"} />
                <InfoTile label="Version" value={documents.length ? `v${Math.max(...documents.map((d) => d.current_version))}` : "—"} />
                <InfoTile label="Pending Reviews" value={String(stats.inReview)} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto -mx-1 px-1 pb-1">
              <TabsList className="inline-flex w-max min-w-full gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="ai">AI Docs</TabsTrigger>
                <TabsTrigger value="review">Review Center</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="versions">Version History</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
                <StatCard label="Total" value={stats.total} />
                <StatCard label="Approved" value={stats.approved} />
                <StatCard label="Under Review" value={stats.inReview} />
                <StatCard label="Drafts" value={stats.drafts} />
                <StatCard label="Needs Update" value={stats.needsUpdate} />
                <StatCard label="Coverage" value={`${stats.coverage}%`} />
                <StatCard label="AI Score" value={stats.avgScore != null ? `${stats.avgScore}/100` : "—"} />
                <StatCard label="Reviews" value={reviews.length} />
              </div>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Documentation Categories</CardTitle></CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {CATEGORIES.map((c) => {
                    const list = byCategory[c] ?? [];
                    const Icon = CATEGORY_ICON[c];
                    const pct = list.length === 0 ? 0 : Math.round((list.filter((d) => d.status === "approved").length / list.length) * 100);
                    return (
                      <div key={c} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium capitalize"><Icon className="h-4 w-4 opacity-70" />{c}</div>
                          <span className="text-xs text-muted-foreground">{list.length} docs</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                        <div className="mt-1 text-[11px] text-muted-foreground">{pct}% approved</div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">AI Insights</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {stats.total === 0 ? (
                    <div className="text-muted-foreground">No documents yet. Use AI Generate or create from a template to start.</div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Documentation is <b>{stats.coverage}%</b> approved.</div>
                      {stats.needsUpdate > 0 && (
                        <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> {stats.needsUpdate} document(s) marked as needing an update.</div>
                      )}
                      {stats.avgScore != null && stats.avgScore < 75 && (
                        <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Average AI quality score is {stats.avgScore}/100 — consider running a Review pass.</div>
                      )}
                      {(byCategory.api?.length ?? 0) === 0 && (
                        <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> No API documentation found.</div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Category tabs */}
            {(["business", "technical", "api", "database", "user", "ai"] as Category[]).map((cat) => (
              <TabsContent key={cat} value={cat} className="space-y-3">
                <CategoryPanel
                  category={cat}
                  projectId={projectId}
                  docs={byCategory[cat] ?? []}
                  onGenerate={(payload) => aiGen.mutate({ data: payload })}
                  onNew={(payload) => save.mutate({ data: payload })}
                  onReview={(id) => aiReview.mutate({ data: { document_id: id } })}
                  onDelete={(id) => del.mutate({ data: { id } })}
                  onOpen={(id) => setSelectedDocId(id)}
                  onStatus={(doc, status) => save.mutate({ data: { id: doc.id, project_id: doc.project_id, category: doc.category, doc_type: doc.doc_type, title: doc.title, content_md: doc.content_md ?? "", status, change_summary: `Status → ${status}` } })}
                  generating={aiGen.isPending}
                />
              </TabsContent>
            ))}

            {/* Review Center */}
            <TabsContent value="review" className="space-y-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Review Center</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {documents.length === 0 ? (
                    <EmptyState icon={ShieldCheck} title="No documents" description="Create documents to review them here." />
                  ) : (
                    <div className="space-y-2">
                      {documents.map((d) => {
                        const rev = reviews.find((r: any) => r.document_id === d.id);
                        return (
                          <div key={d.id} className="rounded-lg border p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium">{d.title} <span className="text-xs text-muted-foreground">· {d.doc_type}</span></div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  {statusBadge(d.status)}
                                  {d.ai_quality_score != null && <span>Overall {d.ai_quality_score}</span>}
                                  {d.ai_grammar_score != null && <span>· Grammar {d.ai_grammar_score}</span>}
                                  {d.ai_completeness_score != null && <span>· Completeness {d.ai_completeness_score}</span>}
                                  {d.ai_technical_score != null && <span>· Technical {d.ai_technical_score}</span>}
                                </div>
                                {rev?.summary && <div className="mt-2 text-xs text-muted-foreground">{rev.summary}</div>}
                                {rev?.missing_sections && rev.missing_sections.length > 0 && (
                                  <div className="mt-1 text-xs">Missing: {rev.missing_sections.join(", ")}</div>
                                )}
                              </div>
                              <Button size="sm" variant="outline" onClick={() => aiReview.mutate({ data: { document_id: d.id } })} disabled={aiReview.isPending} className="gap-1">
                                <Wand2 className="h-3.5 w-3.5" /> Review with AI
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates */}
            <TabsContent value="templates" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((t: any) => (
                  <Card key={t.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>{t.title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">{t.category}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                      <Button size="sm" variant="secondary" className="w-full gap-1"
                        onClick={() => fromTemplate.mutate({ data: { project_id: projectId, template_id: t.id } })}
                        disabled={fromTemplate.isPending}>
                        <Plus className="h-3.5 w-3.5" /> Create from template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Version History */}
            <TabsContent value="versions" className="space-y-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Version History</CardTitle></CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <EmptyState icon={GitBranch} title="No versions yet" description="Versions are captured automatically on every edit." />
                  ) : (
                    <div className="space-y-2">
                      {versions.map((v: any) => {
                        const doc = documents.find((d: any) => d.id === v.document_id);
                        return (
                          <div key={v.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                            <div className="min-w-0 text-sm">
                              <div className="font-medium">{v.title} <span className="text-xs text-muted-foreground">v{v.version}</span></div>
                              <div className="text-xs text-muted-foreground">{doc?.doc_type ?? "—"} · {new Date(v.created_at).toLocaleString()}</div>
                              {v.change_summary && <div className="mt-1 text-xs">{v.change_summary}</div>}
                            </div>
                            <Button size="sm" variant="ghost" className="gap-1"
                              onClick={() => restore.mutate({ data: { version_id: v.id } })} disabled={restore.isPending}>
                              <RotateCcw className="h-3.5 w-3.5" /> Restore
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {selectedDoc && (
            <DocDetail
              doc={selectedDoc}
              onClose={() => setSelectedDocId(null)}
              comments={comments.filter((c: any) => c.document_id === selectedDoc.id)}
              approvals={approvals.filter((a: any) => a.document_id === selectedDoc.id)}
              onSave={(payload) => save.mutate({ data: { ...payload, id: selectedDoc.id } })}
              onComment={(body, author) => addComment.mutate({ data: { document_id: selectedDoc.id, project_id: selectedDoc.project_id, author_name: author, body } })}
              onApproval={(stage, approver, status, notes) => upsertAppr.mutate({ data: { document_id: selectedDoc.id, project_id: selectedDoc.project_id, stage, approver_name: approver, status, notes: notes || null } })}
              onReview={() => aiReview.mutate({ data: { document_id: selectedDoc.id } })}
              onExport={() => {
                const blob = new Blob([selectedDoc.content_md ?? ""], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `${selectedDoc.title.replace(/\s+/g, "_")}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function CategoryPanel({
  category, projectId, docs, onGenerate, onNew, onReview, onDelete, onOpen, onStatus, generating,
}: {
  category: Category; projectId: string; docs: Doc[];
  onGenerate: (p: { project_id: string; category: Category; doc_type: string; title: string; context_brief?: string }) => void;
  onNew: (p: { project_id: string; category: Category; doc_type: string; title: string; content_md: string; status: Status }) => void;
  onReview: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  onStatus: (doc: Doc, status: Status) => void;
  generating: boolean;
}) {
  const [docType, setDocType] = useState("brd");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [query, setQuery] = useState("");
  const filtered = docs.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="capitalize">{category} documents</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-8 pl-7 text-xs w-56" />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1"><Sparkles className="h-3.5 w-3.5" /> AI Generate</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Generate {category} document</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div><Label>Type</Label><Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="brd, prd, srs, hld, lld, api_spec…" /></div>
                      <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Business Requirement Document" /></div>
                    </div>
                    <div>
                      <Label>Brief (optional)</Label>
                      <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Additional context, focus areas, constraints…" rows={4} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button disabled={generating || !title || !docType} onClick={() => onGenerate({ project_id: projectId, category, doc_type: docType, title, context_brief: brief })}>
                      <Wand2 className="mr-1 h-4 w-4" /> Generate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="h-3.5 w-3.5" /> New</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New {category} document</DialogTitle></DialogHeader>
                  <NewDocForm category={category} projectId={projectId} onCreate={onNew} />
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={FileText} title="No documents" description={`Generate a ${category} document with AI or create one from a template.`} />
          ) : (
            <div className="space-y-2">
              {filtered.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-accent/40 transition-colors">
                  <button onClick={() => onOpen(d.id)} className="min-w-0 text-left">
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="uppercase">{d.doc_type}</span>
                      <span>· v{d.current_version}</span>
                      <span>· Updated {new Date(d.updated_at).toLocaleDateString()}</span>
                      {d.ai_quality_score != null && <span>· AI {d.ai_quality_score}/100</span>}
                      {d.tags?.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Select value={d.status} onValueChange={(v) => onStatus(d, v as Status)}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                    {statusBadge(d.status)}
                    <Button size="icon" variant="ghost" onClick={() => onReview(d.id)} title="AI review"><Wand2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(d.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function NewDocForm({ category, projectId, onCreate }: {
  category: Category; projectId: string;
  onCreate: (p: { project_id: string; category: Category; doc_type: string; title: string; content_md: string; status: Status }) => void;
}) {
  const [docType, setDocType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("# " + category + " document\n\n");
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div><Label>Type</Label><Input value={docType} onChange={(e) => setDocType(e.target.value)} /></div>
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      </div>
      <div className="space-y-2">
        <Label>Content (Markdown)</Label>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-2">
            <div className="rounded-md border bg-background p-4 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content || "*No content yet.*"}</ReactMarkdown>
            </div>
          </TabsContent>
          <TabsContent value="edit" className="mt-2">
            <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-xs" />
          </TabsContent>
        </Tabs>
      </div>
      <DialogFooter>
        <Button disabled={!title || !docType}
          onClick={() => onCreate({ project_id: projectId, category, doc_type: docType, title, content_md: content, status: "draft" })}>
          Create
        </Button>
      </DialogFooter>
    </div>
  );
}

function DocDetail({
  doc, onClose, comments, approvals, onSave, onComment, onApproval, onReview, onExport,
}: {
  doc: Doc; onClose: () => void;
  comments: Array<{ id: string; author_name: string; body: string; created_at: string }>;
  approvals: Array<{ id: string; stage: string; approver_name: string; status: string; notes: string | null; created_at: string }>;
  onSave: (p: { project_id: string; category: Category; doc_type: string; title: string; content_md: string; status: Status; change_summary?: string }) => void;
  onComment: (body: string, author: string) => void;
  onApproval: (stage: string, approver: string, status: "pending" | "approved" | "rejected" | "changes_requested", notes: string) => void;
  onReview: () => void;
  onExport: () => void;
}) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content_md ?? "");
  const [status, setStatus] = useState<Status>(doc.status);
  const [changeSummary, setChangeSummary] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("Sarah Chen");
  const [apprStage, setApprStage] = useState("technical_review");
  const [apprName, setApprName] = useState("Priya Raghavan");
  const [apprStatus, setApprStatus] = useState<"pending" | "approved" | "rejected" | "changes_requested">("approved");
  const [apprNotes, setApprNotes] = useState("");

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-[50vw] overflow-y-auto p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{doc.title}</span>
            <Badge variant="outline" className="text-[10px] uppercase">{doc.doc_type}</Badge>
            <span className="text-xs text-muted-foreground">v{doc.current_version}</span>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-2">
                  <div className="rounded-md border bg-background p-4 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{content || "*No content yet.*"}</ReactMarkdown>
                  </div>
                </TabsContent>
                <TabsContent value="edit" className="mt-2">
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-xs min-h-[18rem]" />
                </TabsContent>
              </Tabs>
            </div>
            <div><Label>Change summary</Label><Input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} placeholder="Describe what changed" /></div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onSave({ project_id: doc.project_id, category: doc.category, doc_type: doc.doc_type, title, content_md: content, status, change_summary: changeSummary || "Manual edit" })}>Save version</Button>
              <Button size="sm" variant="outline" onClick={onReview} className="gap-1"><Wand2 className="h-3.5 w-3.5" /> Review with AI</Button>
              <Button size="sm" variant="outline" onClick={onExport} className="gap-1"><Download className="h-3.5 w-3.5" /> Export .md</Button>
            </div>
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">AI Assistant</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-start gap-2"><Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary" /> Ask the assistant to generate, improve, summarize or translate this document.</div>
                <Button size="sm" variant="outline" className="w-full gap-1" onClick={onReview}><Wand2 className="h-3.5 w-3.5" /> Run AI review</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Comments</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <ScrollArea className="h-40 pr-2">
                  {comments.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No comments yet.</div>
                  ) : comments.map((c) => (
                    <div key={c.id} className="rounded border p-2 mb-2">
                      <div className="text-[11px] font-medium">{c.author_name} <span className="text-muted-foreground">· {new Date(c.created_at).toLocaleString()}</span></div>
                      <div className="text-xs mt-0.5">{c.body}</div>
                    </div>
                  ))}
                </ScrollArea>
                <Separator />
                <Input value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} placeholder="Your name" className="h-8 text-xs" />
                <Textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={2} placeholder="Add a comment…" className="text-xs" />
                <Button size="sm" className="w-full gap-1" disabled={!commentBody.trim()} onClick={() => { onComment(commentBody, commentAuthor); setCommentBody(""); }}><MessageSquare className="h-3.5 w-3.5" /> Add</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Approvals</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs">
                {approvals.length === 0 ? <div className="text-muted-foreground">No approvals recorded.</div> :
                  approvals.map((a) => (
                    <div key={a.id} className="rounded border p-2">
                      <div className="flex justify-between"><span className="font-medium">{a.stage.replace("_"," ")}</span>{statusBadge(a.status)}</div>
                      <div className="text-muted-foreground">{a.approver_name}</div>
                      {a.notes && <div className="mt-1">{a.notes}</div>}
                    </div>
                  ))
                }
                <Separator />
                <Input value={apprStage} onChange={(e) => setApprStage(e.target.value)} placeholder="stage" className="h-8" />
                <Input value={apprName} onChange={(e) => setApprName(e.target.value)} placeholder="approver" className="h-8" />
                <Select value={apprStatus} onValueChange={(v) => setApprStatus(v as typeof apprStatus)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="approved">approved</SelectItem>
                    <SelectItem value="rejected">rejected</SelectItem>
                    <SelectItem value="changes_requested">changes requested</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea value={apprNotes} onChange={(e) => setApprNotes(e.target.value)} rows={2} placeholder="notes" />
                <Button size="sm" className="w-full" onClick={() => onApproval(apprStage, apprName, apprStatus, apprNotes)}>Record approval</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
