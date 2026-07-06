import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ROLES, getSession } from "@/lib/roles";
import { Sparkles, ArrowRight, Lock } from "lucide-react";

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: "Sign in — Aristotle" },
      { name: "description", content: "Pick your role to sign in to the Aristotle demo workspace." },
    ],
  }),
  component: LoginPicker,
});

function LoginPicker() {
  const nav = useNavigate();
  useEffect(() => {
    const s = getSession();
    if (s) nav({ to: "/dashboard" });
  }, [nav]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-xl">Aristotle</span>
          </Link>
          <div className="text-xs text-muted-foreground">Demo workspace · pick a role</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl leading-tight">Sign in as…</h1>
          <p className="mt-3 text-muted-foreground">
            Each role sees a different slice of the platform. Project Manager has full access; the
            others are scoped to the modules they own. Click a card to continue to the role's sign-in.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <Link
              key={r.id}
              to="/login/$role"
              params={{ role: r.id }}
              className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${r.accent}`} />
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {r.tagline}
                </div>
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg">{r.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{r.description}</p>
              <div className="mt-4 rounded-lg border bg-surface p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <div><span className="text-foreground">user:</span> {r.username}</div>
                <div><span className="text-foreground">pass:</span> {r.password}</div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
                Sign in as {r.title} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
