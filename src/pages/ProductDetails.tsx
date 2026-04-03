import { useParams } from "react-router-dom";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton";
import ErrorState from "@/components/ErrorState";
import { useCartStore } from "@/stores/useCartStore";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";
import { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/useActionToast";
import { getThemeColors } from "@/config/theme";
import ProductImageSlider from "@/components/ProductImageSlider";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductItem from "@/components/ProductItem";
import { getProducts } from "@/api/products";
import type { ProductType } from "@/interfaces";

export default function ProductDetails() {
  const { slug } = useParams();
  const theme = getThemeColors("dark");

  if (!slug) {
    return (
      <div className={`w-full min-h-screen ${theme.bg} flex flex-col`}>
        <Navbar variant="dark" />
        <div className="flex-1 px-8 py-16">
          <ErrorState error="Product_not_found." />
        </div>
        <Footer />
      </div>
    );
  }

  return <ProductDetailsContent key={slug} slug={slug} />;
}

function ProductDetailsContent({ slug }: { slug: string }) {
  const { product, isLoading, error } = useProductDetails(slug);
  const [selectedSize, setSelectedSize] = useState<string | number | null>(null);
  const [cartQuantity, setCartQuantity] = useState(1);
  const { items } = useCartStore((state) => state);
  const addItem = useCartStore((state) => state.addToCart);
  const { showSuccess, showError } = useActionToast();
  const theme = getThemeColors("dark");
  const currency = useCurrencyStore((state) => state.currency);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    if (!product) return;
    getProducts()
      .then((data) => {
        const others = (data ?? []).filter(
          (p) => p.id !== product.id && p.stock_status !== "out_of_stock"
        );
        const shuffled = others.sort(() => Math.random() - 0.5);
        setRelatedProducts(shuffled.slice(0, 4));
      })
      .catch(() => setRelatedProducts([]));
  }, [product]);

  const isOutOfStock = product?.stock_status === "out_of_stock";
  const maxQty = product?.quantity ?? 1;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showError({ message: "Product_is_out_of_stock" });
      return;
    }
    if (!selectedSize) {
      showError({ message: "Please_select_a_size" });
      return;
    }
    if (items.some((item) => item.id === product?.id && item.selectedSize === selectedSize)) {
      showError({ message: "Product_already_in_loadout" });
      return;
    }
    if (product) {
      addItem(product, selectedSize, cartQuantity);
      showSuccess({ product, selectedSize, message: "product_added_to_loadout" });
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full min-h-screen ${theme.bg} flex flex-col`}>
        <Navbar variant="dark" />
        <div className="flex-1 flex items-center justify-center">
          <ProductDetailsSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`w-full min-h-screen ${theme.bg} flex flex-col`}>
        <Navbar variant="dark" />
        <div className="flex-1 flex items-center justify-center p-4">
          <ErrorState error={error} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${theme.bg} ${theme.text} flex flex-col`}>
      <Navbar variant="dark" />
      <Toaster position="bottom-right" />
      <div className="px-6 md:px-12 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Inventory", href: "/inventory" },
            { label: product.name },
          ]}
          variant="dark"
        />
      </div>
      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className={isOutOfStock ? "opacity-40" : ""}>
            <ProductImageSlider
              images={product.image_url}
              productName={product.name}
              isOutOfStock={isOutOfStock}
            />
          </div>

          <div className="flex flex-col">
            <header className="mb-8">
              <div className="flex justify-between items-baseline mb-2">
                <h1 className="text-6xl font-black uppercase tracking-tighter italic">
                  {product.name}
                </h1>
                <span className={`${theme.textSecondary} text-xs`}>VER. 2026.01</span>
              </div>
              <p className={`text-2xl ${theme.text}`}>{formatPrice(product.price, currency)}</p>
            </header>

            <section className={`border-y ${theme.border} py-8 my-8 space-y-6`}>
              <div>
                <h3
                  className={`text-[10px] ${theme.textSecondary} uppercase tracking-[0.2em] mb-3`}
                >
                  // description
                </h3>
                <p className={`${theme.textSecondary} leading-relaxed max-w-lg`}>
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className={`text-[10px] ${theme.textSecondary} uppercase mb-1`}>
                    // material
                  </h3>
                  <p className={`text-sm ${theme.textSecondary}`}>{product.materials}</p>
                </div>
                <div>
                  <h3 className={`text-[10px] ${theme.textSecondary} uppercase mb-1`}>// weight</h3>
                  <p className={`text-sm ${theme.textSecondary}`}>{product.weight} KG</p>
                </div>
              </div>
            </section>

            {!isOutOfStock && (
              <>
                <div className="mb-8">
                  <h3
                    className={`text-[10px] ${theme.textSecondary} uppercase tracking-[0.2em] mb-4`}
                  >
                    // select_size
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((size) => (
                      <Button
                        key={String(size)}
                        onClick={() => setSelectedSize(size)}
                        className={`px-8 py-3 text-sm rounded-xs transition-all border ${
                          selectedSize === size
                            ? "bg-white text-black border-white hover:bg-gray-100"
                            : `bg-transparent ${theme.text} ${theme.border} hover:border-gray-400`
                        }`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-12">
                  <h3
                    className={`text-[10px] ${theme.textSecondary} uppercase tracking-[0.2em] mb-4`}
                  >
                    // quantity
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center border ${theme.border}`}>
                      <button
                        onClick={() => setCartQuantity((q) => Math.max(1, q - 1))}
                        disabled={cartQuantity <= 1}
                        className={`w-10 h-10 flex items-center justify-center ${theme.textSecondary} hover:text-white transition-colors text-lg disabled:opacity-25 disabled:cursor-not-allowed`}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        className={`w-10 h-10 flex items-center justify-center text-sm font-black tabular-nums border-x ${theme.border}`}
                      >
                        {cartQuantity}
                      </span>
                      <button
                        onClick={() => setCartQuantity((q) => Math.min(maxQty, q + 1))}
                        disabled={cartQuantity >= maxQty}
                        className={`w-10 h-10 flex items-center justify-center ${theme.textSecondary} hover:text-white transition-colors text-lg disabled:opacity-25 disabled:cursor-not-allowed`}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span
                      className={`text-[10px] ${theme.textSecondary} tracking-[0.2em] uppercase`}
                    >
                      {maxQty} IN_STOCK
                    </span>
                  </div>
                </div>
              </>
            )}

            <Button
              disabled={!selectedSize || isOutOfStock}
              onClick={handleAddToCart}
              variant="destructive"
              className={`w-full py-8 font-black uppercase tracking-[0.3em] rounded-xs text-lg transition-all duration-300 group flex items-center justify-center gap-4 ${
                isOutOfStock
                  ? `${theme.bg} ${theme.textSecondary} cursor-not-allowed`
                  : "bg-white text-black hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed"
              }`}
            >
              {isOutOfStock ? (
                <span>Out_of_Stock</span>
              ) : selectedSize ? (
                <div className="flex items-center gap-2">
                  <span>INITIALIZE_ACQUISITION</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              ) : (
                <span>SET_SIZE_UNIT</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="px-6 md:px-12 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="border-t border-gray-800 pt-12">
              <p className="text-[10px] text-gray-500 tracking-[0.4em] uppercase mb-3">
                // RECOMMENDED
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-10">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductItem key={p.id} product={p} variant="dark" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
