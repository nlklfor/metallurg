import type { ProductType } from "@/interfaces";

interface ProductItemProps {
  product: ProductType;
}

export default function ProductItem({ product }: ProductItemProps) {
  console.log("Rendering ProductItem:", product);
  return (
    <div
      className="bg-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
    >
      {/* Image Container */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-black mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm">{product.description}</p>
        {product.price && (
          <p className="text-lg font-semibold text-black mt-3">
            {product.price} UAH
          </p>
        )}
      </div>
    </div>
  );
}
