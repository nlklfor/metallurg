import { NOVA_POSHTA_SEARCH_URL } from "@/lib/constants/order";
import type { NPCity, NPWarehouse } from "@/interfaces";

export async function searchCities(query: string): Promise<NPCity[]> {
  const res = await fetch(NOVA_POSHTA_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search-cities", query }),
  });
  if (!res.ok) throw new Error("Failed to search cities");
  const json = await res.json();
  return json.cities ?? [];
}

export async function searchWarehouses(cityRef: string, query?: string): Promise<NPWarehouse[]> {
  const res = await fetch(NOVA_POSHTA_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "search-warehouses", cityRef, query }),
  });
  if (!res.ok) throw new Error("Failed to search warehouses");
  const json = await res.json();
  return json.warehouses ?? [];
}

export async function fetchDeliveryCostPreview(
  cityRef: string,
  weightKg: number,
  declaredValueUah: number
): Promise<number> {
  const res = await fetch(NOVA_POSHTA_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delivery-cost", cityRef, weightKg, declaredValueUah }),
  });
  if (!res.ok) throw new Error("Failed to calculate delivery cost");
  const json = await res.json();
  if (typeof json.cost !== "number") throw new Error("Failed to calculate delivery cost");
  return json.cost;
}
