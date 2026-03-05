import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IndeedEmptyState } from "../components/common/IndeedEmptyState";
import { JobCard } from "../components/JobCard";
import { useApplicationTracking } from "../context/ApplicationTrackingContext";
import { useTheme } from "../context/ThemeContext";
import { fetchJobs } from "../services/jobService";
import type { Job } from "../types/job";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "CompanyJobs">;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function CompanyJobsScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { companyName } = route.params;
  const { saveJob, isJobSaved } = useApplicationTracking();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const allJobs = await fetchJobs(0, 200);
        const filtered = allJobs.filter(
          (job) =>
            normalize(job.companyName || job.company) ===
            normalize(companyName),
        );

        if (!mounted) {
          return;
        }

        setJobs(filtered);
        setLogo(filtered.find((job) => job.companyLogo)?.companyLogo);
      } catch {
        if (mounted) {
          setJobs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [companyName]);

  const subtitle = useMemo(
    () => `See all jobs at ${companyName}`,
    [companyName],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            ‹ Back
          </Text>
        </Pressable>

        <View style={[styles.logoWrap, { borderColor: colors.border }]}>
          {logo ? (
            <Image
              source={{ uri: logo }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.logoFallback}>🏢</Text>
          )}
        </View>
        <Text style={[styles.company, { color: colors.textPrimary }]}>
          {companyName}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {jobs.length} jobs available
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : jobs.length === 0 ? (
        <IndeedEmptyState
          title="No open positions"
          subtitle={`No open positions at ${companyName}`}
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.guid || item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              colors={colors}
              isSaved={isJobSaved(item.guid || item.id)}
              onSave={(job) => {
                void saveJob(job);
              }}
              onApply={() =>
                navigation.navigate("ApplicationForm", {
                  jobId: item.guid || item.id,
                  source: "jobFinder",
                })
              }
              onPress={(job) =>
                navigation.navigate("JobDetail", { job, source: "jobFinder" })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  backButton: {
    minHeight: 44,
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoFallback: {
    fontSize: 30,
  },
  company: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    textAlign: "center",
  },
  count: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
