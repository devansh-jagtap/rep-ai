import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getProfileById } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const profile = await getProfileById(session.user.id);

  return (
    <main className="mx-auto max-w-5xl p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/auth/signin" });
          }}
        >
          <button className="rounded border px-3 py-1.5 text-sm" type="submit">
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-3 text-zinc-600 dark:text-zinc-300">
        Signed in as {profile?.email} ({profile?.plan} plan) with {profile?.credits ?? 0} credits.
      </p>
    </main>
  );
}
