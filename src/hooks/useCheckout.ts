import { useState } from "react";
import supabase from "@/lib/supabase";
import { useCartStore } from "@/stores/useCartStore";
import { generateOrderNumber, serializeCartItems } from "@/utils";
import { EDGE_FUNCTION_URL } from "@/lib/constants/order";
import type { OrderStep, ShippingZone } from "@/interfaces";

export function useCheckout() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState<OrderStep>("form");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [zone, setZone] = useState<ShippingZone>("Ukraine");

  const isFormValid = name.trim().length > 0 && contact.trim().length > 0;

  const reset = () => {
    setStep("form");
    setName("");
    setContact("");
    setZone("Ukraine");
    setErrorMsg("");
  };

  const handleClose = (onClose: () => void) => {
    if (step === "success") clearCart();
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid || items.length === 0) return;
    setStep("submitting");

    const order_number = generateOrderNumber();
    const total = totalPrice();
    const serializedItems = serializeCartItems(items);

    const payload = {
      order_number,
      customer_name: name.trim(),
      contact: contact.trim(),
      shipping_zone: zone,
      items: serializedItems,
      total_price: total,
    };

    try {
      const { error } = await supabase.from("orders").insert({
        ...payload,
        status: "waiting_for_payment",
      });

      if (error) throw error;

      await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setOrderNumber(order_number);
      setStep("success");
    } catch (err: unknown) {
      setErrorMsg(
        (err as { message?: string })?.message ?? "Unknown error occurred.",
      );
      setStep("error");
    }
  };

  return {
    step,
    setStep,
    orderNumber,
    errorMsg,
    name,
    setName,
    contact,
    setContact,
    zone,
    setZone,
    isFormValid,
    items,
    totalPrice,
    handleSubmit,
    handleClose,
  };
}
