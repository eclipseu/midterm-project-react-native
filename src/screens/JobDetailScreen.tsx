import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RenderHtml from "react-native-render-html";
import { useApplicationTracking } from "../context/ApplicationTrackingContext";
import { useTheme } from "../context/ThemeContext";
import { fetchJobs } from "../services/jobService";
import type { Job } from "../types/job";
import type { RootStackParamList } from "../types/navigation";
import {
  calculateDaysSincePosted,
  formatSalary,
  getWorkModelEmoji,
} from "../utils/jobHelpers";
import { addRecentlyViewed } from "../utils/recentlyViewed";

type Props = NativeStackScreenProps<RootStackParamList, "JobDetail">;

function getDaysUntil(dateValue: number | undefined): number | null {
  if (typeof dateValue !== "number" || !Number.isFinite(dateValue)) {
    return null;
  }

  const timestamp =
    dateValue < 1_000_000_000_000 ? dateValue * 1000 : dateValue;
  const diff = timestamp - Date.now();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function JobDetailScreen({ route, navigation }: Props) {
  const { job, source } = route.params;
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const {
    saveJob,
    removeJob,
    isJobSaved,
    getJobStatus,
    getAppliedAt,
    registerJobs,
  } = useApplicationTracking();

  const [hasLogoError, setHasLogoError] = useState(false);
  const [jobsByCompanyPool, setJobsByCompanyPool] = useState<Job[]>([]);

  const jobId = job.guid || job.id;
  const saved = isJobSaved(jobId);

  useEffect(() => {
    registerJobs([job]);
  }, [job, registerJobs]);

  const salaryText =
    typeof job.minSalary === "number" || typeof job.maxSalary === "number"
      ? formatSalary(job.minSalary, job.maxSalary, job.currency)
      : job.salary || "Not disclosed";

  const locationText =
    Array.isArray(job.locations) && job.locations.length > 0
      ? job.locations.join(", ")
      : job.location?.trim() || "Not specified";

  const postedDays = calculateDaysSincePosted(job.pubDate ?? Date.now());
  const daysUntilExpiry = getDaysUntil(job.expiryDate);
  const workModelEmoji = getWorkModelEmoji(job.workModel ?? "On site");
  const companyName = job.companyName || job.company;

  const htmlSource = useMemo(
    () => ({
      html:
        job.description ||
        `<p>${job.details || "No description available."}</p>`,
    }),
    [job.description, job.details],
  );

  const moreFromCompany = useMemo(() => {
    const normalizedCompany = companyName.trim().toLowerCase();

    return jobsByCompanyPool
      .filter((candidate) => {
        const candidateCompany = (candidate.companyName || candidate.company)
          .trim()
          .toLowerCase();
        return (
          candidateCompany === normalizedCompany && candidate.id !== job.id
        );
      })
      .slice(0, 10);
  }, [companyName, job.id, jobsByCompanyPool]);

  useEffect(() => {
    navigation.setOptions({ title: "Job Detail" });
  }, [navigation]);

  useEffect(() => {
    void addRecentlyViewed(job);
  }, [job]);

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      try {
        const allJobs = await fetchJobs();
        if (mounted) {
          setJobsByCompanyPool(allJobs);
        }
      } catch {
        if (mounted) {
          setJobsByCompanyPool([]);
        }
      }
    };

    void loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApply = async () => {
    const status = getJobStatus(jobId);

    if (status === "applied") {
      const appliedAt = getAppliedAt(jobId);
      const appliedOn = appliedAt
        ? new Date(appliedAt).toLocaleDateString()
        : "a previous date";

      Alert.alert("Already applied", `You already applied to this job.`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "View in Applied section",
          onPress: () =>
            navigation.navigate("MainTabs", {
              screen: "SavedJobs",
            }),
        },
      ]);
      return;
    }

    navigation.navigate("ApplicationForm", {
      jobId,
      source: source || "jobFinder",
    });
  };

  const handleShare = async () => {
    const url = job.guid || job.applicationLink;
    if (!url) {
      return;
    }

    await Share.share({ url });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <View
            style={[styles.logoLargeContainer, { borderColor: colors.border }]}
          >
            {job.companyLogo && !hasLogoError ? (
              <Image
                source={{ uri: job.companyLogo }}
                style={styles.logoLargeImage}
                resizeMode="cover"
                onError={() => setHasLogoError(true)}
              />
            ) : (
              <Text style={styles.logoFallback}>🏢</Text>
            )}
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {job.title}
          </Text>
          <Text style={[styles.companyLink, { color: colors.buttonPrimary }]}>
            {companyName}
          </Text>
          <View
            style={[
              styles.workModelChip,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.workModelText, { color: colors.text }]}>
              {workModelEmoji} {job.workModel || "On site"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>💰</Text>
            <Text style={[styles.metaText, { color: colors.text }]}>
              {salaryText === "Salary Not Disclosed"
                ? "Not disclosed"
                : salaryText}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={[styles.metaText, { color: colors.text }]}>
              {locationText}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>🕒</Text>
            <Text style={[styles.metaText, { color: colors.text }]}>
              Posted {postedDays} days ago
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>⏳</Text>
            <Text style={[styles.metaText, { color: colors.text }]}>
              {daysUntilExpiry === null
                ? "Expiry date not specified"
                : `Expires in ${daysUntilExpiry} days`}
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Required Skills
          </Text>
          <View style={styles.tagsWrap}>
            {(job.tags && job.tags.length > 0
              ? job.tags
              : ["Not specified"]
            ).map((tag) => (
              <View
                key={`${job.id}-${tag}`}
                style={[
                  styles.tagChip,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Job Description
          </Text>
          <View
            style={[
              styles.descriptionCard,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <RenderHtml
              contentWidth={width - 48}
              source={htmlSource}
              baseStyle={{ color: colors.text, fontSize: 14 }}
              tagsStyles={{
                a: {
                  color: colors.buttonPrimary,
                  textDecorationLine: "underline",
                },
                p: {
                  color: colors.text,
                  marginTop: 0,
                  marginBottom: 10,
                  lineHeight: 20,
                },
                ul: { color: colors.text, marginTop: 0, marginBottom: 10 },
                li: { color: colors.text, marginBottom: 6 },
                strong: { color: colors.text },
              }}
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            More jobs from {companyName}
          </Text>
          {moreFromCompany.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moreRow}
            >
              {moreFromCompany.map((companyJob) => (
                <Pressable
                  key={companyJob.id}
                  onPress={() =>
                    navigation.push("JobDetail", { job: companyJob, source })
                  }
                  style={[
                    styles.moreCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={2}
                    style={[styles.moreTitle, { color: colors.text }]}
                  >
                    {companyJob.title}
                  </Text>
                  <Text
                    style={[styles.moreMeta, { color: colors.placeholder }]}
                  >
                    {companyJob.workModel || "On site"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.emptyMore, { color: colors.placeholder }]}>
              No additional jobs from this company right now.
            </Text>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.actionsContainer,
          { borderTopColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Pressable
          onPress={() => {
            void handleApply();
          }}
          style={[
            styles.actionButton,
            { backgroundColor: colors.buttonPrimary },
          ]}
        >
          <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>
            Apply on Empllo
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (saved) {
              void removeJob(jobId);
              return;
            }

            void saveJob(job);
          }}
          style={[
            styles.actionButton,
            { backgroundColor: colors.buttonSecondary },
          ]}
        >
          <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>
            {saved ? "Unsave" : "Save Job"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            void handleShare();
          }}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Share
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 140,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoLargeContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  logoLargeImage: {
    width: "100%",
    height: "100%",
  },
  logoFallback: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  companyLink: {
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  workModelChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  workModelText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  descriptionCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  moreRow: {
    gap: 10,
  },
  moreCard: {
    width: 220,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  moreTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  moreMeta: {
    fontSize: 12,
  },
  emptyMore: {
    fontSize: 13,
  },
  actionsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
