"use client"

import {
  useActionState,
  useState,
  type ReactElement,
} from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { createTask, updateTask, type ActionResult } from "./actions"
import type { Task } from "./task-card"

function toLocalDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const defaultTriggerFor = (mode: "create" | "edit"): ReactElement =>
  mode === "create" ? (
    <Button>+ Add task</Button>
  ) : (
    <Button variant="ghost" size="icon-sm" aria-label="Edit task">
      <Pencil />
    </Button>
  )

export function TaskFormDialog({
  mode = "create",
  task,
  trigger,
}: {
  mode?: "create" | "edit"
  task?: Task
  trigger?: ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(task?.title ?? "")
  const [dueAt, setDueAt] = useState(
    task?.due_at ? toLocalDateTime(task.due_at) : "",
  )
  const [priority, setPriority] = useState(String(task?.priority ?? 0))

  const isEdit = mode === "edit"

  // useActionState: error flows back to UI automatically
  const [state, formAction, pending] = useActionState<
    { error: string | null } | ActionResult,
    FormData
  >(
    async (_, fd) => {
      const result = isEdit && task
        ? await updateTask(task.id, fd)
        : await createTask(fd)
      if ("success" in result) {
        setOpen(false)
      }
      return result
    },
    { error: null },
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? defaultTriggerFor(mode)} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit task" : "Add a task"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the task details below."
              : "Quick capture. Title is required; due date and priority are optional."}
          </DialogDescription>
        </DialogHeader>
        {"error" in state && state.error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}
        <form action={formAction} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="due_at">Due (optional)</FieldLabel>
              <Input
                id="due_at"
                name="due_at"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="priority">Priority</FieldLabel>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              >
                <option value="0">Low</option>
                <option value="1">Medium</option>
                <option value="2">High</option>
              </select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
