import Link from "next/link";

const routes = [
  { href: "/marketing", label: "Marketing" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/demo-agent", label: "Public AI Page (/demo-agent)" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-10">
      <h1 className="text-3xl font-bold">AI SaaS App Skeleton</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Route groups and API endpoints are scaffolded and ready for implementation.
      </p>
      <ul className="space-y-3">
        {routes.map((route) => (
          <li key={route.href}>
            <Link className="underline underline-offset-4" href={route.href}>
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
