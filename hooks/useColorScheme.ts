import { useColorScheme as _useColorScheme } from "react-native";

/**
 * Custom hook that wraps React Native's useColorScheme
 * Provides consistent theming support for the app
 */
export function useColorScheme() {
  return _useColorScheme();
}

/**
 * Type definition for the color scheme hook return value
 */
export type ColorScheme = ReturnType<typeof useColorScheme>;

/**
 * Helper function to check if the current color scheme is dark
 */
export function useIsDarkMode() {
  const colorScheme = useColorScheme();
  return colorScheme === "dark";
}

/**
 * Helper function to check if the current color scheme is light
 */
export function useIsLightMode() {
  const colorScheme = useColorScheme();
  return colorScheme === "light";
}

/**
 * Get the opposite color scheme
 */
export function getOppositeColorScheme(colorScheme: ColorScheme): "light" | "dark" {
  return colorScheme === "light" ? "dark" : "light";
}

/**
 * Default color scheme fallback
 */
export const DEFAULT_COLOR_SCHEME: NonNullable<ColorScheme> = "light";

/**
 * Color scheme options
 */
export const COLOR_SCHEMES = ["light", "dark"] as const;
