// Loading card: same frame and text rhythm as ProductItem (square photo, name
// in 2–3 lines, price + sizes — stacked on phones, one row from sm).
const bar = "bg-[#F3F4F6]";

export default function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col border border-rule" aria-hidden="true">
      <div className="flex aspect-square items-center justify-center bg-[#F9FAFB] text-[11px] tracking-[0.15em] text-[#D1D5DB] animate-[pulse_1.2s_ease-in-out_infinite]">
        ░░░░
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-rule p-2.5 sm:gap-2 sm:px-4 sm:py-3.5">
        <div className="flex flex-col gap-[3px] sm:gap-1">
          <div className={`h-[13px] w-[90%] sm:h-[16px] ${bar}`} />
          <div className={`h-[13px] w-[75%] sm:h-[16px] sm:w-[60%] ${bar}`} />
          {/* phone names usually wrap to a 3rd line */}
          <div className={`h-[13px] w-[40%] sm:hidden ${bar}`} />
        </div>
        <div className="mt-auto flex flex-col gap-1 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div className={`h-[14px] w-[45%] sm:h-[16px] sm:w-[35%] ${bar}`} />
          <div className={`h-[10px] w-[35%] sm:w-[25%] ${bar}`} />
        </div>
      </div>
    </div>
  );
}
