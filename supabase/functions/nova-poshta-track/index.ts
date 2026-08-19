import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NOVA_POSHTA_API_KEY = Deno.env.get("NOVA_POSHTA_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const STATUS_MAP: Record<string, string> = {
  "1": "Shipment created",
  "2": "Deleted",
  "3": "Not found",
  "4": "In city sender",
  "5": "Departed",
  "6": "In city recipient",
  "7": "Arrived at branch",
  "8": "Undelivered — returning",
  "9": "Customs clearance",
  "10": "Refused by recipient",
  "11": "Delivered",
  "12": "Re-delivery",
  "101": "On the way",
  "102": "Not found in system",
  "103": "Delivered with change",
  "104": "Address changed",
  "105": "Stopped",
  "106": "Delivered to parcel locker",
};

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&country=Ukraine&format=json&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "metallurg-store/1.0" } });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // coords are optional
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { ttn } = await req.json();

    if (!ttn || typeof ttn !== "string") {
      return new Response(JSON.stringify({ error: "ttn is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const npResponse = await fetch(NP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: NOVA_POSHTA_API_KEY,
        modelName: "TrackingDocument",
        calledMethod: "getStatusDocuments",
        methodProperties: {
          Documents: [{ DocumentNumber: ttn.trim() }],
        },
      }),
    });

    const npData = await npResponse.json();
    console.log("NP response for", ttn, ":", JSON.stringify(npData));

    if (!npData.success || !npData.data?.length) {
      const npErrors = npData.errors?.join(", ") ?? "no data returned";
      return new Response(JSON.stringify({ error: `NP API: ${npErrors}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const doc = npData.data[0];
    const statusCode = String(doc.StatusCode ?? "");

    const coords = doc.CityRecipient ? await geocodeCity(doc.CityRecipient) : null;

    const result = {
      ttn: doc.Number,
      status_code: statusCode,
      status: STATUS_MAP[statusCode] ?? doc.Status ?? "Unknown",
      status_raw: doc.Status,
      city_sender: doc.CitySender,
      city_recipient: doc.CityRecipient,
      warehouse_recipient: doc.WarehouseRecipient,
      scheduled_date: doc.ScheduledDeliveryDate,
      actual_date: doc.ActualDeliveryDate,
      is_delivered: statusCode === "11" || statusCode === "106",
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("NP track error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
