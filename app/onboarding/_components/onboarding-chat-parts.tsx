import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OnboardingData } from "@/lib/onboarding/types";
import {
  JSXPreview,
  JSXPreviewContent,
  JSXPreviewError,
} from "@/components/ai-elements/jsx-preview";
import { CheckIcon } from "lucide-react";

const PREVIEW_JSX =
  "<Card className=\"border-primary/30 bg-primary/5\">" +
  "<CardHeader>" +
  "<CardTitle className=\"text-xl\">{data.name}</CardTitle>" +
  "<p className=\"text-muted-foreground text-sm\">{data.title}</p>" +
  "</CardHeader>" +
  "<CardContent className=\"space-y-4\">" +
  "<div><p className=\"text-muted-foreground text-xs font-medium uppercase tracking-wide\">Bio</p><p className=\"text-sm\">{data.bio}</p></div>" +
  "<div><p className=\"text-muted-foreground text-xs font-medium uppercase tracking-wide\">Services</p><ul className=\"mt-1 flex flex-wrap gap-2\">{servicesList}</ul></div>" +
  "<div><p className=\"text-muted-foreground text-xs font-medium uppercase tracking-wide\">Projects</p><div className=\"mt-2 space-y-2\">{projectList}</div></div>" +
  "<div className=\"flex flex-wrap items-center justify-between gap-3 pt-2\">" +
  '<p className="text-muted-foreground text-xs">ref.io/' + "{data.handle}" + " · " + "{data.tone}" + "</p>" +
  "<div className=\"flex gap-2 shrink-0\"><EditButton /><ConfirmButton /></div></div></CardContent></Card>";

export function OnboardingMessageResponse({ children }: { children: string }) {
  return (
    <Streamdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0" plugins={{ cjk }} controls={{ code: false, mermaid: false }}>
      {children}
    </Streamdown>
  );
}

export function OnboardingPreviewCard({
  data,
  onConfirm,
  onEdit,
  isConfirming,
}: {
  data: OnboardingData;
  onConfirm: () => void;
  onEdit: () => void;
  isConfirming: boolean;
}) {
  const servicesList = <>{data.services.map((s) => <li key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm">{s}</li>)}</>;
  const projectList = <>{data.projects.map((project, i) => <div key={i} className="rounded-lg border bg-background/50 p-3"><p className="font-medium text-sm">{project.title}</p><p className="text-muted-foreground text-xs">{project.description}</p></div>)}</>;
  const EditButton = () => <Button type="button" variant="outline" size="sm" onClick={onEdit}>Edit</Button>;
  const ConfirmButton = () => (
    <Button onClick={onConfirm} disabled={isConfirming} size="sm" className="shrink-0">
      {isConfirming ? "Creating…" : <><CheckIcon className="size-4 mr-1" />Confirm</>}
    </Button>
  );

  return (
    <JSXPreview
      jsx={PREVIEW_JSX}
      components={{ Card, CardHeader, CardTitle, CardContent, EditButton, ConfirmButton } as any}
      bindings={{ data, servicesList, projectList }}
      onError={(err) => console.error("JSX Preview error:", err)}
    >
      <JSXPreviewContent />
      <JSXPreviewError />
    </JSXPreview>
  );
}
