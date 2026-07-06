import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Database, Bot, Sparkles, Send, Upload, Search, Shield, Zap, Activity,
  Table as TableIcon, GitBranch, HardDrive, Server, KeyRound, Lock, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, FileText, Layers, Link2, RefreshCw, GitCommit,
  Save, PlayCircle, Gauge, ShieldCheck, Download, Copy, Printer,
} from "lucide-react";

import { PageHeader } from "@/routes/_authenticated/route";
import { useCurrentProject } from "@/hooks/use-current-project";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ERDiagram, type ERTable, type ERRelation } from "@/components/er-diagram";

export const Route = createFileRoute("/_authenticated/modules/database")({
  component: DatabasePage,
});

/* ============================================================================
   Simulated data — AI Database Architect
   ========================================================================= */

const PROJECT = {
  engine: "PostgreSQL",
  version: "15.4",
  status: "Healthy",
  health: 94,
  perf: 91,
  security: 96,
  normalization: 92,
  storage: "12.6 GB",
  storagePct: 42,
  tables: 46,
  relations: 82,
  indexes: 117,
  slowQueries: 7,
  connections: 34,
  backup: "OK · 2h ago",
};

const METRICS = [
  { label: "DB Health", value: `${PROJECT.health}%`, hint: "+3 vs last week", icon: Activity },
  { label: "Performance", value: `${PROJECT.perf}%`, hint: "avg 42ms", icon: Zap },
  { label: "Security", value: `${PROJECT.security}%`, hint: "OWASP + CIS", icon: Shield },
  { label: "Normalization", value: `${PROJECT.normalization}%`, hint: "3NF compliant", icon: Layers },
  { label: "Storage", value: PROJECT.storage, hint: `${PROJECT.storagePct}% used`, icon: HardDrive },
  { label: "Tables", value: PROJECT.tables, hint: "12 schemas", icon: TableIcon },
  { label: "Relationships", value: PROJECT.relations, hint: "FK integrity 100%", icon: Link2 },
  { label: "Indexes", value: PROJECT.indexes, hint: "8 unused", icon: KeyRound },
  { label: "Slow Queries", value: PROJECT.slowQueries, hint: "> 500ms", icon: Clock },
  { label: "Active Connections", value: PROJECT.connections, hint: "of 100 pool", icon: Server },
  { label: "DB Size", value: PROJECT.storage, hint: "+180MB / week", icon: Database },
  { label: "Backup Status", value: "Healthy", hint: PROJECT.backup, icon: ShieldCheck },
];

const TABLES = [
  { name: "users", rows: "12,480", size: "42 MB", cols: 14, keys: "PK, 3 FK", indexes: 5, health: "ok" },
  { name: "employees", rows: "8,120", size: "78 MB", cols: 22, keys: "PK, 4 FK", indexes: 7, health: "ok" },
  { name: "departments", rows: "48", size: "24 KB", cols: 6, keys: "PK, 1 FK", indexes: 2, health: "ok" },
  { name: "attendance", rows: "2,340,110", size: "3.2 GB", cols: 9, keys: "PK, 2 FK", indexes: 4, health: "warn", note: "Consider partitioning" },
  { name: "payroll", rows: "94,200", size: "412 MB", cols: 18, keys: "PK, 3 FK", indexes: 6, health: "ok" },
  { name: "leave_requests", rows: "48,900", size: "56 MB", cols: 12, keys: "PK, 2 FK", indexes: 3, health: "ok" },
  { name: "projects", rows: "1,240", size: "12 MB", cols: 15, keys: "PK, 2 FK", indexes: 4, health: "ok" },
  { name: "tasks", rows: "68,500", size: "88 MB", cols: 17, keys: "PK, 3 FK", indexes: 5, health: "warn", note: "Missing FK index on assignee_id" },
  { name: "notifications", rows: "1,200,300", size: "620 MB", cols: 8, keys: "PK, 1 FK", indexes: 2, health: "bad", note: "Full table scan on filter" },
  { name: "audit_logs", rows: "5,800,200", size: "6.1 GB", cols: 10, keys: "PK", indexes: 3, health: "warn", note: "Archive > 6 months" },
];

const RELATIONSHIPS = [
  { from: "employees", to: "departments", kind: "N-1", integrity: "ok" },
  { from: "attendance", to: "employees", kind: "N-1", integrity: "ok" },
  { from: "payroll", to: "employees", kind: "N-1", integrity: "ok" },
  { from: "tasks", to: "projects", kind: "N-1", integrity: "ok" },
  { from: "tasks", to: "employees", kind: "N-1", integrity: "warn", note: "No cascade rule" },
  { from: "leave_requests", to: "employees", kind: "N-1", integrity: "ok" },
];

const SLOW_QUERIES = [
  { sql: "SELECT * FROM notifications WHERE user_id = ? AND read = false", ms: 1240, rows: "1.2M", suggestion: "Add composite index (user_id, read)" },
  { sql: "SELECT a.* FROM attendance a JOIN employees e ON …", ms: 890, rows: "2.3M", suggestion: "Partition attendance by month" },
  { sql: "SELECT COUNT(*) FROM audit_logs WHERE created_at > …", ms: 720, rows: "5.8M", suggestion: "Materialized view for daily counts" },
  { sql: "SELECT * FROM tasks WHERE assignee_id = ?", ms: 640, rows: "68K", suggestion: "Missing index on assignee_id" },
  { sql: "SELECT DISTINCT dept FROM employees", ms: 420, rows: "8K", suggestion: "Cache with 5-min TTL" },
];

