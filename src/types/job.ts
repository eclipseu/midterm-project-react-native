export type Job = {
  id: string;
  title: string;
  company: string;
  companyName?: string;
  companyLogo?: string;
  workModel?: string;
  mainCategory?: string;
  seniorityLevel?: string;
  jobType?: string;
  location?: string;
  locations?: string[];
  pubDate?: number;
  expiryDate?: number;
  guid?: string;
  tags?: string[];
  description?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  salary: string;
  details: string;
  applicationLink: string;
};

export type ApplicationStatus = "saved" | "applied";

export type EnhancedSavedJob = Job & {
  status: ApplicationStatus;
  notes: string;
  savedAt: string;
  appliedAt?: string;
};

export type EnhancedJob = Job & {
  userNotes: string;
  applicationStatus: string;
  applicationDate: number | null;
};

export type FilterState = {
  mainCategory: string;
  workModel: string;
  seniorityLevel: string;
  jobType: string;
  locations: string[];
  hasSalaryOnly: boolean;
};

export type JobsApiResponse = {
  jobs?: Array<{
    title?: string;
    companyName?: string;
    companyLogo?: string;
    workModel?: string;
    mainCategory?: string;
    seniorityLevel?: string;
    jobType?: string;
    location?: string;
    locations?: string[];
    pubDate?: number;
    expiryDate?: number;
    tags?: string[];
    minSalary?: number | null;
    maxSalary?: number | null;
    currency?: string | null;
    description?: string;
    applicationLink?: string;
    guid?: string;
  }>;
};
