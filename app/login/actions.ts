"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type LoginState = {
  error: string | null
}

export async function signInAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // 不区分"邮箱不存在"和"密码错" — 防枚举
    return { error: "Invalid email or password." }
  }

  redirect("/dashboard")
}
