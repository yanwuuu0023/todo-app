import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotebookPen } from "lucide-react"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <NotebookPen className="size-12 text-primary" aria-hidden />
        <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground">
          TodoApp
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Stay on top of college life. Assignments, club tasks, and personal
          goals — in one place.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          Get started
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Sign in
        </Button>
      </div>
    </main>
  )
}
