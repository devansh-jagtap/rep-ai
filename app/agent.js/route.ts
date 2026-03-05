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

function sanitizeShadow(value: string | null): "none" | "sm" | "md" | "lg" {
  if (value === "none" || value === "sm" || value === "lg") return value;
  return "md";
}

function sanitizeRadius(value: string | null): "full" | "md" | "sm" {
  if (value === "md" || value === "sm") return value;
  return "full";
}

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 2px 8px rgba(0,0,0,0.15)",
  md: "0 8px 24px rgba(0,0,0,0.2)",
  lg: "0 16px 48px rgba(0,0,0,0.3)",
};

const RADIUS_MAP_ICON: Record<string, string> = {
  full: "9999px",
  md: "18px",
  sm: "10px",
};

const RADIUS_MAP_PILL: Record<string, string> = {
  full: "9999px",
  md: "14px",
  sm: "8px",
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const agentId = searchParams.get("agentId")?.trim() ?? "";
  const label = sanitizeLabel(searchParams.get("label"));
  const position = sanitizePosition(searchParams.get("position"));
  const width = clampNumber(searchParams.get("w"), 280, 480, 360);
  const height = clampNumber(searchParams.get("h"), 420, 720, 520);
  const color = searchParams.get("color")?.trim() || "#111827";
  const style = searchParams.get("style")?.trim() || "icon"; // pill or icon
  const greeting = searchParams.get("greeting")?.trim() || "";
  const avatarUrl = searchParams.get("avatar")?.trim() || "";
  const shadow = sanitizeShadow(searchParams.get("shadow"));
  const radius = sanitizeRadius(searchParams.get("radius"));
  const buttonShadow = SHADOW_MAP[shadow];
  const buttonRadius = style === "pill" ? RADIUS_MAP_PILL[radius] : RADIUS_MAP_ICON[radius];

  if (!validateUuid(agentId)) {
    return new NextResponse("console.error('Invalid agentId');", {
      headers: { "content-type": "application/javascript; charset=utf-8" },
      status: 400,
    });
  }

  const script = `(function () {
  var existing = document.getElementById('rep-ai-agent-widget');
  if (existing) return;
  var pos = ${JSON.stringify(position)};
  var styleParam = ${JSON.stringify(style)};
  var avatarUrl = ${JSON.stringify(avatarUrl)};
  var buttonColor = ${JSON.stringify(color)};
  var buttonShadow = ${JSON.stringify(buttonShadow)};
  var buttonRadius = ${JSON.stringify(buttonRadius)};

  /* ---- iframe ---- */
  var iframe = document.createElement('iframe');
  iframe.id = 'rep-ai-agent-widget';
  iframe.src = '${origin}/embed/${agentId}';
  iframe.setAttribute('title', 'AI Chat Assistant');
  iframe.style.cssText = [
    'position:fixed',
    'bottom:90px',
    pos === 'bottom-right' ? 'right:20px' : 'left:20px',
    'width:${width}px',
    'height:${height}px',
    'border:1px solid rgba(0,0,0,0.1)',
    'border-radius:16px',
    'box-shadow:0 24px 64px rgba(0,0,0,0.2)',
    'display:none',
    'z-index:2147483646',
    'opacity:0',
    'transform:translateY(8px) scale(0.97)',
    'transition:opacity 0.22s ease,transform 0.22s ease',
  ].join(';');

  /* ---- launcher button ---- */
  var button = document.createElement('button');
  button.type = 'button';
  button.id = 'rep-ai-launcher';
  button.setAttribute('aria-label', 'Open chat');

  var chatSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
  var closeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  if (styleParam === 'icon') {
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.overflow = 'hidden';
    if (avatarUrl) {
      var img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = '';
      img.style.cssText = 'width:60px;height:60px;object-fit:cover;border-radius:inherit;position:absolute;top:0;left:0;pointer-events:none;';
      button.style.position = 'relative';
      button.appendChild(img);
      /* close icon overlay (hidden initially) */
      var closeOverlay = document.createElement('div');
      closeOverlay.id = 'rep-ai-close-overlay';
      closeOverlay.innerHTML = closeSVG;
      closeOverlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);border-radius:inherit;opacity:0;transition:opacity 0.18s ease;pointer-events:none;';
      button.appendChild(closeOverlay);
    } else {
      button.innerHTML = chatSVG;
    }
  } else {
    button.innerText = ${JSON.stringify(label)};
    button.style.padding = '0 24px';
    button.style.height = '52px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.whiteSpace = 'nowrap';
    button.style.fontWeight = '500';
    button.style.fontSize = '15px';
    button.style.letterSpacing = '0.01em';
  }

  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style[pos === 'bottom-right' ? 'right' : 'left'] = '20px';
  button.style.borderRadius = buttonRadius;
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.background = buttonColor;
  button.style.color = '#ffffff';
  button.style.fontFamily = 'system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
  button.style.boxShadow = buttonShadow;
  button.style.zIndex = '2147483647';
  button.style.transition = 'transform 0.2s cubic-bezier(.34,1.56,.64,1),box-shadow 0.2s ease';
  button.onmouseover = function() { button.style.transform = 'scale(1.06)'; };
  button.onmouseout = function() { button.style.transform = 'scale(1)'; };

  /* ---- greeting tooltip ---- */
  var greetingParam = ${JSON.stringify(greeting)};
  var tooltip = null;
  if (greetingParam) {
    tooltip = document.createElement('div');
    tooltip.innerText = greetingParam;
    tooltip.style.cssText = [
      'position:fixed',
      'bottom:88px',
      pos === 'bottom-right' ? 'right:20px' : 'left:20px',
      'background:#fff',
      'color:#111827',
      'box-shadow:0 4px 20px rgba(0,0,0,0.1)',
      'padding:10px 16px',
      'border-radius:14px',
      pos === 'bottom-right' ? 'border-bottom-right-radius:4px' : 'border-bottom-left-radius:4px',
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
      'font-size:14px',
      'font-weight:500',
      'z-index:2147483647',
      'border:1px solid rgba(0,0,0,0.07)',
      'transition:opacity 0.2s ease,transform 0.2s ease',
      'pointer-events:none',
      'max-width:240px',
      'white-space:nowrap',
    ].join(';');
    document.body.appendChild(tooltip);
  }

  /* ---- open / close logic ---- */
  var open = false;
  button.addEventListener('click', function () {
    open = !open;

    if (open) {
      iframe.style.display = 'block';
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          iframe.style.opacity = '1';
          iframe.style.transform = 'translateY(0) scale(1)';
        });
      });
    } else {
      iframe.style.opacity = '0';
      iframe.style.transform = 'translateY(8px) scale(0.97)';
      setTimeout(function() { iframe.style.display = 'none'; }, 220);
    }

    /* avatar mode: show/hide close overlay */
    if (styleParam === 'icon' && avatarUrl) {
      var overlay = document.getElementById('rep-ai-close-overlay');
      if (overlay) overlay.style.opacity = open ? '1' : '0';
    } else if (styleParam === 'icon') {
      button.innerHTML = open ? closeSVG : chatSVG;
    }

    /* dismiss tooltip on first open */
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
      "cache-control": "public, max-age=60",
    },
  });
}
