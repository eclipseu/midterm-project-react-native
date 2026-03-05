import type { TextStyle } from "react-native";
import type { ThemeColors } from "./colors";

export type TypographyTokens = {
  heading: TextStyle;
  subheading: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  button: TextStyle;
};

export function createTypography(colors: ThemeColors): TypographyTokens {
  return {
    heading: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    subheading: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    body: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.textPrimary,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400",
      color: colors.textSecondary,
    },
    button: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.buttonText,
    },
  };
}