const SECURITY_CHECKS = [
  { area: "Encryption at Rest", status: "pass", note: "AES-256 enabled" },
  { area: "TLS in Transit", status: "pass", note: "TLS 1.3" },
  { area: "Row-Level Security", status: "warn", note: "Not enabled on 4 tables" },
  { area: "Sensitive Data / PII", status: "warn", note: "Mask employees.ssn, users.email" },
  { area: "SQL Injection Risk", status: "pass", note: "All queries parameterized" },
  { area: "Audit Logging", status: "pass", note: "Enabled" },
  { area: "Backup Encryption", status: "pass", note: "KMS-managed" },
  { area: "Least-Privilege Roles", status: "bad", note: "3 roles have SUPERUSER" },
  { area: "Credential Rotation", status: "warn", note: "Rotated 84 days ago" },
];

const MIGRATIONS = [
  { id: "20260702_1420", name: "add_index_notifications_user_read", author: "A. Silva", status: "applied", date: "2h" },
  { id: "20260630_0930", name: "partition_attendance_by_month", author: "M. Chen", status: "pending", date: "2d" },
  { id: "20260628_1145", name: "add_rls_to_payroll", author: "R. Kapoor", status: "applied", date: "4d" },
  { id: "20260620_1020", name: "rename_users_full_name_column", author: "P. Nair", status: "applied", date: "12d" },
  { id: "20260615_1810", name: "drop_deprecated_temp_reports", author: "L. Ortiz", status: "rolled back", date: "18d" },
];

const BACKUPS = [
  { type: "Full", size: "12.4 GB", when: "Today · 02:00", status: "ok", location: "s3://backup-prod" },
  { type: "Incremental", size: "412 MB", when: "Today · 08:00", status: "ok", location: "s3://backup-prod" },
  { type: "Incremental", size: "384 MB", when: "Today · 14:00", status: "ok", location: "s3://backup-prod" },
  { type: "PITR checkpoint", size: "—", when: "Continuous", status: "ok", location: "wal-archive" },
];

const REVIEW = [
  { area: "Schema Design", score: 94, verdict: "Excellent", note: "Consistent naming, clean FKs" },
  { area: "Normalization", score: 92, verdict: "Excellent", note: "3NF across core tables" },
  { area: "Indexing", score: 82, verdict: "Good", note: "8 unused, 3 missing composite" },
  { area: "Performance", score: 88, verdict: "Good", note: "Partition attendance & audit_logs" },
  { area: "Security", score: 96, verdict: "Excellent", note: "Enable RLS on 4 remaining tables" },
  { area: "Scalability", score: 74, verdict: "Needs Improvement", note: "Add read replica for reporting" },
  { area: "Storage", score: 86, verdict: "Good", note: "Archive audit_logs > 6 months" },
  { area: "Documentation", score: 78, verdict: "Good", note: "Missing column comments on 18 tables" },
];

const VERSIONS = [
  { v: "v4.2", author: "A. Silva", date: "2h", changes: "Notification index, RLS extended", approval: "approved", added: 2, removed: 0 },
  { v: "v4.1", author: "M. Chen", date: "4d", changes: "Payroll RLS, partition plan", approval: "approved", added: 5, removed: 1 },
  { v: "v4.0", author: "R. Kapoor", date: "3w", changes: "Employees schema rework", approval: "approved", added: 12, removed: 4 },
  { v: "v3.6", author: "P. Nair", date: "6w", changes: "Rename user columns", approval: "revisions", added: 3, removed: 3 },
];

const AI_ACTIONS = [
  "Generate Schema", "Explain Table", "Explain Relationship", "Optimize Query",
  "Review Database", "Generate ER Diagram", "Detect Problems", "Generate Data Dictionary",
  "Generate Migration", "Review Security", "Estimate Storage", "Suggest Indexes",
];

const INTEGRATIONS = [
  "PostgreSQL", "MySQL", "SQL Server", "Oracle", "MongoDB", "Redis",
  "Prisma", "TypeORM", "SQLAlchemy", "AWS RDS", "Supabase", "PlanetScale",
];

/* ---------------------------- ER Diagram data ---------------------------- */

