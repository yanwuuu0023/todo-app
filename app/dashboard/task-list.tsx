import { TaskCard, type Task } from "./task-card"

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  )
}
