import { ClipboardList } from "lucide-react"
import { TaskFormDialog } from "./task-form-dialog"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card/30 px-6 py-16 text-center">
      <ClipboardList className="size-12 text-muted-foreground" aria-hidden />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">No tasks yet</h2>
        <p className="text-sm text-muted-foreground">
          Add your first task to get started.
        </p>
      </div>
      <TaskFormDialog />
    </div>
  )
}
