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
// IMPORTANT: FindByString/CityName must be Cyrillic — Latin transliteration
// ("Kyiv") fails with a misleading "field not specified/invalid" error rather
// than just returning no results.
const NOVA_POSHTA_API_KEY = Deno.env.get("NOVA_POSHTA_API_KEY") ?? "";
const NOVA_POSHTA_SENDER_CITY_REF = Deno.env.get("NOVA_POSHTA_SENDER_CITY_REF") ?? "";
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 30;

async function isRateLimited(identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("lookup_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("source", "nova-poshta-search")
    .gte("created_at", windowStart);
  if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) return true;
  await supabase.from("lookup_attempts").insert({ identifier, source: "nova-poshta-search" });
  return false;
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

type RequestBody =
  | { action: "search-cities"; query: string }
  | { action: "search-warehouses"; cityRef: string; query?: string }
  | { action: "delivery-cost"; cityRef: string; weightKg: number; declaredValueUah: number };

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

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "INVALID_JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "search-cities") {
      const query = body.query?.trim();
      if (!query || query.length < 2) {
        return new Response(JSON.stringify({ cities: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const json = await callNovaPoshta("Address", "getCities", {
        FindByString: query,
        Limit: "20",
        Page: "1",
      });
      const addresses = json?.data ?? [];
      const cities = addresses.map((a: Record<string, string>) => ({
        ref: a.Ref,
        name: a.Description,
        area: a.AreaDescription ?? "",
      }));
      return new Response(JSON.stringify({ cities }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "search-warehouses") {
      if (!body.cityRef) {
        return new Response(JSON.stringify({ error: "VALIDATION_ERROR" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const json = await callNovaPoshta("Address", "getWarehouses", {
        CityRef: body.cityRef,
        FindByString: body.query?.trim() ?? "",
        Page: "1",
        Limit: "50",
      });
      const warehouses = (json?.data ?? []).map((w: Record<string, string>) => ({
        ref: w.Ref,
        description: w.Description,
      }));
      return new Response(JSON.stringify({ warehouses }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "delivery-cost") {
      if (!body.cityRef || !NOVA_POSHTA_SENDER_CITY_REF) {
        return new Response(JSON.stringify({ error: "VALIDATION_ERROR" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const cost = await fetchDeliveryCost(body.cityRef, body.weightKg, body.declaredValueUah);
        return new Response(JSON.stringify({ cost }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ error: "NP_DELIVERY_COST_FAILED" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "UNKNOWN_ACTION" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("nova-poshta-search error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
