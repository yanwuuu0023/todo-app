"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type SignupState = {
  error: string | null
}

export async function signUpAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  // 服务端验证（即使前端 required/minLength 也再检查一次）
  if (!email || !password) {
    return { error: "Email and password are required." }
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    // 不区分"邮箱已注册"和"其他错误" — 防枚举攻击
    return { error: "Could not create account. Please check your details." }
  }

  // 注册成功 → 跳 dashboard
  redirect("/dashboard")
}
