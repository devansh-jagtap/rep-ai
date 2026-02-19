"use client"

import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <section className="bg-background grid min-h-screen grid-rows-[auto_1fr] px-4">
      <div className="mx-auto w-full max-w-7xl border-b py-3">
        <Link
          href="/"
          aria-label="go home"
          className="inline-block border-t-2 border-transparent py-3"
        >
          <Logo className="w-fit" />
        </Link>
      </div>

      <div className="m-auto w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-medium">Create account</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign up to get started
          </p>
        </div>
        <Card className="mt-6 border p-8">
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault()
              setError(null)
              setLoading(true)
              const formData = new FormData(event.currentTarget)
              const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: formData.get("name"),
                  email: formData.get("email"),
                  password: formData.get("password"),
                }),
              })

              const json = (await response.json().catch(() => ({}))) as {
                error?: string
              }

              if (!response.ok) {
                setError(json.error ?? "Failed to create account.")
                setLoading(false)
                return
              }

              router.push("/auth/signin?signedUp=1")
              router.refresh()
            }}
          >
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
              />
            </div>

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
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="8+ characters"
                minLength={8}
                required
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
