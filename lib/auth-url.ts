/**
 * Ensures the base URL has a protocol (https:// or http://).
 * Vercel and other platforms may provide URLs without protocol (e.g. "rep-ai-nine.vercel.app").
 */
export function ensureBaseUrl(url: string | undefined): string {
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) return url;
  if (url) return `https://${url}`;

  // Fallbacks for when `url` is undefined
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const pubUrl = process.env.NEXT_PUBLIC_APP_URL;
    return pubUrl.startsWith("http") ? pubUrl : `https://${pubUrl}`;
  }
  return "http://localhost:3000";
}
