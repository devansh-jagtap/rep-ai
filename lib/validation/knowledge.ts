const MAX_TITLE_CHARS = 160;
const MAX_CONTENT_CHARS = 20_000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type KnowledgeType = "text" | "pdf";
export type KnowledgeStatus = "pending" | "processing" | "complete" | "failed";

export interface KnowledgeTextInput {
  type: "text";
  title: string;
  content: string;
}

export interface KnowledgeFileInput {
  type: "pdf";
  title: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

export type KnowledgeInput = KnowledgeTextInput | KnowledgeFileInput;

function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isValidKnowledgeFileUrl(fileUrl: string): boolean {
  const expectedHost = process.env.S3_PUBLIC_HOST;
  if (!expectedHost) {
    return false;
  }

  try {
    const parsedUrl = new URL(fileUrl);
    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname === expectedHost &&
      parsedUrl.pathname.startsWith("/knowledge/")
    );
  } catch {
    return false;
  }
}

export function parseKnowledgeInput(body: Record<string, unknown> | null): KnowledgeInput | null {
  if (!body) {
    return null;
  }

  const title = sanitizeText(String(body.title ?? ""));

  if (!title || title.length > MAX_TITLE_CHARS) {
    return null;
  }

  if (body.fileUrl && body.mimeType) {
    const fileUrl = String(body.fileUrl);
    const mimeType = String(body.mimeType);
    const fileSize = Number(body.fileSize) || 0;

    if (mimeType !== "application/pdf") {
      return null;
    }

    if (!isValidKnowledgeFileUrl(fileUrl)) {
      return null;
    }

    if (fileSize > MAX_FILE_SIZE) {
      return null;
    }

    return {
      type: "pdf",
      title,
      fileUrl,
      mimeType,
      fileSize,
    };
  }

  const content = sanitizeText(String(body.content ?? ""));

  if (!content || content.length > MAX_CONTENT_CHARS) {
    return null;
  }

  return {
    type: "text",
    title,
    content,
  };
}
