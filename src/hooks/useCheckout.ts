import { useState, useMemo, useEffect } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { serializeCartItems } from "@/utils";
import { normalizeUaPhone } from "@/utils/phone";
import { computeTotal } from "@/utils/computeTotal";
import { CREATE_ORDER_URL } from "@/lib/constants/order";
import { fetchDeliveryCostPreview } from "@/api/novaPoshta";
import type { NPCity, NPWarehouse, OrderStep, ShippingZone } from "@/interfaces";

export interface ConfirmedOrder {
  order_number: string;
  created_at: string;
  customer_name: string;
  contact: string;
  shipping_zone: string;
  total_price: number;
  delivery_cost: number | null;
  items: Array<{
    name: string;
    selectedSize: string | number;
    price: number;
    cart_quantity: number;
  }>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMITED: "TOO_MANY_ATTEMPTS — please wait a few minutes and try again.",
  VALIDATION_ERROR: "Please check the form and try again.",
  OUT_OF_STOCK: "One of the items in your loadout just went out of stock. Please review your cart.",
  INSUFFICIENT_STOCK: "Not enough stock left for one of your items. Please adjust the quantity.",
  NP_DELIVERY_COST_FAILED: "Couldn't calculate delivery cost right now. Please try again shortly.",
  PRODUCT_NOT_FOUND: "One of the items in your loadout is no longer available.",
  ORDER_CREATION_FAILED: "Something went wrong creating your order. Please try again.",
};

export function useCheckout() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Recompute whenever the loadout changes (quantity edits in the cart while
  // this hook stays mounted). totalPrice() is a stable function reference, so
  // memoizing on it alone froze the total at its first value.
  const itemsTotal = useMemo(() => computeTotal(items), [items]);

  const [step, setStep] = useState<OrderStep>("form");
  const [orderNumber, setOrderNumber] = useState("");
  // The order exactly as create-order saved it (server prices, real delivery
  // cost) — the receipt is built from this, never from client-side numbers.
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  // Recipient phone for the Nova Poshta waybill (Ukraine only).
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState<ShippingZone>("Ukraine");

  const [selectedCity, setSelectedCityState] = useState<NPCity | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<NPWarehouse | null>(null);
  const [deliveryCost, setDeliveryCost] = useState<number | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  const [country, setCountry] = useState("");
  const [intlCity, setIntlCity] = useState("");

  const isUkraine = zone === "Ukraine";
  // Only surface delivery-cost state while it's actually relevant — avoids
  // showing a stale value from a previous city/zone selection.
  const showDelivery = isUkraine && selectedCity !== null;
  const effectiveDeliveryCost = showDelivery ? deliveryCost : null;
  const effectiveIsCalculatingDelivery = showDelivery && isCalculatingDelivery;
  const finalTotal = itemsTotal + (isUkraine ? (effectiveDeliveryCost ?? 0) : 0);

  const normalizedPhone = normalizeUaPhone(phone);
  const isFormValid =
    name.trim().length > 0 &&
    contact.trim().length > 0 &&
    (email.trim().length === 0 || EMAIL_REGEX.test(email.trim())) &&
    (isUkraine
      ? selectedCity !== null && selectedWarehouse !== null && normalizedPhone !== null
      : country.trim().length > 0 && intlCity.trim().length > 0);

  const setSelectedCity = (city: NPCity | null) => {
    setSelectedCityState(city);
    setSelectedWarehouse(null);
    setDeliveryCost(null);
  };

  // Live delivery-cost preview once a city is chosen — display only, never
  // trusted at submit time (create-order recomputes it authoritatively).
  useEffect(() => {
    if (!isUkraine || !selectedCity || items.length === 0) {
      return;
    }
    let cancelled = false;
    const weightKg = items.reduce(
      (sum, item) => sum + (item.weight ?? 0.5) * item.cart_quantity,
      0
    );
    Promise.resolve()
      .then(() => {
        if (!cancelled) setIsCalculatingDelivery(true);
        return fetchDeliveryCostPreview(selectedCity.ref, weightKg, itemsTotal);
      })
      .then((cost) => {
        if (!cancelled) setDeliveryCost(cost);
      })
      .catch(() => {
        if (!cancelled) setDeliveryCost(null);
      })
      .finally(() => {
        if (!cancelled) setIsCalculatingDelivery(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCity, isUkraine, items, itemsTotal]);

  const reset = () => {
    setStep("form");
    setName("");
    setContact("");
    setEmail("");
    setPhone("");
    setZone("Ukraine");
    setSelectedCity(null);
    setCountry("");
    setIntlCity("");
    setErrorMsg("");
    setConfirmedOrder(null);
  };

  const handleClose = (onClose: () => void) => {
    if (step === "success") clearCart();
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid || items.length === 0) return;
    setStep("submitting");

    const serializedItems = serializeCartItems(items);

    const payload = {
      customer_name: name.trim(),
      contact: contact.trim(),
      ...(email.trim() && { customer_email: email.trim() }),
      shipping_zone: zone,
      ...(isUkraine
        ? {
            city: selectedCity!.name,
            city_ref: selectedCity!.ref,
            np_branch: selectedWarehouse!.description,
            warehouse_ref: selectedWarehouse!.ref,
            recipient_phone: normalizedPhone,
          }
        : { country: country.trim(), city: intlCity.trim() }),
      items: serializedItems,
    };

    try {
      const res = await fetch(CREATE_ORDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setErrorMsg(ERROR_MESSAGES[json.error] ?? "Something went wrong. Please try again.");
        setStep("error");
        return;
      }

      // The owner's Telegram alert is sent by create-order itself now.
      const createdOrderNumber: string = json.order.order_number;

      setOrderNumber(createdOrderNumber);
      setConfirmedOrder(json.order as ConfirmedOrder);
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error occurred.";
      setErrorMsg(message);
      setStep("error");
    }
  };

  return {
    step,
    setStep,
    orderNumber,
    confirmedOrder,
    errorMsg,
    name,
    setName,
    contact,
    setContact,
    email,
    setEmail,
    phone,
    setPhone,
    phoneInvalid: phone.trim().length > 0 && normalizedPhone === null,
    zone,
    setZone,
    selectedCity,
    setSelectedCity,
    selectedWarehouse,
    setSelectedWarehouse,
    country,
    setCountry,
    intlCity,
    setIntlCity,
    deliveryCost: effectiveDeliveryCost,
    isCalculatingDelivery: effectiveIsCalculatingDelivery,
    isUkraine,
    isFormValid,
    items,
    total: finalTotal,
    itemsTotal,
    handleSubmit,
    handleClose,
  };
}
