import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { projectChat } from "@/lib/ai.functions";
import { useCurrentProject } from "@/hooks/use-current-project";

import { PageHeader } from "@/routes/_authenticated/route";
import { EmptyState, Markdown } from "@/components/ui-blocks";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/_authenticated/modules/assistant")({ component: Assistant });

function Assistant() {
  const { projectId, current } = useCurrentProject();
  const chatFn = useServerFn(projectChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const m = useMutation({
    mutationFn: (next: Msg[]) => chatFn({ data: { project_id: projectId!, messages: next } }),
    onSuccess: (r) => setMessages((prev) => [...prev, { role: "assistant", content: r.reply }]),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim() || !projectId) return;
    const next: Msg[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    m.mutate(next);
  };

  const suggestions = [
    "Explain this architecture",
    "What are the top security risks?",
    "Show missing requirements",
    "Generate a deployment checklist",
  ];

  return (
    <>
      <PageHeader
        title="AI Project Assistant"
        description="Ask anything about your project. Answers are grounded in your latest documentation and reviews."
      />
      <div className="flex w-full flex-1 flex-col px-8 py-6">
        {!current ? (
          <EmptyState icon={MessageSquare} title="Select a project" />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
              {messages.length === 0 && (
                <div className="rounded-xl border bg-card p-6">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-accent" /> Ready when you are</div>
                  <p className="text-sm text-muted-foreground">Ask a question about <span className="font-medium text-foreground">{current.name}</span>. Try one:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => setInput(s)} className="rounded-full border bg-surface px-3 py-1 text-xs hover:bg-secondary">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`rounded-xl border p-4 ${msg.role === "user" ? "bg-secondary" : "bg-card"}`}>
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {msg.role === "user" ? "You" : "Assistant"}
                  </div>
                  {msg.role === "user" ? <p className="text-sm whitespace-pre-wrap">{msg.content}</p> : <Markdown>{msg.content}</Markdown>}
                </div>
              ))}
              {m.isPending && <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">Thinking…</div>}
            </div>
            <div className="sticky bottom-0 border-t bg-background pt-3">
              <div className="flex gap-2">
                <Textarea
                  rows={2}
                  placeholder="Ask about architecture, security, requirements…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
                />
                <Button onClick={send} disabled={m.isPending || !input.trim()} className="self-end"><Send className="h-4 w-4" /></Button>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Cmd/Ctrl + Enter to send</div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
