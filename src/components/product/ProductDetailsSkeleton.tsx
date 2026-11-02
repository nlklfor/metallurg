// Object page while loading: same frame as the real page, dark pulse blocks.
const block = "bg-[#111827] animate-[pulse_1.2s_ease-in-out_infinite]";

export default function ProductDetailsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 px-4 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14"
      aria-busy="true"
      aria-label="Loading object"
    >
      <div className="flex flex-col gap-3">
        <div className={`h-[400px] lg:h-[min(720px,70vh)] ${block}`} />
        <div className="hidden grid-cols-5 gap-2 lg:grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-24 ${block}`} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <p className="text-[11px] tracking-[0.1em] text-dim-dark">
          // FETCHING_OBJECT<span className="animate-blink-cursor text-paper">█</span>
        </p>
        <div className={`h-16 w-4/5 ${block}`} />
        <div className={`h-8 w-1/3 ${block}`} />
        <div className={`h-14 ${block}`} />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`h-12 w-[72px] ${block}`} />
          ))}
        </div>
        <div className={`h-[60px] ${block}`} />
      </div>
    </div>
  );
}
