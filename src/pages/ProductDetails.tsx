import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductDetailsSkeleton from "@/components/product/ProductDetailsSkeleton";
import ProductImageSlider from "@/components/product/ProductImageSlider";
import RelatedProductsSlider from "@/components/product/RelatedProductsSlider";
import SizeGuideModal from "@/components/product/SizeGuideModal";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useActionToast } from "@/hooks/useActionToast";
import { getProducts } from "@/api/products";
import { useCartStore } from "@/stores/useCartStore";
import {
  CURRENCIES,
  convertPrice,
  formatPrice,
  useCurrencyStore,
  type CurrencyCode,
} from "@/stores/useCurrencyStore";
import { compareSizes } from "@/utils/filterUtils";
import { getMaxQuantity } from "@/utils/stock";
import { cn } from "@/lib/utils";
import Seo from "@/components/seo/Seo";
import { breadcrumbJsonLd, productJsonLd, productMeta } from "@/lib/seo";
import type { ProductType } from "@/interfaces";

// Object page (design file: Object-D / Object-M / ObjectStates).
// Dark "object" theme. Desktop: gallery left, 520px panel right.
// Mobile: swipe gallery, stacked sections, fixed purchase bar at the bottom.

const ONE_SIZE = "ONE_SIZE";
const sp = "text-[10px] tracking-[0.15em] text-dim-dark";

const STATUS: Record<ProductType["stock_status"], { label: string; dot: string; eta: string }> = {
  in_stock: { label: "IN_STOCK", dot: "bg-status-ok", eta: "READY_TO_SHIP // NOVA_POSHTA" },
  pre_order: { label: "PRE_ORDER", dot: "bg-status-info", eta: "ETA: 10–14 DAYS" },
  out_of_stock: { label: "OUT_OF_STOCK", dot: "bg-status-error", eta: "ARCHIVED" },
};

/** "≈ 141 CHF · 151 EUR" — the price in the two currencies not selected. */
function approxPrices(price: number, current: CurrencyCode): string {
  return (Object.keys(CURRENCIES) as CurrencyCode[])
    .filter((c) => c !== current)
    .map((c) => `${Math.round(convertPrice(price, c)).toLocaleString("en-US")} ${c}`)
    .join(" · ");
}

function useRelated(product: ProductType | null) {
  const [related, setRelated] = useState<ProductType[]>([]);
  useEffect(() => {
    if (!product) return;
    let alive = true;
    getProducts()
      .then((data) => {
        if (!alive) return;
        const others = (data ?? []).filter(
          (p: ProductType) => p.id !== product.id && p.stock_status !== "out_of_stock"
        );
        // Same category first, then the rest; shuffled inside each group.
        const shuffle = (list: ProductType[]) => [...list].sort(() => Math.random() - 0.5);
        const same = shuffle(others.filter((p: ProductType) => p.category === product.category));
        const rest = shuffle(others.filter((p: ProductType) => p.category !== product.category));
        setRelated([...same, ...rest].slice(0, 8));
      })
      .catch(() => alive && setRelated([]));
    return () => {
      alive = false;
    };
  }, [product]);
  return related;
}

export default function ProductDetails() {
  const { slug } = useParams();
  return <ProductDetailsContent key={slug} slug={slug ?? ""} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-ink font-mono text-paper">
      <Navbar variant="dark" />
      {children}
      <Footer />
    </div>
  );
}

function NotFound({ error }: { error?: string | null }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p aria-hidden="true" className="text-[12px] tracking-[0.15em] text-[#4B5563]">
        ░░░░░░░░░░
      </p>
      <h1 className="display text-[40px] lg:text-[64px]">Object_not_found</h1>
      <p className="max-w-[340px] text-[12px] leading-relaxed text-dim-dark">
        {error ?? "This object is not in the archive, or its link has changed."}
      </p>
      <Link
        to="/inventory"
        className="mt-2 flex h-[52px] w-full max-w-[326px] items-center justify-center bg-paper text-[12px] font-bold tracking-[0.15em] !text-ink"
      >
        BACK_TO_INVENTORY →
      </Link>
    </div>
  );
}

