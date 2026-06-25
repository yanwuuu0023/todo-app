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
    // Don't distinguish "email already registered" vs other errors — prevent enumeration
    return { error: "Could not create account. Please check your details." }
  }

  redirect("/dashboard")
}
