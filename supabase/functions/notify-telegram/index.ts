import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

async function isRateLimited(identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count } = await supabase
    .from("lookup_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("source", "notify-telegram")
    .gte("created_at", windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  await supabase.from("lookup_attempts").insert({ identifier, source: "notify-telegram" });
  return false;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (await isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { order_number } = body;

    if (!order_number || typeof order_number !== "string") {
      return new Response(JSON.stringify({ error: "order_number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull the authoritative order record — never trust the request body for order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "order_number, customer_name, contact, shipping_zone, city, np_branch, items, total_price"
      )
      .eq("order_number", order_number.trim().toUpperCase())
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build item list — same fallback chain as PDF: cart_quantity ?? cartQuantity ?? quantity ?? 1
    interface OrderLineItem {
      name: string;
      selectedSize: string | number;
      cart_quantity?: number;
      cartQuantity?: number;
      quantity?: number;
    }
    const itemList = Array.isArray(order.items)
      ? (order.items as OrderLineItem[])
          .map((item) => {
            const qty = item.cart_quantity ?? item.cartQuantity ?? item.quantity ?? 1;
            return `  ${item.name} x${qty} (size: ${item.selectedSize})`;
          })
          .join("\n")
      : JSON.stringify(order.items);

    const alertMessage = [
      `// NEW_ORDER_DETECTED`,
      ``,
      `ID: ${order.order_number}`,
      `CUSTOMER: ${order.customer_name}`,
      `CONTACT: ${order.contact}`,
      `SHIPPING: ${order.shipping_zone}`,
      ...(order.city ? [`CITY: ${order.city}`] : []),
      ...(order.np_branch ? [`BRANCH: ${order.np_branch}`] : []),
      ``,
      `ITEMS:`,
      itemList,
      ``,
      `TOTAL: ${order.total_price} UAH`,
    ].join("\n");

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: alertMessage }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
