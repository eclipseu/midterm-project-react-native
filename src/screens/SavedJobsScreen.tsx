import React, { useMemo } from "react";
import {
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JobCard } from "../components/JobCard";
import { useApplicationTracking } from "../context/ApplicationTrackingContext";
import { useTheme } from "../context/ThemeContext";
import type { ApplicationStatus, EnhancedSavedJob, Job } from "../types/job";

type Props = {
  navigation: any;
};

type JobsSection = {
  key: ApplicationStatus;
  title: string;
  emptyText: string;
  data: EnhancedSavedJob[];
};

function getJobId(job: Job): string {
  return job.guid || job.id;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const isApplied = status === "applied";

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: isApplied ? "#2563eb" : "#6b7280" },
      ]}
    >
      <Text style={styles.statusBadgeText}>
        {isApplied ? "✓ Applied" : "★ Saved"}
      </Text>
    </View>
  );
}

export function SavedJobsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const {
    enhancedSavedJobs,
    appliedJobs,
    removeJob,
    removeApplied,
    getJobStatus,
    isJobSaved,
    saveJob,
  } = useApplicationTracking();

  const sections = useMemo<JobsSection[]>(() => {
    const applied = appliedJobs.sort((a, b) => {
      const aValue = new Date(a.appliedAt || 0).getTime();
      const bValue = new Date(b.appliedAt || 0).getTime();
      return bValue - aValue;
    });

    const saved = enhancedSavedJobs.sort((a, b) => {
      const aValue = new Date(a.savedAt).getTime();
      const bValue = new Date(b.savedAt).getTime();
      return bValue - aValue;
    });

    return [
      {
        key: "applied",
        title: "Applied",
        emptyText: "No applications yet",
        data: applied,
      },
      {
        key: "saved",
        title: "Saved",
        emptyText: "No saved jobs",
        data: saved,
      },
    ];
  }, [appliedJobs, enhancedSavedJobs]);

  const handleApply = (job: EnhancedSavedJob) => {
    const status = getJobStatus(getJobId(job));

    if (status === "applied") {
      Alert.alert(
        "Already applied",
        `You already applied to this job on ${formatDate(job.appliedAt)}.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "View in Applied section", onPress: () => {} },
        ],
      );
      return;
    }

    navigation.navigate("ApplicationForm", {
      jobId: getJobId(job),
      source: "savedJobs",
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.guid || item.id}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}
          </Text>
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <Text
              style={[styles.emptySectionText, { color: colors.placeholder }]}
            >
              {section.emptyText}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <View style={styles.statusRow}>
              <StatusBadge status={item.status} />
              {item.status === "applied" ? (
                <Text
                  style={[styles.appliedDate, { color: colors.placeholder }]}
                >
                  Applied on {formatDate(item.appliedAt)}
                </Text>
              ) : null}
              <Pressable
                onPress={() => {
                  if (item.status === "applied") {
                    void removeApplied(getJobId(item));
                    return;
                  }

                  void removeJob(getJobId(item));
                }}
                style={[
                  styles.removePill,
                  { backgroundColor: colors.buttonDanger },
                ]}
              >
                <Text
                  style={[styles.removePillText, { color: colors.buttonText }]}
                >
                  Remove
                </Text>
              </Pressable>
            </View>

            <JobCard
              job={item}
              colors={colors}
              isSaved={isJobSaved(getJobId(item))}
              onPress={(job) =>
                navigation.navigate("JobDetail", { job, source: "savedJobs" })
              }
              onCompanyPress={(job) =>
                navigation.navigate("CompanyJobs", {
                  companyName: job.companyName || job.company,
                })
              }
              onApply={() => handleApply(item)}
              onSave={(job) => {
                void saveJob(job);
              }}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 6,
  },
  emptySectionText: {
    fontSize: 13,
    marginBottom: 10,
  },
  itemWrap: {
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  appliedDate: {
    fontSize: 12,
    flex: 1,
  },
  removePill: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removePillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
