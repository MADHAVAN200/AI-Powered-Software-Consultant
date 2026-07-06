import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "@/lib/projects.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function NewProjectDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState("");
  const [repo, setRepo] = useState("");
  const qc = useQueryClient();
  const router = useRouter();
  const create = useServerFn(createProject);
  const m = useMutation({
    mutationFn: (input: { name: string; description: string; tech_stack: string[]; repo_url?: string }) =>
      create({ data: input }),
    onSuccess: (p) => {
      toast.success("Project created");
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["workspace-overview"] });
      setOpen(false);
      setName(""); setDescription(""); setStack(""); setRepo("");
      router.navigate({ to: "/projects/$projectId", params: { projectId: p.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New project</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Give your project a name and a short description.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            m.mutate({
              name: name.trim(),
              description: description.trim(),
              tech_stack: stack.split(",").map((s) => s.trim()).filter(Boolean),
              repo_url: repo.trim() || undefined,
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5"><Label htmlFor="n">Name</Label><Input id="n" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="d">Description</Label><Textarea id="d" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="s">Tech stack (comma-separated)</Label><Input id="s" placeholder="React, Node.js, Postgres" value={stack} onChange={(e) => setStack(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="r">Repo URL (optional)</Label><Input id="r" placeholder="https://github.com/org/repo" value={repo} onChange={(e) => setRepo(e.target.value)} /></div>
          <DialogFooter>
            <Button type="submit" disabled={m.isPending}>{m.isPending ? "Creating…" : "Create project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