const ER_TABLES: ERTable[] = [
  {
    name: "departments", schema: "public",
    columns: [
      { name: "id", type: "uuid", kind: "pk" },
      { name: "name", type: "text" },
      { name: "code", type: "text", kind: "unique" },
      { name: "manager_id", type: "uuid", kind: "fk", fkTo: "employees.id", nullable: true },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "employees", schema: "public",
    columns: [
      { name: "id", type: "uuid", kind: "pk" },
      { name: "user_id", type: "uuid", kind: "fk", fkTo: "users.id" },
      { name: "department_id", type: "uuid", kind: "fk", fkTo: "departments.id" },
      { name: "full_name", type: "text" },
      { name: "email", type: "citext", kind: "unique" },
      { name: "role", type: "text" },
      { name: "hired_at", type: "date" },
      { name: "status", type: "text" },
    ],
  },
  {
    name: "users", schema: "auth",
    columns: [
      { name: "id", type: "uuid", kind: "pk" },
      { name: "email", type: "citext", kind: "unique" },
      { name: "password_hash", type: "text" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "projects", schema: "public",
    columns: [
      { name: "id", type: "uuid", kind: "pk" },
      { name: "name", type: "text" },
      { name: "owner_id", type: "uuid", kind: "fk", fkTo: "employees.id" },
      { name: "department_id", type: "uuid", kind: "fk", fkTo: "departments.id" },
      { name: "status", type: "text" },
      { name: "start_date", type: "date" },
      { name: "end_date", type: "date", nullable: true },
    ],
  },
  {
    name: "tasks", schema: "public",
    columns: [
      { name: "id", type: "uuid", kind: "pk" },
      { name: "project_id", type: "uuid", kind: "fk", fkTo: "projects.id" },
      { name: "assignee_id", type: "uuid", kind: "fk", fkTo: "employees.id", nullable: true },
      { name: "title", type: "text" },
      { name: "priority", type: "text" },
      { name: "status", type: "text" },
      { name: "due_date", type: "date", nullable: true },
    ],
  },
  {
    name: "attendance", schema: "public",
    columns: [
      { name: "id", type: "bigint", kind: "pk" },
      { name: "employee_id", type: "uuid", kind: "fk", fkTo: "employees.id" },
      { name: "date", type: "date" },
      { name: "clock_in", type: "timestamptz" },
      { name: "clock_out", type: "timestamptz", nullable: true },
      { name: "hours", type: "numeric" },
    ],
  },
  {
    name: "payroll", schema: "public",
    columns: [
      { name: "id", type: "uuid", kind: "pk" },
      { name: "employee_id", type: "uuid", kind: "fk", fkTo: "employees.id" },
      { name: "period", type: "text" },
      { name: "gross", type: "numeric" },
      { name: "tax", type: "numeric" },
      { name: "net", type: "numeric" },
      { name: "paid_at", type: "timestamptz", nullable: true },
    ],
  },
  {
    name: "leave_requests", schema: "public",
    columns: [
      { name: "id", type: "uuid", kind: "pk" },
      { name: "employee_id", type: "uuid", kind: "fk", fkTo: "employees.id" },
      { name: "type", type: "text" },
      { name: "from_date", type: "date" },
      { name: "to_date", type: "date" },
      { name: "status", type: "text" },
    ],
  },
  {
    name: "notifications", schema: "public",
    columns: [
      { name: "id", type: "bigint", kind: "pk" },
      { name: "user_id", type: "uuid", kind: "fk", fkTo: "users.id" },
      { name: "title", type: "text" },
      { name: "body", type: "text" },
      { name: "read", type: "boolean" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "audit_logs", schema: "public",
    columns: [
      { name: "id", type: "bigint", kind: "pk" },
      { name: "actor_id", type: "uuid", kind: "fk", fkTo: "users.id", nullable: true },
      { name: "entity", type: "text" },
      { name: "action", type: "text" },
      { name: "meta", type: "jsonb" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
];

const ER_RELATIONS: ERRelation[] = [
  { from: "employees", to: "users", kind: "1-1", label: "user" },
  { from: "employees", to: "departments", kind: "1-N", label: "belongs to" },
  { from: "departments", to: "employees", kind: "1-1", label: "manager" },
  { from: "projects", to: "employees", kind: "1-N", label: "owner" },
  { from: "projects", to: "departments", kind: "1-N", label: "dept" },
  { from: "tasks", to: "projects", kind: "1-N", label: "of" },
  { from: "tasks", to: "employees", kind: "1-N", label: "assignee" },
  { from: "attendance", to: "employees", kind: "1-N", label: "log" },
  { from: "payroll", to: "employees", kind: "1-N", label: "for" },
  { from: "leave_requests", to: "employees", kind: "1-N", label: "by" },
  { from: "notifications", to: "users", kind: "1-N", label: "to" },
  { from: "audit_logs", to: "users", kind: "1-N", label: "actor" },
];

/* ----------------------------- Documents -------------------------------- */

type DocKey =
  | "design" | "schema" | "tables" | "columns"
  | "relationships" | "migration" | "backup" | "dictionary";

interface DocFile {
  key: DocKey;
  title: string;
  summary: string;
  updated: string;
  owner: string;
  pages: number;
  tags: string[];
  sections: { heading: string; body: string; code?: string }[];
}

const DOCS: DocFile[] = [
  {
    key: "design",
    title: "Database Design Document",
    summary: "End-to-end design for the PostgreSQL 15.4 datastore, covering domain model, key decisions, non-functional targets and future evolution.",
    updated: "2h ago", owner: "A. Silva", pages: 24,
    tags: ["Architecture", "PostgreSQL", "3NF"],
    sections: [
      { heading: "1. Purpose & Scope", body: "This document describes the design of the operational database powering the TaskFlow platform: employees, projects, tasks, attendance, payroll and audit. The design targets 99.95% availability, sub-100ms p95 read latency and RPO ≤ 15 minutes." },
      { heading: "2. Domain Model", body: "The core aggregates are Employee (with an auth User), Department, Project, Task, Attendance, Payroll, LeaveRequest, Notification and AuditLog. Employees belong to a single Department; Projects roll up to Departments; Tasks belong to Projects and are assigned to Employees." },
      { heading: "3. Design Decisions", body: "• UUIDv7 primary keys everywhere except high-volume append-only tables (bigint).\n• 3NF for transactional tables; denormalized views for reporting.\n• Row-Level Security on all tenant-scoped tables.\n• attendance and audit_logs partitioned monthly.\n• All timestamps in timestamptz." },
      { heading: "4. Non-Functional Requirements", body: "Availability 99.95% · RPO 15m · RTO 30m · Encryption AES-256 at rest, TLS 1.3 in transit · Backups: nightly full + hourly incremental + PITR." },
      { heading: "5. Future Work", body: "Introduce a read replica for reporting workloads; migrate notifications to an outbox pattern; archive audit_logs older than 6 months to cold storage." },
    ],
  },
  {
    key: "schema",
    title: "Schema Documentation",
    summary: "Full DDL for all schemas, including tables, keys, constraints, indexes and defaults.",
    updated: "2h ago", owner: "A. Silva", pages: 41,
    tags: ["DDL", "SQL"],
    sections: [
      { heading: "Overview", body: "Two schemas are in scope: auth (managed by Supabase) and public (application data). Only public objects are managed here." },
      { heading: "public.employees", body: "Primary entity linking an auth user to a department.", code: `create table public.employees (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  department_id uuid not null references public.departments(id),
  full_name     text not null,
  email         citext not null unique,
  role          text not null default 'member',
  hired_at      date not null,
  status        text not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index employees_department_idx on public.employees(department_id);` },
      { heading: "public.tasks", body: "Work items owned by projects and assigned to employees.", code: `create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  assignee_id uuid references public.employees(id) on delete set null,
  title       text not null,
  priority    text not null default 'normal',
  status      text not null default 'todo',
  due_date    date,
  created_at  timestamptz not null default now()
);
create index tasks_project_idx  on public.tasks(project_id);
create index tasks_assignee_idx on public.tasks(assignee_id);` },
    ],
  },
  {
    key: "tables",
    title: "Table Documentation",
    summary: "Per-table description with row counts, storage footprint, keys and health.",
    updated: "1d ago", owner: "M. Chen", pages: 18,
    tags: ["Tables", "Storage"],
    sections: [
      { heading: "Inventory", body: "10 primary tables occupy ~10.6 GB. The largest is audit_logs (6.1 GB, 5.8M rows); attendance (3.2 GB, 2.3M rows) is a candidate for monthly partitioning." },
      { heading: "Hot Tables", body: "notifications (620 MB, 1.2M rows) exhibits full table scans on (user_id, read). Adding a composite index is expected to reduce query time by ~71%." },
      { heading: "Cold Tables", body: "departments (48 rows) and lookup dimensions are stable; consider caching in-application with a 5-minute TTL." },
    ],
  },
  {
    key: "columns",
    title: "Column Definitions",
    summary: "Semantic dictionary for every column: business meaning, type, default, nullability and PII classification.",
    updated: "3d ago", owner: "R. Kapoor", pages: 62,
    tags: ["Data Dictionary", "PII"],
    sections: [
      { heading: "PII Columns", body: "employees.email, employees.full_name and users.email are classified as PII. users.email is additionally used as an auth identifier and must never appear in application logs." },
      { heading: "Financial Columns", body: "payroll.gross, payroll.tax, payroll.net use numeric(14,2) and are always calculated server-side. Reads require the finance or admin role." },
      { heading: "Status Enums", body: "projects.status ∈ {planned, active, on_hold, done, cancelled}. tasks.status ∈ {todo, in_progress, review, done}. Enforced by CHECK constraints." },
    ],
  },
  {
    key: "relationships",
    title: "Relationships",
    summary: "Foreign key map with cardinality, cascade behavior and integrity notes.",
    updated: "4d ago", owner: "P. Nair", pages: 9,
    tags: ["FK", "Integrity"],
    sections: [
      { heading: "Cardinality", body: "Employees 1—N Attendance, Payroll, LeaveRequests, Tasks. Departments 1—N Employees, Projects. Users 1—1 Employees, 1—N Notifications and AuditLogs." },
      { heading: "Cascade Rules", body: "auth.users deletion cascades to employees. Project deletion cascades to tasks. Deleting an employee sets tasks.assignee_id to NULL to preserve history." },
      { heading: "Open Items", body: "tasks → employees is missing a cascade rule; recommend ON DELETE SET NULL to match current app behavior." },
    ],
  },
  {
    key: "migration",
    title: "Migration Guide",
    summary: "How to author, review, apply and roll back schema changes safely across environments.",
    updated: "6d ago", owner: "L. Ortiz", pages: 14,
    tags: ["Migrations", "Ops"],
    sections: [
      { heading: "Workflow", body: "1) Author migration in a feature branch. 2) Run against the ephemeral preview DB. 3) Peer review + AI review. 4) Apply to staging, run smoke tests. 5) Apply to production during the low-traffic window with automatic rollback plan." },
      { heading: "Zero-Downtime Rules", body: "Add columns as nullable; backfill in batches; add NOT NULL in a second migration. Drop columns only after two release cycles of unused state. Never rename in place — add + backfill + swap." },
      { heading: "Rollback Plan", body: "Every migration ships with a matching down() script and a tested restore-from-PITR runbook. Rollbacks are practiced quarterly." },
    ],
  },
  {
    key: "backup",
    title: "Backup Strategy",
    summary: "Backup, retention, restoration and disaster-recovery procedures.",
    updated: "1w ago", owner: "R. Kapoor", pages: 11,
    tags: ["Backup", "DR"],
    sections: [
      { heading: "Cadence", body: "Nightly full backup (02:00 UTC), hourly incremental during business hours, continuous WAL archiving for PITR. All artifacts encrypted with KMS-managed keys and stored in s3://backup-prod." },
      { heading: "Retention", body: "Full: 30 days. Incremental: 14 days. PITR: 7 days. Quarterly cold backups retained for 1 year in Glacier." },
      { heading: "DR", body: "Warm standby in a secondary region with 15-minute lag. Failover runbook exercised twice a year; last successful drill: 3 weeks ago." },
    ],
  },
  {
    key: "dictionary",
    title: "Data Dictionary",
    summary: "Business-friendly glossary of tables and columns with owners and update cadence.",
    updated: "2w ago", owner: "A. Silva", pages: 48,
    tags: ["Dictionary", "Glossary"],
    sections: [
      { heading: "Employees", body: "Records a person employed by the organization. Owner: HR. Update cadence: on hire / role change / termination." },
      { heading: "Projects", body: "A time-bounded body of work that produces business value. Owner: PMO. Update cadence: on status change." },
      { heading: "Attendance", body: "Daily clock-in/clock-out records used for payroll calculation. Owner: HR Ops. Update cadence: near real-time." },
    ],
  },
];

/* ============================================================================
   Component
   ========================================================================= */

function DatabasePage() {
  const { current } = useCurrentProject();
  const [tab, setTab] = useState("overview");
  const [aiOpen, setAiOpen] = useState(false);
  const [openDoc, setOpenDoc] = useState<DocFile | null>(null);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm your AI Database Architect. Ask me to review the schema, optimize a query, generate a migration, or audit security." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [tableQuery, setTableQuery] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [sqlInput, setSqlInput] = useState(
    "SELECT * FROM notifications WHERE user_id = 42 AND read = false ORDER BY created_at DESC LIMIT 50;",
  );

  const projectName = current?.name ?? "AI Software Consultant";

  const filteredTables = useMemo(
    () => TABLES.filter((t) =>
      t.name.toLowerCase().includes(tableQuery.toLowerCase()) &&
      (tableFilter === "all" || t.health === tableFilter),
    ),
    [tableQuery, tableFilter],
  );

  const sendChat = (text?: string) => {
    const t = (text ?? chatInput).trim();
    if (!t) return;
    setChat((c) => [
      ...c,
      { role: "user", text: t },
      { role: "ai", text: `Analyzing "${t}"… I'll cross-reference the schema, indexes, query plans and security policies and share findings shortly.` },
    ]);
    setChatInput("");
  };

  return (
    <>
      <PageHeader
        title="Database"
        description="AI Database Architect — design, review, optimize, secure and document your databases."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Import</Button>
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Bot className="h-4 w-4" /> AI Architect
            </Button>
            <Button size="sm"><Sparkles className="h-4 w-4" /> AI Review</Button>
          </div>
        }
      />

      <div className="w-full px-8 py-6 space-y-6">
        {/* Project overview */}
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Field label="Project" value={projectName} />
              <Field label="Database Type" value={PROJECT.engine} />
              <Field label="Version" value={PROJECT.version} />
              <Field
                label="Status"
                value={<Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">{PROJECT.status}</Badge>}
              />
              <ScoreField label="Database Health" value={PROJECT.health} />
              <ScoreField label="Performance Score" value={PROJECT.perf} />
              <ScoreField label="Security Score" value={PROJECT.security} />
              <ScoreField label="Storage Usage" value={PROJECT.storagePct} />
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <TabsList className="inline-flex w-max min-w-full gap-1">
              {[
                ["overview", "Overview"],
                ["schema", "Schema Designer"],
                ["model", "Data Model"],
                ["tables", "Tables & Relationships"],
                ["query", "Query Analyzer"],
                ["perf", "Performance"],
                ["security", "Security"],
                ["migrations", "Migrations"],
                ["backup", "Backup & Recovery"],
                ["review", "AI Database Review"],
                ["docs", "Documentation"],
                ["versions", "Version History"],
              ].map(([v, l]) => (
                <TabsTrigger key={v} value={v}>{l}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {METRICS.map((m) => (
                <Card key={m.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
                      <m.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-1 font-display text-2xl">{m.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{m.hint}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">AI Database Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    <strong>{PROJECT.engine} {PROJECT.version}</strong> — {PROJECT.tables} tables, {PROJECT.relations} relationships,
                    {" "}{PROJECT.indexes} indexes, {PROJECT.storage}. Health is high; focus on partitioning
                    <code className="mx-1">attendance</code> and <code className="mx-1">audit_logs</code>, and enabling RLS on 4 remaining tables.
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <SummaryCell label="Health" value={`${PROJECT.health}%`} />
                    <SummaryCell label="Performance" value={`${PROJECT.perf}%`} />
                    <SummaryCell label="Security" value={`${PROJECT.security}%`} />
                    <SummaryCell label="Normalization" value={`${PROJECT.normalization}%`} />
                    <SummaryCell label="Slow Queries" value={String(PROJECT.slowQueries)} />
                    <SummaryCell label="Backup" value="Healthy" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Integrations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {INTEGRATIONS.slice(0, 6).map((p) => (
                    <div key={p} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><Database className="h-4 w-4 text-muted-foreground" /> {p}</span>
                      <Badge variant="outline" className={p === PROJECT.engine ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : ""}>
                        {p === PROJECT.engine ? "Connected" : "Available"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SCHEMA DESIGNER */}
          <TabsContent value="schema" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Generate Schema</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Database</div>
                    <Select defaultValue="postgres">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["PostgreSQL", "MySQL", "SQL Server", "Oracle", "MongoDB", "DynamoDB", "Neo4j"].map((d) => (
                          <SelectItem key={d} value={d.toLowerCase().replace(/\s/g, "")}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Generate From</div>
                    <Select defaultValue="requirements">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[["requirements","Requirements"], ["stories","User Stories"], ["existing","Existing Database"], ["er","ER Diagram"]].map(([v,l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full"><Sparkles className="h-4 w-4" /> Generate Schema</Button>
                  </div>
                </div>
                <Textarea rows={5} placeholder="Describe the domain, entities and business rules — the AI will produce tables, columns, keys, constraints and indexes." />
                <div className="flex flex-wrap gap-2">
                  {["Generate Tables","Generate Relationships","Generate Constraints","Generate Indexes","Detect Missing Tables","Suggest Improvements"].map((a) => (
                    <Button key={a} variant="outline" size="sm">{a}</Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATA MODEL */}
          <TabsContent value="model" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Visual Data Model</CardTitle>
                  <Select defaultValue="er">
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[["er","ER Diagram"],["star","Star Schema"],["snowflake","Snowflake"],["graph","Graph"],["document","Document"],["dim","Dimensional"]].map(([v,l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <ERDiagram tables={ER_TABLES} relations={ER_RELATIONS} height={520} />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {ER_TABLES.length} entities · {ER_RELATIONS.length} relationships · drag nodes to rearrange
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">AI Model Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {["Generate ER Diagram","Normalize Data","Suggest Better Relationships","Generate Business Rules"].map((a) => (
                    <Button key={a} variant="outline" size="sm" className="w-full justify-start">{a}</Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TABLES & RELATIONSHIPS */}
          <TabsContent value="tables" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-56">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={tableQuery} onChange={(e) => setTableQuery(e.target.value)} placeholder="Search tables…" className="pl-8" />
              </div>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ok">Healthy</SelectItem>
                  <SelectItem value="warn">Warnings</SelectItem>
                  <SelectItem value="bad">Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-3">Table</div>
                  <div className="col-span-2">Rows</div>
                  <div className="col-span-1">Size</div>
                  <div className="col-span-1">Cols</div>
                  <div className="col-span-2">Keys</div>
                  <div className="col-span-1">Idx</div>
                  <div className="col-span-2">Health</div>
                </div>
                {filteredTables.map((t) => (
                  <div key={t.name} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-3 font-mono">{t.name}</div>
                    <div className="col-span-2 text-muted-foreground">{t.rows}</div>
                    <div className="col-span-1 text-muted-foreground">{t.size}</div>
                    <div className="col-span-1 text-muted-foreground">{t.cols}</div>
                    <div className="col-span-2 text-xs">{t.keys}</div>
                    <div className="col-span-1">{t.indexes}</div>
                    <div className="col-span-2">
                      <HealthBadge status={t.health} />
                      {t.note && <div className="mt-0.5 text-[10px] text-muted-foreground">{t.note}</div>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Relationships</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-4">From</div>
                  <div className="col-span-4">To</div>
                  <div className="col-span-2">Kind</div>
                  <div className="col-span-2">Integrity</div>
                </div>
                {RELATIONSHIPS.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-4 font-mono">{r.from}</div>
                    <div className="col-span-4 font-mono">{r.to}</div>
                    <div className="col-span-2"><Badge variant="outline">{r.kind}</Badge></div>
                    <div className="col-span-2">
                      <HealthBadge status={r.integrity} />
                      {r.note && <div className="mt-0.5 text-[10px] text-muted-foreground">{r.note}</div>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Detections</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-5 text-sm">
                <MiniStat label="Missing FKs" value="2" tone="warn" />
                <MiniStat label="Circular Refs" value="0" tone="ok" />
                <MiniStat label="Duplicate Tables" value="1" tone="warn" />
                <MiniStat label="Poor Naming" value="4" tone="warn" />
                <MiniStat label="Missing Constraints" value="3" tone="warn" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUERY ANALYZER */}
          <TabsContent value="query" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Analyze SQL</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea rows={5} value={sqlInput} onChange={(e) => setSqlInput(e.target.value)} className="font-mono text-xs" />
                <div className="flex flex-wrap gap-2">
                  <Button><PlayCircle className="h-4 w-4" /> Analyze</Button>
                  <Button variant="outline"><Sparkles className="h-4 w-4" /> Rewrite Query</Button>
                  <Button variant="outline"><KeyRound className="h-4 w-4" /> Suggest Indexes</Button>
                  <Button variant="outline"><Gauge className="h-4 w-4" /> Explain Plan</Button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                  <MiniStat label="Exec Time" value="1.24s" tone="bad" />
                  <MiniStat label="Rows Scanned" value="1.2M" tone="warn" />
                  <MiniStat label="Rows Returned" value="50" />
                  <MiniStat label="Memory" value="82MB" />
                  <MiniStat label="CPU" value="High" tone="warn" />
                  <MiniStat label="Cost Est." value="18,420" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Slow Queries</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-6">Query</div>
                  <div className="col-span-1">ms</div>
                  <div className="col-span-2">Scanned</div>
                  <div className="col-span-3">AI Suggestion</div>
                </div>
                {SLOW_QUERIES.map((q, i) => (
                  <div key={i} className="grid grid-cols-12 items-start border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-6 truncate font-mono text-xs" title={q.sql}>{q.sql}</div>
                    <div className="col-span-1 text-rose-700">{q.ms}</div>
                    <div className="col-span-2 text-muted-foreground">{q.rows}</div>
                    <div className="col-span-3 text-xs">{q.suggestion}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERFORMANCE */}
          <TabsContent value="perf" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Slow Queries" value={String(PROJECT.slowQueries)} tone="warn" />
              <MiniStat label="Missing Indexes" value="3" tone="warn" />
              <MiniStat label="Table Scans" value="12" tone="warn" />
              <MiniStat label="Deadlocks" value="0" tone="ok" />
              <MiniStat label="Lock Contention" value="Low" tone="ok" />
              <MiniStat label="Cache Hit" value="98.4%" tone="ok" />
              <MiniStat label="Connections" value={`${PROJECT.connections}/100`} />
              <MiniStat label="Fragmentation" value="6%" tone="ok" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Resource Trends</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid h-48 place-items-center rounded-md border bg-muted/30 text-sm text-muted-foreground">
                    CPU · Memory · Storage growth (last 30d)
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">AI Optimization</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    ["Partition attendance by month", "-38% scan time"],
                    ["Add composite index (user_id, read) on notifications", "-71% query time"],
                    ["Introduce read replica for analytics queries", "-24% primary load"],
                    ["Cache dept list (5m TTL)", "-12ms per page"],
                    ["Archive audit_logs > 6 months", "-2.4GB storage"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span>{k}</span>
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">{v}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Security Score" value={`${PROJECT.security}%`} tone="ok" />
              <MiniStat label="Critical Risks" value="1" tone="bad" />
              <MiniStat label="Warnings" value="3" tone="warn" />
              <MiniStat label="Passed Checks" value="12" tone="ok" />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-4">Check</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-6">Notes</div>
                </div>
                {SECURITY_CHECKS.map((c) => (
                  <div key={c.area} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-4 flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" />{c.area}</div>
                    <div className="col-span-2"><HealthBadge status={c.status} /></div>
                    <div className="col-span-6 text-muted-foreground">{c.note}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Security Suggestions</CardTitle></CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                {["Encrypt employees.ssn & users.email", "Enable Row-Level Security on 4 tables", "Rotate DB credentials", "Restrict SUPERUSER roles", "Mask PII in non-prod backups"].map((s) => (
                  <div key={s} className="flex items-start gap-2 rounded-md border p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /> {s}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MIGRATIONS */}
          <TabsContent value="migrations" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {["Flyway","Liquibase","Alembic","Prisma","TypeORM","Entity Framework"].map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-3">ID</div>
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-1">Age</div>
                  <div className="col-span-2">Status</div>
                </div>
                {MIGRATIONS.map((m) => (
                  <div key={m.id} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-3 font-mono text-xs">{m.id}</div>
                    <div className="col-span-4 font-mono text-xs">{m.name}</div>
                    <div className="col-span-2 text-muted-foreground">{m.author}</div>
                    <div className="col-span-1 text-xs text-muted-foreground">{m.date}</div>
                    <div className="col-span-2"><MigrationBadge status={m.status} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline"><Sparkles className="h-4 w-4" /> Generate Migration</Button>
              <Button variant="outline"><CheckCircle2 className="h-4 w-4" /> Validate</Button>
              <Button variant="outline"><AlertTriangle className="h-4 w-4" /> Detect Conflicts</Button>
              <Button variant="outline"><RefreshCw className="h-4 w-4" /> Rollback Plan</Button>
            </div>
          </TabsContent>

          {/* BACKUP & RECOVERY */}
          <TabsContent value="backup" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="Backup Health" value="Healthy" tone="ok" />
              <MiniStat label="RPO" value="15 min" />
              <MiniStat label="RTO" value="30 min" />
              <MiniStat label="DR Status" value="Warm Standby" tone="ok" />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-3">When</div>
                  <div className="col-span-3">Location</div>
                  <div className="col-span-2">Status</div>
                </div>
                {BACKUPS.map((b, i) => (
                  <div key={i} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-2">{b.type}</div>
                    <div className="col-span-2 text-muted-foreground">{b.size}</div>
                    <div className="col-span-3 text-muted-foreground">{b.when}</div>
                    <div className="col-span-3 font-mono text-xs">{b.location}</div>
                    <div className="col-span-2"><HealthBadge status={b.status} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline"><Save className="h-4 w-4" /> Run Backup</Button>
              <Button variant="outline"><CheckCircle2 className="h-4 w-4" /> Validate Backup</Button>
              <Button variant="outline"><PlayCircle className="h-4 w-4" /> Simulate Recovery</Button>
              <Button variant="outline"><Shield className="h-4 w-4" /> DR Assessment</Button>
            </div>
          </TabsContent>

          {/* AI DATABASE REVIEW */}
          <TabsContent value="review" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Database Score</div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-3xl">{PROJECT.health}%</span>
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Production Ready</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Senior Database Architect review across schema, normalization, indexing, performance, security and scalability.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-3">Area</div>
                  <div className="col-span-1">Score</div>
                  <div className="col-span-2">Verdict</div>
                  <div className="col-span-6">AI Notes</div>
                </div>
                {REVIEW.map((r) => (
                  <div key={r.area} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-3">{r.area}</div>
                    <div className="col-span-1 font-display">{r.score}</div>
                    <div className="col-span-2"><VerdictBadge v={r.verdict} /></div>
                    <div className="col-span-6 text-muted-foreground">{r.note}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENTATION */}
          <TabsContent value="docs" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Auto-Generated Documents</CardTitle>
                  <Badge variant="outline">{DOCS.length} documents</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {DOCS.map((d) => (
                    <div key={d.key} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
                      <div className="min-w-0 flex items-start gap-2.5">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{d.title}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {d.pages} pages · updated {d.updated} · {d.owner}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {d.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="hidden md:inline-flex text-[10px]">{t}</Badge>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => setOpenDoc(d)}>View</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">AI Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {["Generate Documentation","Update Documentation","Export Documentation","Version Documentation","Generate Data Dictionary"].map((a) => (
                    <Button key={a} variant="outline" size="sm" className="w-full justify-start"><Sparkles className="h-4 w-4" /> {a}</Button>
                  ))}
                  <div className="mt-3 rounded-md border p-3 text-sm">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Coverage</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-display text-lg">78%</span>
                      <Progress value={78} className="h-1.5 flex-1" />
                    </div>
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Freshness</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Latest update: {DOCS[0].updated} · 2 documents older than 1 week
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* VERSION HISTORY */}
          <TabsContent value="versions" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 border-b px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-1">Version</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-1">Age</div>
                  <div className="col-span-4">Changes</div>
                  <div className="col-span-2">Approval</div>
                  <div className="col-span-2">Delta</div>
                </div>
                {VERSIONS.map((v) => (
                  <div key={v.v} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0">
                    <div className="col-span-1 font-mono">{v.v}</div>
                    <div className="col-span-2 text-muted-foreground">{v.author}</div>
                    <div className="col-span-1 text-xs text-muted-foreground">{v.date}</div>
                    <div className="col-span-4">{v.changes}</div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={v.approval === "approved" ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : "bg-amber-500/15 text-amber-700 border-amber-500/30"}>
                        {v.approval}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      <span className="text-emerald-700">+{v.added}</span> · <span className="text-rose-700">−{v.removed}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Version Comparison</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
                <ChangeCell icon={<TableIcon className="h-4 w-4" />} k="Added Tables" v="3" tone="ok" />
                <ChangeCell icon={<TableIcon className="h-4 w-4" />} k="Removed Columns" v="6" tone="warn" />
                <ChangeCell icon={<KeyRound className="h-4 w-4" />} k="New Constraints" v="8" tone="ok" />
                <ChangeCell icon={<GitCommit className="h-4 w-4" />} k="Migrations" v="12" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Architect Sheet */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> AI Database Architect</SheetTitle>
          </SheetHeader>
          <div className="border-b p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Quick actions</div>
            <div className="flex flex-wrap gap-1.5">
              {AI_ACTIONS.map((a) => (
                <Button key={a} variant="outline" size="sm" className="h-7 text-xs" onClick={() => sendChat(a)}>{a}</Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {chat.map((m, i) => (
                <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "ai" ? "bg-muted" : "ml-auto bg-primary text-primary-foreground"}`}>
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Ask the database architect…"
              />
              <Button size="icon" onClick={() => sendChat()}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Document Viewer Sheet */}
      <Sheet open={!!openDoc} onOpenChange={(o) => !o && setOpenDoc(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
          {openDoc && (
            <>
              <SheetHeader className="space-y-2 border-b p-5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> Database Documentation
                </div>
                <SheetTitle className="text-xl">{openDoc.title}</SheetTitle>
                <SheetDescription className="text-sm">{openDoc.summary}</SheetDescription>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Up to date</Badge>
                  <span>· {openDoc.pages} pages</span>
                  <span>· updated {openDoc.updated}</span>
                  <span>· {openDoc.owner}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {openDoc.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Download</Button>
                  <Button size="sm" variant="outline"><Copy className="h-3.5 w-3.5" /> Copy</Button>
                  <Button size="sm" variant="outline"><Printer className="h-3.5 w-3.5" /> Print</Button>
                  <Button size="sm"><Sparkles className="h-3.5 w-3.5" /> AI Refresh</Button>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="space-y-6 p-6">
                  {openDoc.sections.map((s) => (
                    <section key={s.heading} className="space-y-2">
                      <h3 className="font-display text-base">{s.heading}</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                      {s.code && (
                        <pre className="mt-2 overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
{s.code}
                        </pre>
                      )}
                    </section>
                  ))}
                  <div className="rounded-md border bg-muted/30 p-4 text-xs text-muted-foreground">
                    Generated by the AI Database Architect from live schema introspection.
                    Sections update automatically when migrations are applied.
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ============================================================================
   Helpers
   ========================================================================= */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function ScoreField({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="font-display text-lg">{value}%</span>
        <Progress value={value} className="h-1.5 w-24" />
      </div>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-lg">{value}</div>
    </div>
  );
}

function HealthBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ok: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    pass: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    bad: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  };
  const label: Record<string, string> = { ok: "Healthy", pass: "Pass", warn: "Warning", bad: "Critical" };
  return <Badge variant="outline" className={map[status] ?? ""}>{label[status] ?? status}</Badge>;
}

function MigrationBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    applied: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    "rolled back": "bg-rose-500/15 text-rose-700 border-rose-500/30",
  };
  return <Badge variant="outline" className={`capitalize ${map[status] ?? ""}`}>{status}</Badge>;
}

function VerdictBadge({ v }: { v: string }) {
  const map: Record<string, string> = {
    Excellent: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    Good: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    "Needs Improvement": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  };
  return <Badge variant="outline" className={map[v] ?? ""}>{v}</Badge>;
}

function MiniStat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "ok" | "warn" | "bad" }) {
  const cls = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-rose-600" : "";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 font-display text-2xl ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function ChangeCell({ icon, k, v, tone }: { icon: React.ReactNode; k: string; v: string; tone?: "ok" | "warn" }) {
  const cls = tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "";
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">{icon} {k}</div>
      <div className={`mt-1 font-display text-lg ${cls}`}>{v}</div>
    </div>
  );
}
