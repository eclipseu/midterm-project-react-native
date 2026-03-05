import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFilters } from "../../context/FilterContext";
import { useTheme } from "../../context/ThemeContext";
import type { Job } from "../../types/job";
import { FilterSheet } from "./FilterSheet";

type FilterableJob = Job & {
  mainCategory?: string;
  category?: string;
  workModel?: string;
  seniorityLevel?: string;
  jobType?: string;
  location?: string;
  locations?: string[];
};

type FilterButtonProps = {
  jobs: FilterableJob[];
  resultCount: number;
};

export function FilterButton({ jobs, resultCount }: FilterButtonProps) {
  const { colors } = useTheme();
  const { activeFilterCount } = useFilters();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.button,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.buttonLabel, { color: colors.text }]}>
          Filters
        </Text>
        {activeFilterCount > 0 ? (
          <View
            style={[styles.badge, { backgroundColor: colors.buttonPrimary }]}
          >
            <Text style={[styles.badgeText, { color: colors.buttonText }]}>
              {activeFilterCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <FilterSheet
        visible={open}
        jobs={jobs}
        resultCount={resultCount}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
