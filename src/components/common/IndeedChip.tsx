import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function IndeedChip({ label, selected = false, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : colors.background,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? colors.buttonText : colors.textPrimary,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
});
