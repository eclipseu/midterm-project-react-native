import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { Job } from "../types/job";
import { clearRecentlyViewed } from "../utils/recentlyViewed";

type RecentlyViewedSectionProps = {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onCleared: () => void;
};

export function RecentlyViewedSection({
  jobs,
  onSelectJob,
  onCleared,
}: RecentlyViewedSectionProps) {
  const { colors } = useTheme();

  if (jobs.length === 0) {
    return null;
  }

  const handleClear = async () => {
    await clearRecentlyViewed();
    onCleared();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          Recently Viewed
        </Text>
        <Pressable onPress={() => void handleClear()}>
          <Text style={[styles.clearText, { color: colors.buttonPrimary }]}>
            Clear
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {jobs.map((job) => (
          <Pressable
            key={`recent-job-${job.guid || job.id}`}
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => onSelectJob(job)}
          >
            <Text
              numberOfLines={2}
              style={[styles.jobTitle, { color: colors.text }]}
            >
              {job.title}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.companyText, { color: colors.placeholder }]}
            >
              {job.companyName || job.company}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.metaText, { color: colors.text }]}
            >
              {job.workModel || "On site"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 180,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  companyText: {
    fontSize: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
