import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { getProducts } from "@/api/products";
import type { ProductType } from "@/interfaces";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isLoading = isOpen && !hasFetched;

  useEffect(() => {
    if (!isOpen) return;
    if (hasFetched) return;

    getProducts()
      .then((data) => {
        setProducts(data ?? []);
        setHasFetched(true);
      })
      .catch(() => setProducts([]));
  }, [isOpen, hasFetched]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (product: ProductType) => {
      onClose();
      navigate(`/product/${product.id}`);
    },
    [onClose, navigate]
  );

  const filtered =
    debouncedQuery.trim().length > 0
      ? products.filter((p) => {
          const q = debouncedQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.materials?.toLowerCase().includes(q)
          );
        })
      : [];

  const showResults = debouncedQuery.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />

          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10"
          >
            <div className="max-w-4xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[9px] text-gray-500 uppercase tracking-[0.3em]">
                  // search_catalog
                </span>
                <button
                  onClick={handleClose}
                  className="text-[10px] text-gray-500 hover:text-white transition-colors tracking-widest"
                >
                  [ESC]
                </button>
              </div>

              <div className="relative border-b border-white/20 pb-4">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {">"}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ENTER_QUERY..."
                  className="w-full bg-transparent text-white text-xl font-bold uppercase tracking-wider pl-6 focus:outline-none placeholder:text-gray-600"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {showResults && (
                <div className="mt-6 max-h-[60vh] overflow-y-auto scrollbar-none">
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] animate-pulse">
                        // loading...
                      </p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">
                        // no_results_found
                      </p>
                      <p className="text-[9px] text-gray-600 tracking-[0.2em] mt-1">
                        QUERY: "{debouncedQuery}" — 0 MATCHES
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em] mb-4">
                        // {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                      </p>
                      <div className="space-y-1">
                        {filtered.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors group text-left"
                          >
                            <img
                              src={product.image_url[0]}
                              alt={product.name}
                              className={`w-12 h-12 object-cover flex-shrink-0 ${
                                product.stock_status === "out_of_stock"
                                  ? "grayscale opacity-40"
                                  : ""
                              }`}
                            />

                            <div className="flex-1 min-w-0">
                              <p
                                className="text-white text-sm uppercase tracking-wide truncate group-hover:text-gray-200"
                                style={{ fontFamily: "'Archivo Black', sans-serif" }}
                              >
                                {product.name}
                              </p>
                              <p className="text-[10px] text-gray-500 tracking-[0.2em] mt-0.5">
                                {product.materials && `// ${product.materials}`}
                              </p>
                            </div>

                            <div className="flex-shrink-0 text-right">
                              <p className="text-sm text-white font-bold tabular-nums">
                                {product.price.toLocaleString()}{" "}
                                <span className="text-[10px] text-gray-500 font-normal">UAH</span>
                              </p>
                              {product.stock_status === "out_of_stock" && (
                                <p className="text-[8px] text-red-400 uppercase tracking-[0.2em]">
                                  OUT_OF_STOCK
                                </p>
                              )}
                            </div>

                            <span className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all text-sm">
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {!showResults && (
                <div className="mt-6 py-4">
                  <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em]">
                    // search by name, material, or description
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
