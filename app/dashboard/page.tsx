import { createClient } from "@/lib/supabase/server"
import { NotebookPen } from "lucide-react"
import { EmptyState } from "./empty-state"
import { TaskFormDialog } from "./task-form-dialog"
import { UserMenu } from "./user-menu"
import { DashboardTabs } from "./dashboard-tabs"
import type { Task } from "./task-card"

type RawTask = {
  id: string
  title: string
  due_at: string | null
  priority: number
  completed: boolean
  created_at: string
}

function sortTasks(tasks: RawTask[]): RawTask[] {
  // Sort: due_at ASC, NULL last; completed at bottom
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    if (a.due_at && b.due_at) {
      return a.due_at.localeCompare(b.due_at)
    }
    if (a.due_at) return -1
    if (b.due_at) return 1
    return 0
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_at, priority, completed, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-8">
        <p className="text-sm text-destructive">Error: {error.message}</p>
      </main>
    )
  }

  const tasks: Task[] = (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    due_at: r.due_at,
    priority: r.priority,
    completed: r.completed,
    created_at: r.created_at,
  }))

  const sorted = sortTasks(tasks)
  const hasTasks = sorted.length > 0

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6 sm:p-8">
        <header className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
            <NotebookPen className="size-6 text-primary" aria-hidden />
            TodoApp
          </h1>
          <div className="flex items-center gap-2">
            {user?.email && <UserMenu email={user.email} />}
            {hasTasks && <TaskFormDialog />}
          </div>
        </header>

        {hasTasks ? <DashboardTabs tasks={sorted} /> : <EmptyState />}
      </div>
    </main>
  )
}
