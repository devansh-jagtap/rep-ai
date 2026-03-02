import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink } from "lucide-react";

interface AgentWidgetTabProps {
  canGenerateWidget: boolean;
  isWidgetReady: boolean;
  scriptUrl: string;
  scriptSnippet: string;
  iframeSnippet: string;
  appOrigin: string;
  agentId: string | null;
  widgetLabel: string;
  widgetPosition: "bottom-right" | "bottom-left";
  widgetWidth: number;
  widgetHeight: number;
  setWidgetLabel: (value: string) => void;
  setWidgetPosition: (value: "bottom-right" | "bottom-left") => void;
  setWidgetWidth: (value: number) => void;
  setWidgetHeight: (value: number) => void;
}

export function AgentWidgetTab(props: AgentWidgetTabProps) {
  const {
    canGenerateWidget,
    isWidgetReady,
    scriptUrl,
    scriptSnippet,
    iframeSnippet,
    appOrigin,
    agentId,
    widgetLabel,
    widgetPosition,
    widgetWidth,
    widgetHeight,
    setWidgetLabel,
    setWidgetPosition,
    setWidgetWidth,
    setWidgetHeight,
  } = props;

  return (
    <div className="pt-5">
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Get Agent Widget</h3>
          <p className="text-sm text-muted-foreground mt-1">Copy-paste this widget into any website and start chatting.</p>
        </div>

        {!canGenerateWidget && <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground bg-muted/50">Save your configuration first so your account gets an `agentId` for the widget.</div>}

        {canGenerateWidget && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="widget-label" className="font-semibold">Button Label</Label><Input id="widget-label" value={widgetLabel} maxLength={24} onChange={(event) => setWidgetLabel(event.target.value)} className="shadow-sm" /></div>
              <div className="space-y-2"><Label className="font-semibold">Position</Label><Select value={widgetPosition} onValueChange={(value) => setWidgetPosition(value as "bottom-right" | "bottom-left")}><SelectTrigger className="w-full shadow-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bottom-right" className="font-medium">Bottom right</SelectItem><SelectItem value="bottom-left" className="font-medium">Bottom left</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="widget-width" className="font-semibold">Widget Width</Label><Input id="widget-width" type="number" min={280} max={480} value={widgetWidth} onChange={(event) => setWidgetWidth(Math.max(280, Math.min(480, Number(event.target.value) || 360)))} className="shadow-sm" /></div>
              <div className="space-y-2"><Label htmlFor="widget-height" className="font-semibold">Widget Height</Label><Input id="widget-height" type="number" min={420} max={720} value={widgetHeight} onChange={(event) => setWidgetHeight(Math.max(420, Math.min(720, Number(event.target.value) || 520)))} className="shadow-sm" /></div>
            </div>

            <div className="space-y-3"><div className="flex items-center gap-2"><Label className="font-semibold">Script Install Snippet</Label><Badge variant="secondary" className="text-xs font-medium">Recommended</Badge></div><CodeBlock code={scriptSnippet} language="html" /></div>
            <div className="space-y-3"><Label className="font-semibold">Iframe Fallback</Label><CodeBlock code={iframeSnippet} language="html" /></div>
            <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-2"><p className="font-semibold">Install checklist</p><ul className="list-disc pl-5 space-y-1 text-muted-foreground font-medium"><li>Keep your portfolio published and agent enabled.</li><li>Paste the script snippet before the closing <code className="bg-muted px-1 py-0.5 rounded text-foreground">{"</body>"}</code> tag.</li><li>Open your website and click the widget button to test.</li></ul></div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="outline" size="sm" asChild className="shadow-sm font-medium"><a href={scriptUrl} target="_blank" rel="noreferrer">View Generated Script<ExternalLink className="size-4 ml-2" /></a></Button>
              {agentId && <Button variant="outline" size="sm" asChild className="shadow-sm font-medium"><a href={`${appOrigin}/embed/${agentId}`} target="_blank" rel="noreferrer">Open Embed Preview<ExternalLink className="size-4 ml-2" /></a></Button>}
              <div className="flex items-center"><Badge variant={isWidgetReady ? "default" : "secondary"} className="font-medium">{isWidgetReady ? "Widget ready to install" : "Publish + enable agent to go live"}</Badge></div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
