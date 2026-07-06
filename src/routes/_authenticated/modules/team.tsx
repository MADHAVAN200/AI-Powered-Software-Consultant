import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/routes/_authenticated/route";

import { useCurrentProject } from "@/hooks/use-current-project";
import { EmptyState } from "@/components/ui-blocks";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/modules/team")({ component: Team });

function Team() {
  const { current } = useCurrentProject();
  return (
    <>
      <PageHeader
        title="Team Collaboration"
        description="Assign reviews, approve, comment and audit changes across projects."
      />
      <div className="w-full flex-1 px-8 py-8">
        <EmptyState
          icon={Users}
          title={current ? "Team collaboration — coming next" : "Select a project"}
          description="Owner-only member management, roles (editor/reviewer/viewer), commenting and audit-log UI are the next iteration. The database and RLS policies are already in place."
        />
      </div>
    </>
  );
}
