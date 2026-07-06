import { createFileRoute, Outlet, Link, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureDemoProject } from "@/lib/demo.functions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession, getRole, clearSession, canAccess, type Session } from "@/lib/roles";
import { useCurrentProject } from "@/hooks/use-current-project";
import { ProjectSwitcher } from "@/components/project-switcher";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileText, BookOpen, Boxes, GitBranch,
  Palette, Database, Plug, TestTubes, AlertTriangle,
  Library, MessageSquare, Users, Sparkles, ChevronRight, LogOut,
} from "lucide-react";
import type { ComponentType } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const session = getSession();
    if (!session) throw redirect({ to: "/login" });
    const role = getRole(session.roleId);
    if (!role) {
      clearSession();
      throw redirect({ to: "/login" });
    }
    if (!canAccess(role, location.pathname)) {
      throw redirect({ to: "/dashboard" });
    }
    // Keep anon supabase sign-in so server fns (requireSupabaseAuth) work.
    let user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      const anon = await supabase.auth.signInAnonymously();
      if (anon.error || !anon.data.user) throw new Error(anon.error?.message ?? "Anon sign-in failed");
      user = anon.data.user;
    }
    return { user, session, role };
  },
  component: AppShell,
});

const NAV: { label: string; to: string; icon: ComponentType<{ className?: string }> }[] = [];

const MODULES: { label: string; to: string; icon: ComponentType<{ className?: string }> }[] = [
  { label: "Requirements", to: "/modules/requirements", icon: FileText },
  { label: "Documentation", to: "/modules/documentation", icon: BookOpen },
  { label: "Architecture", to: "/modules/architecture", icon: Boxes },
  { label: "Repository", to: "/modules/repository", icon: GitBranch },
  { label: "UI / UX", to: "/modules/uiux", icon: Palette },
  { label: "Database", to: "/modules/database", icon: Database },
  { label: "API", to: "/modules/api", icon: Plug },
  { label: "Test Cases", to: "/modules/tests", icon: TestTubes },
  { label: "Risk Analysis", to: "/modules/risks", icon: AlertTriangle },
  { label: "Knowledge Base", to: "/modules/knowledge", icon: Library },
  { label: "Assistant", to: "/modules/assistant", icon: MessageSquare },
  { label: "Team", to: "/modules/team", icon: Users },
];

function AppShell() {
  const loc = useLocation();
  const nav = useNavigate();
  const seed = useServerFn(ensureDemoProject);
  const qc = useQueryClient();
  const [session, setLocalSession] = useState<Session | null>(null);
  const { current: currentProject } = useCurrentProject();

  useEffect(() => {
    setLocalSession(getSession());
    seed().then((r) => {
      if (r?.created) qc.invalidateQueries();
    }).catch(() => {});
  }, [seed, qc]);

  const role = session ? getRole(session.roleId) : null;

  const isActive = (to: string) => loc.pathname === to || loc.pathname.startsWith(to + "/");

  const visibleNav = useMemo(
    () => (role ? NAV.filter((n) => canAccess(role, n.to)) : []),
    [role],
  );
  const visibleModules = useMemo(
    () => (role ? MODULES.filter((n) => canAccess(role, n.to)) : []),
    [role],
  );
  const activeModule = useMemo(
    () => visibleModules.find((m) => isActive(m.to)),
    [visibleModules, isActive],
  );

  // A project is "in context" when the user is inside a project detail page
  // or any module page. Modules always operate against the currently selected
  // project (persisted via useCurrentProject).
  const inProjectContext =
    loc.pathname.startsWith("/projects/") || loc.pathname.startsWith("/modules/");
  const showModules = inProjectContext && !!currentProject;

  const handleLogout = () => {
    clearSession();
    nav({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-6 px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-display text-base">Aristotle</span>
          </Link>
          <nav className="flex items-center gap-1 text-[13px]">
            {visibleNav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-md px-2.5 py-1.5 transition-colors ${
                  isActive(n.to)
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">

              <ThemeToggle />
              <ProjectSwitcher />
              <div className="hidden items-center gap-2 rounded-md border px-2 py-1 sm:flex">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-[10px] font-medium">
                  {role?.title.charAt(0) ?? "?"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium leading-tight">{role?.title ?? "Guest"}</div>
                  <div className="truncate text-[10px] leading-tight text-muted-foreground">{session?.username}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showModules && visibleModules.length > 0 ? (
        <div className="flex flex-1">
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col overflow-hidden border-r bg-sidebar md:flex">
            <nav className="flex-1 overflow-y-auto px-2 py-3 text-[13px]">
              <Link
                to="/projects/$projectId"
                params={{ projectId: currentProject.id }}
                className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                  loc.pathname === `/projects/${currentProject.id}`
                    ? "bg-sidebar-active font-medium text-sidebar-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 opacity-70" /> Overview
              </Link>
              <div className="mt-4 px-2.5 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                AI Modules
              </div>
              <div className="space-y-0.5">
                {visibleModules.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                      isActive(n.to)
                        ? "bg-sidebar-active font-medium text-sidebar-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-hover"
                    }`}
                  >
                    <n.icon className="h-4 w-4 opacity-70" /> {n.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
          <main className="flex min-w-0 flex-1 flex-col">
            {currentProject && (
              <div className="border-b bg-background/60 px-8 py-2.5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
                  <ChevronRight className="h-3 w-3" />
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: currentProject.id }}
                    className="max-w-[200px] truncate hover:text-foreground"
                    title={currentProject.name}
                  >
                    {currentProject.name}
                  </Link>
                  {activeModule && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span className="text-foreground">{activeModule.label}</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <Outlet />
          </main>

        </div>
      ) : (
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      )}
    </div>
  );
}




export function PageHeader({ title, description, action }: {
  title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <header className="border-b bg-background">
      <div className="flex w-full items-start justify-between gap-4 px-8 py-6">
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
