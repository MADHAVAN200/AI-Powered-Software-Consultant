import { useCurrentProject } from "@/hooks/use-current-project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

export function ProjectSwitcher() {
  const { projects, projectId, setProjectId } = useCurrentProject();

  if (projects.length === 0) {
    return (
      <Link to="/dashboard">
        <Button size="sm" variant="outline" className="gap-2">
          <FolderPlus className="h-4 w-4" /> Create your first project
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Project</span>
      <Select value={projectId ?? undefined} onValueChange={setProjectId}>
        <SelectTrigger className="h-8 min-w-[200px] text-sm"><SelectValue placeholder="Select project" /></SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
