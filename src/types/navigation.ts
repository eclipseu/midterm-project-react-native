import type { Job } from "./job";

export type RootStackParamList = {
  JobFinder: undefined;
  SavedJobs: undefined;
  ApplicationForm: {
    job: Job;
    fromSaved?: boolean;
  };
};
