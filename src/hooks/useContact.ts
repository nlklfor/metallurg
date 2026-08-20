import { useState } from "react";
import { EDGE_FUNCTIONS_BASE_URL } from "@/lib/constants/order";

const CONTACT_FORM_URL = `${EDGE_FUNCTIONS_BASE_URL}/contact-form`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    name.trim().length > 0 && EMAIL_REGEX.test(email.trim()) && message.trim().length > 0;

  const submit = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(CONTACT_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setError("TRANSMISSION_FAILED — TRY_AGAIN");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSent(false);
    setError("");
  };

  return {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    isLoading,
    sent,
    error,
    isValid,
    submit,
    reset,
  };
}
