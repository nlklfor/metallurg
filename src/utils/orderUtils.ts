const ORDER_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I/L — avoids typos

export function generateOrderNumber(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ORDER_CODE_CHARS[Math.floor(Math.random() * ORDER_CODE_CHARS.length)];
  }
  return `MTL-${code}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString()} UAH`;
}

// NOTE: For currency-aware formatting, use formatPrice from @/stores/useCurrencyStore instead.

export function serializeCartItems(
  items: { name: string; selectedSize: string | number; price: number; cart_quantity: number }[]
) {
  return items.map((item) => ({
    name: item.name,
    selectedSize: item.selectedSize,
    price: item.price,
    cart_quantity: item.cart_quantity,
  }));
}
