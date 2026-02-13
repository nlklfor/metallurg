import type { ProductType } from "@/interfaces";
import { useState } from "react";

interface ProductItemProps {
  product: ProductType;
}

export default function ProductItem({ product }: ProductItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div
      className="overflow-hidden w-72 h-106 flex flex-col gap-10"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative w-full h-2/3 bg-gray-100 overflow-hidden">
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
      
      <div className="p-3 space-y-2 flex flex-col justify-start flex-1 bg-white">
        <h3 className="font-archivo-black text-sm text-black line-clamp-2">{product.name}</h3>
        {product.price && (
          <p className="font-ibm-mono text-sm font-semibold text-black">
            {product.price} UAH
          </p>
        )}
        
        {product.sizes && (
          <div className={`flex gap-2 flex-wrap transition-opacity duration-500 ease-in-out ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}>
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
}