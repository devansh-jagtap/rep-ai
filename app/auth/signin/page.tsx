"use client"

import { authClient } from "@/auth-client"
import { SignedUpToast } from "@/app/auth/_components/signed-up-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Suspense, useState } from "react"

export default function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  return (
    <section className="bg-background grid min-h-screen grid-rows-[auto_1fr] px-4">
      <Suspense fallback={null}>
        <SignedUpToast />
      </Suspense>
      <div className="mx-auto w-full max-w-7xl border-b py-3">
        <Link
          href="/"
          aria-label="go home"
          className="inline-block border-t-2 border-transparent py-3"
        >
          REF
        </Link>
      </div>

      <div className="m-auto w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-medium">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your account to continue
          </p>
        </div>
        <Card className="mt-6 border p-8">
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              setLoading(true)
              const formData = new FormData(e.currentTarget)
              const { data, error: signInError } = await authClient.signIn.email({
                email: String(formData.get("email")),
                password: String(formData.get("password")),
                callbackURL: "/dashboard",
              })
              if (signInError) {
                setError(signInError.message ?? "Invalid email or password")
                setLoading(false)
                return
              }
              if (data) {
                router.push("/dashboard")
                router.refresh()
              }
              setLoading(false)
            }}
          >
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                id="password"
                name="password"
                required
              />
            </div>

            {error ? (
              <p className="text-destructive text-sm">{error}</p>
            ) : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  )
}
