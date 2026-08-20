import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { render } from "npm:@react-email/render@^2";
import React from "npm:react@^19";
import { Resend } from "npm:resend@^6";
import { ContactReceiptEmail } from "../_shared/emails/ContactReceiptEmail.tsx";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "METALLURG <onboarding@resend.dev>";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
// Resend's constructor throws synchronously on an empty key, so it's only
// instantiated when a key is actually configured — until then, the receipt
// email is skipped but the form (Telegram) still works.
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const NAME_MAX_LENGTH = 100;
const MESSAGE_MAX_LENGTH = 2000;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function isRateLimited(identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count } = await supabase
    .from("lookup_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("source", "contact-form")
    .gte("created_at", windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  await supabase.from("lookup_attempts").insert({ identifier, source: "contact-form" });
  return false;
}

// Escape Telegram legacy Markdown special characters so user input can't
// break message formatting or inject unintended styling/links.
function escapeMarkdown(text: string): string {
  return text.replace(/[_*`[\]]/g, (char) => `\\${char}`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (await isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, email, message } = await req.json();

    if (
      !name ||
      !email ||
      !message ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      trimmedName.length > NAME_MAX_LENGTH ||
      trimmedEmail.length > EMAIL_MAX_LENGTH ||
      trimmedMessage.length > MESSAGE_MAX_LENGTH
    ) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text =
      `*METALLURG — Contact Message*\n\n` +
      `*From:* ${escapeMarkdown(trimmedName)}\n\n` +
      `*Email:* ${escapeMarkdown(trimmedEmail)}\n\n` +
      `*Message:*\n${escapeMarkdown(trimmedMessage)}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!tgRes.ok) {
      const tgError = await tgRes.json();
      throw new Error(`Telegram: ${JSON.stringify(tgError)}`);
    }

    // Receipt email is best-effort — the message already reached Telegram,
    // so a Resend failure here shouldn't fail the whole request.
    if (resend) {
      try {
        const html = await render(
          React.createElement(ContactReceiptEmail, {
            name: trimmedName,
            message: trimmedMessage,
          })
        );
        const { error: emailError } = await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: [trimmedEmail],
          subject: "We received your message — METALLURG™",
          html,
        });
        if (emailError) {
          console.error("contact-form receipt email error:", emailError);
        }
      } catch (emailErr) {
        console.error("contact-form receipt email error:", emailErr);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("contact-form error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
