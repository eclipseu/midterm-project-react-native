import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFilters } from "../../context/FilterContext";
import { useTheme } from "../../context/ThemeContext";
import type { Job } from "../../types/job";
import { getUniqueValues } from "../../utils/jobHelpers";

type FilterableJob = Job & {
  mainCategory?: string;
  category?: string;
  workModel?: string;
  seniorityLevel?: string;
  jobType?: string;
  location?: string;
  locations?: string[];
};

type FilterSheetProps = {
  visible: boolean;
  jobs: FilterableJob[];
  resultCount: number;
  onClose: () => void;
  onApply?: () => void;
};

type DropdownSelectProps = {
  label: string;
  selectedValue: string | null;
  options: string[];
  onSelect: (value: string | null) => void;
  placeholder: string;
};

function normalizeWorkModel(
  value: string | null,
): "Remote" | "Hybrid" | "On site" | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "remote") {
    return "Remote";
  }
  if (normalized === "hybrid") {
    return "Hybrid";
  }
  if (
    normalized === "on site" ||
    normalized === "onsite" ||
    normalized === "on-site"
  ) {
    return "On site";
  }

  return null;
}

function DropdownSelect({
  label,
  selectedValue,
  options,
  onSelect,
  placeholder,
}: DropdownSelectProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>{label}</Text>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={[
          styles.selectButton,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.selectButtonText,
            { color: selectedValue ? colors.text : colors.placeholder },
          ]}
        >
          {selectedValue ?? placeholder}
        </Text>
      </Pressable>

      {expanded ? (
        <View
          style={[
            styles.dropdownList,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Pressable
            onPress={() => {
              onSelect(null);
              setExpanded(false);
            }}
            style={styles.dropdownItem}
          >
            <Text
              style={[styles.dropdownItemText, { color: colors.placeholder }]}
            >
              {placeholder}
            </Text>
          </Pressable>
          {options.map((option) => (
            <Pressable
              key={`${label}-${option}`}
              onPress={() => {
                onSelect(option);
                setExpanded(false);
              }}
              style={styles.dropdownItem}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function FilterSheet({
  visible,
  jobs,
  resultCount,
  onClose,
  onApply,
}: FilterSheetProps) {
  const { colors } = useTheme();
  const { filters, setFilter, clearAllFilters } = useFilters();
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [debouncedLocationSearch, setDebouncedLocationSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedLocationSearch(locationSearchInput);
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [locationSearchInput]);

  const categoryOptions = useMemo(() => {
    const mainCategories = jobs
      .map((job) => job.mainCategory ?? job.category)
      .filter((value): value is string => typeof value === "string");

    return Array.from(
      new Set(mainCategories.map((value) => value.trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const seniorityOptions = useMemo(
    () => getUniqueValues(jobs, "seniorityLevel"),
    [jobs],
  );

  const jobTypeOptions = useMemo(
    () => getUniqueValues(jobs, "jobType"),
    [jobs],
  );

  const locationOptions = useMemo(() => {
    const fromSingle = getUniqueValues(jobs, "location");
    const fromMultiple = jobs.flatMap((job) =>
      Array.isArray(job.locations)
        ? job.locations.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    );

    return Array.from(
      new Set(
        [...fromSingle, ...fromMultiple]
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const filteredLocationOptions = useMemo(() => {
    const query = debouncedLocationSearch.trim().toLowerCase();
    if (!query) {
      return locationOptions;
    }

    return locationOptions.filter((location) =>
      location.toLowerCase().includes(query),
    );
  }, [debouncedLocationSearch, locationOptions]);

  const workModelOptions: Array<"Remote" | "Hybrid" | "On site"> = [
    "Remote",
    "Hybrid",
    "On site",
  ];

  const toggleLocation = (location: string) => {
    const exists = filters.locations.some(
      (selectedLocation) =>
        selectedLocation.toLowerCase() === location.toLowerCase(),
    );

    if (exists) {
      setFilter(
        "locations",
        filters.locations.filter(
          (selectedLocation) =>
            selectedLocation.toLowerCase() !== location.toLowerCase(),
        ),
      );
      return;
    }

    setFilter("locations", [...filters.locations, location]);
  };

  const handleShowResults = () => {
    onApply?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            <DropdownSelect
              label="Category"
              selectedValue={filters.mainCategory}
              options={categoryOptions}
              onSelect={(value) => setFilter("mainCategory", value)}
              placeholder="All categories"
            />

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Work model
              </Text>
              <View style={styles.segmentedRow}>
                {workModelOptions.map((option) => {
                  const selected =
                    normalizeWorkModel(filters.workModel) === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() =>
                        setFilter("workModel", selected ? null : option)
                      }
                      style={[
                        styles.segment,
                        {
                          borderColor: selected
                            ? colors.buttonPrimary
                            : colors.border,
                          backgroundColor: selected
                            ? colors.buttonPrimary
                            : colors.inputBackground,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          { color: selected ? colors.buttonText : colors.text },
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <DropdownSelect
              label="Seniority level"
              selectedValue={filters.seniorityLevel}
              options={seniorityOptions}
              onSelect={(value) => setFilter("seniorityLevel", value)}
              placeholder="All levels"
            />

            <DropdownSelect
              label="Job type"
              selectedValue={filters.jobType}
              options={jobTypeOptions}
              onSelect={(value) => setFilter("jobType", value)}
              placeholder="All types"
            />

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Locations
              </Text>
              <TextInput
                value={locationSearchInput}
                onChangeText={setLocationSearchInput}
                placeholder="Search locations"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.locationSearchInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
              />
              <View
                style={[styles.locationList, { borderColor: colors.border }]}
              >
                <ScrollView
                  nestedScrollEnabled
                  style={styles.locationListScroll}
                  keyboardShouldPersistTaps="always"
                  keyboardDismissMode="none"
                >
                  {filteredLocationOptions.length === 0 ? (
                    <View style={styles.emptyLocationsRow}>
                      <Text
                        style={[
                          styles.emptyLocationsText,
                          { color: colors.placeholder },
                        ]}
                      >
                        No locations found
                      </Text>
                    </View>
                  ) : (
                    filteredLocationOptions.map((location) => {
                      const checked = filters.locations.some(
                        (selectedLocation) =>
                          selectedLocation.toLowerCase() ===
                          location.toLowerCase(),
                      );

                      return (
                        <Pressable
                          key={`location-${location}`}
                          onPress={() => toggleLocation(location)}
                          style={styles.locationRow}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: checked
                                  ? colors.buttonPrimary
                                  : colors.border,
                                backgroundColor: checked
                                  ? colors.buttonPrimary
                                  : "transparent",
                              },
                            ]}
                          >
                            {checked ? (
                              <Text
                                style={[
                                  styles.checkboxTick,
                                  { color: colors.buttonText },
                                ]}
                              >
                                ✓
                              </Text>
                            ) : null}
                          </View>
                          <Text
                            style={[
                              styles.locationText,
                              { color: colors.text },
                            ]}
                          >
                            {location}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </View>

            <View style={styles.sectionRowBetween}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Only show jobs with salary
              </Text>
              <Switch
                value={filters.hasSalaryOnly}
                onValueChange={(value) => setFilter("hasSalaryOnly", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.buttonPrimary,
                }}
                thumbColor={colors.buttonText}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable onPress={clearAllFilters}>
              <Text
                style={[styles.clearAllText, { color: colors.buttonPrimary }]}
              >
                Clear all
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShowResults}
              style={[
                styles.showResultsButton,
                { backgroundColor: colors.buttonPrimary },
              ]}
            >
              <Text
                style={[
                  styles.showResultsButtonText,
                  { color: colors.buttonText },
                ]}
              >
                Show {resultCount} results
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    maxHeight: "85%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectButtonText: {
    fontSize: 14,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 9,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
  },
  locationSearchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  locationList: {
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 180,
    minHeight: 140,
  },
  locationListScroll: {
    paddingVertical: 6,
  },
  emptyLocationsRow: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  emptyLocationsText: {
    fontSize: 13,
    textAlign: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checkboxTick: {
    fontSize: 11,
    fontWeight: "700",
  },
  locationText: {
    fontSize: 14,
  },
  sectionRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  showResultsButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  showResultsButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
