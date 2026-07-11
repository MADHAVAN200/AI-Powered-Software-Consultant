import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProjects } from "@/lib/projects.functions";

const KEY = "aristotle.currentProjectId";

export function useCurrentProject() {
  const fetchProjects = useServerFn(listProjects);
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

  const [id, setIdState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(KEY);
    if (stored && projects.some((p: any) => p.id === stored)) {
      setIdState(stored);
    } else if (projects[0]) {
      setIdState(projects[0].id);
      window.localStorage.setItem(KEY, projects[0].id);
    } else {
      setIdState(null);
    }
  }, [projects]);

  const setId = useCallback((next: string) => {
    setIdState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, next);
  }, []);

  const current = projects.find((p: any) => p.id === id) ?? null;
  return { projects, current, projectId: id, setProjectId: setId, isLoading };
}
