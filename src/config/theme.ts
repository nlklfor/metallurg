export const THEME_COLORS = {
  light: {
    bg: "bg-white",
    text: "text-black",
    border: "border-gray-200",
    hover: "hover:text-gray-600",
    logoEncrypted: "text-gray-400",
    textSecondary: "text-gray-500",
  },
  dark: {
    bg: "bg-black",
    text: "text-white",
    textSecondary: "text-gray-500",
    border: "border-gray-800",
    hover: "hover:text-gray-400",
    logoEncrypted: "text-gray-600",
  },
};

export type ThemeVariant = keyof typeof THEME_COLORS;

export function getThemeColors(variant: ThemeVariant) {
  return THEME_COLORS[variant];
}
