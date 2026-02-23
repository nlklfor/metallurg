import { useProductList } from "@/hooks/useProductList";
import ProductItem from "./ProductItem";
import ProductSkeleton from "./ProductSkeleton";
import { filterProducts } from "@/utils/filterUtils";
import type { FilterOptions } from "@/interfaces";
import { Link } from "react-router";

export default function ProductList({
  filters,
}: {
  filters: FilterOptions | null;
}) {
  const { products, error, isLoading } = useProductList();

  const filteredProducts = filterProducts(products, filters);

  if (isLoading)
    return (
      <div className="px-8 py-16">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <li key={idx}>
              <ProductSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );

  if (error)
    return (
      <div className="px-8 py-16 text-center text-red-600">Error: {error}</div>
    );

  return (
    <div className="px-8 py-16">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <li key={product.id}>
              <Link
                to={`/product/${product.id}`}
                className="block h-full group"
              >
                <ProductItem product={product} />
              </Link>
            </li>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No_units_found
          </p>
        )}
      </ul>
    </div>
  );
}
