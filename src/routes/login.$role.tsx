import { createFileRoute, Link, useNavigate, useParams, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRole, setSession, type RoleId } from "@/lib/roles";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login/$role")({
  beforeLoad: ({ params }) => {
    if (!getRole(params.role)) throw redirect({ to: "/login" });
  },
  component: RoleLogin,
});

function RoleLogin() {
  const { role: roleId } = useParams({ from: "/login/$role" });
  const role = getRole(roleId)!;
  const nav = useNavigate();
  const [username, setUsername] = useState(role.username);
  const [password, setPassword] = useState(role.password);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== role.username || password !== role.password) {
      setError("Invalid credentials for this role.");
      return;
    }
    setSession({ roleId: role.id as RoleId, username: role.username });
    nav({ to: "/dashboard" });
  };

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
          <Link to="/login" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All roles
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-md px-6 py-16">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className={`h-1 ${role.accent}`} />
          <div className="p-7">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {role.tagline}
            </div>
            <h1 className="mt-1 font-display text-2xl">Sign in as {role.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="u">Username</Label>
                <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p">Password</Label>
                <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Continue to workspace</Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Demo credentials prefilled — just click Continue.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
