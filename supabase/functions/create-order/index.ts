import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Classic Nova Poshta domestic API (api.novaposhta.ua) — apiKey sent directly
// in every request body. Key comes from new.novaposhta.ua/dashboard/settings/developers.
const NOVA_POSHTA_API_KEY = Deno.env.get("NOVA_POSHTA_API_KEY") ?? "";
const NOVA_POSHTA_SENDER_CITY_REF = Deno.env.get("NOVA_POSHTA_SENDER_CITY_REF") ?? "";
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

// Same alphabet/format as src/utils/orderUtils.ts generateOrderNumber() —
// kept in sync manually since Deno can't import across the Vite/Node boundary.
const ORDER_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateOrderNumber(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ORDER_CODE_CHARS[Math.floor(Math.random() * ORDER_CODE_CHARS.length)];
  }
  return `MTL-${code}`;
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

async function isRateLimited(identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("lookup_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("source", "create-order")
    .gte("created_at", windowStart);
  if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) return true;
  await supabase.from("lookup_attempts").insert({ identifier, source: "create-order" });
  return false;
}

interface IncomingItem {
  product_id: string;
  selectedSize: string | number | null;
  cart_quantity: number;
}

interface CreateOrderRequest {
  customer_name: string;
  contact: string;
  shipping_zone: "Ukraine" | "International";
  city?: string;
  city_ref?: string;
  np_branch?: string;
  country?: string;
  items: IncomingItem[];
}

async function callNovaPoshta(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
) {
  const res = await fetch(NP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: NOVA_POSHTA_API_KEY,
      modelName,
      calledMethod,
      methodProperties,
    }),
  });
  return res.json();
}

async function fetchDeliveryCost(
  cityRef: string,
  weightKg: number,
  declaredValueUah: number
): Promise<number> {
  const json = await callNovaPoshta("InternetDocument", "getDocumentPrice", {
    CitySender: NOVA_POSHTA_SENDER_CITY_REF,
    CityRecipient: cityRef,
    Weight: weightKg.toFixed(2),
    ServiceType: "WarehouseWarehouse",
    Cost: String(Math.max(1, Math.round(declaredValueUah))),
    CargoType: "Parcel",
    SeatsAmount: "1",
  });
  if (!json.success || !json.data?.[0]?.Cost) {
    console.error("NP delivery-cost error:", JSON.stringify(json));
    throw new Error("NP_DELIVERY_COST_FAILED");
  }
  return Math.round(Number(json.data[0].Cost));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  try {
    if (await isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "RATE_LIMITED" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: CreateOrderRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "INVALID_JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      !body.items?.length ||
      !body.customer_name?.trim() ||
      !body.contact?.trim() ||
      (body.shipping_zone !== "Ukraine" && body.shipping_zone !== "International")
    ) {
      return new Response(JSON.stringify({ error: "VALIDATION_ERROR" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (body.shipping_zone === "Ukraine" && (!body.city_ref || !body.np_branch)) {
      return new Response(
        JSON.stringify({ error: "VALIDATION_ERROR", detail: "city/warehouse required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (body.shipping_zone === "International" && (!body.country?.trim() || !body.city?.trim())) {
      return new Response(
        JSON.stringify({ error: "VALIDATION_ERROR", detail: "country/city required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Re-fetch authoritative product data; never trust client price/name/stock ---
    const productIds = [...new Set(body.items.map((i) => i.product_id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, weight, stock_status, size_stock, quantity")
      .in("id", productIds);

    if (productsError || !products || products.length !== productIds.length) {
      return new Response(JSON.stringify({ error: "PRODUCT_NOT_FOUND" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      if (!product || product.stock_status === "out_of_stock") {
        return new Response(
          JSON.stringify({ error: "OUT_OF_STOCK", product_id: item.product_id }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const serverItems = body.items.map((item) => {
      const product = productMap.get(item.product_id)!;
      return {
        product_id: item.product_id,
        name: product.name,
        selectedSize: item.selectedSize,
        price: product.price,
        cart_quantity: item.cart_quantity,
      };
    });

    const itemsTotal = serverItems.reduce((t, i) => t + i.price * i.cart_quantity, 0);

    // --- Delivery cost (Ukraine only) ---
    let deliveryCost = 0;
    if (body.shipping_zone === "Ukraine") {
      const totalWeightKg = body.items.reduce((sum, item) => {
        const product = productMap.get(item.product_id)!;
        const parsed = parseFloat(product.weight ?? "");
        const unitWeight = Number.isFinite(parsed) ? parsed : 0.5;
        return sum + unitWeight * item.cart_quantity;
      }, 0);

      try {
        deliveryCost = await fetchDeliveryCost(body.city_ref!, totalWeightKg, itemsTotal);
      } catch {
        return new Response(JSON.stringify({ error: "NP_DELIVERY_COST_FAILED" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const totalPrice = itemsTotal + deliveryCost;

    // --- Create order (atomic stock decrement + insert), retry order_number collisions ---
    let order = null;
    let lastError: { message?: string } | null = null;
    for (let attempt = 0; attempt < 3 && !order; attempt++) {
      const orderNumber = generateOrderNumber();
      const { data, error } = await supabase.rpc("create_order", {
        p_order_number: orderNumber,
        p_customer_name: body.customer_name.trim(),
        p_contact: body.contact.trim(),
        p_shipping_zone: body.shipping_zone,
        p_city:
          body.shipping_zone === "Ukraine" ? (body.city ?? null) : (body.city?.trim() ?? null),
        p_np_branch: body.shipping_zone === "Ukraine" ? (body.np_branch ?? null) : null,
        p_items: serverItems,
        p_total_price: totalPrice,
        p_delivery_cost: deliveryCost,
      });
      if (error) {
        lastError = error;
        if (error.message?.includes("duplicate key") && error.message?.includes("order_number")) {
          continue; // retry with a new order number
        }
        break; // any other error (stock, validation) is not retryable
      }
      order = data;
    }

    if (!order) {
      const msg = lastError?.message ?? "";
      if (msg.startsWith("INSUFFICIENT_STOCK")) {
        const [, productId, size] = msg.split(":");
        return new Response(
          JSON.stringify({
            error: "INSUFFICIENT_STOCK",
            product_id: productId,
            size: size || null,
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.startsWith("PRODUCT_NOT_FOUND") || msg.startsWith("MISSING_SIZE")) {
        return new Response(JSON.stringify({ error: "VALIDATION_ERROR", detail: msg }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("create-order RPC error:", msg);
      return new Response(JSON.stringify({ error: "ORDER_CREATION_FAILED" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-order error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
