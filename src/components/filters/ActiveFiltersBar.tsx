import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFilters } from "../../context/FilterContext";
import { useTheme } from "../../context/ThemeContext";

type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export function ActiveFiltersBar() {
  const { colors } = useTheme();
  const {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    activeFilterCount,
  } = useFilters();

  const chips = useMemo<ActiveFilterChip[]>(() => {
    const items: ActiveFilterChip[] = [];

    if (filters.mainCategory) {
      items.push({
        key: "mainCategory",
        label: `Category: ${filters.mainCategory}`,
        onRemove: () => clearFilter("mainCategory"),
      });
    }

    if (filters.workModel) {
      items.push({
        key: "workModel",
        label: `Work model: ${filters.workModel}`,
        onRemove: () => clearFilter("workModel"),
      });
    }

    if (filters.seniorityLevel) {
      items.push({
        key: "seniorityLevel",
        label: `Seniority: ${filters.seniorityLevel}`,
        onRemove: () => clearFilter("seniorityLevel"),
      });
    }

    if (filters.jobType) {
      items.push({
        key: "jobType",
        label: `Job type: ${filters.jobType}`,
        onRemove: () => clearFilter("jobType"),
      });
    }

    if (filters.hasSalaryOnly) {
      items.push({
        key: "hasSalaryOnly",
        label: "Salary only",
        onRemove: () => clearFilter("hasSalaryOnly"),
      });
    }

    filters.locations.forEach((location) => {
      items.push({
        key: `location-${location}`,
        label: `Location: ${location}`,
        onRemove: () =>
          setFilter(
            "locations",
            filters.locations.filter(
              (selectedLocation) =>
                selectedLocation.toLowerCase() !== location.toLowerCase(),
            ),
          ),
      });
    });

    return items;
  }, [clearFilter, filters, setFilter]);

  if (chips.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {chips.map((chip) => (
          <Pressable
            key={chip.key}
            onPress={chip.onRemove}
            style={[
              styles.chip,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.chipText, { color: colors.text }]}>
              {chip.label}
            </Text>
            <Text style={[styles.chipClose, { color: colors.placeholder }]}>
              ✕
            </Text>
          </Pressable>
        ))}

        {activeFilterCount > 1 ? (
          <Pressable
            onPress={clearAllFilters}
            style={[styles.clearAllChip, { borderColor: colors.buttonPrimary }]}
          >
            <Text
              style={[styles.clearAllChipText, { color: colors.buttonPrimary }]}
            >
              Clear all
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  contentContainer: {
    paddingRight: 4,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipClose: {
    fontSize: 12,
    fontWeight: "700",
  },
  clearAllChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    justifyContent: "center",
  },
  clearAllChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
