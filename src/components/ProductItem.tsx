import type { ProductType } from "@/interfaces";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCurrencyStore, formatPrice } from "@/stores/useCurrencyStore";

interface ProductItemProps {
  product: ProductType;
}

export default function ProductItem({ product }: ProductItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  const isOutOfStock = product.stock_status === "out_of_stock";
  const currency = useCurrencyStore((state) => state.currency);

  const content = (
    <div
      className={`overflow-hidden w-72 h-106 flex flex-col gap-10 transition-all duration-300 ${
        isOutOfStock ? "opacity-40 grayscale cursor-not-allowed" : ""
      }`}
      onMouseEnter={() => !isOutOfStock && setIsHovering(true)}
      onMouseLeave={() => !isOutOfStock && setIsHovering(false)}
    >
      <div className="relative w-full h-2/3 bg-gray-100 overflow-hidden">
        <img
          src={product.image_url[0]}
          alt={product.name}
          className={`absolute w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
            isHovering && !isOutOfStock ? "opacity-0" : "opacity-100"
          }${isOutOfStock ? " blur-[2px]" : ""}`}
        />
        <img
          src={product.image_url[1]}
          alt={product.name}
          className={`absolute w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
            isHovering && !isOutOfStock ? "opacity-100" : "opacity-0"
          }${isOutOfStock ? " blur-[2px]" : ""}`}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gray-600/80 px-5 py-2">
              <p className="text-white font-black text-xs uppercase tracking-[0.25em]">
                OUT_OF_STOCK
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2 flex flex-col justify-start flex-1 bg-white">
        <h3 className="font-archivo-black text-sm text-black line-clamp-2">{product.name}</h3>
        {product.price && (
          <p className="font-ibm-mono text-sm font-semibold text-black">
            {formatPrice(product.price, currency)}
          </p>
        )}

        {product.sizes && !isOutOfStock && (
          <div
            className={`flex gap-2 flex-wrap transition-opacity duration-500 ease-in-out ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            {product.sizes.map((size) => (
              <span key={size} className="font-ibm-mono text-xs text-black px-2 py-1">
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isOutOfStock) return content;

  return <Link to={`/product/${product.id}`}>{content}</Link>;
}
