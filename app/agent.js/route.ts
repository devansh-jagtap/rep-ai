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
  const color = searchParams.get("color")?.trim() || "#111827";
  const style = searchParams.get("style")?.trim() || "pill"; // pill or icon
  const greeting = searchParams.get("greeting")?.trim() || "";

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
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = position === 'bottom-right' ? '20px' : '';
  button.style.left = position === 'bottom-left' ? '20px' : '';
  
  const styleParam = ${JSON.stringify(style)};
  if (styleParam === 'icon') {
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.borderRadius = '9999px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
  } else {
    button.innerText = ${JSON.stringify(label)};
    button.style.padding = '0 24px';
    button.style.height = '50px';
    button.style.borderRadius = '9999px';
    button.style.fontWeight = '500';
  }

  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.background = ${JSON.stringify(color)};
  button.style.color = '#ffffff';
  button.style.fontFamily = 'system-ui, sans-serif';
  button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
  button.style.zIndex = '2147483647';
  button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  button.onmouseover = function() { button.style.transform = 'scale(1.05)'; };
  button.onmouseout = function() { button.style.transform = 'scale(1)'; };

  iframe.style.right = position === 'bottom-right' ? '20px' : '';
  iframe.style.left = position === 'bottom-left' ? '20px' : '';

  let open = false;
  const chatIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
  const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  const greetingParam = ${JSON.stringify(greeting)};
  let tooltip = null;
  if (styleParam === 'icon' && greetingParam) {
    tooltip = document.createElement('div');
    tooltip.innerText = greetingParam;
    tooltip.style.position = 'fixed';
    tooltip.style.bottom = '88px';
    tooltip.style.right = position === 'bottom-right' ? '20px' : '';
    tooltip.style.left = position === 'bottom-left' ? '20px' : '';
    tooltip.style.backgroundColor = '#ffffff';
    tooltip.style.color = '#111827';
    tooltip.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    tooltip.style.padding = '10px 16px';
    tooltip.style.borderRadius = '16px';
    tooltip.style.borderBottomRightRadius = position === 'bottom-right' ? '4px' : '16px';
    tooltip.style.borderBottomLeftRadius = position === 'bottom-left' ? '4px' : '16px';
    tooltip.style.fontFamily = 'system-ui, sans-serif';
    tooltip.style.fontSize = '14px';
    tooltip.style.fontWeight = '500';
    tooltip.style.zIndex = '2147483647';
    tooltip.style.border = '1px solid rgba(0,0,0,0.08)';
    tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    tooltip.style.pointerEvents = 'none';
    document.body.appendChild(tooltip);
  }

  button.addEventListener('click', function () {
    open = !open;
    iframe.style.display = open ? 'block' : 'none';
    if (styleParam === 'icon') {
      button.innerHTML = open ? closeIcon : chatIcon;
    }
    if (tooltip && open) {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(4px)';
      setTimeout(function() { if (tooltip) { tooltip.remove(); tooltip = null; } }, 200);
    }
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
