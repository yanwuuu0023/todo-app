"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskList } from "./task-list"
import { TaskFormDialog } from "./task-form-dialog"
import { EmptyState } from "./empty-state"
import { ClipboardList, Search, X } from "lucide-react"
import type { Task } from "./task-card"

type Tab = "all" | "today" | "done"
type SortKey = "due-asc" | "due-desc" | "priority" | "created-desc"

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "due-asc", label: "Due ↑" },
  { value: "due-desc", label: "Due ↓" },
  { value: "priority", label: "Priority" },
  { value: "created-desc", label: "Newest" },
]

function sortTasks(arr: Task[], key: SortKey): Task[] {
  const copy = [...arr]
  if (key === "due-asc") {
    // Tasks with due_at first (asc), null due_at last
    copy.sort((a, b) => {
      if (!a.due_at && !b.due_at) return 0
      if (!a.due_at) return 1
      if (!b.due_at) return -1
      return a.due_at.localeCompare(b.due_at)
    })
  } else if (key === "due-desc") {
    copy.sort((a, b) => {
      if (!a.due_at && !b.due_at) return 0
      if (!a.due_at) return 1
      if (!b.due_at) return -1
      return b.due_at.localeCompare(a.due_at)
    })
  } else if (key === "priority") {
    // Higher priority first; tiebreak by due_at asc (NULL last)
    copy.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      if (a.due_at && b.due_at) return a.due_at.localeCompare(b.due_at)
      if (a.due_at) return -1
      if (b.due_at) return 1
      return 0
    })
  } else {
    // created-desc: newest created first
    copy.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
  return copy
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

const emptyCopy: Record<Tab, { title: string; body: string }> = {
  all: { title: "No tasks yet", body: "Add your first task to get started." },
  today: { title: "Nothing due today", body: "Enjoy the calm, or plan ahead." },
  done: { title: "No completed tasks", body: "Check off a task and it will land here." },
}

function EmptyByTab({ tab }: { tab: Tab }) {
  const c = emptyCopy[tab]
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card/30 px-6 py-16 text-center">
      <ClipboardList className="size-12 text-muted-foreground" aria-hidden />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">{c.title}</h2>
        <p className="text-sm text-muted-foreground">{c.body}</p>
      </div>
      {tab === "all" && <TaskFormDialog />}
    </div>
  )
}

export function DashboardTabs({ tasks }: { tasks: Task[] }) {
  const [tab, setTab] = useState<Tab>("all")
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("due-asc")

  const counts = useMemo(
    () => ({
      all: tasks.length,
      today: tasks.filter((t) => t.due_at && isToday(t.due_at)).length,
      done: tasks.filter((t) => t.completed).length,
    }),
    [tasks],
  )

  const filtered = useMemo(() => {
    // 1. tab filter
    let arr: Task[] = tasks
    if (tab === "today") arr = arr.filter((t) => t.due_at && isToday(t.due_at))
    if (tab === "done") arr = arr.filter((t) => t.completed)
    // 2. search filter
    const q = query.trim().toLowerCase()
    if (q) arr = arr.filter((t) => t.title.toLowerCase().includes(q))
    // 3. sort
    return sortTasks(arr, sortKey)
  }, [tasks, tab, query, sortKey])

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as Tab)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
            aria-label="Search tasks"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Select
          value={sortKey}
          onValueChange={(v) => setSortKey(v as SortKey)}
        >
          <SelectTrigger className="sm:w-44" aria-label="Sort tasks">
            <SelectValue>
              {sortOptions.find((o) => o.value === sortKey)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TabsList>
        <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        <TabsTrigger value="today">Today ({counts.today})</TabsTrigger>
        <TabsTrigger value="done">Done ({counts.done})</TabsTrigger>
      </TabsList>
      <TabsContent value={tab} className="flex flex-col gap-2">
        {filtered.length > 0 ? <TaskList tasks={filtered} /> : <EmptyByTab tab={tab} />}
      </TabsContent>
    </Tabs>
  )
}
