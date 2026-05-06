import type { BreadcrumbsProps } from "@/interfaces/breadcrumbs";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items, variant = "light" }: BreadcrumbsProps) {
  const isDark = variant === "dark";
  const separatorColor = isDark ? "text-gray-600" : "text-gray-300";
  const linkColor = isDark
    ? "!text-gray-500 hover:!text-white"
    : "!text-gray-400 hover:!text-black";
  const activeColor = isDark ? "text-white" : "text-black";

  return (
    <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-ibm-mono">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className={separatorColor}>/</span>}
            {isLast || !item.href ? (
              <span className={`${isLast ? activeColor : linkColor} truncate max-w-[200px]`}>
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className={`${linkColor} transition-colors`}>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
