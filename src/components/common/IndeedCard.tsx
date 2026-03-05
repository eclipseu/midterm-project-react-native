import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type Props = ViewProps;

export function IndeedCard({ style, ...rest }: Props) {
  const { colors } = useTheme();

  return (
    <View
      {...rest}
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});
