/**
 * Ensures the base URL has a protocol (https:// or http://).
 * Vercel and other platforms may provide URLs without protocol (e.g. "rep-ai-nine.vercel.app").
 */
export function ensureBaseUrl(url: string | undefined): string {
  if (!url) return "http://localhost:3000";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}
