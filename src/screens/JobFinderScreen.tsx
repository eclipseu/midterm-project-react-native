import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { JobCard } from "../components/JobCard";
import { useSavedJobs } from "../context/SavedJobsContext";
import { useTheme } from "../context/ThemeContext";
import { fetchJobs } from "../services/jobService";
import type { Job } from "../types/job";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "JobFinder">;

export function JobFinderScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { addJob, isSaved } = useSavedJobs();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedJobs = await fetchJobs();
      setJobs(fetchedJobs);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Something went wrong while fetching jobs.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return jobs;
    }

    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query),
    );
  }, [jobs, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        onPress={() => navigation.navigate("SavedJobs")}
        style={[
          styles.savedJobsButton,
          { backgroundColor: colors.buttonSecondary },
        ]}
      >
        <Text style={[styles.savedJobsText, { color: colors.buttonText }]}>
          Go to Saved Jobs
        </Text>
      </Pressable>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by title or company"
        placeholderTextColor={colors.placeholder}
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.buttonPrimary} />
          <Text style={[styles.stateText, { color: colors.text }]}>
            Loading jobs...
          </Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.centerState}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <Pressable
            onPress={() => {
              void loadJobs();
            }}
            style={[
              styles.retryButton,
              { backgroundColor: colors.buttonPrimary },
            ]}
          >
            <Text style={[styles.retryText, { color: colors.buttonText }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error ? (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              colors={colors}
              isSaved={isSaved(item)}
              onSave={addJob}
              onApply={(job) => navigation.navigate("ApplicationForm", { job })}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.stateText, { color: colors.text }]}>
              No jobs found.
            </Text>
          }
          contentContainerStyle={styles.listContent}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  savedJobsButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  savedJobsText: {
    fontWeight: "600",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  centerState: {
    alignItems: "center",
    marginTop: 24,
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  retryText: {
    fontWeight: "600",
  },
});
