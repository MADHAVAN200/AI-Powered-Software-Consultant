import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateDocument } from "@/lib/ai.functions";
import { listArtifacts } from "@/lib/projects.functions";
import { useCurrentProject } from "@/hooks/use-current-project";

import { PageHeader } from "@/routes/_authenticated/route";
import { EmptyState, Markdown, ScoreBadge } from "@/components/ui-blocks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Kind =
  | "srs" | "brd" | "prd" | "user_stories" | "tech_design" | "api_docs" | "architecture_doc"
  | "database_doc" | "deployment_guide" | "user_manual"
  | "architecture_review" | "repo_review" | "uiux_review" | "database_review" | "api_review"
  | "test_cases" | "risk_analysis" | "security_review";

interface ModuleWorkbenchProps {
  title: string;
  description: string;
  kinds: { value: Kind; label: string }[];
  briefLabel?: string;
  briefPlaceholder: string;
  minChars?: number;
}

export function ModuleWorkbench({ title, description, kinds, briefLabel = "Brief", briefPlaceholder, minChars = 30 }: ModuleWorkbenchProps) {
  const { current, projectId } = useCurrentProject();
  const [kind, setKind] = useState<Kind>(kinds[0].value);
  const [brief, setBrief] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const qc = useQueryClient();
  const listFn = useServerFn(listArtifacts);
  const genFn = useServerFn(generateDocument);

  const kindValues = kinds.map((k) => k.value);
  const { data: artifacts = [], isLoading } = useQuery({
    queryKey: ["artifacts", projectId, kindValues.join(",")],
    queryFn: async () => {
      if (!projectId) return [];
      const results = await Promise.all(
        kindValues.map((k) => listFn({ data: { project_id: projectId, kind: k } })),
      );
      return results.flat().sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
    },
    enabled: !!projectId,
  });

  const m = useMutation({
    mutationFn: () => {
      if (!projectId) throw new Error("Select a project first");
      if (brief.trim().length < minChars) throw new Error(`Please provide at least ${minChars} characters of context.`);
      return genFn({ data: { project_id: projectId, kind, brief: brief.trim() } });
    },
    onSuccess: (row) => {
      toast.success("Generated");
      qc.invalidateQueries({ queryKey: ["artifacts", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      setSelected(row.id);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const active = artifacts.find((a) => a.id === selected) ?? artifacts[0];

  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="grid w-full flex-1 gap-6 px-8 py-8 lg:grid-cols-[360px_1fr]">
        {/* Composer */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-accent" /> New generation
            </div>
            {!current ? (
              <p className="text-sm text-muted-foreground">Select or create a project to begin.</p>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {kinds.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{briefLabel}</Label>
                  <Textarea rows={10} placeholder={briefPlaceholder} value={brief} onChange={(e) => setBrief(e.target.value)} />
                  <div className="text-[11px] text-muted-foreground">{brief.length} chars</div>
                </div>
                <Button className="w-full" onClick={() => m.mutate()} disabled={m.isPending}>
                  {m.isPending ? "Generating with Groq…" : "Generate"}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card">
            <div className="border-b px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">History</div>
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading…</div>
            ) : artifacts.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No artifacts yet.</div>
            ) : (
              <ul>
                {artifacts.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => setSelected(a.id)}
                      className={`flex w-full items-start justify-between gap-2 border-b px-4 py-2.5 text-left text-sm last:border-0 hover:bg-surface ${active?.id === a.id ? "bg-surface" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{a.title}</div>
                        <div className="text-[11px] text-muted-foreground">{a.kind} · {formatDistanceToNow(new Date(a.updated_at), { addSuffix: true })}</div>
                      </div>
                      <ScoreBadge score={a.score} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Viewer */}
        <div className="min-h-[400px] rounded-xl border bg-card p-8">
          {active?.content_md ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-4 border-b pb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{active.kind}</div>
                  <h2 className="mt-1 font-display text-2xl">{active.title}</h2>
                </div>
                <ScoreBadge score={active.score} />
              </div>
              <Markdown>{active.content_md}</Markdown>
            </>
          ) : (
            <EmptyState
              icon={FileText}
              title={current ? "Nothing here yet" : "Select a project"}
              description={current ? "Fill in the brief on the left and generate your first artifact." : "Pick a project or create one to get started."}
            />
          )}
        </div>
      </div>
    </>
  );
}
