import type { Job } from "./job";
import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  JobFinder: undefined;
  SavedJobs: undefined;
  AppliedProfile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  JobDetail: {
    job: Job;
    source?: "jobFinder" | "savedJobs";
  };
  CompanyJobs: {
    companyName: string;
  };
  Comparison: {
    jobs: Job[];
  };
  ApplicationForm: {
    jobId: string;
    source: "jobFinder" | "savedJobs";
  };
};
