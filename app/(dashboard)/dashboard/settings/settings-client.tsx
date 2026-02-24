"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useState, useEffect, useTransition } from "react";
import { updateHandle, deleteActivePortfolio } from "../actions";
import { toast } from "sonner";
import { Zap, AlertTriangle, Trash2 } from "lucide-react";

interface SettingsClientProps {
  user: {
    email: string;
    name: string;
    plan: string;
    credits: number;
  };
  portfolio: {
    handle: string;
  };
}

export function SettingsClient({ user, portfolio }: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [isPending, startTransition] = useTransition();
  const [handle, setHandle] = useState(portfolio.handle);
  const [handleError, setHandleError] = useState("");
  const [isDeletingPortfolio, setIsDeletingPortfolio] = useState(false);


  const validateHandleFormat = (value: string) => {
    if (value.length < 3) {
      setHandleError("Must be at least 3 characters");
      return false;
    }
    if (value.length > 30) {
      setHandleError("Must be 30 characters or fewer");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      setHandleError("Only lowercase letters, numbers, and hyphens");
      return false;
    }
    setHandleError("");
    return true;
  };

  const handleHandleChange = (value: string) => {
    const normalized = value.toLowerCase().trim();
    setHandle(normalized);
    if (normalized) validateHandleFormat(normalized);
    else setHandleError("");
  };

  const handleSaveProfile = () => {
    if (!validateHandleFormat(handle)) return;

    startTransition(async () => {
      try {
        await updateHandle(handle);
        toast.success("Handle updated successfully");
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to save";
        toast.error(msg);
        setHandleError(msg);
      }
    });
  };

  const handleDeletePortfolio = () => {
    if (!confirm("Are you sure you want to delete this portfolio? This action cannot be undone and will delete all associated agents and leads.")) {
      return;
    }

    setIsDeletingPortfolio(true);
    startTransition(async () => {
      try {
        await deleteActivePortfolio();
        toast.success("Portfolio deleted successfully");
        window.location.href = "/dashboard";
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete portfolio");
        setIsDeletingPortfolio(false);
      }
    });
  };

  const hasHandleChanged = handle !== portfolio.handle;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Plan & Credits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan & Usage</CardTitle>
              <CardDescription>Your current subscription and credit balance.</CardDescription>
            </div>
            <Badge variant="secondary" className="capitalize">{user.plan}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Credits Remaining</p>
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-yellow-500" />
                <span className="text-2xl font-bold">{user.credits}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold capitalize">{user.plan}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your public handle and view account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user.name} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handle">Public Handle</Label>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => handleHandleChange(e.target.value)}
              className={handleError ? "border-destructive" : ""}
              placeholder="your-handle"
              disabled={isPending}
            />
            {handleError ? (
              <p className="text-[0.8rem] text-destructive">{handleError}</p>
            ) : (
              <p className="text-[0.8rem] text-muted-foreground">
                Your portfolio URL: /{handle}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-[0.8rem] text-muted-foreground">
              Used for login and notifications. Cannot be changed here.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 py-4 justify-end border-t">
          <Button
            onClick={handleSaveProfile}
            disabled={isPending || !hasHandleChanged || !!handleError}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the dashboard looks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme Preference</Label>
            {mounted && (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border rounded-md border-destructive/20 bg-destructive/5">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Delete Current Portfolio</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this specific portfolio, its agent, and captured leads.
                </p>
              </div>
              <Button
                variant="destructive"
                className="shrink-0"
                onClick={handleDeletePortfolio}
                disabled={isDeletingPortfolio || isPending}
              >
                <Trash2 className="size-4 mr-2" />
                {isDeletingPortfolio ? "Deleting..." : "Delete Portfolio"}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border rounded-md border-destructive/20 bg-destructive/5">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account, all portfolios, agents, and all captured leads.
                </p>
              </div>
              <Button variant="destructive" className="shrink-0">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
