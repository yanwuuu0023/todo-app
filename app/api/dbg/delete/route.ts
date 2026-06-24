// [DEBUG] Test-only API for RLS validation. DELETE in V1.0.
// Purpose: allows RLS write-protection testing (delete a task by id).
// Safety: disabled in production.
import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    )
  }

  const { id } = await request.json()
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 })
  }
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    return NextResponse.json({ error: "invalid uuid" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    affected: data?.length ?? 0,
    data: data ?? [],
  })
}