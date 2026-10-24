// Ukrainian mobile number in the form Nova Poshta expects: 380XXXXXXXXX.
// Accepts "+38 (067) 123-45-67", "0671234567", "380671234567", "671234567".
// Mirrored in supabase/functions/create-order (keep in sync).
export function normalizeUaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let n = digits;
  if (n.length === 9) n = "380" + n;
  else if (n.length === 10 && n.startsWith("0")) n = "38" + n;
  else if (n.length === 11 && n.startsWith("80")) n = "3" + n;
  return /^380\d{9}$/.test(n) ? n : null;
}
