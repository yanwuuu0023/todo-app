"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toggleTask, deleteTask } from "./actions"
import { TaskFormDialog } from "./task-form-dialog"

export type Task = {
  id: string
  title: string
  due_at: string | null
  priority: number
  completed: boolean
  created_at: string
}

const priorityConfig = {
  2: { label: "High", className: "bg-primary text-primary-foreground" },
  1: { label: "Med", className: "bg-accent text-accent-foreground" },
  0: { label: "Low", className: "bg-chart-4 text-foreground" },
} as const

function formatDue(dueAt: string | null): string {
  if (!dueAt) return ""
  const d = new Date(dueAt)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function TaskCard({ task }: { task: Task }) {
  const pCfg =
    priorityConfig[task.priority as 0 | 1 | 2] ?? priorityConfig[0]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(c) => toggleTask(task.id, c === true)}
        aria-label={`Mark "${task.title}" as ${task.completed ? "pending" : "done"}`}
      />
      <div className="flex flex-1 flex-col gap-1">
        <span
          className={
            task.completed
              ? "text-sm text-muted-foreground line-through"
              : "text-sm font-medium text-foreground"
          }
        >
          {task.title}
        </span>
        {task.due_at && (
          <span className="text-xs text-muted-foreground">
            Due {formatDue(task.due_at)}
          </span>
        )}
      </div>
      <Badge className={pCfg.className}>{pCfg.label}</Badge>
      <TaskFormDialog mode="edit" task={task} />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => deleteTask(task.id)}
        aria-label={`Delete "${task.title}"`}
      >
        <X />
      </Button>
    </div>
  )
}
