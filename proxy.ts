import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

// TODO V2: When enabling OAuth providers (Google/GitHub) OR re-enabling
// email confirm, create `app/auth/callback/route.ts` to handle the
// redirect back from Supabase. Template + details in:
//   summary/signup/step-1-supabase-project.md §X
//   https://supabase.com/docs/guides/auth/social-login/auth-google
// Currently: email confirm is OFF + no OAuth → this route is not needed.

export async function proxy(request: NextRequest) {
  // 1. 刷新 Supabase session + 拿到 user
  const { response, user } = await updateSession(request)

  const { pathname } = request.nextUrl

  // 2. 已登录保护：已登录用户访问登录相关页面 → 跳 /dashboard
  //    （这是 Step 7 的内容，提前做，因为有真实 bug）
  const authPages = ["/login", "/signup"]
  if (user && authPages.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return Response.redirect(url)
  }

  // 3. 未登录保护：未登录访问受保护页面 → 跳 /login
  const protectedPaths = ["/dashboard", "/settings"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return Response.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
