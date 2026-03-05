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
  widgetColor: string;
  widgetStyle: "pill" | "icon";
  setWidgetLabel: (value: string) => void;
  setWidgetPosition: (value: "bottom-right" | "bottom-left") => void;
  setWidgetWidth: (value: number) => void;
  setWidgetHeight: (value: number) => void;
  setWidgetColor: (value: string) => void;
  setWidgetStyle: (value: "pill" | "icon") => void;
  widgetGreeting: string;
  setWidgetGreeting: (value: string) => void;
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
    widgetColor,
    widgetStyle,
    setWidgetLabel,
    setWidgetPosition,
    setWidgetWidth,
    setWidgetHeight,
    setWidgetColor,
    setWidgetStyle,
    widgetGreeting,
    setWidgetGreeting,
  } = props;

  return (
    <div className="pt-5">
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg">Get Agent Widget</h3>
          <p className="text-sm text-muted-foreground mt-1">Copy-paste this widget into any website and start chatting.</p>
        </div>

        {!canGenerateWidget && <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground bg-muted/50">Save your configuration first so your account gets an `agentId` for the widget.</div>}

        {canGenerateWidget && (
          <>
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2"><Label className="font-semibold">Widget Style</Label><Select value={widgetStyle} onValueChange={(value) => setWidgetStyle(value as "pill" | "icon")}><SelectTrigger className="w-full shadow-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="icon" className="font-medium">Minimal Icon</SelectItem><SelectItem value="pill" className="font-medium">Text Button</SelectItem></SelectContent></Select></div>
                  {widgetStyle === "pill" && <div className="space-y-2"><Label htmlFor="widget-label" className="font-semibold">Button Label</Label><Input id="widget-label" value={widgetLabel} maxLength={24} onChange={(event) => setWidgetLabel(event.target.value)} className="shadow-sm" /></div>}
                  {widgetStyle === "icon" && <div className="space-y-2"><Label htmlFor="widget-greeting" className="font-semibold">Greeting Tooltip</Label><Input id="widget-greeting" value={widgetGreeting} maxLength={40} onChange={(event) => setWidgetGreeting(event.target.value)} className="shadow-sm" placeholder="e.g. Need help?" /></div>}

                  <div className="space-y-2"><Label htmlFor="widget-color" className="font-semibold">Theme Color</Label><div className="flex gap-2"><Input id="widget-color" type="color" value={widgetColor} onChange={(event) => setWidgetColor(event.target.value)} className="w-12 h-10 p-1 cursor-pointer shrink-0" /><Input type="text" value={widgetColor.toUpperCase()} onChange={(event) => setWidgetColor(event.target.value)} className="flex-1 uppercase font-mono shadow-sm" pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" /></div></div>

                  <div className="space-y-2"><Label className="font-semibold">Position</Label><Select value={widgetPosition} onValueChange={(value) => setWidgetPosition(value as "bottom-right" | "bottom-left")}><SelectTrigger className="w-full shadow-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bottom-right" className="font-medium">Bottom right</SelectItem><SelectItem value="bottom-left" className="font-medium">Bottom left</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="widget-width" className="font-semibold">Widget Width</Label><Input id="widget-width" type="number" min={280} max={480} value={widgetWidth} onChange={(event) => setWidgetWidth(Math.max(280, Math.min(480, Number(event.target.value) || 360)))} className="shadow-sm" /></div>
                  <div className="space-y-2"><Label htmlFor="widget-height" className="font-semibold">Widget Height</Label><Input id="widget-height" type="number" min={420} max={720} value={widgetHeight} onChange={(event) => setWidgetHeight(Math.max(420, Math.min(720, Number(event.target.value) || 520)))} className="shadow-sm" /></div>
                </div>
              </div>
              <div className="lg:col-span-2 hidden lg:flex border rounded-xl bg-muted/30 relative shadow-inner overflow-hidden min-h-[400px] flex-col">
                <div className="text-center py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider border-b bg-muted/10">Live Preview</div>
                <div className="relative flex-1 p-4">
                  <div className="absolute inset-x-4 top-4 bottom-4 bg-background border rounded-lg shadow-sm opacity-50 overflow-hidden pointer-events-none">
                    <div className="h-12 border-b bg-muted/20 flex items-center px-4 gap-4"><div className="w-8 h-8 rounded-full bg-muted"></div><div className="h-2 w-24 bg-muted rounded"></div></div>
                    <div className="p-4 space-y-4"><div className="h-32 bg-muted/40 rounded"></div><div className="h-4 w-3/4 bg-muted/40 rounded"></div><div className="h-4 w-1/2 bg-muted/40 rounded"></div></div>
                  </div>

                  <div style={{
                    position: 'absolute',
                    [widgetPosition === 'bottom-right' ? 'right' : 'left']: '24px',
                    bottom: '24px',
                  }} className="flex flex-col items-end gap-3 pointer-events-none">
                    {widgetStyle === 'icon' && widgetGreeting && (
                      <div className="bg-background text-foreground text-sm px-4 py-2 rounded-2xl rounded-br-none shadow-md border font-medium">
                        {widgetGreeting}
                      </div>
                    )}
                    <div style={{
                      backgroundColor: widgetColor,
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      fontFamily: 'system-ui, sans-serif',
                      ...(widgetStyle === 'icon' ? {
                        width: '60px',
                        height: '60px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      } : {
                        height: '50px',
                        padding: '0 24px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 500,
                      })
                    }}>
                      {widgetStyle === 'icon' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                      ) : (
                        widgetLabel
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
