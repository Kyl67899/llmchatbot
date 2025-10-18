import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware({
  publicRoutes: ["/", "/login(.*)", "/register(.*)", "/sign-in(.*)", "/sign-up(.*)"],
})

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
}
