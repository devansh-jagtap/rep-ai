import { NextResponse } from "next/server";
import { validate as validateUuid } from "uuid";

function clampNumber(value: string | null, min: number, max: number, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function sanitizeLabel(value: string | null) {
  const label = (value ?? "").trim().replace(/\s+/g, " ");
  if (!label) return "Chat";
  return label.slice(0, 24);
}

function sanitizePosition(value: string | null): "bottom-right" | "bottom-left" {
  return value === "bottom-left" ? "bottom-left" : "bottom-right";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const agentId = searchParams.get("agentId")?.trim() ?? "";
  const label = sanitizeLabel(searchParams.get("label"));
  const position = sanitizePosition(searchParams.get("position"));
  const width = clampNumber(searchParams.get("w"), 280, 480, 360);
  const height = clampNumber(searchParams.get("h"), 420, 720, 520);

  if (!validateUuid(agentId)) {
    return new NextResponse("console.error('Invalid agentId');", {
      headers: { "content-type": "application/javascript; charset=utf-8" },
      status: 400,
    });
  }

  const script = `(function () {
  const existing = document.getElementById('rep-ai-agent-widget');
  if (existing) return;
  const position = ${JSON.stringify(position)};

  const iframe = document.createElement('iframe');
  iframe.id = 'rep-ai-agent-widget';
  iframe.src = '${origin}/embed/${agentId}';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '90px';
  iframe.style.width = '${width}px';
  iframe.style.height = '${height}px';
  iframe.style.border = '1px solid rgba(0,0,0,0.12)';
  iframe.style.borderRadius = '12px';
  iframe.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
  iframe.style.display = 'none';
  iframe.style.zIndex = '2147483646';

  const button = document.createElement('button');
  button.type = 'button';
  button.innerText = ${JSON.stringify(label)};
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = position === 'bottom-right' ? '20px' : '';
  button.style.left = position === 'bottom-left' ? '20px' : '';
  button.style.width = '56px';
  button.style.height = '56px';
  button.style.borderRadius = '9999px';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.background = '#111827';
  button.style.color = '#ffffff';
  button.style.fontFamily = 'system-ui, sans-serif';
  button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
  button.style.zIndex = '2147483647';

  iframe.style.right = position === 'bottom-right' ? '20px' : '';
  iframe.style.left = position === 'bottom-left' ? '20px' : '';

  let open = false;
  button.addEventListener('click', function () {
    open = !open;
    iframe.style.display = open ? 'block' : 'none';
  });

  document.body.appendChild(iframe);
  document.body.appendChild(button);
})();`;

  return new NextResponse(script, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=120",
    },
  });
}
