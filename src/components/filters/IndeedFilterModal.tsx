import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { IndeedButton } from "../common/IndeedButton";

type RemoteType = "Remote only" | "Hybrid" | "On-site" | "Any";
type DatePostedType =
  | "Last 24 hours"
  | "Last 3 days"
  | "Last 7 days"
  | "Any time";

export type IndeedFilterState = {
  remote: RemoteType;
  datePosted: DatePostedType;
  showEstimate: boolean;
  minimumSalary: string;
};

type Props = {
  visible: boolean;
  filters: IndeedFilterState;
  onClose: () => void;
  onChange: (next: IndeedFilterState) => void;
  onClearAll: () => void;
  onApply: () => void;
};

const REMOTE_OPTIONS: RemoteType[] = [
  "Remote only",
  "Hybrid",
  "On-site",
  "Any",
];
const DATE_OPTIONS: DatePostedType[] = [
  "Last 24 hours",
  "Last 3 days",
  "Last 7 days",
  "Any time",
];

export function IndeedFilterModal({
  visible,
  filters,
  onClose,
  onChange,
  onClearAll,
  onApply,
}: Props) {
  const { colors } = useTheme();

  const setRemote = (value: RemoteType) =>
    onChange({ ...filters, remote: value });
  const setDatePosted = (value: DatePostedType) =>
    onChange({ ...filters, datePosted: value });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Filter jobs
          </Text>

          <ScrollView contentContainerStyle={styles.content}>
            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Remote
            </Text>
            <View style={styles.optionWrap}>
              {REMOTE_OPTIONS.map((option) => {
                const active = filters.remote === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setRemote(option)}
                    style={styles.optionRow}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {active ? (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[styles.optionText, { color: colors.textPrimary }]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Date posted
            </Text>
            <View style={styles.optionWrap}>
              {DATE_OPTIONS.map((option) => {
                const active = filters.datePosted === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setDatePosted(option)}
                    style={styles.optionRow}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        {
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {active ? (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[styles.optionText, { color: colors.textPrimary }]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Salary
            </Text>
            <Pressable
              onPress={() =>
                onChange({ ...filters, showEstimate: !filters.showEstimate })
              }
              style={styles.optionRow}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: filters.showEstimate
                      ? colors.primary
                      : colors.border,
                    backgroundColor: filters.showEstimate
                      ? colors.primary
                      : "transparent",
                  },
                ]}
              />
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                Show estimate
              </Text>
            </Pressable>

            <TextInput
              value={filters.minimumSalary}
              onChangeText={(value) =>
                onChange({
                  ...filters,
                  minimumSalary: value.replace(/[^0-9]/g, ""),
                })
              }
              keyboardType="numeric"
              placeholder="Minimum salary"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.minSalaryInput,
                {
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  backgroundColor: colors.background,
                },
              ]}
            />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable onPress={onClearAll}>
              <Text style={[styles.reset, { color: colors.primary }]}>
                Clear all
              </Text>
            </Pressable>
            <View style={styles.footerButton}>
              <IndeedButton label="Apply" onPress={onApply} variant="primary" />
            </View>
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
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "86%",
  },
  grabber: {
    width: 48,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
  },
  optionWrap: {
    gap: 8,
  },
  optionRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionText: {
    fontSize: 14,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
  },
  minSalaryInput: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reset: {
    fontSize: 14,
    fontWeight: "700",
  },
  footerButton: {
    flex: 1,
  },
});
