import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, Globe, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import type { AgentConfigState } from "./types";

interface AgentIntegrationsTabProps {
  config: AgentConfigState;
  isDisconnectingCalendar: boolean;
  handleCalendarDisconnect: () => Promise<void>;
}

export function AgentIntegrationsTab({ config, isDisconnectingCalendar, handleCalendarDisconnect }: AgentIntegrationsTabProps) {
  return (
    <div className="space-y-6 pt-5">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Calendar className="size-6" /></div>
              <Badge variant={config.googleCalendarEnabled ? "default" : "secondary"}>{config.googleCalendarEnabled ? <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> Connected</span> : "Not Connected"}</Badge>
            </div>
            <CardTitle className="text-xl">Google Calendar</CardTitle>
            <CardDescription>Allow your agent to see your availability and schedule meetings directly into your calendar.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {config.googleCalendarEnabled && config.googleCalendarAccountEmail && <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border text-sm font-medium"><Globe className="size-4 text-muted-foreground" /><span className="truncate">{config.googleCalendarAccountEmail}</span></div>}
            {!config.googleCalendarEnabled && <p className="text-sm text-muted-foreground">Connect your Google account to sync your calendar with your AI assistant.</p>}
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border mt-auto">
            {config.googleCalendarEnabled ? (
              <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleCalendarDisconnect} disabled={isDisconnectingCalendar}>
                {isDisconnectingCalendar ? <Loader2 className="size-4 animate-spin mr-2" /> : <XCircle className="size-4 mr-2" />}Disconnect Calendar
              </Button>
            ) : (
              <Button className="w-full" asChild><Link href="/api/integrations/google-calendar/connect">Connect Google Calendar</Link></Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
