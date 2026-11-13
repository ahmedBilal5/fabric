/**
 * Sample data held in memory. Replace `ProjectsProvider` with calls to your API: the
 * pages only use `useProjects()`.
 */

import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

export type ProjectStatus = "planned" | "active" | "done";

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  owner: string;
  /** Budget in USD. */
  budget: number;
  /** Spent so far, in USD. */
  spent: number;
  /** Due date, `YYYY-MM-DD`. */
  due: string;
  description: string;
}

/** Everything about a project except its ID, as the form edits it. */
export type ProjectInput = Omit<Project, "id" | "spent">;

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "In progress",
  done: "Done",
};

export const OWNERS = ["Jane Doe", "Sam Lee", "Priya Patel"];

const SAMPLE: Project[] = [
  {
    id: "p-101",
    name: "Website redesign",
    client: "Acme Corporation",
    status: "active",
    owner: "Jane Doe",
    budget: 48000,
    spent: 31200,
    due: "2026-12-15",
    description: "New marketing site and design system rollout.",
  },
  {
    id: "p-102",
    name: "Mobile app launch",
    client: "Northwind Traders",
    status: "active",
    owner: "Sam Lee",
    budget: 120000,
    spent: 64000,
    due: "2027-02-01",
    description: "",
  },
  {
    id: "p-103",
    name: "Data warehouse",
    client: "Globex",
    status: "planned",
    owner: "Priya Patel",
    budget: 90000,
    spent: 0,
    due: "2027-04-30",
    description: "",
  },
  {
    id: "p-104",
    name: "Support portal",
    client: "Initech",
    status: "done",
    owner: "Jane Doe",
    budget: 26000,
    spent: 24800,
    due: "2026-09-30",
    description: "",
  },
  {
    id: "p-105",
    name: "Checkout revamp",
    client: "Contoso",
    status: "active",
    owner: "Priya Patel",
    budget: 35000,
    spent: 33900,
    due: "2026-11-28",
    description: "",
  },
  {
    id: "p-106",
    name: "Onboarding emails",
    client: "Fabrikam",
    status: "done",
    owner: "Sam Lee",
    budget: 8000,
    spent: 7100,
    due: "2026-08-15",
    description: "",
  },
  {
    id: "p-107",
    name: "Partner API",
    client: "Tailspin Toys",
    status: "planned",
    owner: "Jane Doe",
    budget: 52000,
    spent: 0,
    due: "2027-03-01",
    description: "",
  },
];

interface ProjectsValue {
  projects: Project[];
  saveProject: (input: ProjectInput, id?: string) => Promise<Project>;
  deleteProjects: (ids: readonly string[]) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsValue | null>(null);

/** Pretend network delay, so pages show their saving states. */
const wait = () => new Promise((r) => setTimeout(r, 300));

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(SAMPLE);
  const value = useMemo<ProjectsValue>(
    () => ({
      projects,
      saveProject: async (input, id) => {
        await wait();
        const existing = projects.find((p) => p.id === id);
        const project: Project = existing
          ? { ...existing, ...input }
          : {
              ...input,
              id: `p-${Math.max(100, ...projects.map((p) => Number(p.id.slice(2)))) + 1}`,
              spent: 0,
            };
        setProjects((list) =>
          existing ? list.map((p) => (p.id === id ? project : p)) : [project, ...list],
        );
        return project;
      },
      deleteProjects: async (ids) => {
        await wait();
        setProjects((list) => list.filter((p) => !ids.includes(p.id)));
      },
    }),
    [projects],
  );
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsValue {
  const value = useContext(ProjectsContext);
  if (!value) throw new Error("useProjects must be used inside <ProjectsProvider>");
  return value;
}
