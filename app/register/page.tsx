"use client"

import { SignUp } from "@clerk/nextjs"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { useSignUp } from "@clerk/nextjs"
// import { UserPlus } from "lucide-react"

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

export default function RegisterPage() {
  //   const router = useRouter()
  //   const { signUp, isLoaded } = useSignUp()

  //   const [username, setUsername] = useState("")
  //   const [email, setEmail] = useState("")
  //   const [password, setPassword] = useState("")
  //   const [confirmPassword, setConfirmPassword] = useState("")
  //   const [error, setError] = useState("")
  //   const [isLoading, setIsLoading] = useState(false)
  //   const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault()
  //     setError("")

  //     if (password !== confirmPassword) {
  //       setError("Passwords do not match")
  //       return
  //     }

  //     if (password.length < 6) {
  //       setError("Password must be at least 6 characters")
  //       return
  //     }

  //     if (!isLoaded) return

  //     setIsLoading(true)

  //     try {
  //       const result = await signUp.create({
  //         emailAddress: email,
  //         password,
  //         username,
  //       })

  //       await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

  //       router.push("/verify-email") // You can create this page to handle email verification
  //     } catch (err: any) {
  //       setError(err.errors?.[0]?.message || "Registration failed")
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   const handleGoogleSignup = async () => {
  //     setError("")
  //     setIsGoogleLoading(true)

  //     try {
  //       await signUp?.authenticateWithRedirect({
  //         strategy: "oauth_google",
  //         redirectUrl: "/chat",
  //       })
  //     } catch (err) {
  //       setError("Google signup failed")
  //       setIsGoogleLoading(false)
  //     }
  //   }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignUp afterSignUpUrl="/chat" />
      {/* <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Sign up to start chatting with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Creating account..." : "Create Account"}
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
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? "Connecting to Google..." : "Sign up with Google"}
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
