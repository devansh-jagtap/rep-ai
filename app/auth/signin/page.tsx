import Link from "next/link";
import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form
        className="space-y-3"
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard",
          });
        }}
      >
        <input name="email" type="email" placeholder="you@example.com" className="w-full rounded border p-2" required />
        <input name="password" type="password" placeholder="Password" className="w-full rounded border p-2" required />
        <button className="w-full rounded bg-black p-2 text-white" type="submit">
          Continue
        </button>
      </form>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Don&apos;t have an account? <Link className="underline" href="/auth/signup">Sign up</Link>
      </p>
    </main>
  );
}
