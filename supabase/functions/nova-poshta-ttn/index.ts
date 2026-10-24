import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Creates a Nova Poshta waybill (TTN) for an order, from the admin panel.
//
//   POST { action: "sender" }                → sender profile (for the dialog)
//   POST { action: "create", order_id, ... } → creates the TTN, saves it on the order
//
// Admin-only: the caller's Supabase JWT must belong to a row in public.admins
// (checked with is_admin(), the same predicate the RLS policies use).
// Sender = the NP account behind NOVA_POSHTA_API_KEY; ships from branch
// NOVA_POSHTA_SENDER_WAREHOUSE_NUMBER (default 1) in NOVA_POSHTA_SENDER_CITY_REF.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NP_API_KEY = Deno.env.get("NOVA_POSHTA_API_KEY") ?? "";
const SENDER_CITY_REF = Deno.env.get("NOVA_POSHTA_SENDER_CITY_REF") ?? "";
const SENDER_WAREHOUSE_NUMBER = Deno.env.get("NOVA_POSHTA_SENDER_WAREHOUSE_NUMBER") ?? "1";
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

class NpError extends Error {}

// deno-lint-ignore no-explicit-any
async function np(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<any[]> {
  const res = await fetch(NP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: NP_API_KEY, modelName, calledMethod, methodProperties }),
  });
  const data = await res.json();
  if (!data.success) {
    const msg = [...(data.errors ?? []), ...(data.warnings ?? [])].join("; ") || "unknown error";
    throw new NpError(`${modelName}.${calledMethod}: ${msg}`);
  }
  return data.data ?? [];
}

// Same rules as the storefront (src/utils/phone.ts): 380XXXXXXXXX.
function normalizeUaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let n = digits;
  if (n.length === 9) n = "380" + n;
  else if (n.length === 10 && n.startsWith("0")) n = "38" + n;
  else if (n.length === 11 && n.startsWith("80")) n = "3" + n;
  return /^380\d{9}$/.test(n) ? n : null;
}

