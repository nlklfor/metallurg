// Order numbers (MTL-XXXXXX) are now generated server-side, in
// supabase/functions/create-order/index.ts — keep that in sync if this
// scheme ever changes.

export function formatPrice(price: number): string {
  return `${price.toLocaleString()} UAH`;
}

// NOTE: For currency-aware formatting, use formatPrice from @/stores/useCurrencyStore instead.

export function serializeCartItems(
  items: {
    id: string;
    name: string;
    selectedSize: string | number;
    price: number;
    cart_quantity: number;
  }[]
) {
  return items.map((item) => ({
    product_id: item.id,
    name: item.name,
    selectedSize: item.selectedSize,
    price: item.price,
    cart_quantity: item.cart_quantity,
  }));
}
