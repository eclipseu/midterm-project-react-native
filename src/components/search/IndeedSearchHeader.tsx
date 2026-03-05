import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { IndeedInput } from "../common/IndeedInput";

type Props = {
  whatValue: string;
  whereValue: string;
  onWhatChange: (value: string) => void;
  onWhereChange: (value: string) => void;
  onSearch: () => void;
};

export function IndeedSearchHeader({
  whatValue,
  whereValue,
  onWhatChange,
  onWhereChange,
  onSearch,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>What</Text>
      <View style={styles.inputRow}>
        <IndeedInput
          value={whatValue}
          onChangeText={onWhatChange}
          placeholder="Job title, keyword, or company"
          iconName="search"
          flex={1}
          onSubmitEditing={onSearch}
        />
        {whatValue.trim().length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear what input"
            onPress={() => onWhatChange("")}
            style={[styles.clearButton, { borderColor: colors.border }]}
          >
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Where</Text>
      <View style={styles.row}>
        <View style={styles.whereWrap}>
          <IndeedInput
            value={whereValue}
            onChangeText={onWhereChange}
            placeholder="City, state, or remote"
            iconName="location-outline"
            flex={1}
            onSubmitEditing={onSearch}
          />
        </View>

        {whereValue.trim().length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear where input"
            onPress={() => onWhereChange("")}
            style={[styles.clearButton, { borderColor: colors.border }]}
          >
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search jobs"
          onPress={onSearch}
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="search" size={18} color={colors.buttonText} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  whereWrap: {
    flex: 1,
  },
  clearButton: {
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
