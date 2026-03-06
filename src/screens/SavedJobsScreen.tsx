import React, { useMemo, useState } from "react";
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

function normalizeId(value: string): string {
  return value.trim().toLowerCase();
}

function makeSelectionKey(status: ApplicationStatus, jobId: string): string {
  return `${status}:${normalizeId(jobId)}`;
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedByStatus, setSelectedByStatus] = useState<
    Record<ApplicationStatus, string[]>
  >({
    applied: [],
    saved: [],
  });

  const sections = useMemo<JobsSection[]>(() => {
    const applied = [...appliedJobs].sort((a, b) => {
      const aValue = new Date(a.appliedAt || 0).getTime();
      const bValue = new Date(b.appliedAt || 0).getTime();
      return bValue - aValue;
    });

    const saved = [...enhancedSavedJobs].sort((a, b) => {
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

  const selectedKeys = useMemo(
    () =>
      new Set([
        ...selectedByStatus.applied.map((id) =>
          makeSelectionKey("applied", id),
        ),
        ...selectedByStatus.saved.map((id) => makeSelectionKey("saved", id)),
      ]),
    [selectedByStatus],
  );

  const allIdsByStatus = useMemo(
    () => ({
      applied:
        sections
          .find((section) => section.key === "applied")
          ?.data.map((job) => getJobId(job)) || [],
      saved:
        sections
          .find((section) => section.key === "saved")
          ?.data.map((job) => getJobId(job)) || [],
    }),
    [sections],
  );

  const selectedCount =
    selectedByStatus.applied.length + selectedByStatus.saved.length;

  const toggleSelection = (status: ApplicationStatus, jobId: string) => {
    const normalized = normalizeId(jobId);

    setSelectedByStatus((current) => {
      const currentForStatus = current[status];
      const exists = currentForStatus.some(
        (id) => normalizeId(id) === normalized,
      );

      return {
        ...current,
        [status]: exists
          ? currentForStatus.filter((id) => normalizeId(id) !== normalized)
          : [...currentForStatus, jobId],
      };
    });
  };

  const isSelected = (status: ApplicationStatus, jobId: string): boolean =>
    selectedKeys.has(makeSelectionKey(status, jobId));

  const enterSelectionMode = (status?: ApplicationStatus, jobId?: string) => {
    setSelectionMode(true);

    if (status && jobId) {
      const normalized = normalizeId(jobId);
      setSelectedByStatus((current) => {
        const currentForStatus = current[status];
        if (currentForStatus.some((id) => normalizeId(id) === normalized)) {
          return current;
        }

        return {
          ...current,
          [status]: [...currentForStatus, jobId],
        };
      });
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedByStatus({ applied: [], saved: [] });
  };

  const handleSelectAll = () => {
    setSelectedByStatus({
      applied: allIdsByStatus.applied,
      saved: allIdsByStatus.saved,
    });
  };

  const handleClearSelection = () => {
    setSelectedByStatus({ applied: [], saved: [] });
  };

  const handleRemoveSelected = () => {
    if (selectedCount === 0) {
      return;
    }

    Alert.alert("Confirm removal", `Remove ${selectedCount} selected jobs?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          void (async () => {
            const appliedToRemove = appliedJobs.filter((job) =>
              selectedByStatus.applied
                .map(normalizeId)
                .includes(normalizeId(getJobId(job))),
            );
            const savedToRemove = enhancedSavedJobs.filter((job) =>
              selectedByStatus.saved
                .map(normalizeId)
                .includes(normalizeId(getJobId(job))),
            );

            await Promise.all([
              ...appliedToRemove.map((job) => removeApplied(getJobId(job))),
              ...savedToRemove.map((job) => removeJob(getJobId(job))),
            ]);

            exitSelectionMode();
          })();
        },
      },
    ]);
  };

  const handleApply = (job: EnhancedSavedJob) => {
    const status = getJobStatus(getJobId(job));

    if (status === "applied") {
      Alert.alert("Already applied", `You already applied to this job.`, [
        { text: "Cancel", style: "cancel" },
        { text: "View in Applied section", onPress: () => {} },
      ]);
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
      <View style={[styles.headerActionsRow, { borderColor: colors.border }]}>
        {!selectionMode ? (
          <Pressable
            onPress={() => enterSelectionMode()}
            style={[styles.headerActionPill, { borderColor: colors.border }]}
          >
            <Text style={[styles.headerActionText, { color: colors.text }]}>
              Select jobs
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={handleSelectAll}
              style={[styles.headerActionPill, { borderColor: colors.border }]}
            >
              <Text style={[styles.headerActionText, { color: colors.text }]}>
                Select all
              </Text>
            </Pressable>
            <Pressable
              onPress={handleClearSelection}
              style={[styles.headerActionPill, { borderColor: colors.border }]}
            >
              <Text style={[styles.headerActionText, { color: colors.text }]}>
                Clear selection
              </Text>
            </Pressable>
            <Pressable
              onPress={exitSelectionMode}
              style={[styles.headerActionPill, { borderColor: colors.border }]}
            >
              <Text style={[styles.headerActionText, { color: colors.text }]}>
                Done
              </Text>
            </Pressable>
          </>
        )}
      </View>

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
          <View
            style={[
              styles.itemWrap,
              {
                borderColor: isSelected(item.status, getJobId(item))
                  ? colors.buttonPrimary
                  : "transparent",
                backgroundColor: isSelected(item.status, getJobId(item))
                  ? colors.inputBackground
                  : "transparent",
              },
            ]}
          >
            <View style={styles.statusRow}>
              {selectionMode ? (
                <Pressable
                  onPress={() => toggleSelection(item.status, getJobId(item))}
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isSelected(item.status, getJobId(item))
                        ? colors.buttonPrimary
                        : colors.border,
                      backgroundColor: isSelected(item.status, getJobId(item))
                        ? colors.buttonPrimary
                        : "transparent",
                    },
                  ]}
                >
                  {isSelected(item.status, getJobId(item)) ? (
                    <Text
                      style={[
                        styles.checkboxTick,
                        { color: colors.buttonText },
                      ]}
                    >
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              ) : null}

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
                  if (selectionMode) {
                    toggleSelection(item.status, getJobId(item));
                    return;
                  }

                  enterSelectionMode(item.status, getJobId(item));
                }}
                style={[
                  styles.selectPill,
                  {
                    backgroundColor: selectionMode
                      ? colors.buttonSecondary
                      : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectPillText,
                    {
                      color: selectionMode ? colors.buttonText : colors.text,
                    },
                  ]}
                >
                  {selectionMode ? "Toggle" : "Select"}
                </Text>
              </Pressable>
            </View>

            <JobCard
              job={item}
              colors={colors}
              isSaved={isJobSaved(getJobId(item))}
              onPress={(job) => {
                if (selectionMode) {
                  toggleSelection(item.status, getJobId(job));
                  return;
                }

                navigation.navigate("JobDetail", { job, source: "savedJobs" });
              }}
              onApply={() => {
                if (selectionMode) {
                  toggleSelection(item.status, getJobId(item));
                  return;
                }

                handleApply(item);
              }}
              onSave={(job) => {
                void saveJob(job);
              }}
            />
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          selectionMode ? styles.listContentWithBatchBar : null,
        ]}
        stickySectionHeadersEnabled={false}
      />

      {selectionMode ? (
        <View
          style={[
            styles.batchBar,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Text style={[styles.batchText, { color: colors.text }]}>
            {selectedCount} job{selectedCount === 1 ? "" : "s"} selected
          </Text>
          <Pressable
            onPress={handleRemoveSelected}
            disabled={selectedCount === 0}
            style={[
              styles.removeSelectedButton,
              {
                backgroundColor:
                  selectedCount === 0
                    ? colors.buttonSecondary
                    : colors.buttonDanger,
                opacity: selectedCount === 0 ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.removeSelectedButtonText,
                { color: colors.buttonText },
              ]}
            >
              Remove Selected
            </Text>
          </Pressable>
        </View>
      ) : null}
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
  listContentWithBatchBar: {
    paddingBottom: 112,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  headerActionPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: "700",
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
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
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
  selectPill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxTick: {
    fontSize: 12,
    fontWeight: "800",
  },
  batchBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  batchText: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  removeSelectedButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  removeSelectedButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
