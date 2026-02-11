import { useProductList } from "@/hooks/useProductList";
import ProductItem from "./ProductItem";
import ProductSkeleton from "./ProductSkeleton";

export default function ProductList() {
  const { products, error, isLoading } = useProductList();

  if (isLoading) return (
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
  
  if (error) return <div className="px-8 py-16 text-center text-red-600">Error: {error}</div>;
    
  return (
    <div className="px-8 py-16">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductItem product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
