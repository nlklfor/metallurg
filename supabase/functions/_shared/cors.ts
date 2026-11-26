// CORS for the public edge functions.
//
// Browsers only get a usable answer on the site's own origins. Calls without
// an Origin header (the Telegram bot, curl, server-to-server) are not affected:
// CORS is a browser rule, so this is about blocking other websites, not about
// authentication.
//
// Extra origins (the custom domain, a Vercel preview) can be added without a
// code change: Supabase → Edge Functions → Secrets → ALLOWED_ORIGINS,
// comma-separated, e.g. "https://metallurg.store,https://www.metallurg.store".

const DEFAULT_ORIGINS = [
  "https://metallurg.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

const EXTRA_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const ALLOWED = new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS]);

export function corsHeaders(req: Request, allowHeaders: string): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    // An unknown origin gets the main site's origin back, so its browser blocks the response.
    "Access-Control-Allow-Origin": ALLOWED.has(origin) ? origin : DEFAULT_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": allowHeaders,
    Vary: "Origin",
  };
}
