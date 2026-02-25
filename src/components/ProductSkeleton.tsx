export default function ProductSkeleton() {
  return (
    <div className="bg-gray-200 rounded-sm overflow-hidden w-72 h-106 flex flex-col">
      <div className="relative w-full h-1/2 bg-gray-200 animate-pulse mt-6" />
      
      <div className="p-3 space-y-2 flex flex-col justify-end flex-1">
        <div className="h-4 bg-gray-300 rounded-sm animate-pulse w-3/4" />
        
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 rounded-sm animate-pulse" />
          <div className="h-3 bg-gray-300 rounded-sm animate-pulse w-5/6" />
        </div>
        
        <div className="h-4 bg-gray-300 rounded-sm animate-pulse w-1/3" />
      </div>
    </div>
  );
}