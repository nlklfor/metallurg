export function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MTL-${num}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString()} UAH`;
}

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
