import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { submitOnboardingForm } from "@/app/onboarding/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPortfolioByUserId } from "@/lib/db/portfolio";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/onboarding");
  }

  const portfolio = await getPortfolioByUserId(session.user.id);
  if (portfolio) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to preffer.me</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitOnboardingForm} method="post" className="space-y-5">
            {params.error ? (
              <Alert variant="destructive">
                <AlertDescription>{params.error}</AlertDescription>
              </Alert>
            ) : null}


            <div className="space-y-2">
              <Label htmlFor="handle">Choose your handle</Label>
              <Input
                id="handle"
                name="handle"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-z0-9-]+"
                placeholder="your-name"
              />
              <p className="text-muted-foreground text-xs">
                This will be used for your public URL: /[handle]
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea id="bio" name="bio" required rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services (comma-separated)</Label>
              <Input id="services" name="services" required placeholder="Web apps, API development" />
            </div>

            {[1, 2, 3].map((index) => (
              <div key={index} className="rounded-md border p-4 space-y-3">
                <p className="text-sm font-medium">Project {index}</p>
                <div className="space-y-2">
                  <Label htmlFor={`projectTitle${index}`}>Title</Label>
                  <Input
                    id={`projectTitle${index}`}
                    name={`projectTitle${index}`}
                    required={index <= 2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`projectDescription${index}`}>Description</Label>
                  <Textarea
                    id={`projectDescription${index}`}
                    name={`projectDescription${index}`}
                    required={index <= 2}
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                name="tone"
                required
                defaultValue="Professional"
                className="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-4xl border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Bold">Bold</option>
                <option value="Minimal">Minimal</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              Save and Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
