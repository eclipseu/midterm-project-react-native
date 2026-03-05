import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ApplicationStatus, EnhancedSavedJob, Job } from "../types/job";

const SAVED_KEY = "@enhanced_saved_jobs_v2";
const APPLIED_KEY = "@applied_jobs_v2";
const LEGACY_SAVED_KEY = "@saved_jobs";

type ApplicationTrackingContextValue = {
  enhancedSavedJobs: EnhancedSavedJob[];
  appliedJobs: EnhancedSavedJob[];
  saveJob: (job: Job) => Promise<void>;
  markAsApplied: (jobId: string) => Promise<void>;
  removeJob: (jobId: string) => Promise<void>;
  removeApplied: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
  getJobStatus: (jobId: string) => ApplicationStatus | null;
  getJobById: (jobId: string) => Job | null;
  getAppliedAt: (jobId: string) => string | null;
  registerJobs: (jobs: Job[]) => void;
};

const ApplicationTrackingContext = createContext<
  ApplicationTrackingContextValue | undefined
>(undefined);

type Props = {
  children: React.ReactNode;
};

function normalizeId(value: string): string {
  return value.trim().toLowerCase();
}

function getJobIdentity(job: Job): string {
  return normalizeId(job.guid || job.id);
}

function matchesJobId(job: Job, jobId: string): boolean {
  const normalized = normalizeId(jobId);
  return (
    normalizeId(job.id) === normalized ||
    normalizeId(job.guid || "") === normalized
  );
}

function toSavedEntry(job: Job): EnhancedSavedJob {
  return {
    ...job,
    status: "saved",
    notes: "",
    savedAt: new Date().toISOString(),
  };
}

function toAppliedEntry(
  job: Job,
  existingAppliedAt?: string,
): EnhancedSavedJob {
  return {
    ...job,
    status: "applied",
    notes: "",
    savedAt: new Date().toISOString(),
    appliedAt: existingAppliedAt || new Date().toISOString(),
  };
}

function normalizeEntry(input: unknown): EnhancedSavedJob | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const raw = input as Record<string, unknown>;

  if (
    typeof raw.id !== "string" ||
    typeof raw.title !== "string" ||
    typeof raw.company !== "string" ||
    typeof raw.salary !== "string" ||
    typeof raw.details !== "string" ||
    typeof raw.applicationLink !== "string"
  ) {
    return null;
  }

  const status: ApplicationStatus =
    raw.status === "applied" ? "applied" : "saved";

  return {
    id: raw.id,
    title: raw.title,
    company: raw.company,
    salary: raw.salary,
    details: raw.details,
    applicationLink: raw.applicationLink,
    companyName:
      typeof raw.companyName === "string" ? raw.companyName : undefined,
    companyLogo:
      typeof raw.companyLogo === "string" ? raw.companyLogo : undefined,
    workModel: typeof raw.workModel === "string" ? raw.workModel : undefined,
    mainCategory:
      typeof raw.mainCategory === "string" ? raw.mainCategory : undefined,
    seniorityLevel:
      typeof raw.seniorityLevel === "string" ? raw.seniorityLevel : undefined,
    jobType: typeof raw.jobType === "string" ? raw.jobType : undefined,
    location: typeof raw.location === "string" ? raw.location : undefined,
    locations: Array.isArray(raw.locations)
      ? raw.locations.filter(
          (value): value is string => typeof value === "string",
        )
      : undefined,
    pubDate: typeof raw.pubDate === "number" ? raw.pubDate : undefined,
    expiryDate: typeof raw.expiryDate === "number" ? raw.expiryDate : undefined,
    guid: typeof raw.guid === "string" ? raw.guid : undefined,
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((value): value is string => typeof value === "string")
      : undefined,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    minSalary: typeof raw.minSalary === "number" ? raw.minSalary : null,
    maxSalary: typeof raw.maxSalary === "number" ? raw.maxSalary : null,
    currency: typeof raw.currency === "string" ? raw.currency : null,
    status,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    savedAt:
      typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString(),
    appliedAt: typeof raw.appliedAt === "string" ? raw.appliedAt : undefined,
  };
}

