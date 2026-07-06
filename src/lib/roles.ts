// Client-side role-based access control for the demo.
// Credentials are intentionally hardcoded on the login cards.

export type RoleId =
  | "project_manager"
  | "business_analyst"
  | "developer"
  | "qa_engineer"
  | "designer"
  | "client";

export type RoleDef = {
  id: RoleId;
  title: string;
  tagline: string;
  description: string;
  accent: string; // tailwind color class for the card accent bar
  username: string;
  password: string;
  /** Route paths this role may access. "*" = everything under /_authenticated */
  allowed: string[] | "*";
};

export const ROLES: RoleDef[] = [
  {
    id: "project_manager",
    title: "Project Manager",
    tagline: "Full access · orchestrates the SDLC",
    description:
      "Owns delivery. Sees every module — requirements, architecture, reviews, quality scores, team and risks.",
    accent: "bg-violet-500",
    username: "pm@aristotle.dev",
    password: "manager123",
    allowed: "*",
  },
  {
    id: "business_analyst",
    title: "Business Analyst",
    tagline: "Requirements · docs · knowledge",
    description:
      "Shapes what to build. Access to requirements, documentation, knowledge base and the assistant.",
    accent: "bg-sky-500",
    username: "ba@aristotle.dev",
    password: "analyst123",
    allowed: [
      "/dashboard",
      "/projects",
      "/modules/requirements",
      "/modules/documentation",
      "/modules/knowledge",
      "/modules/assistant",
    ],
  },
  {
    id: "developer",
    title: "Developer / Architect",
    tagline: "Architecture · repo · DB · API",
    description:
      "Builds the system. Reviews architecture, repository, database schema, API surface and technical docs.",
    accent: "bg-emerald-500",
    username: "dev@aristotle.dev",
    password: "developer123",
    allowed: [
      "/dashboard",
      "/projects",
      "/modules/architecture",
      "/modules/repository",
      "/modules/database",
      "/modules/api",
      "/modules/documentation",
      "/modules/assistant",
    ],
  },
  {
    id: "qa_engineer",
    title: "QA Engineer",
    tagline: "Tests · quality · risks · security",
    description:
      "Guards quality. Access to test cases, quality scores, risk analysis and security review.",
    accent: "bg-amber-500",
    username: "qa@aristotle.dev",
    password: "quality123",
    allowed: [
      "/dashboard",
      "/projects",
      "/modules/tests",
      "/modules/quality",
      "/modules/risks",
      "/modules/security",
      "/modules/assistant",
    ],
  },
  {
    id: "designer",
    title: "UI / UX Designer",
    tagline: "UI · UX · docs",
    description:
      "Owns the experience. Access to UI/UX review, documentation and the design assistant.",
    accent: "bg-pink-500",
    username: "design@aristotle.dev",
    password: "designer123",
    allowed: [
      "/dashboard",
      "/projects",
      "/modules/uiux",
      "/modules/documentation",
      "/modules/assistant",
    ],
  },
  {
    id: "client",
    title: "Client / Stakeholder",
    tagline: "Read-only overview",
    description:
      "Watches progress. Sees dashboard, project overview, documentation and quality score only.",
    accent: "bg-slate-500",
    username: "client@aristotle.dev",
    password: "client123",
    allowed: [
      "/dashboard",
      "/projects",
      "/modules/documentation",
      "/modules/quality",
      "/modules/assistant",
    ],
  },
];

export const getRole = (id: string): RoleDef | undefined =>
  ROLES.find((r) => r.id === id);

const SESSION_KEY = "aristotle.session";

export type Session = { roleId: RoleId; username: string };

export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

export const setSession = (s: Session) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
};

export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
};

export const canAccess = (role: RoleDef, path: string): boolean => {
  if (role.allowed === "*") return true;
  return role.allowed.some((p) => path === p || path.startsWith(p + "/"));
};
