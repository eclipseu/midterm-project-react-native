import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { IndeedEmptyState } from "../components/common/IndeedEmptyState";
import { RecentlyViewedSection } from "../components/RecentlyViewedSection";
import {
  IndeedFilterModal,
  type IndeedFilterState,
} from "../components/filters/IndeedFilterModal";
import { JobCard } from "../components/JobCard";
import { IndeedSearchHeader } from "../components/search/IndeedSearchHeader";
import { useApplicationTracking } from "../context/ApplicationTrackingContext";
import { useTheme } from "../context/ThemeContext";
import { fetchJobs } from "../services/jobService";
import type { Job } from "../types/job";
import { addSearch, getRecentSearches } from "../utils/searchHistory";
import { getRecentlyViewed } from "../utils/recentlyViewed";

type Props = {
  navigation: any;
};

const PAGE_SIZE = 100;

const initialFilters: IndeedFilterState = {
  remote: "Any",
  datePosted: "Any time",
  showEstimate: false,
  minimumSalary: "",
};

function getJobId(job: Job): string {
  return job.guid || job.id;
}

function getActiveFilterCount(filters: IndeedFilterState): number {
  let count = 0;

  if (filters.remote !== "Any") count += 1;
  if (filters.datePosted !== "Any time") count += 1;
  if (filters.showEstimate) count += 1;
  if (filters.minimumSalary.trim().length > 0) count += 1;

  return count;
}

function toTimestampSeconds(value: number | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value > 1_000_000_000_000 ? Math.floor(value / 1000) : value;
}

