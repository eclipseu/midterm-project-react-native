import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ThemeColors } from "../constants/theme";
import type { Job } from "../types/job";

type JobCardProps = {
  job: Job;
  colors: ThemeColors;
  isSaved?: boolean;
  onSave?: (job: Job) => void;
  onApply: (job: Job) => void;
  onRemove?: (job: Job) => void;
};

export function JobCard({
  job,
  colors,
  isSaved = false,
  onSave,
  onApply,
  onRemove,
}: JobCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{job.title}</Text>
      <Text style={[styles.meta, { color: colors.text }]}>
        Company: {job.company}
      </Text>
      <Text style={[styles.meta, { color: colors.text }]}>
        Salary: {job.salary}
      </Text>
      <Text numberOfLines={3} style={[styles.details, { color: colors.text }]}>
        {job.details}
      </Text>

      <View style={styles.actionsRow}>
        {onSave ? (
          <Pressable
            disabled={isSaved}
            onPress={() => onSave(job)}
            style={[
              styles.button,
              {
                backgroundColor: isSaved
                  ? colors.buttonSecondary
                  : colors.buttonPrimary,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>
              {isSaved ? "Saved" : "Save Job"}
            </Text>
          </Pressable>
        ) : null}

        {onRemove ? (
          <Pressable
            onPress={() => onRemove(job)}
            style={[styles.button, { backgroundColor: colors.buttonDanger }]}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>
              Remove
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => onApply(job)}
          style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            Apply
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    marginBottom: 4,
  },
  details: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontWeight: "600",
  },
});
