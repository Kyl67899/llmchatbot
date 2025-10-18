"use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
import { SignIn, useSignIn } from "@clerk/nextjs"
// import { Lock } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

export default function LoginPage() {
  // const router = useRouter()
  // const { signIn, isLoaded } = useSignIn()

  // const [username, setUsername] = useState("")
  // const [password, setPassword] = useState("")
  // const [error, setError] = useState("")
  // const [isLoading, setIsLoading] = useState(false)
  // const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setError("")
  //   setIsLoading(true)

  //   if (!isLoaded) return

  //   try {
  //     const result = await signIn.create({
  //       identifier: username,
  //       password,
  //     })

  //     if (result.status === "complete") {
  //       router.push("/chat")
  //     } else {
  //       setError("Unexpected sign-in status")
  //     }
  //   } catch (err: any) {
  //     setError(err.errors?.[0]?.message || "Login failed")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // const handleGoogleLogin = async () => {
  //   setIsGoogleLoading(true)
  //   try {
  //     await signIn?.authenticateWithRedirect({
  //       strategy: "oauth_google",
  //       redirectUrl: "/chat",
  //     })
  //   } catch (err: any) {
  //     setError("Google login failed")
  //     setIsGoogleLoading(false)
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn routing="hash" afterSignInUrl="/chat" />
      {/* <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? "Connecting to Google..." : "Sign in with Google"}
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
