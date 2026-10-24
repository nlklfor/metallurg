// Motion tokens — one curve, short durations (see docs/design-system.md §4).
// Mirrors --ease-mtl in index.css for components animated with `motion`.

export const EASE_MTL = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  /** chip select, small state changes */
  chip: 0.15,
  /** card hover: border, photo cross-fade, size strip */
  hover: 0.2,
  /** page enter: opacity 0→1, y 12→0 */
  page: 0.3,
  /** toast slide-in */
  toast: 0.3,
  /** modal panel: opacity + y 40→0 */
  modal: 0.35,
  /** list stagger per item, capped at 8 items */
  stagger: 0.1,
} as const;

/** Stagger delay for the i-th list item, capped at 8 items (max 0.8s). */
export const staggerDelay = (i: number) => Math.min(i, 8) * DURATION.stagger;