function matchesDateFilter(
  job: Job,
  datePosted: IndeedFilterState["datePosted"],
): boolean {
  if (datePosted === "Any time") {
    return true;
  }

  const pub = toTimestampSeconds(job.pubDate);
  if (!pub) {
    return false;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const diffHours = (nowSec - pub) / 3600;

  if (datePosted === "Last 24 hours") {
    return diffHours <= 24;
  }

  if (datePosted === "Last 3 days") {
    return diffHours <= 72;
  }

  return diffHours <= 168;
}

export function JobFinderScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { saveJob, isJobSaved, getJobStatus, registerJobs } =
    useApplicationTracking();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const [whatDraftValue, setWhatDraftValue] = useState("");
  const [whereDraftValue, setWhereDraftValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [appliedWhereValue, setAppliedWhereValue] = useState("");

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<IndeedFilterState>(initialFilters);
  const [draftFilters, setDraftFilters] =
    useState<IndeedFilterState>(initialFilters);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentlyViewedJobs, setRecentlyViewedJobs] = useState<Job[]>([]);
  const listOpacity = useRef(new Animated.Value(0)).current;

  const loadJobs = async (
    targetOffset: number,
    options?: {
      append?: boolean;
      refresh?: boolean;
    },
  ) => {
    const shouldAppend = options?.append ?? false;
    const isRefresh = options?.refresh ?? false;

    if (isRefresh) {
      setRefreshing(true);
    } else if (shouldAppend) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
      listOpacity.setValue(0);
    }

    if (!shouldAppend) {
      setError(null);
    }

    try {
      const fetchedJobs = await fetchJobs(targetOffset, PAGE_SIZE);
      const nextHasMore = fetchedJobs.length === PAGE_SIZE;

      setHasMore(nextHasMore);
      setOffset(targetOffset + fetchedJobs.length);

      setJobs((currentJobs) => {
        if (!shouldAppend || targetOffset === 0) {
          return fetchedJobs;
        }

        const existingGuids = new Set(
          currentJobs.map((job) => (job.guid || job.id).toLowerCase()),
        );

        const nextJobs = fetchedJobs.filter(
          (job) => !existingGuids.has((job.guid || job.id).toLowerCase()),
        );

        return [...currentJobs, ...nextJobs];
      });

      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Something went wrong while fetching jobs.";
      setError(message);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else if (shouldAppend) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadJobs(0);

    void (async () => {
      const [history, recentJobs] = await Promise.all([
        getRecentSearches(),
        getRecentlyViewed(),
      ]);
      setRecentSearches(history);
      setRecentlyViewedJobs(recentJobs);
    })();
  }, []);

  useEffect(() => {
    registerJobs(jobs);
  }, [jobs, registerJobs]);

  useEffect(() => {
    const debounceId = setTimeout(() => {
      setSearchValue(whatDraftValue.trim());
      setAppliedWhereValue(whereDraftValue.trim());
    }, 350);

    return () => {
      clearTimeout(debounceId);
    };
  }, [whatDraftValue, whereDraftValue]);

  const filteredJobs = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const locationQuery = appliedWhereValue.trim().toLowerCase();
    const minSalary = Number(filters.minimumSalary || "0");

    return jobs.filter((job) => {
      const company = (job.companyName || job.company).toLowerCase();
      const details = (job.details || "").toLowerCase();
      const locationValues = [job.location || "", ...(job.locations || [])]
        .join(" ")
        .toLowerCase();
      const workModel = (job.workModel || "").toLowerCase();

      const matchesSearch =
        query.length === 0 ||
        job.title.toLowerCase().includes(query) ||
        company.includes(query) ||
        details.includes(query);

      const matchesWhere =
        locationQuery.length === 0 ||
        locationValues.includes(locationQuery) ||
        company.includes(locationQuery);

      const matchesRemote =
        filters.remote === "Any"
          ? true
          : filters.remote === "Remote only"
            ? workModel.includes("remote")
            : filters.remote === "Hybrid"
              ? workModel.includes("hybrid")
              : workModel.includes("on-site") ||
                workModel.includes("on site") ||
                workModel.includes("onsite");

      const matchesDate = matchesDateFilter(job, filters.datePosted);

      const salaryFloor =
        typeof job.minSalary === "number"
          ? job.minSalary
          : typeof job.maxSalary === "number"
            ? job.maxSalary
            : 0;

      const matchesSalary = !filters.showEstimate || salaryFloor >= minSalary;

      return (
        matchesSearch &&
        matchesWhere &&
        matchesRemote &&
        matchesDate &&
        matchesSalary
      );
    });
  }, [
    filters.datePosted,
    filters.minimumSalary,
    filters.remote,
    filters.showEstimate,
    jobs,
    appliedWhereValue,
    searchValue,
  ]);

  const hasNoResults = !loading && !error && filteredJobs.length === 0;
  const activeFilterCount = getActiveFilterCount(filters);

  const handleLoadMore = () => {
    if (loading || refreshing || isLoadingMore || !hasMore) {
      return;
    }

    void loadJobs(offset, { append: true });
  };

  const handleRefresh = () => {
    setJobs([]);
    setOffset(0);
    setHasMore(true);
    void loadJobs(0, { refresh: true });
  };

  const handleSearch = async () => {
    const normalized = whatDraftValue.trim();
    setSearchValue(normalized);
    setAppliedWhereValue(whereDraftValue.trim());

    if (normalized.length > 0) {
      await addSearch(normalized);
      setRecentSearches(await getRecentSearches());
    }
  };

  const handleApplyPress = (job: Job) => {
    const jobId = getJobId(job);
    const status = getJobStatus(jobId);

    if (status === "applied") {
      navigation.navigate("MainTabs", { screen: "SavedJobs" });
      return;
    }

    navigation.navigate("ApplicationForm", {
      jobId,
      source: "jobFinder",
    });
  };

  const openFilterModal = () => {
    setDraftFilters(filters);
    setFilterModalOpen(true);
  };

  const applyFilterChanges = () => {
    setFilters(draftFilters);
    setFilterModalOpen(false);
  };

  const renderHeader = () => (
    <View style={[styles.stickyWrap, { backgroundColor: colors.background }]}>
      <IndeedSearchHeader
        whatValue={whatDraftValue}
        whereValue={whereDraftValue}
        onWhatChange={setWhatDraftValue}
        onWhereChange={setWhereDraftValue}
        onSearch={() => {
          void handleSearch();
        }}
      />

      <View style={styles.filterRow}>
        <Pressable
          onPress={openFilterModal}
          style={[
            styles.filterButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text
            style={[styles.filterButtonLabel, { color: colors.textPrimary }]}
          >
            Filter
          </Text>
          {activeFilterCount > 0 ? (
            <View
              style={[styles.filterBadge, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[styles.filterBadgeText, { color: colors.buttonText }]}
              >
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {recentSearches.length > 0 && whatDraftValue.trim().length === 0 ? (
        <View style={styles.recentRow}>
          <Text style={[styles.recentLabel, { color: colors.textSecondary }]}>
            Recent:
          </Text>
          {recentSearches.slice(0, 3).map((item) => (
            <Pressable
              key={item}
              style={[styles.recentChip, { borderColor: colors.border }]}
              onPress={() => {
                setWhatDraftValue(item);
                setSearchValue(item);
              }}
            >
              <Text
                style={[styles.recentChipText, { color: colors.textPrimary }]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <RecentlyViewedSection
        jobs={recentlyViewedJobs}
        onSelectJob={(job) =>
          navigation.navigate("JobDetail", { job, source: "jobFinder" })
        }
        onCleared={() => setRecentlyViewedJobs([])}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <IndeedFilterModal
        visible={filterModalOpen}
        filters={draftFilters}
        onClose={() => setFilterModalOpen(false)}
        onChange={setDraftFilters}
        onClearAll={() => setDraftFilters(initialFilters)}
        onApply={applyFilterChanges}
      />

      <View
        style={[styles.headerContainer, { backgroundColor: colors.background }]}
      >
        {renderHeader()}
      </View>

      {error ? (
        <IndeedEmptyState
          title="Something went wrong"
          subtitle={error}
          actionLabel="Retry"
          onAction={() => {
            void loadJobs(0);
          }}
        />
      ) : loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <Animated.View style={[styles.listWrap, { opacity: listOpacity }]}>
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.guid || item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              hasNoResults ? (
                <IndeedEmptyState
                  title="No jobs match your search"
                  subtitle="Try adjusting keywords, location, or filters."
                />
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <JobCard
                  job={item}
                  colors={colors}
                  isSaved={isJobSaved(getJobId(item))}
                  onSave={(job) => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    void saveJob(job);
                  }}
                  onPress={(job) =>
                    navigation.navigate("JobDetail", {
                      job,
                      source: "jobFinder",
                    })
                  }
                  onApply={() => {
                    handleApplyPress(item);
                  }}
                />
              </View>
            )}
            onEndReachedThreshold={0.2}
            onEndReached={handleLoadMore}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerState}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : !hasMore && filteredJobs.length > 0 ? (
                <View style={styles.footerState}>
                  <Text
                    style={[styles.footerText, { color: colors.textSecondary }]}
                  >
                    No more jobs
                  </Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  listWrap: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 1,
  },
  stickyWrap: {
    paddingBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  filterButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterButtonLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
  },
  cardWrap: {
    paddingHorizontal: 16,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerState: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  recentRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recentLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  recentChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  recentChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
