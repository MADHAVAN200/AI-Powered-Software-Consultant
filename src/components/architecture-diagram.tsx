import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Database, Server, Cloud, Users, Zap, Cpu, Globe, Shield,
  Boxes, Radio, Layers, Box, Network, Workflow, HardDrive,
} from "lucide-react";

/* ----- pick an icon from label/sub ----- */
function pickIcon(label: string, sub?: string) {
  const t = `${label} ${sub ?? ""}`.toLowerCase();
  if (/user|client|customer|actor/.test(t)) return Users;
  if (/db|database|postgres|mongo|redis|sql|store|vector|rds/.test(t)) return Database;
  if (/kafka|queue|topic|event|bus|sqs|pub|sub|stream/.test(t)) return Radio;
  if (/gateway|proxy|edge|cdn|cloudfront|load ?balancer|lb|nginx/.test(t)) return Globe;
  if (/auth|security|jwt|iam|guard/.test(t)) return Shield;
  if (/ai|ml|model|llm|vector|embed|orchestrat/.test(t)) return Cpu;
  if (/service|api|micro/.test(t)) return Server;
  if (/cloud|aws|gcp|azure|s3|bucket/.test(t)) return Cloud;
  if (/worker|job|cron|lambda|function/.test(t)) return Zap;
  if (/storage|disk|volume|file/.test(t)) return HardDrive;
  if (/network|vpc|mesh/.test(t)) return Network;
  if (/flow|pipeline|workflow/.test(t)) return Workflow;
  if (/layer|module/.test(t)) return Layers;
  if (/container|pod|k8s/.test(t)) return Boxes;
  return Box;
}

function ArchNode({ data }: NodeProps<{ label: string; sub?: string; color?: string }>) {
  const Icon = pickIcon(data.label, data.sub);
  const color = data.color ?? "hsl(var(--primary))";
  return (
    <div
      className="group relative rounded-xl border border-border/70 bg-card px-3.5 py-2.5 shadow-sm min-w-[168px] max-w-[200px] transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{
        boxShadow: `0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px ${color}22, 0 8px 24px -12px ${color}55`,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !border-2 !bg-background"
        style={{ borderColor: color }}
      />
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${color}18`, color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold leading-tight text-foreground truncate">
            {data.label}
          </div>
          {data.sub && (
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
              {data.sub}
            </div>
          )}
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-xl opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !border-2 !bg-background"
        style={{ borderColor: color }}
      />
    </div>
  );
}

const nodeTypes = { arch: ArchNode };

interface Props {
  nodes: Node[];
  edges: Edge[];
  height?: number;
}

export function ArchitectureDiagram({ nodes: initialNodes, edges: initialEdges, height = 560 }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);
  useEffect(() => setEdges(initialEdges), [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "hsl(var(--accent))" },
            style: { stroke: "hsl(var(--accent))", strokeWidth: 1.6 },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const types = useMemo(() => nodeTypes, []);

  return (
    <div
      style={{
        height,
        backgroundImage:
          "radial-gradient(circle at 20% 10%, hsl(var(--accent) / 0.06), transparent 40%), radial-gradient(circle at 80% 90%, hsl(var(--primary) / 0.05), transparent 45%)",
      }}
      className="rounded-xl border bg-surface overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={types}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="hsl(var(--border))" />
        <Controls
          className="!bg-card !border !border-border !rounded-lg !shadow-sm overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-card !border !border-border !rounded-lg overflow-hidden"
          pannable
          zoomable
          nodeColor={(n) => (n.data as { color?: string })?.color ?? "hsl(var(--primary))"}
          nodeStrokeWidth={2}
          maskColor="hsl(var(--muted) / 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
