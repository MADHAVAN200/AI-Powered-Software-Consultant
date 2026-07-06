import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-notion max-w-none", className)}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon, action }: {
  title: string; description?: string; icon?: React.ComponentType<{ className?: string }>; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-surface p-10 text-center">
      {Icon && (
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="font-medium">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
  const tone = score >= 80 ? "bg-success/15 text-success" : score >= 60 ? "bg-warning/20 text-warning-foreground" : "bg-destructive/15 text-destructive";
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>{score}</span>;
}
