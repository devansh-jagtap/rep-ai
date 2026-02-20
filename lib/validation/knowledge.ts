const MAX_TITLE_CHARS = 160;
const MAX_CONTENT_CHARS = 20_000;

export interface KnowledgeInput {
  title: string;
  content: string;
}

function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function parseKnowledgeInput(body: Record<string, unknown> | null): KnowledgeInput | null {
  if (!body) {
    return null;
  }

  const title = sanitizeText(String(body.title ?? ""));
  const content = sanitizeText(String(body.content ?? ""));

  if (!title || title.length > MAX_TITLE_CHARS) {
    return null;
  }

  if (!content || content.length > MAX_CONTENT_CHARS) {
    return null;
  }

  return { title, content };
}
