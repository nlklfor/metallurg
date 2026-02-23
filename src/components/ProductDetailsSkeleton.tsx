export default function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-4">
        <div className="aspect-[3/4] bg-gray-900 border border-gray-800 rounded animate-pulse" />
        
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="aspect-square bg-gray-900 border border-gray-800 rounded animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="mb-8">
          <div className="h-16 bg-gray-900 rounded mb-4 animate-pulse" />
          <div className="h-8 bg-gray-900 rounded w-1/3 animate-pulse" />
        </div>

        <div className="mb-8 pb-8 border-b border-gray-800">
          <div className="space-y-3">
            <div className="h-4 bg-gray-900 rounded animate-pulse" />
            <div className="h-4 bg-gray-900 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-900 rounded w-4/6 animate-pulse" />
          </div>
        </div>

        <div className="mb-8 space-y-6">
          <div>
            <div className="h-4 bg-gray-900 rounded w-1/4 mb-3 animate-pulse" />
            <div className="h-4 bg-gray-900 rounded w-1/3 animate-pulse" />
          </div>
          <div>
            <div className="h-4 bg-gray-900 rounded w-1/4 mb-3 animate-pulse" />
            <div className="h-4 bg-gray-900 rounded w-1/5 animate-pulse" />
          </div>
        </div>

        <div className="mb-8">
          <div className="h-4 bg-gray-900 rounded w-1/4 mb-4 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="h-12 w-20 bg-gray-900 rounded border border-gray-800 animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="h-14 bg-gray-900 rounded animate-pulse" />
      </div>
    </div>
  );
}