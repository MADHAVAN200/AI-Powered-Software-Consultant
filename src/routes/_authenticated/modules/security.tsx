import { createFileRoute } from "@tanstack/react-router";
import { ModuleWorkbench } from "@/components/module-workbench";

export const Route = createFileRoute("/_authenticated/modules/security")({
  component: () => (
    <ModuleWorkbench
      title="Security Review"
      description="OWASP Top 10, authn/authz, secrets, dependency and infra checks — for the system context you provide."
      kinds={[{ value: "security_review", label: "Security review" }]}
      briefLabel="System context"
      briefPlaceholder="Describe auth model, data sensitivity, external integrations, deployment (cloud, network), and any current controls."
      minChars={40}
    />
  ),
});
