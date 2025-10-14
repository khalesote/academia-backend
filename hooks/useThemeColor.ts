import { useColorScheme } from "./useColorScheme";

/**
 * Color configuration for light and dark themes
 */
const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
    border: "#E5E5E5",
    card: "#fff",
    notification: "#ff453a",
    primary: "#0a7ea4",
    success: "#34c759",
    warning: "#ff9500",
    error: "#ff3b30",
  },
  dark: {
    text: "#ECEDEE",
    background: "#0f1419",
    tint: "#fff",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#fff",
    border: "#383838",
    card: "#1c2128",
    notification: "#ff453a",
    primary: "#0a7ea4",
    success: "#32d74b",
    warning: "#ff9f0a",
    error: "#ff453a",
  },
};

/**
 * Hook to get themed colors based on current color scheme
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  const theme = useColorScheme() ?? "light";

  // If custom light/dark colors are provided, use them
  if (props.light || props.dark) {
    const colorFromProps = props[theme];
    if (colorFromProps) {
      return colorFromProps;
    }
  }

  // Otherwise, use the theme color from our Colors object
  return Colors[theme][colorName];
}

/**
 * Export the Colors object for direct access
 */
export { Colors };

/**
 * Helper function to get a specific theme color
 */
export function getThemeColor(
  colorName: keyof typeof Colors.light,
  theme: "light" | "dark" = "light"
): string {
  return Colors[theme][colorName];
}

/**
 * Hook to get multiple theme colors at once
 */
export function useThemeColors() {
  const theme = useColorScheme() ?? "light";
  return Colors[theme];
}

/**
 * Type definitions for theme colors
 */
export type ThemeColors = typeof Colors.light;
export type ColorName = keyof ThemeColors;
