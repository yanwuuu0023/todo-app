"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type ActionResult = { success: true } | { error: string }

export async function createTask(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const title = (formData.get("title") as string)?.trim()
  const dueAtRaw = (formData.get("due_at") as string)?.trim()
  const priorityRaw = formData.get("priority") as string

  if (!title) {
    return { error: "Title is required." }
  }

  // Check for duplicate (same user, same title, NOT yet completed)
  const { data: existing } = await supabase
    .from("tasks")
    .select("id")
    .ilike("title", title)
    .eq("user_id", user.id)
    .eq("completed", false)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: `You already have an active task named "${title}".` }
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    description: null,
    due_at: dueAtRaw ? new Date(dueAtRaw).toISOString() : null,
    priority: priorityRaw ? parseInt(priorityRaw, 10) : 0,
    completed: false,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function toggleTask(
  id: string,
  completed: boolean,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("tasks")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function updateTask(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Title is required." }

  // Check for duplicate (exclude current task, NOT yet completed)
  const { data: existing } = await supabase
    .from("tasks")
    .select("id")
    .ilike("title", title)
    .eq("user_id", user.id)
    .eq("completed", false)
    .neq("id", id)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: `You already have an active task named "${title}".` }
  }

  const dueAtRaw = (formData.get("due_at") as string)?.trim()
  const priorityRaw = formData.get("priority") as string

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      due_at: dueAtRaw ? new Date(dueAtRaw).toISOString() : null,
      priority: priorityRaw ? parseInt(priorityRaw, 10) : 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}
