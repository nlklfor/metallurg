import { useParams } from "react-router-dom";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton";
import ErrorState from "@/components/ErrorState";
import { useCartStore } from "@/stores/useCartStore";
import { useAddToCartToast } from "@/hooks/useAddToCartToast";
import { Toaster } from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const { product, isLoading, error } = useProductDetails(id);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const addItem = useCartStore((state) => state.addToCart);
  const { showAddedToast } = useAddToCartToast();

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addItem(product, selectedSize);
      showAddedToast(product, selectedSize);
    }
  };

  if (!id) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col">
        <Navbar variant="dark" />
        <div className="flex-1 px-8 py-16 text-gray-400 font-sans">
          <ErrorState error="Product_not_found." />
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col">
        <Navbar variant="dark" />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <ProductDetailsSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col">
        <Navbar variant="dark" />
        <div className="flex-1 flex items-center justify-center p-4">
          <ErrorState error={error} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      <Navbar variant="dark" />
      <Toaster position="bottom-right" />

      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-900 border border-gray-800 overflow-hidden relative group">
              <img
                src={product.image_url[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 text-[10px] text-gray-400 border border-gray-800">
                SPEC_SHR_IMG_01
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.image_url.slice(1).map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-900 border border-gray-800 hover:border-gray-500 cursor-pointer overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`${product.name} view ${idx + 2}`}
                    className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <header className="mb-8">
              <div className="flex justify-between items-baseline mb-2">
                <h1 className="text-6xl font-black uppercase tracking-tighter italic">
                  {product.name}
                </h1>
                <span className="text-gray-600 text-xs">VER. 2026.01</span>
              </div>
              <p className="text-2xl text-white">
                {product.price.toLocaleString()} UAH
              </p>
            </header>

            <section className="border-y border-gray-800 py-8 my-8 space-y-6">
              <div>
                <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-3">
                  // description
                </h3>
                <p className="text-gray-300 leading-relaxed max-w-lg">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase mb-1">
                    // material
                  </h3>
                  <p className="text-sm text-gray-200">HEAVY_STEEL_COTTON</p>
                </div>
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase mb-1">
                    // weight
                  </h3>
                  <p className="text-sm text-gray-200">1.280_KG</p>
                </div>
              </div>
            </section>

            <div className="mb-12">
              <h3 className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-4">
                // select_size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-8 py-3 text-sm transition-all border ${
                      selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!selectedSize}
              onClick={handleAddToCart}
              className="w-full bg-white text-black py-5 font-black uppercase tracking-[0.3em] text-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed group flex items-center justify-center gap-4"
            >
              {selectedSize ? (
                <div className="flex items-center gap-2">
                  <span>Initiate_Order</span>
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </div>
              ) : (
                <span>Select_size_to_order</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
