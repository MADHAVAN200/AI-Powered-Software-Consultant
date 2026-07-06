import type { Edge, Node } from "reactflow";
import { MarkerType } from "reactflow";

export type DiagramKind =
  | "flow"
  | "sequence"
  | "component"
  | "deployment"
  | "er"
  | "microservices";

export interface GeneratedDiagram {
  nodes: Node[];
  edges: Edge[];
  kind: DiagramKind;
  title: string;
}

/* ---------- helpers ---------- */

const COLORS = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#ec4899", // pink
  "#3b82f6", // blue
  "#14b8a6", // teal
  "#f97316", // orange
];

function colorFor(label: string, sub?: string, id?: string) {
  const t = `${label} ${sub ?? ""}`.toLowerCase();
  if (/user|client|actor|customer/.test(t)) return "#6366f1";
  if (/db|database|postgres|mongo|redis|sql|vector|rds|store/.test(t)) return "#10b981";
  if (/kafka|queue|topic|event|bus|sqs|stream|pub|sub/.test(t)) return "#f59e0b";
  if (/gateway|cdn|edge|proxy|lb|load ?balancer|nginx|cloudfront/.test(t)) return "#06b6d4";
  if (/auth|security|jwt|iam/.test(t)) return "#ef4444";
  if (/ai|ml|llm|model|embed|orchestrat/.test(t)) return "#8b5cf6";
  if (/cloud|aws|gcp|azure|s3/.test(t)) return "#3b82f6";
  if (/worker|job|cron|lambda|function/.test(t)) return "#ec4899";
  if (/service|api|micro/.test(t)) return "#14b8a6";
  return COLORS[Math.abs(hash(id ?? label)) % COLORS.length];
}

function makeNode(
  id: string,
  label: string,
  x: number,
  y: number,
  opts: { color?: string; kind?: string; sub?: string } = {},
): Node {
  const color = opts.color ?? colorFor(label, opts.sub, id);
  return {
    id,
    position: { x, y },
    data: { label, sub: opts.sub, kind: opts.kind, color },
    type: "arch",
    draggable: true,
  };
}

function makeEdge(source: string, target: string, label?: string, animated = false, color?: string): Edge {
  const stroke = color ?? "#94a3b8";
  return {
    id: `${source}->${target}-${label ?? ""}`,
    source,
    target,
    label,
    animated,
    type: "smoothstep",
    pathOptions: { borderRadius: 18, offset: 20 } as never,
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: stroke },
    style: { stroke, strokeWidth: animated ? 2.2 : 1.8, opacity: 0.95 },
    labelStyle: { fontSize: 10, fontWeight: 600, fill: "hsl(var(--foreground))" },
    labelBgStyle: { fill: "hsl(var(--card))", fillOpacity: 0.95 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 6,
  };
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

/* ---------- text parser ---------- */

/**
 * Parses free-form input into nodes/edges.
 * Supported syntax (mix freely):
 *   A -> B                (edge)
 *   A -> B : label        (edge with label)
 *   A => B                (animated edge)
 *   A, B, C -> D          (fan-in)
 *   Frontend | React      (node with sublabel)
 *   # System Title        (title)
 *   Users -> CDN -> LB -> API -> DB   (pipeline chain)
 */
export function generateFromText(input: string, kindHint?: DiagramKind): GeneratedDiagram {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));

  let title = "Generated Diagram";
  const nodeMap = new Map<string, { label: string; sub?: string }>();
  const edges: { s: string; t: string; label?: string; animated?: boolean }[] = [];

  const addNode = (raw: string) => {
    const [name, sub] = raw.split("|").map((x) => x.trim());
    const id = slug(name);
    if (!nodeMap.has(id)) nodeMap.set(id, { label: name, sub });
    else if (sub && !nodeMap.get(id)!.sub) nodeMap.get(id)!.sub = sub;
    return id;
  };

  for (const line of lines) {
    if (line.startsWith("#")) {
      title = line.replace(/^#+\s*/, "");
      continue;
    }

    // Chain: A -> B -> C -> D
    const chainSep = line.includes("=>") ? "=>" : "->";
    if (line.includes(chainSep)) {
      const [pathPart, ...labelParts] = line.split(":");
      const label = labelParts.join(":").trim() || undefined;
      const animated = line.includes("=>");
      const parts = pathPart.split(chainSep).map((p) => p.trim()).filter(Boolean);
      for (let i = 0; i < parts.length - 1; i++) {
        const lefts = parts[i].split(",").map((x) => x.trim()).filter(Boolean);
        const rights = parts[i + 1].split(",").map((x) => x.trim()).filter(Boolean);
        for (const l of lefts) for (const r of rights) {
          const ls = addNode(l);
          const rs = addNode(r);
          edges.push({ s: ls, t: rs, label: i === parts.length - 2 ? label : undefined, animated });
        }
      }
      continue;
    }

    // Plain node
    addNode(line);
  }

  // Layout — layered by dependency depth
  const nodes = layout(nodeMap, edges);
  const rfEdges = edges.map((e) => {
    const src = nodeMap.get(e.s);
    const color = src ? colorFor(src.label, src.sub, e.s) : undefined;
    return makeEdge(e.s, e.t, e.label, e.animated, color);
  });

  return {
    nodes,
    edges: rfEdges,
    kind: kindHint ?? "flow",
    title,
  };
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "node";
}

