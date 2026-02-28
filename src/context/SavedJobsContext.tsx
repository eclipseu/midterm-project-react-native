import React, { createContext, useContext, useMemo, useState } from "react";
import type { Job } from "../types/job";

type SavedJobsContextValue = {
  savedJobs: Job[];
  addJob: (job: Job) => void;
  removeJob: (job: Job) => void;
  isSaved: (job: Job) => boolean;
};

const SavedJobsContext = createContext<SavedJobsContextValue | undefined>(
  undefined,
);

type Props = {
  children: React.ReactNode;
};

function getJobIdentity(job: Job): string {
  return `${job.title.trim().toLowerCase()}|${job.company
    .trim()
    .toLowerCase()}|${job.applicationLink.trim().toLowerCase()}`;
}

export function SavedJobsProvider({ children }: Props) {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const addJob = (job: Job) => {
    setSavedJobs((currentJobs) => {
      const exists = currentJobs.some(
        (savedJob) => getJobIdentity(savedJob) === getJobIdentity(job),
      );

      if (exists) {
        return currentJobs;
      }

      return [...currentJobs, job];
    });
  };

  const removeJob = (job: Job) => {
    setSavedJobs((currentJobs) =>
      currentJobs.filter(
        (savedJob) => getJobIdentity(savedJob) !== getJobIdentity(job),
      ),
    );
  };

  const isSaved = (job: Job): boolean => {
    return savedJobs.some(
      (savedJob) => getJobIdentity(savedJob) === getJobIdentity(job),
    );
  };

  const value = useMemo<SavedJobsContextValue>(
    () => ({
      savedJobs,
      addJob,
      removeJob,
      isSaved,
    }),
    [savedJobs],
  );

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);

  if (context === undefined) {
    throw new Error("useSavedJobs must be used within SavedJobsProvider");
  }

  return context;
}
