import { useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  MarkerType,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { Key, Link2, Table as TableIcon } from "lucide-react";

/* -------------------------------- Types --------------------------------- */

export type ColumnKind = "pk" | "fk" | "unique" | "col";
export interface ERColumn {
  name: string;
  type: string;
  kind?: ColumnKind;
  fkTo?: string; // "table.column"
  nullable?: boolean;
}
export interface ERTable {
  name: string;
  schema?: string;
  columns: ERColumn[];
  color?: string;
  note?: string;
}
export interface ERRelation {
  from: string; // table name
  to: string;   // table name
  kind: "1-1" | "1-N" | "N-N";
  label?: string;
}

interface Props {
  tables: ERTable[];
  relations: ERRelation[];
  height?: number;
}

/* --------------------------- Palette per table --------------------------- */

const PALETTE = [
  "#6366f1", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981",
  "#ef4444", "#ec4899", "#3b82f6", "#14b8a6", "#f97316",
];
const colorFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

/* ----------------------------- Node component ---------------------------- */

function TableNode({ data }: NodeProps<{ table: ERTable }>) {
  const t = data.table;
  const color = t.color ?? colorFor(t.name);
  return (
    <div
      className="rounded-xl border border-border/70 bg-card shadow-sm overflow-hidden w-[240px]"
      style={{
        boxShadow: `0 1px 2px rgb(0 0 0 / 0.05), 0 0 0 1px ${color}22, 0 10px 28px -14px ${color}55`,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-background" style={{ borderColor: color }} />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-background" style={{ borderColor: color }} />

      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-border/60"
        style={{ background: `${color}14` }}
      >
        <div
          className="grid h-6 w-6 place-items-center rounded-md"
          style={{ background: `${color}26`, color }}
        >
          <TableIcon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold leading-tight truncate">{t.name}</div>
          {t.schema && <div className="text-[10px] text-muted-foreground truncate">{t.schema}</div>}
        </div>
        <span className="text-[10px] text-muted-foreground">{t.columns.length}</span>
      </div>

      <ul className="divide-y divide-border/50">
        {t.columns.map((c) => (
          <li key={c.name} className="flex items-center gap-2 px-3 py-1.5 text-[11px]">
            <span className="w-3 shrink-0">
              {c.kind === "pk" && <Key className="h-3 w-3 text-amber-500" />}
              {c.kind === "fk" && <Link2 className="h-3 w-3 text-sky-500" />}
            </span>
            <span className={`truncate font-mono ${c.kind === "pk" ? "font-semibold text-foreground" : "text-foreground/90"}`}>
              {c.name}
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{c.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const nodeTypes = { erTable: TableNode };

/* -------------------------------- Layout -------------------------------- */

function layoutTables(tables: ERTable[], relations: ERRelation[]) {
  // depth by BFS from tables with no incoming
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  tables.forEach((t) => { incoming.set(t.name, 0); outgoing.set(t.name, []); });
  relations.forEach((r) => {
    incoming.set(r.to, (incoming.get(r.to) ?? 0) + 1);
    outgoing.get(r.from)?.push(r.to);
  });
  const depth = new Map<string, number>();
  const roots = tables.filter((t) => (incoming.get(t.name) ?? 0) === 0).map((t) => t.name);
  const seeds = roots.length ? roots : tables.slice(0, 1).map((t) => t.name);
  const q: string[] = [...seeds];
  seeds.forEach((n) => depth.set(n, 0));
  // Cycle-safe BFS: visit each node at most once so cyclic relations
  // (e.g. employees <-> departments) cannot cause an infinite loop.
  while (q.length) {
    const cur = q.shift()!;
    const d = depth.get(cur) ?? 0;
    for (const nxt of outgoing.get(cur) ?? []) {
      if (!depth.has(nxt)) { depth.set(nxt, d + 1); q.push(nxt); }
    }
  }
  tables.forEach((t) => { if (!depth.has(t.name)) depth.set(t.name, 0); });

  const byDepth = new Map<number, ERTable[]>();
  tables.forEach((t) => {
    const d = depth.get(t.name) ?? 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(t);
  });

  const COL_W = 330;
  const ROW_H = 260;
  const nodes: Node[] = [];
  [...byDepth.keys()].sort((a, b) => a - b).forEach((d) => {
    const col = byDepth.get(d)!;
    col.forEach((t, i) => {
      nodes.push({
        id: t.name,
        type: "erTable",
        position: { x: d * COL_W, y: i * ROW_H - ((col.length - 1) * ROW_H) / 2 },
        data: { table: t },
        draggable: true,
      });
    });
  });
  return nodes;
}

/* --------------------------------- Main --------------------------------- */

export function ERDiagram({ tables, relations, height = 620 }: Props) {
  const initialNodes = useMemo(() => layoutTables(tables, relations), [tables, relations]);
  const initialEdges = useMemo<Edge[]>(
    () =>
      relations.map((r, i) => {
        const stroke = colorFor(r.from);
        return {
          id: `${r.from}->${r.to}-${i}`,
          source: r.from,
          target: r.to,
          type: "smoothstep",
          animated: true,
          label: r.label ?? r.kind,
          markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: stroke },
          style: { stroke, strokeWidth: 2, opacity: 0.95 },
          labelStyle: { fontSize: 10, fontWeight: 600, fill: "hsl(var(--foreground))" },
          labelBgStyle: { fill: "hsl(var(--card))", fillOpacity: 0.95 },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 6,
          pathOptions: { borderRadius: 20, offset: 24 } as never,
        };
      }),
    [relations],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);
  useEffect(() => setEdges(initialEdges), [initialEdges, setEdges]);

  return (
    <div
      style={{
        height,
        backgroundImage:
          "radial-gradient(circle at 15% 10%, hsl(var(--primary) / 0.06), transparent 45%), radial-gradient(circle at 85% 90%, hsl(var(--accent) / 0.06), transparent 50%)",
      }}
      className="rounded-xl border overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="hsl(var(--border))" />
        <Controls className="!bg-card !border !border-border !rounded-lg !shadow-sm overflow-hidden" showInteractive={false} />
        <MiniMap
          className="!bg-card !border !border-border !rounded-lg overflow-hidden"
          pannable
          zoomable
          nodeColor={(n) => colorFor((n.data as { table: ERTable }).table.name)}
          nodeStrokeWidth={2}
          maskColor="hsl(var(--muted) / 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
