"use client";

import { Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Textarea } from "@/components/ui/Textarea";
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from "@/lib/actions/projects";
import { fetchGoals } from "@/lib/actions/goals";
import type { DailyGoal, Project } from "@/lib/types";
import { projectProgress, todayISO } from "@/lib/utils/xp";

const priorities = ["Low", "Medium", "High", "Critical"];
const statuses = ["Planning", "Active", "Paused", "Completed"];

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  target_date: todayISO(),
  xp_reward: 50,
  status: "Planning",
};

export default function ProjectsPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [projectData, goalData] = await Promise.all([
          fetchProjects(),
          fetchGoals(),
        ]);
        setProjects(projectData);
        setGoals(goalData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        const status = String(a.status).localeCompare(String(b.status));
        if (status !== 0) return status;
        return String(a.target_date ?? "").localeCompare(String(b.target_date ?? ""));
      }),
    [projects],
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;

    try {
      setSaving(true);
      setError("");
      if (editingId) {
        const updated = await updateProject(editingId, {
          ...form,
          title: form.title.trim(),
          target_date: form.target_date || null,
        });
        setProjects((current) =>
          current.map((project) => (project.id === updated.id ? updated : project)),
        );
      } else {
        const created = await createProject({
          ...form,
          title: form.title.trim(),
          target_date: form.target_date || null,
        });
        setProjects((current) => [created, ...current]);
      }
      setForm(emptyForm);
      setEditingId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(project: Project) {
    try {
      setError("");
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
    }
  }

  function edit(project: Project) {
    setError("");
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description ?? "",
      priority: String(project.priority),
      target_date: project.target_date ?? "",
      xp_reward: project.xp_reward,
      status: String(project.status),
    });
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      titleInputRef.current?.focus();
    });
  }

  if (loading) return <PageShell>Loading projects...</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Operating system
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Projects
        </h1>
      </header>

      <div ref={formRef}>
      <Card
        title={editingId ? "Edit Project" : "Create Project"}
        eyebrow={editingId ? "Editing selected project" : undefined}
      >
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              ref={titleInputRef}
              value={form.title}
            />
            <Input
              label="Target Date"
              onChange={(event) =>
                setForm({ ...form, target_date: event.target.value })
              }
              type="date"
              value={form.target_date}
            />
          </div>
          <Textarea
            label="Description"
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            value={form.description}
          />
          <div className="grid gap-4 md:grid-cols-4">
            <Select
              label="Priority"
              onChange={(value) => setForm({ ...form, priority: value })}
              options={priorities}
              value={form.priority}
            />
            <Select
              label="Status"
              onChange={(value) => setForm({ ...form, status: value })}
              options={statuses}
              value={form.status}
            />
            <Input
              label="XP Reward"
              min={0}
              onChange={(event) =>
                setForm({ ...form, xp_reward: Number(event.target.value) })
              }
              type="number"
              value={form.xp_reward}
            />
            <div className="flex items-end gap-2">
              <Button disabled={saving} type="submit">
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {editingId ? "Save" : "Create"}
              </Button>
              {editingId && (
                <Button
                  onClick={() => {
                    setEditingId("");
                    setForm(emptyForm);
                  }}
                  type="button"
                  variant="secondary"
                >
                  <X size={16} />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </Card>
      </div>

      {sortedProjects.length === 0 ? (
        <EmptyState>No projects yet.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedProjects.map((project) => {
            const progress = projectProgress(project, goals);
            return (
              <Card className="flex flex-col" key={project.id}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {project.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#A1A1AA]">
                      {project.description || "No description."}
                    </p>
                  </div>
                </div>
                <ProgressBar value={progress.percentage} label="Progress" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Meta label="Status" value={project.status} />
                  <Meta label="Priority" value={project.priority} />
                  <Meta label="Target Date" value={project.target_date ?? "--"} />
                  <Meta label="XP Reward" value={`${project.xp_reward} XP`} />
                  <Meta label="Linked Goals" value={progress.total} />
                  <Meta label="Completion" value={`${progress.percentage}%`} />
                </div>
                <div className="mt-5 flex gap-2">
                  <Button onClick={() => edit(project)} type="button" variant="secondary">
                    <Edit3 size={16} />
                    Edit
                  </Button>
                  <Button onClick={() => remove(project)} type="button" variant="danger">
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
        {label}
      </span>
      <select
        className="h-11 w-full rounded-2xl border border-[#1A1A1A] bg-black/40 px-4 text-sm text-white outline-none focus:border-[#34D399]/70"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#1A1A1A] bg-black/25 p-3">
      <p className="text-xs text-[#A1A1AA]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-sm text-[#A1A1AA]">
      {children}
    </div>
  );
}
