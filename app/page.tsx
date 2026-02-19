import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutDashboardIcon, LogInIcon, UserPlusIcon } from "lucide-react";

const routes = [
  { href: "/marketing", label: "Marketing", icon: null },
  { href: "/dashboard", label: "Dashboard (protected)", icon: LayoutDashboardIcon },
  { href: "/auth/signin", label: "Sign in", icon: LogInIcon },
  { href: "/auth/signup", label: "Sign up", icon: UserPlusIcon },
  { href: "/demo-agent", label: "Public AI Page (/demo-agent)", icon: null },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-10">
      <div>
        <h1 className="text-3xl font-bold">AI SaaS App Skeleton</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Route groups and API endpoints are scaffolded and ready for
          implementation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Navigate to any of these routes to explore the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <Button key={route.href} variant="outline" asChild>
                  <Link
                    href={route.href}
                    className="flex items-center justify-start gap-2"
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {route.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
