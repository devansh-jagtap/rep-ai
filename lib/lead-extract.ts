import type { Lead } from "@/lib/db";

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function extractLeadFromText(text: string): Lead {
  const email = text.match(emailRegex)?.[0];

  return {
    email,
  };
}
