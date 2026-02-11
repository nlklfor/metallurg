import type { ProductType } from "@/interfaces";
import { useState } from "react";

interface ProductItemProps {
  product: ProductType;
}

export default function ProductItem({ product }: ProductItemProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="bg-gray-200 rounded-sm overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg w-62 h-96 flex flex-col"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Container - 2/4 of card */}
      <div className="relative w-full h-1/2 bg-gray-200 overflow-hidden mt-6">
        <img
          src={product.image_url[0]}
          alt={product.name}
          className={`absolute w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
            isHovering ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <img
          src={product.image_url[1]}
          alt={product.name}
          className={`absolute w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      
      {/* Content Container - Sticky to bottom */}
      <div className="p-3 space-y-2 flex flex-col justify-end flex-1">
        <h3 className="text-sm font-bold text-black line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
        {product.price && (
          <p className="text-sm font-semibold text-black">
            {product.price} UAH
          </p>
        )}
      </div>
    </div>
  );
}