import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDebounce } from "@/hooks/useDebounce";

interface AsyncComboboxProps<T> {
  value: T | null;
  onChange: (value: T | null) => void;
  fetchOptions: (query: string) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  getOptionKey: (option: T) => string;
  placeholder: string;
  disabled?: boolean;
  minQueryLength?: number;
}

export default function AsyncCombobox<T>({
  value,
  onChange,
  fetchOptions,
  getOptionLabel,
  getOptionKey,
  placeholder,
  disabled = false,
  minQueryLength = 2,
}: AsyncComboboxProps<T>) {
  const [query, setQuery] = useState(value ? getOptionLabel(value) : "");
  const [options, setOptions] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [panelRect, setPanelRect] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setQuery(value ? getOptionLabel(value) : "");
    // getOptionLabel is typically an inline function from the caller; only
    // resync the text when the selected value itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!isOpen || debouncedQuery.trim().length < minQueryLength) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchOptions(debouncedQuery.trim())
      .then((results) => {
        if (!cancelled) setOptions(results);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, isOpen, minQueryLength]);

  // Dropdown is portaled to document.body (so it can't be clipped by a
  // scrollable ancestor like the checkout modal's body) and positioned via
  // the input's actual screen coordinates instead of CSS absolute/relative.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const updateRect = () => {
      const el = inputRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPanelRect({ top: rect.bottom, left: rect.left, width: rect.width });
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(e.target as HTMLElement).closest?.("[data-combobox-panel]")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const selectOption = (option: T) => {
    onChange(option);
    setQuery(getOptionLabel(option));
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (value) onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) selectOption(options[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showPanel =
    isOpen && (isLoading || options.length > 0 || query.trim().length >= minQueryLength);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        className="w-full font-ibm-mono border border-black px-4 py-3 text-sm bg-white placeholder-gray-300 focus:outline-none focus:border-black disabled:opacity-50 uppercase tracking-wider"
      />
      {showPanel &&
        panelRect &&
        createPortal(
          <div
            data-combobox-panel
            role="listbox"
            style={{
              position: "fixed",
              top: panelRect.top,
              left: panelRect.left,
              width: panelRect.width,
              zIndex: 9999,
            }}
            className="mt-1 max-h-56 overflow-y-auto border border-black bg-white shadow-lg"
          >
            {isLoading && (
              <p className="px-4 py-3 text-[10px] font-ibm-mono uppercase tracking-[0.2em] text-gray-400 animate-pulse">
                // searching...
              </p>
            )}
            {!isLoading && options.length === 0 && (
              <p className="px-4 py-3 text-[10px] font-ibm-mono uppercase tracking-[0.2em] text-gray-400">
                // no_results_found
              </p>
            )}
            {!isLoading &&
              options.map((option, i) => (
                <button
                  key={getOptionKey(option)}
                  type="button"
                  role="option"
                  aria-selected={i === highlightedIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={`w-full text-left px-4 py-3 text-xs font-ibm-mono uppercase tracking-wider transition-colors ${
                    i === highlightedIndex ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {getOptionLabel(option)}
                </button>
              ))}
          </div>,
          document.body
        )}
    </div>
  );
}