export function ApplicationTrackingProvider({ children }: Props) {
  const [enhancedSavedJobs, setEnhancedSavedJobs] = useState<
    EnhancedSavedJob[]
  >([]);
  const [appliedJobs, setAppliedJobs] = useState<EnhancedSavedJob[]>([]);
  const [knownJobs, setKnownJobs] = useState<Record<string, Job>>({});

  const persistSaved = async (jobs: EnhancedSavedJob[]) => {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(jobs));
  };

  const persistApplied = async (jobs: EnhancedSavedJob[]) => {
    await AsyncStorage.setItem(APPLIED_KEY, JSON.stringify(jobs));
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [savedRaw, appliedRaw] = await Promise.all([
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(APPLIED_KEY),
        ]);

        if (savedRaw || appliedRaw) {
          const parsedSaved = savedRaw ? JSON.parse(savedRaw) : [];
          const parsedApplied = appliedRaw ? JSON.parse(appliedRaw) : [];

          const normalizedSaved = Array.isArray(parsedSaved)
            ? parsedSaved
                .map((item) => normalizeEntry(item))
                .filter((item): item is EnhancedSavedJob => item !== null)
                .map((item) => ({
                  ...item,
                  status: "saved" as ApplicationStatus,
                  appliedAt: undefined,
                }))
            : [];

          const normalizedApplied = Array.isArray(parsedApplied)
            ? parsedApplied
                .map((item) => normalizeEntry(item))
                .filter((item): item is EnhancedSavedJob => item !== null)
                .map((item) => ({
                  ...item,
                  status: "applied" as ApplicationStatus,
                  appliedAt: item.appliedAt || new Date().toISOString(),
                }))
            : [];

          if (!mounted) {
            return;
          }

          setEnhancedSavedJobs(normalizedSaved);
          setAppliedJobs(normalizedApplied);
          return;
        }

        const legacy = await AsyncStorage.getItem(LEGACY_SAVED_KEY);
        const parsedLegacy = legacy ? JSON.parse(legacy) : [];

        const migrated = Array.isArray(parsedLegacy)
          ? parsedLegacy
              .filter((item): item is Job => !!item && typeof item === "object")
              .map((item) => toSavedEntry(item as Job))
          : [];

        if (!mounted) {
          return;
        }

        setEnhancedSavedJobs(migrated);
        setAppliedJobs([]);
        await persistSaved(migrated);
        await persistApplied([]);
      } catch {
        if (!mounted) {
          return;
        }

        setEnhancedSavedJobs([]);
        setAppliedJobs([]);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const registerJobs = useCallback((jobs: Job[]) => {
    setKnownJobs((current) => {
      let changed = false;
      const next = { ...current };

      jobs.forEach((job) => {
        const idKey = normalizeId(job.id);
        if (!next[idKey]) {
          next[idKey] = job;
          changed = true;
        }

        if (job.guid) {
          const guidKey = normalizeId(job.guid);
          if (!next[guidKey]) {
            next[guidKey] = job;
            changed = true;
          }
        }
      });

      return changed ? next : current;
    });
  }, []);

  const saveJob = async (job: Job) => {
    registerJobs([job]);

    setEnhancedSavedJobs((current) => {
      const identity = getJobIdentity(job);
      const exists = current.some(
        (entry) => getJobIdentity(entry) === identity,
      );

      if (exists) {
        return current;
      }

      const next = [toSavedEntry(job), ...current];
      void persistSaved(next);
      return next;
    });
  };

  const markAsApplied = async (jobId: string) => {
    const normalized = normalizeId(jobId);

    const sourceJob =
      knownJobs[normalized] ||
      enhancedSavedJobs.find((entry) => matchesJobId(entry, jobId)) ||
      appliedJobs.find((entry) => matchesJobId(entry, jobId)) ||
      null;

    if (!sourceJob) {
      return;
    }

    setAppliedJobs((current) => {
      const existing = current.find((entry) => matchesJobId(entry, jobId));
      const nextEntry = toAppliedEntry(sourceJob, existing?.appliedAt);

      const next = [
        nextEntry,
        ...current.filter((entry) => !matchesJobId(entry, jobId)),
      ];

      void persistApplied(next);
      return next;
    });
  };

  const removeJob = async (jobId: string) => {
    setEnhancedSavedJobs((current) => {
      const next = current.filter((entry) => !matchesJobId(entry, jobId));
      void persistSaved(next);
      return next;
    });
  };

  const removeApplied = async (jobId: string) => {
    setAppliedJobs((current) => {
      const next = current.filter((entry) => !matchesJobId(entry, jobId));
      void persistApplied(next);
      return next;
    });
  };

  const isJobSaved = (jobId: string): boolean => {
    return enhancedSavedJobs.some((entry) => matchesJobId(entry, jobId));
  };

  const getJobStatus = (jobId: string): ApplicationStatus | null => {
    if (appliedJobs.some((entry) => matchesJobId(entry, jobId))) {
      return "applied";
    }

    if (enhancedSavedJobs.some((entry) => matchesJobId(entry, jobId))) {
      return "saved";
    }

    return null;
  };

  const getAppliedAt = (jobId: string): string | null => {
    const found = appliedJobs.find((entry) => matchesJobId(entry, jobId));
    return found?.appliedAt || null;
  };

  const getJobById = (jobId: string): Job | null => {
    const normalized = normalizeId(jobId);

    if (knownJobs[normalized]) {
      return knownJobs[normalized];
    }

    const fromSaved = enhancedSavedJobs.find((entry) =>
      matchesJobId(entry, jobId),
    );
    if (fromSaved) {
      return fromSaved;
    }

    const fromApplied = appliedJobs.find((entry) => matchesJobId(entry, jobId));
    return fromApplied || null;
  };

  const value = useMemo<ApplicationTrackingContextValue>(
    () => ({
      enhancedSavedJobs,
      appliedJobs,
      saveJob,
      markAsApplied,
      removeJob,
      removeApplied,
      isJobSaved,
      getJobStatus,
      getJobById,
      getAppliedAt,
      registerJobs,
    }),
    [
      appliedJobs,
      enhancedSavedJobs,
      getAppliedAt,
      getJobById,
      getJobStatus,
      isJobSaved,
      markAsApplied,
      registerJobs,
      removeJob,
      removeApplied,
      saveJob,
    ],
  );

  return (
    <ApplicationTrackingContext.Provider value={value}>
      {children}
    </ApplicationTrackingContext.Provider>
  );
}

export function useApplicationTracking() {
  const context = useContext(ApplicationTrackingContext);

  if (context === undefined) {
    throw new Error(
      "useApplicationTracking must be used within ApplicationTrackingProvider",
    );
  }

  return context;
}
