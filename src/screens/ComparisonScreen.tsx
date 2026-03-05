import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { Job } from "../types/job";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Comparison">;

type AttributeRow = {
  key:
    | "company"
    | "title"
    | "salary"
    | "workModel"
    | "locations"
    | "tags"
    | "description"
    | "status";
  label: string;
};

const ATTRIBUTE_ROWS: AttributeRow[] = [
  { key: "company", label: "Company" },
  { key: "title", label: "Title" },
  { key: "salary", label: "Salary" },
  { key: "workModel", label: "Work Model" },
  { key: "locations", label: "Locations" },
  { key: "tags", label: "Tags" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
];

const ATTRIBUTE_LABEL_WIDTH = 130;
const JOB_COLUMN_WIDTH = 210;

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function getSalaryScore(job: Job): number {
  if (typeof job.maxSalary === "number") {
    return job.maxSalary;
  }

  if (typeof job.minSalary === "number") {
    return job.minSalary;
  }

  const salaryText = job.salary || "";
  const matches = salaryText.match(/\d[\d,]*/g);

  if (!matches || matches.length === 0) {
    return 0;
  }

  const parsed = matches
    .map((value) => Number(value.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));

  if (parsed.length === 0) {
    return 0;
  }

  return Math.max(...parsed);
}

function getCellValue(job: Job, row: AttributeRow["key"]): string {
  switch (row) {
    case "company":
      return job.companyName || job.company || "-";
    case "title":
      return job.title || "-";
    case "salary":
      return job.salary || "Not disclosed";
    case "workModel":
      return job.workModel || "On site";
    case "locations":
      if (Array.isArray(job.locations) && job.locations.length > 0) {
        return job.locations.join(", ");
      }
      return job.location || "Not specified";
    case "tags":
      if (Array.isArray(job.tags) && job.tags.length > 0) {
        return `${job.tags.length} tags`;
      }
      return "0 tags";
    case "description": {
      const text = (job.description || job.details || "")
        .replace(/<[^>]*>/g, " ")
        .trim();
      return text.length > 100 ? `${text.slice(0, 100)}...` : text || "-";
    }
    case "status":
      return (job as Job & { status?: string }).status || "saved";
    default:
      return "-";
  }
}

export function ComparisonScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const [compareJobs, setCompareJobs] = useState<Job[]>(
    route.params.jobs.slice(0, 3),
  );

  const salaryScores = useMemo(
    () => compareJobs.map((job) => getSalaryScore(job)),
    [compareJobs],
  );
  const highestSalary = useMemo(
    () => Math.max(...salaryScores, 0),
    [salaryScores],
  );

  const rowDifferenceMap = useMemo(() => {
    const map = new Map<AttributeRow["key"], boolean>();

    ATTRIBUTE_ROWS.forEach((row) => {
      const normalizedValues = compareJobs.map((job) =>
        normalizeValue(getCellValue(job, row.key)),
      );
      map.set(row.key, new Set(normalizedValues).size > 1);
    });

    return map;
  }, [compareJobs]);

  const clearAll = () => {
    setCompareJobs([]);
  };

  const removeFromComparison = (job: Job) => {
    const identity = (job.guid || job.id).toLowerCase();
    setCompareJobs((current) =>
      current.filter(
        (item) => (item.guid || item.id).toLowerCase() !== identity,
      ),
    );
  };

  const handleApplySingle = async (job: Job) => {
    if (!job.applicationLink) {
      return;
    }

    await Linking.openURL(job.applicationLink);
  };

  const handleApplyAll = async () => {
    for (const job of compareJobs) {
      if (!job.applicationLink) {
        continue;
      }

      await Linking.openURL(job.applicationLink);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Comparing {compareJobs.length} Jobs
        </Text>
        <Pressable onPress={clearAll}>
          <Text style={[styles.clearAllText, { color: colors.buttonPrimary }]}>
            Clear all
          </Text>
        </Pressable>
      </View>

      <ScrollView stickyHeaderIndices={[0]}>
        <View
          style={[
            styles.tableHeaderRow,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.attributeHeaderCell, { borderColor: colors.border }]}
          >
            <Text style={[styles.attributeHeaderText, { color: colors.text }]}>
              Attribute
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.jobsHeaderColumnsWrap}>
              {compareJobs.map((job) => (
                <View
                  key={`header-${job.guid || job.id}`}
                  style={[
                    styles.jobHeaderCell,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={2}
                    style={[styles.jobHeaderTitle, { color: colors.text }]}
                  >
                    {job.title}
                  </Text>
                  <Pressable
                    onPress={() => removeFromComparison(job)}
                    style={[
                      styles.removeCompareButton,
                      { backgroundColor: colors.buttonSecondary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.removeCompareText,
                        { color: colors.buttonText },
                      ]}
                    >
                      Remove
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {ATTRIBUTE_ROWS.map((row) => {
          const hasDifference = rowDifferenceMap.get(row.key) ?? false;

          return (
            <View key={`row-${row.key}`} style={styles.tableBodyRow}>
              <View
                style={[
                  styles.attributeCell,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                <Text style={[styles.attributeLabel, { color: colors.text }]}>
                  {row.label}
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.jobsBodyColumnsWrap}>
                  {compareJobs.map((job, index) => {
                    const value = getCellValue(job, row.key);
                    const showMatching = !hasDifference;
                    const isBestSalary =
                      row.key === "salary" &&
                      highestSalary > 0 &&
                      salaryScores[index] === highestSalary;

                    return (
                      <View
                        key={`cell-${row.key}-${job.guid || job.id}`}
                        style={[
                          styles.valueCell,
                          {
                            borderColor: colors.border,
                            backgroundColor: hasDifference
                              ? "rgba(255, 215, 0, 0.12)"
                              : colors.inputBackground,
                          },
                        ]}
                      >
                        {row.key === "company" ? (
                          <View style={styles.companyCellWrap}>
                            {job.companyLogo ? (
                              <Image
                                source={{ uri: job.companyLogo }}
                                style={styles.companyLogo}
                                resizeMode="cover"
                              />
                            ) : null}
                            <Text
                              numberOfLines={2}
                              style={[styles.valueText, { color: colors.text }]}
                            >
                              {value}
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={[styles.valueText, { color: colors.text }]}
                          >
                            {value}
                          </Text>
                        )}

                        {showMatching ? (
                          <Text style={styles.matchingIndicator}>✅</Text>
                        ) : null}
                        {isBestSalary ? (
                          <Text style={styles.bestIndicator}>⭐ Best</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.bottomActions,
          { borderTopColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Pressable
          onPress={() => {
            void handleApplyAll();
          }}
          style={[
            styles.applyAllButton,
            { backgroundColor: colors.buttonPrimary },
          ]}
        >
          <Text
            style={[styles.applyAllButtonText, { color: colors.buttonText }]}
          >
            Apply to all
          </Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.individualActionsRow}
        >
          {compareJobs.map((job) => (
            <Pressable
              key={`apply-${job.guid || job.id}`}
              onPress={() => {
                void handleApplySingle(job);
              }}
              style={[
                styles.singleApplyButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.singleApplyText, { color: colors.text }]}>
                Apply • {job.companyName || job.company}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Pressable onPress={() => navigation.goBack()} style={styles.backArea}>
        <Text style={[styles.backText, { color: colors.buttonPrimary }]}>
          Back to Saved Jobs
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: "700",
  },
  tableHeaderRow: {
    flexDirection: "row",
    zIndex: 2,
  },
  attributeHeaderCell: {
    width: ATTRIBUTE_LABEL_WIDTH,
    borderWidth: 1,
    padding: 10,
    justifyContent: "center",
  },
  attributeHeaderText: {
    fontSize: 13,
    fontWeight: "700",
  },
  jobsHeaderColumnsWrap: {
    flexDirection: "row",
  },
  jobHeaderCell: {
    width: JOB_COLUMN_WIDTH,
    borderWidth: 1,
    padding: 10,
  },
  jobHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  removeCompareButton: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  removeCompareText: {
    fontSize: 11,
    fontWeight: "700",
  },
  tableBodyRow: {
    flexDirection: "row",
  },
  attributeCell: {
    width: ATTRIBUTE_LABEL_WIDTH,
    borderWidth: 1,
    padding: 10,
    justifyContent: "center",
  },
  attributeLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  jobsBodyColumnsWrap: {
    flexDirection: "row",
  },
  valueCell: {
    width: JOB_COLUMN_WIDTH,
    borderWidth: 1,
    padding: 10,
    minHeight: 72,
  },
  valueText: {
    fontSize: 12,
    lineHeight: 18,
  },
  companyCellWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  companyLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  matchingIndicator: {
    marginTop: 6,
    fontSize: 12,
  },
  bestIndicator: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
  },
  bottomActions: {
    borderTopWidth: 1,
    padding: 10,
  },
  applyAllButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  applyAllButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  individualActionsRow: {
    gap: 8,
    paddingRight: 8,
  },
  singleApplyButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  singleApplyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  backArea: {
    alignItems: "center",
    paddingBottom: 12,
  },
  backText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
