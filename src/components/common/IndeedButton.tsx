import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { createTypography } from "../../theme/typography";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IndeedButton({
  label,
  onPress,
  variant = "primary",
  fullWidth = true,
  disabled = false,
  style,
}: Props) {
  const { colors } = useTheme();
  const typography = createTypography(colors);

  const backgroundColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondary
        : "transparent";

  const borderColor = variant === "ghost" ? colors.border : backgroundColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          width: fullWidth ? "100%" : undefined,
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          typography.button,
          {
            color: variant === "ghost" ? colors.textPrimary : colors.buttonText,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
