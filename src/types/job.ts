export type Job = {
  id: string;
  title: string;
  company: string;
  salary: string;
  details: string;
  applicationLink: string;
};

export type JobsApiResponse = {
  jobs?: Array<{
    title?: string;
    companyName?: string;
    minSalary?: number | null;
    maxSalary?: number | null;
    currency?: string | null;
    description?: string;
    applicationLink?: string;
    guid?: string;
  }>;
};