function npDate(d = new Date()): string {
  // Kyiv local date, dd.mm.yyyy
  const parts = new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}`;
}

interface Sender {
  ref: string;
  name: string;
  contactRef: string;
  contactName: string;
  phone: string;
  cityRef: string;
  warehouseRef: string;
  warehouseName: string;
}

let senderCache: { at: number; sender: Sender } | null = null;

async function getSender(): Promise<Sender> {
  if (senderCache && Date.now() - senderCache.at < 30 * 60 * 1000) return senderCache.sender;
  if (!NP_API_KEY) throw new NpError("NOVA_POSHTA_API_KEY is not set");
  if (!SENDER_CITY_REF) throw new NpError("NOVA_POSHTA_SENDER_CITY_REF is not set");

  const [counterparty] = await np("Counterparty", "getCounterparties", {
    CounterpartyProperty: "Sender",
    Page: "1",
  });
  if (!counterparty) throw new NpError("No sender counterparty on this Nova Poshta account");

  const [contact] = await np("Counterparty", "getCounterpartyContactPersons", {
    Ref: counterparty.Ref,
    Page: "1",
  });
  if (!contact) throw new NpError("No contact person on the sender counterparty");

  const [warehouse] = await np("Address", "getWarehouses", {
    CityRef: SENDER_CITY_REF,
    WarehouseId: SENDER_WAREHOUSE_NUMBER,
  });
  if (!warehouse) {
    throw new NpError(`Sender branch №${SENDER_WAREHOUSE_NUMBER} not found in the sender city`);
  }

  const sender: Sender = {
    ref: counterparty.Ref,
    name: counterparty.Description,
    contactRef: contact.Ref,
    contactName: contact.Description,
    phone: String(contact.Phones ?? "").replace(/\D/g, ""),
    cityRef: SENDER_CITY_REF,
    warehouseRef: warehouse.Ref,
    warehouseName: warehouse.Description,
  };
  senderCache = { at: Date.now(), sender };
  return sender;
}

/** Older orders only stored the city/branch text — resolve the refs by name. */
async function resolveRecipientAddress(order: {
  city: string | null;
  city_ref: string | null;
  np_branch: string | null;
  warehouse_ref: string | null;
}): Promise<{ cityRef: string; warehouseRef: string }> {
  let cityRef = order.city_ref;
  if (!cityRef) {
    if (!order.city) throw new NpError("Order has no city");
    const cities = await np("Address", "getCities", { FindByString: order.city, Limit: "5" });
    const exact = cities.find((c) => c.Description === order.city) ?? cities[0];
    if (!exact) throw new NpError(`City "${order.city}" not found in Nova Poshta`);
    cityRef = exact.Ref as string;
  }
  let warehouseRef = order.warehouse_ref;
  if (!warehouseRef) {
    if (!order.np_branch) throw new NpError("Order has no Nova Poshta branch");
    const number = order.np_branch.match(/№\s*(\d+)/)?.[1];
    const list = await np("Address", "getWarehouses", {
      CityRef: cityRef,
      ...(number ? { WarehouseId: number } : { FindByString: order.np_branch }),
      Limit: "50",
    });
    const exact =
      list.find((w) => w.Description === order.np_branch) ?? (number ? list[0] : undefined);
    if (!exact)
      throw new NpError(`Branch "${order.np_branch}" not found — pick it again in the dialog`);
    warehouseRef = exact.Ref as string;
  }
  return { cityRef, warehouseRef };
}

interface CreateRequest {
  action: "create";
  order_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: string;
  weight_kg: number;
  declared_value: number;
  description?: string;
  cod_amount?: number | null; // null/0 → no cash on delivery
  force?: boolean; // create another TTN even if the order already has one
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // --- admin gate -----------------------------------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  const asCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: isAdmin, error: adminErr } = await asCaller.rpc("is_admin");
  if (adminErr || isAdmin !== true) return json({ error: "Forbidden" }, 403);

  let body: { action?: string } & Partial<CreateRequest>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  try {
    if (body.action === "sender") {
      const s = await getSender();
      return json({
        sender: {
          name: s.name,
          contact: s.contactName,
          phone: s.phone,
          warehouse: s.warehouseName,
        },
      });
    }

    if (body.action !== "create") return json({ error: "Unknown action" }, 400);
    const b = body as CreateRequest;

    // --- validate input -----------------------------------------------------
    const firstName = String(b.first_name ?? "").trim();
    const lastName = String(b.last_name ?? "").trim();
    const middleName = String(b.middle_name ?? "").trim();
    const phone = normalizeUaPhone(String(b.phone ?? ""));
    const weight = Number(b.weight_kg);
    const declared = Math.round(Number(b.declared_value));
    const cod = b.cod_amount ? Math.round(Number(b.cod_amount)) : 0;
    if (!b.order_id) return json({ error: "order_id is required" }, 400);
    if (!firstName || !lastName)
      return json({ error: "Recipient first and last name are required" }, 400);
    if (!phone) return json({ error: "Recipient phone must be a Ukrainian mobile number" }, 400);
    if (!(weight > 0 && weight <= 30))
      return json({ error: "Weight must be between 0 and 30 kg" }, 400);
    if (!(declared >= 1)) return json({ error: "Declared value must be at least 1 UAH" }, 400);
    if (cod < 0) return json({ error: "Invalid cash-on-delivery amount" }, 400);

    const { data: order, error: orderErr } = await service
      .from("orders")
      .select(
        "id, order_number, shipping_zone, status, city, city_ref, np_branch, warehouse_ref, tracking_number"
      )
      .eq("id", b.order_id)
      .single();
    if (orderErr || !order) return json({ error: "Order not found" }, 404);
    if (order.shipping_zone !== "Ukraine")
      return json({ error: "Waybills are for Ukraine orders only" }, 400);
    if (order.status === "cancelled") return json({ error: "Order is cancelled" }, 400);
    if (order.tracking_number && !b.force) {
      return json({ error: `Order already has TTN ${order.tracking_number}` }, 409);
    }

    // --- build the waybill --------------------------------------------------
    const sender = await getSender();
    const { cityRef, warehouseRef } = await resolveRecipientAddress(order);

    const [recipient] = await np("Counterparty", "save", {
      FirstName: firstName,
      MiddleName: middleName,
      LastName: lastName,
      Phone: phone,
      Email: "",
      CounterpartyType: "PrivatePerson",
      CounterpartyProperty: "Recipient",
    });
    const recipientContactRef = recipient?.ContactPerson?.data?.[0]?.Ref;
    if (!recipient?.Ref || !recipientContactRef)
      throw new NpError("Could not create the recipient");

    const description = (
      b.description?.trim() || `Одяг та взуття, замовлення ${order.order_number}`
    ).slice(0, 100);

    const props: Record<string, unknown> = {
      PayerType: "Recipient",
      PaymentMethod: "Cash",
      DateTime: npDate(),
      CargoType: "Parcel",
      Weight: weight.toFixed(2),
      ServiceType: "WarehouseWarehouse",
      SeatsAmount: "1",
      Description: description,
      Cost: String(declared),
      CitySender: sender.cityRef,
      Sender: sender.ref,
      SenderAddress: sender.warehouseRef,
      ContactSender: sender.contactRef,
      SendersPhone: sender.phone,
      CityRecipient: cityRef,
      Recipient: recipient.Ref,
      RecipientAddress: warehouseRef,
      ContactRecipient: recipientContactRef,
      RecipientsPhone: phone,
      InfoRegClientBarcodes: order.order_number,
    };
    if (cod > 0) {
      props.BackwardDeliveryData = [
        { PayerType: "Recipient", CargoType: "Money", RedeliveryString: String(cod) },
      ];
    }

    const [doc] = await np("InternetDocument", "save", props);
    if (!doc?.IntDocNumber) throw new NpError("Nova Poshta did not return a TTN number");

    // --- save on the order --------------------------------------------------
    // Ukraine route: 0 ORDER_ACCEPTED, 1 PACKING, 2 READY_FOR_PICKUP, 3 HANDED_TO_RESIDENT
    const { error: updErr } = await service
      .from("orders")
      .update({
        tracking_number: doc.IntDocNumber,
        np_document_ref: doc.Ref,
        recipient_phone: phone,
        city_ref: cityRef,
        warehouse_ref: warehouseRef,
        status: "shipped",
        current_status_index: 2,
      })
      .eq("id", order.id);
    if (updErr) {
      // The TTN exists in NP even if saving failed — return it so it isn't lost.
      console.error("nova-poshta-ttn: order update failed", updErr);
      return json({
        ttn: doc.IntDocNumber,
        warning: "TTN created but not saved on the order: " + updErr.message,
      });
    }

    return json({
      ttn: doc.IntDocNumber,
      cost: doc.CostOnSite ?? null,
      estimated_delivery: doc.EstimatedDeliveryDate ?? null,
    });
  } catch (err) {
    if (err instanceof NpError) return json({ error: err.message }, 502);
    console.error("nova-poshta-ttn error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
