// Loading card, same frame as ProductItem (InventoryStates: "░ pulse 1.2s").
export default function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col border border-rule" aria-hidden="true">
      <div className="flex aspect-square items-center justify-center bg-[#F3F4F6] text-[11px] tracking-[0.15em] text-[#D1D5DB] animate-[pulse_1.2s_ease-in-out_infinite]">
        ░░░░
      </div>
      <div className="flex flex-col gap-2 p-2.5 sm:px-4 sm:py-3.5">
        <div className="h-3 w-[85%] bg-[#F3F4F6]" />
        <div className="h-3 w-[55%] bg-[#F3F4F6]" />
        <div className="h-2.5 w-[35%] bg-[#F3F4F6]" />
      </div>
    </div>
  );
}
