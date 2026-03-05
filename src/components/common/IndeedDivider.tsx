import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

export function IndeedDivider() {
  const { colors } = useTheme();

  return <View style={[styles.divider, { borderColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: 1,
    marginVertical: spacing.md,
  },
});
