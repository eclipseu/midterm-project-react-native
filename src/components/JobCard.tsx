import React, { useMemo, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ThemeColors } from "../constants/theme";
import {
  calculateDaysSincePosted,
  formatSalary,
  getWorkModelEmoji,
} from "../utils/jobHelpers";
import type { Job } from "../types/job";

type JobCardJob = Job & {
  companyName?: string;
  companyLogo?: string;
  workModel?: string;
  tags?: string[];
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  pubDate?: number;
  publishedAt?: number;
  postedAt?: number;
};

type JobCardProps = {
  job: JobCardJob;
  colors: ThemeColors;
  isSaved?: boolean;
  onSave?: (job: Job) => void;
  onApply: (job: Job) => void;
  onRemove?: (job: Job) => void;
  onPress?: (job: Job) => void;
};

export function JobCard({
  job,
  colors,
  isSaved = false,
  onSave,
  onApply,
  onRemove,
  onPress,
}: JobCardProps) {
  const [hasLogoError, setHasLogoError] = useState<boolean>(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const companyLabel = job.companyName?.trim() || job.company;

  const salaryText = useMemo(() => {
    if (
      typeof job.minSalary === "number" ||
      typeof job.maxSalary === "number"
    ) {
      return formatSalary(job.minSalary, job.maxSalary, job.currency);
    }

    return job.salary || "Salary Not Disclosed";
  }, [job.currency, job.maxSalary, job.minSalary, job.salary]);

  const postedTimestamp =
    typeof job.pubDate === "number"
      ? job.pubDate
      : typeof job.publishedAt === "number"
        ? job.publishedAt
        : typeof job.postedAt === "number"
          ? job.postedAt
          : Date.now();
  const postedDays = calculateDaysSincePosted(postedTimestamp);
  const workModelEmoji = getWorkModelEmoji(job.workModel ?? "onsite");
  const visibleTags = Array.isArray(job.tags) ? job.tags.slice(0, 3) : [];

  const animateScale = (toValue: number) => {
    Animated.timing(scaleAnim, {
      toValue,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => onPress?.(job)}
      onPressIn={() => animateScale(0.98)}
      onPressOut={() => animateScale(1)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${job.title} at ${companyLabel}`}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.topRightBadge}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {workModelEmoji}
          </Text>
        </View>

        <View style={styles.headerRow}>
          <View style={[styles.logoContainer, { borderColor: colors.border }]}>
            {job.companyLogo && !hasLogoError ? (
              <Image
                source={{ uri: job.companyLogo }}
                style={styles.logoImage}
                resizeMode="cover"
                onError={() => setHasLogoError(true)}
              />
            ) : (
              <Text style={styles.logoFallbackIcon}>🏢</Text>
            )}
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {job.title}
            </Text>
            <Text style={[styles.meta, { color: colors.text }]}>
              Company: {companyLabel}
            </Text>

            {visibleTags.length > 0 ? (
              <View style={styles.tagsRow}>
                {visibleTags.map((tag) => (
                  <TouchableOpacity
                    key={`${job.id}-${tag}`}
                    activeOpacity={0.8}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.text }]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <Text
              style={[
                styles.salaryText,
                {
                  color:
                    salaryText === "Salary Not Disclosed"
                      ? colors.placeholder
                      : colors.text,
                },
                salaryText === "Salary Not Disclosed"
                  ? styles.salaryMuted
                  : null,
              ]}
            >
              {salaryText}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={3}
          style={[styles.details, { color: colors.text }]}
        >
          {job.details}
        </Text>

        <View style={styles.postedRow}>
          <Text style={[styles.postedText, { color: colors.placeholder }]}>
            Posted {postedDays} days ago
          </Text>
        </View>

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
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: "relative",
  },
  topRightBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingRight: 20,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoFallbackIcon: {
    fontSize: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  salaryText: {
    fontSize: 13,
    marginBottom: 2,
  },
  salaryMuted: {
    fontStyle: "italic",
  },
  details: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 8,
  },
  postedRow: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  postedText: {
    fontSize: 11,
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
