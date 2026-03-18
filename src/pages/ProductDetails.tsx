import { useParams } from "react-router-dom";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton";
import ErrorState from "@/components/ErrorState";
import { useCartStore } from "@/stores/useCartStore";
import { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/useActionToast";
import { getThemeColors } from "@/config/theme";
import ProductImageSlider from "@/components/ProductImageSlider";

export default function ProductDetails() {
  const { id } = useParams();
  const theme = getThemeColors("dark");

  if (!id) {
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

  return <ProductDetailsContent key={id} id={id} />;
}

function ProductDetailsContent({ id }: { id: string }) {
  const { product, isLoading, error } = useProductDetails(id);
  const [selectedSize, setSelectedSize] = useState<string | number | null>(null);
  const { items } = useCartStore((state) => state);
  const addItem = useCartStore((state) => state.addToCart);
  const { showSuccess, showError } = useActionToast();
  const theme = getThemeColors("dark");

  const isOutOfStock = product?.stock_status === "out_of_stock";

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
      showError({ message: "Product_already_in_cart" });
      return;
    }
    if (product) {
      addItem(product, selectedSize);
      showSuccess({ product, selectedSize, message: "product_added_to_cart" });
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

      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* ── Left: SNS-style vertical slider ── */}
          <div className={isOutOfStock ? "opacity-40" : ""}>
            <ProductImageSlider
              images={product.image_url}
              productName={product.name}
              isOutOfStock={isOutOfStock}
            />
          </div>

          {/* ── Right: product info ── */}
          <div className="flex flex-col">
            <header className="mb-8">
              <div className="flex justify-between items-baseline mb-2">
                <h1 className="text-6xl font-black uppercase tracking-tighter italic">
                  {product.name}
                </h1>
                <span className={`${theme.textSecondary} text-xs`}>VER. 2026.01</span>
              </div>
              <p className={`text-2xl ${theme.text}`}>{product.price.toLocaleString()} UAH</p>
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
              <div className="mb-12">
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
                  <span>Initiate_Order</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              ) : (
                <span>Select_size_to_order</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
