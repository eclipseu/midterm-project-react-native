import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const CHIP_KEYS = [
  "Remote",
  "Date posted",
  "Salary",
  "Job type",
  "Experience",
] as const;

export type IndeedChipKey = (typeof CHIP_KEYS)[number];

type Props = {
  activeChip: IndeedChipKey | null;
  onPress: (chip: IndeedChipKey) => void;
};

export function IndeedFilterChips({ activeChip, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {CHIP_KEYS.map((chip) => {
          const active = chip === activeChip;

          return (
            <Pressable
              key={chip}
              accessibilityRole="button"
              accessibilityLabel={`Open ${chip} filter`}
              onPress={() => onPress(chip)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.background,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.buttonText : colors.textPrimary },
                ]}
              >
                {chip}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