function ProductDetailsContent({ slug }: { slug: string }) {
  const { product, isLoading, error } = useProductDetails(slug || undefined);
  const currency = useCurrencyStore((s) => s.currency);
  const items = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addToCart);
  const { showSuccess, showToast } = useActionToast();

  const [pickedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  const related = useRelated(product);

  // Sizes this object came in, with units per size (null = no stock map).
  const sizes = useMemo(() => {
    if (!product) return [];
    const map = product.size_stock ?? {};
    const keys = Object.keys(map).length > 0 ? Object.keys(map) : (product.sizes ?? []).map(String);
    return [...keys].sort(compareSizes).map((s) => ({
      size: s,
      stock: Object.keys(map).length > 0 ? (map[s] ?? 0) : null,
    }));
  }, [product]);

  const isArchived = product?.stock_status === "out_of_stock";
  const hasSizes = sizes.length > 0;

  // Preselect when only one size is buyable (or the object has no sizes).
  const defaultSize = useMemo(() => {
    if (!product || isArchived) return null;
    if (!hasSizes) return ONE_SIZE;
    const buyable = sizes.filter((s) => s.stock === null || s.stock > 0);
    return buyable.length === 1 ? buyable[0].size : null;
  }, [product, isArchived, hasSizes, sizes]);
  const selectedSize = pickedSize ?? defaultSize;

  if (isLoading)
    return (
      <Shell>
        <div className="flex-1">
          <ProductDetailsSkeleton />
        </div>
      </Shell>
    );

  if (error || !product)
    return (
      <Shell>
        <Seo
          title="Object not found — METALLURG™"
          description="This object is not in the archive."
          index={false}
        />
        <NotFound error={error} />
      </Shell>
    );

  const status = STATUS[product.stock_status];
  const maxQty = selectedSize ? getMaxQuantity(product, selectedSize) : 0;
  const ready = !!selectedSize && maxQty > 0 && !isArchived;
  const inLoadout =
    !!selectedSize && items.some((i) => i.id === product.id && i.selectedSize === selectedSize);
  const loadoutCount = items.reduce((n, i) => n + (i.cart_quantity ?? 1), 0);
  const total = product.price * qty;
  const objectNo = product.sku ? product.sku.replace(/\D/g, "").slice(-3) : "";

  const pickSize = (s: string, stock: number | null) => {
    if (stock === 0) return;
    setSelectedSize(s);
    setQty((q) => Math.max(1, Math.min(q, stock ?? product.quantity ?? 1)));
    setJustAdded(false);
  };

  const acquire = () => {
    if (!ready || !selectedSize) return;
    if (inLoadout) return;
    addToCart(product, selectedSize, Math.min(qty, maxQty));
    setJustAdded(true);
    showSuccess({ product, selectedSize, message: "product_added_to_loadout" });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${product.name} — METALLURG™`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("success", { message: "LINK_COPIED" }, 2500);
    } catch {
      /* share sheet dismissed */
    }
  };

  const stockLine = (() => {
    if (!hasSizes || !selectedSize) return null;
    const n = getMaxQuantity(product, selectedSize);
    return n <= 2 ? `LAST_${n}` : null;
  })();

  // ─── Purchase CTA (desktop inline + mobile bar share the same states) ───
  const cta = (mobile: boolean) => {
    const base = cn(
      "flex items-center font-bold transition-colors duration-200",
      mobile
        ? "h-14 flex-1 justify-center text-[12px] tracking-[0.08em]"
        : "h-[60px] w-full justify-between px-[22px] text-[13px] tracking-[0.15em]"
    );
    if (isArchived)
      return (
        <Link
          to="/contact"
          className={cn(
            base,
            "bg-paper !text-ink hover:bg-[#E5E7EB]",
            mobile && "tracking-[0.15em]"
          )}
        >
          <span>REQUEST_SIMILAR_OBJECT →</span>
        </Link>
      );
    if (justAdded || inLoadout)
      return (
        <div className={cn("flex gap-2", mobile ? "flex-1" : "w-full")}>
          {justAdded && (
            <button
              type="button"
              onClick={() => setJustAdded(false)}
              className={cn(
                "border border-paper px-4 text-[11px] tracking-[0.12em] transition-colors hover:bg-[#111827]",
                mobile ? "h-14" : "h-[60px]"
              )}
            >
              CONTINUE
            </button>
          )}
          <Link
            to="/loadout"
            className={cn(base, "flex-1 justify-center bg-paper !text-ink hover:bg-[#E5E7EB]")}
          >
            OPEN_LOADOUT [{loadoutCount}] →
          </Link>
        </div>
      );
    if (!ready)
      return (
        <button
          type="button"
          disabled
          className={cn(
            base,
            "cursor-not-allowed border border-paper text-paper",
            mobile ? "tracking-[0.15em]" : "justify-center"
          )}
        >
          SELECT_SIZE
        </button>
      );
    return (
      <button
        type="button"
        onClick={acquire}
        className={cn(base, "group bg-paper text-ink hover:bg-[#E5E7EB]")}
      >
        <span className="flex items-center gap-2">
          ADD_TO_LOADOUT
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
        {!mobile && <span className="tabular-nums">{formatPrice(total, currency)}</span>}
      </button>
    );
  };

  const specs: [string, string | undefined][] = [
    ["// material", product.materials],
    ["// weight KG", product.weight ? String(product.weight) : undefined],
    ["// condition", product.condition],
    ["// box", product.box],
  ];

  return (
    <Shell>
      <Seo
        {...productMeta(product)}
        path={`/product/${product.slug}`}
        type="product"
        jsonLd={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Inventory", path: "/inventory" },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
        ]}
      />
      <div className="px-4 py-3 sm:px-8 sm:py-5 md:px-12">
        <Breadcrumbs
          variant="dark"
          items={[
            { label: "Home", href: "/" },
            { label: "Inventory", href: "/inventory" },
            { label: product.name.replace(/\s+/g, "_") },
          ]}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 px-4 sm:px-8 md:px-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery stays in view while the panel scrolls (desktop). */}
        <div className="lg:sticky lg:top-[88px] lg:self-start">
          <ProductImageSlider
            images={product.image_url ?? []}
            productName={product.name}
            isOutOfStock={isArchived}
          />
        </div>

        {/* ─── Panel ─── */}
        <div className="flex flex-col lg:gap-6">
          {/* Title + price + status */}
          <section className="flex flex-col gap-3 border-b border-rule-dark py-6 lg:gap-6 lg:border-0 lg:py-0">
            <div className={cn("flex justify-between", sp)}>
              <span>{isArchived ? "ARCHIVED" : ""}</span>
              {objectNo && <span>SKU_{objectNo}</span>}
            </div>
            <h1
              className={cn("display text-[44px] lg:text-[64px]", isArchived && "text-[#D1D5DB]")}
            >
              {product.name}
            </h1>
            <div className="flex flex-wrap items-baseline gap-3 lg:gap-3.5">
              <span
                className={cn(
                  "text-[24px] font-bold tabular-nums lg:text-[30px]",
                  isArchived && "text-[18px] font-normal text-dim line-through lg:text-[24px]"
                )}
              >
                {formatPrice(product.price, currency)}
              </span>
              {!isArchived && (
                <span className="text-[11px] text-dim-dark lg:text-[12px]">
                  ≈ {approxPrices(product.price, currency)}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-col gap-1.5 border border-rule-dark p-3 lg:mt-0 lg:flex-row lg:items-center lg:justify-between lg:px-4 lg:py-3.5">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.15em] lg:gap-2.5 lg:text-[12px]">
                <span aria-hidden="true" className={cn("h-2 w-2", status.dot)} />
                {status.label}
              </div>
              {!isArchived && (
                <div className="text-[11px] tracking-[0.08em] text-[#D1D5DB]">{status.eta}</div>
              )}
            </div>
            {isArchived && (
              <div className="flex flex-col gap-3 pt-1">
                <p className="text-[12px] leading-relaxed text-dim-dark">
                  Passed through the archive. Kept on record.
                </p>
              </div>
            )}
          </section>

          {/* Size */}
          {!isArchived && hasSizes && (
            <section className="flex flex-col gap-3 border-b border-rule-dark py-6 lg:border-0 lg:py-0">
              <div className="flex items-center justify-between">
                <span className={sp}>
                  // select_size{product.category === "footwear" ? " — EU" : ""}
                </span>
                {product.category !== "accessories" && (
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="flex h-8 items-center text-[10px] tracking-[0.15em] underline underline-offset-4 hover:text-dim-dark"
                  >
                    SIZE_GUIDE
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 lg:flex lg:flex-wrap lg:items-center">
                {sizes.map(({ size, stock }) => {
                  const sel = selectedSize === size;
                  const soldOut = stock === 0;
                  const low = stock !== null && stock > 0 && stock <= 2 && !sel;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => pickSize(size, stock)}
                      disabled={soldOut}
                      aria-pressed={sel}
                      aria-label={`Size ${size}${soldOut ? ", sold out" : stock !== null ? `, ${stock} left` : ""}`}
                      className={cn(
                        "relative h-12 border text-[14px] transition-colors duration-150 lg:w-[72px]",
                        sel
                          ? "border-paper bg-paper text-ink"
                          : soldOut
                            ? "cursor-not-allowed border-rule-dark text-[#4B5563] line-through"
                            : "border-[#374151] hover:border-paper"
                      )}
                    >
                      {size}
                      {low && (
                        <span
                          aria-hidden="true"
                          className="absolute right-[5px] top-[5px] h-[5px] w-[5px] bg-status-low"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <Link
                to="/contact"
                className="mt-1 flex h-11 items-center gap-2 border-t border-rule-dark text-[11px] tracking-[0.12em] lg:mt-0 lg:h-auto lg:border-0 lg:pt-1"
              >
                <span className="text-dim-dark">NEED ANOTHER SIZE?</span>
                <span className="underline underline-offset-4">→ REQUEST_OBJECT</span>
              </Link>
            </section>
          )}

          {/* Quantity */}
          {!isArchived && (
            <section className="flex flex-col gap-3 border-b border-rule-dark py-6 lg:flex-row lg:items-center lg:gap-5 lg:border-0 lg:py-0">
              <span className={sp}>// quantity</span>
              <div className="flex items-center gap-4 lg:gap-5">
                <div className="flex h-12 border border-paper">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-12 text-[18px] disabled:text-[#4B5563]"
                  >
                    −
                  </button>
                  <span className="flex w-[52px] items-center justify-center border-x border-paper text-[15px] tabular-nums">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={!ready || qty >= maxQty}
                    className="w-12 text-[18px] disabled:text-[#4B5563]"
                  >
                    +
                  </button>
                </div>
                {stockLine && (
                  <span className="text-[11px] tracking-[0.12em] text-status-low">{stockLine}</span>
                )}
              </div>
            </section>
          )}

          {/* Desktop CTA */}
          <div className="hidden lg:block">{cta(false)}</div>

          {/* Description (collapsed) + specs — after the buying controls */}
          <section className="flex flex-col gap-3 py-6 lg:gap-2.5 lg:border-t lg:border-rule-dark lg:pt-6">
            {product.description && (
              <>
                <p
                  className={cn(
                    "whitespace-pre-line text-[13px] leading-[1.7] text-[#D1D5DB]",
                    !descOpen && "line-clamp-3"
                  )}
                >
                  {product.description}
                </p>
                {product.description.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setDescOpen((v) => !v)}
                    aria-expanded={descOpen}
                    className="self-start py-1 text-[10px] tracking-[0.15em] underline underline-offset-4 hover:text-dim-dark"
                  >
                    {descOpen ? "READ_LESS −" : "READ_MORE +"}
                  </button>
                )}
              </>
            )}
            <dl className="mt-2 grid grid-cols-2 border-l border-t border-rule-dark lg:grid-cols-4">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 border-b border-r border-rule-dark p-3"
                >
                  <dt className={sp}>{label}</dt>
                  <dd className="text-[12px] lg:text-[11px]">{value?.trim() || "[ — ]"}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={share}
              className="flex h-11 items-center self-start text-[10px] tracking-[0.15em] text-dim-dark hover:text-paper"
            >
              ◎ SHARE_OBJECT
            </button>
          </section>
        </div>
      </div>

      {/* Recommended */}
      {related.length > 0 && (
        <section className="pb-12 pl-4 pt-7 sm:px-8 md:px-12 lg:pb-20 lg:pt-20">
          <div className="mx-auto max-w-7xl">
            <RelatedProductsSlider products={related} variant="dark" />
          </div>
        </section>
      )}

      {/* Mobile purchase bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#374151] bg-ink px-4 pt-3 lg:hidden"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        {!justAdded && !inLoadout && (
          <div className="flex min-w-[96px] flex-col gap-0.5">
            <span className="text-[10px] tracking-[0.15em] text-dim-dark">
              {isArchived
                ? "ARCHIVED"
                : ready && selectedSize !== ONE_SIZE
                  ? `${product.category === "footwear" ? "EU " : ""}${selectedSize} · ${qty} ×`
                  : product.stock_status === "pre_order"
                    ? "PRE_ORDER · ETA 10–14D"
                    : "IN_STOCK"}
            </span>
            <span
              className={cn(
                "text-[15px] font-bold tabular-nums",
                isArchived && "text-dim line-through"
              )}
            >
              {formatPrice(total, currency)}
            </span>
          </div>
        )}
        {cta(true)}
      </div>

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </Shell>
  );
}
