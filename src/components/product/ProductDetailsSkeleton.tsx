// Object page while loading: mirrors ProductDetails — breadcrumbs, centred
// 2-column grid (max-w-7xl), gallery with the slider's indicator strip and
// heights, then the panel sections in the same order and sizes.
const block = "bg-[#111827] animate-[pulse_1.2s_ease-in-out_infinite]";
const section = "flex flex-col gap-3 border-b border-rule-dark py-6 lg:border-0 lg:py-0";

export default function ProductDetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading object">
      {/* Breadcrumbs */}
      <div className="px-4 py-3 sm:px-8 sm:py-5 md:px-12">
        <div className={`h-[14px] w-56 ${block}`} />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 px-4 pb-16 sm:px-8 md:px-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery: indicator strip + photo, same heights as ProductImageSlider */}
        <div className="flex h-[300px] gap-3 sm:h-[420px] lg:sticky lg:top-[88px] lg:h-[600px] lg:self-start xl:h-[700px]">
          <div className="flex flex-col justify-center gap-2 py-2">
            <span className="h-8 w-[2px] bg-[#374151]" />
            <span className="h-3 w-[2px] bg-[#1F2937]" />
            <span className="h-3 w-[2px] bg-[#1F2937]" />
          </div>
          <div className={`flex-1 ${block}`} />
        </div>

        <div className="flex flex-col lg:gap-6">
          {/* Title + price + status */}
          <div className={section + " lg:gap-6"}>
            <div className="flex justify-end">
              <div className={`h-3 w-16 ${block}`} />
            </div>
            <div className="flex flex-col gap-2">
              <div className={`h-[40px] w-[85%] lg:h-[58px] ${block}`} />
              <div className={`h-[40px] w-[45%] lg:h-[58px] ${block}`} />
            </div>
            <div className="flex items-baseline gap-3">
              <div className={`h-[26px] w-36 lg:h-[32px] lg:w-44 ${block}`} />
              <div className={`h-3 w-28 ${block}`} />
            </div>
            <div className="mt-1 h-[62px] border border-rule-dark lg:mt-0 lg:h-[48px]" />
          </div>

          {/* Size */}
          <div className={section}>
            <div className="flex h-8 items-center justify-between">
              <div className={`h-3 w-32 ${block}`} />
              <div className={`h-3 w-20 ${block}`} />
            </div>
            <div className="grid grid-cols-4 gap-2 lg:flex">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 border border-[#374151] lg:w-[72px]" />
              ))}
            </div>
            <div className="mt-1 flex h-11 items-center border-t border-rule-dark lg:mt-0 lg:h-auto lg:border-0 lg:pt-1">
              <div className={`h-3 w-52 ${block}`} />
            </div>
          </div>

          {/* Quantity */}
          <div className={section + " lg:flex-row lg:items-center lg:gap-5"}>
            <div className={`h-3 w-20 ${block}`} />
            <div className="h-12 w-[148px] border border-[#374151]" />
          </div>

          {/* CTA (desktop; phones use the bottom bar) */}
          <div className="hidden h-[60px] border border-[#374151] lg:block" />

          {/* Description */}
          <div className="flex flex-col gap-2.5 py-6 lg:border-t lg:border-rule-dark lg:pt-6">
            <div className={`h-3 w-full ${block}`} />
            <div className={`h-3 w-[92%] ${block}`} />
            <div className={`h-3 w-[70%] ${block}`} />
            <div className="mt-3 grid grid-cols-2 border-l border-t border-rule-dark lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[62px] border-b border-r border-rule-dark" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
