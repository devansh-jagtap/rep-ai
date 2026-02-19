"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setLoading(true);
          const formData = new FormData(event.currentTarget);
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.get("name"),
              email: formData.get("email"),
              password: formData.get("password"),
            }),
          });

          const json = (await response.json().catch(() => ({}))) as { error?: string };

          if (!response.ok) {
            setError(json.error ?? "Failed to create account.");
            setLoading(false);
            return;
          }

          router.push("/auth/signin");
          router.refresh();
        }}
      >
        <input name="name" type="text" placeholder="Your name" className="w-full rounded border p-2" />
        <input name="email" type="email" placeholder="you@example.com" className="w-full rounded border p-2" required />
        <input name="password" type="password" minLength={8} placeholder="Password (8+ chars)" className="w-full rounded border p-2" required />
        <button disabled={loading} className="w-full rounded bg-black p-2 text-white disabled:opacity-60" type="submit">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Already have an account? <Link className="underline" href="/auth/signin">Sign in</Link>
      </p>
    </main>
  );
}
