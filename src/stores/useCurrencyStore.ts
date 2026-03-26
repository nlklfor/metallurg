import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "UAH" | "CHF" | "EUR";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number;
}

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  UAH: { code: "UAH", symbol: "₴", label: "UAH / UA", rate: 1 },
  CHF: { code: "CHF", symbol: "CHF", label: "CHF / CH", rate: 1 / 50 },
  EUR: { code: "EUR", symbol: "€", label: "EUR / EU", rate: 1 / 45 },
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "UAH",
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "metallurg-currency" }
  )
);

export function convertPrice(priceInUAH: number, currency: CurrencyCode): number {
  const rate = CURRENCIES[currency].rate;
  return Math.round(priceInUAH * rate * 100) / 100;
}

export function formatPrice(priceInUAH: number, currency: CurrencyCode): string {
  const converted = convertPrice(priceInUAH, currency);
  if (currency === "UAH") {
    return `${converted.toLocaleString()} UAH`;
  }
  return `${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