function layout(
  nodeMap: Map<string, { label: string; sub?: string }>,
  edges: { s: string; t: string }[],
): Node[] {
  const ids = [...nodeMap.keys()];
  // Compute depth via BFS from roots (nodes with no incoming edge)
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  ids.forEach((id) => {
    incoming.set(id, 0);
    outgoing.set(id, []);
  });
  edges.forEach((e) => {
    incoming.set(e.t, (incoming.get(e.t) ?? 0) + 1);
    outgoing.get(e.s)?.push(e.t);
  });

  const depth = new Map<string, number>();
  const queue: string[] = ids.filter((id) => (incoming.get(id) ?? 0) === 0);
  queue.forEach((id) => depth.set(id, 0));
  while (queue.length) {
    const cur = queue.shift()!;
    const d = depth.get(cur) ?? 0;
    for (const nxt of outgoing.get(cur) ?? []) {
      const nd = Math.max(depth.get(nxt) ?? 0, d + 1);
      if (nd !== depth.get(nxt)) {
        depth.set(nxt, nd);
        queue.push(nxt);
      }
    }
  }
  // Fallback for nodes not reached
  ids.forEach((id) => {
    if (!depth.has(id)) depth.set(id, 0);
  });

  const byDepth = new Map<number, string[]>();
  ids.forEach((id) => {
    const d = depth.get(id) ?? 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(id);
  });

  const COL_W = 300;
  const ROW_H = 120;
  const nodes: Node[] = [];
  [...byDepth.keys()].sort((a, b) => a - b).forEach((d) => {
    const col = byDepth.get(d)!;
    col.forEach((id, i) => {
      const meta = nodeMap.get(id)!;
      const x = d * COL_W;
      const y = i * ROW_H - ((col.length - 1) * ROW_H) / 2;
      nodes.push(makeNode(id, meta.label, x, y, { sub: meta.sub }));
    });
  });
  return nodes;
}

/* ---------- Preset generators from structured data ---------- */

export function diagramFromServices(services: { name: string; deps: string[]; tech: string }[]): GeneratedDiagram {
  const nodeMap = new Map<string, { label: string; sub?: string }>();
  const edges: { s: string; t: string; label?: string; animated?: boolean }[] = [];
  services.forEach((s) => {
    const id = slug(s.name);
    nodeMap.set(id, { label: s.name, sub: s.tech });
    s.deps.forEach((d) => {
      const did = slug(d);
      if (!nodeMap.has(did)) nodeMap.set(did, { label: d });
      edges.push({ s: id, t: did, animated: true });
    });
  });
  return {
    nodes: layout(nodeMap, edges),
    edges: edges.map((e) => {
      const src = nodeMap.get(e.s);
      const color = src ? colorFor(src.label, src.sub, e.s) : undefined;
      return makeEdge(e.s, e.t, e.label, e.animated, color);
    }),
    kind: "microservices",
    title: "Microservices Dependency Graph",
  };
}

export function diagramFromEvents(events: { topic: string; publisher: string; consumers: string[]; broker: string }[]): GeneratedDiagram {
  const nodeMap = new Map<string, { label: string; sub?: string }>();
  const edges: { s: string; t: string; label?: string; animated?: boolean }[] = [];
  events.forEach((e) => {
    const pub = slug(e.publisher);
    const topic = slug(`topic-${e.topic}`);
    nodeMap.set(pub, { label: e.publisher, sub: "publisher" });
    nodeMap.set(topic, { label: e.topic, sub: e.broker });
    edges.push({ s: pub, t: topic, animated: true });
    e.consumers.forEach((c) => {
      const cid = slug(c);
      if (!nodeMap.has(cid)) nodeMap.set(cid, { label: c, sub: "consumer" });
      edges.push({ s: topic, t: cid, animated: true });
    });
  });
  return {
    nodes: layout(nodeMap, edges),
    edges: edges.map((e) => {
      const src = nodeMap.get(e.s);
      const color = src ? colorFor(src.label, src.sub, e.s) : undefined;
      return makeEdge(e.s, e.t, e.label, e.animated, color);
    }),
    kind: "flow",
    title: "Event Flow",
  };
}

export const SAMPLE_INPUTS: Record<string, string> = {
  "High Level": `# High Level Architecture
Users -> CloudFront -> Load Balancer -> API Gateway
API Gateway => Auth Service, User Service, Project Service
Project Service => Postgres | RDS Aurora
Project Service => Kafka | Event Bus
Kafka => Notification, Analytics, AI Orchestrator
AI Orchestrator => Vector DB | pgvector`,


  "Sequence": `# Login Sequence
User -> Web App : click login
Web App -> API Gateway : POST /auth
API Gateway -> Auth Service : validate
Auth Service -> Postgres : query user
Auth Service => Redis : cache session
Auth Service -> Web App : JWT`,

  "Event Flow": `# Event Flow
Project Service => Kafka : project.created
Kafka => Notification, Analytics, AI Orchestrator
AI Orchestrator => Vector DB : embed
Analytics => ClickHouse : record`,

  "ER": `# Entity Relationships
User -> Project : owns
Project -> Requirement : contains
Project -> Document : has
Requirement -> AIReview : generates
Document -> AIReview : generates`,
};
