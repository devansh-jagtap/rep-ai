const DEFAULT_TARGET_WORDS = 650;
const MIN_WORDS_PER_CHUNK = 500;
const MAX_WORDS_PER_CHUNK = 800;

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function chunkText(content: string): string[] {
  const normalized = normalizeWhitespace(content);
  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ").filter(Boolean);
  if (words.length <= MAX_WORDS_PER_CHUNK) {
    return [normalized];
  }

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < words.length) {
    const wordsRemaining = words.length - cursor;
    if (wordsRemaining <= MAX_WORDS_PER_CHUNK) {
      chunks.push(words.slice(cursor).join(" "));
      break;
    }

    let end = Math.min(cursor + DEFAULT_TARGET_WORDS, words.length);
    if (words.length - end > 0 && words.length - end < MIN_WORDS_PER_CHUNK) {
      end = Math.min(cursor + MAX_WORDS_PER_CHUNK, words.length);
    }

    chunks.push(words.slice(cursor, end).join(" "));
    cursor = end;
  }

  return chunks;
}
