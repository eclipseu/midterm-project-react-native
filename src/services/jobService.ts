import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import type { Job, JobsApiResponse } from "../types/job";

const API_URL = "https://empllo.com/api/v1";

function cleanText(value: string | undefined): string {
  if (!value) {
    return "No details available.";
  }

  const withoutTags = value.replace(/<[^>]*>/g, " ");

  return withoutTags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSalary(
  minSalary: number | null | undefined,
  maxSalary: number | null | undefined,
  currency: string | null | undefined,
): string {
  const currencyCode = currency ?? "USD";
  const createFormatter = () =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    });

  const formatter = (() => {
    try {
      return createFormatter();
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });
    }
  })();

  if (typeof minSalary === "number" && typeof maxSalary === "number") {
    return `${formatter.format(minSalary)} - ${formatter.format(maxSalary)}`;
  }

  if (typeof minSalary === "number") {
    return `${formatter.format(minSalary)}+`;
  }

  if (typeof maxSalary === "number") {
    return `Up to ${formatter.format(maxSalary)}`;
  }

  return "Not disclosed";
}

export async function fetchJobs(offset = 0, limit = 100): Promise<Job[]> {
  const response = await fetch(`${API_URL}?offset=${offset}&limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch jobs. Please try again later.");
  }

  const data: JobsApiResponse = (await response.json()) as JobsApiResponse;

  if (!Array.isArray(data.jobs)) {
    throw new Error("Invalid jobs data received from API.");
  }

  return data.jobs.map((job) => ({
    id: uuidv4(),
    title: job.title?.trim() || "Untitled role",
    company: job.companyName?.trim() || "Unknown company",
    companyName: job.companyName?.trim() || "Unknown company",
    companyLogo: job.companyLogo?.trim() || undefined,
    workModel: job.workModel?.trim() || undefined,
    mainCategory: job.mainCategory?.trim() || undefined,
    seniorityLevel: job.seniorityLevel?.trim() || undefined,
    jobType: job.jobType?.trim() || undefined,
    location: job.location?.trim() || undefined,
    locations: Array.isArray(job.locations)
      ? job.locations
          .map((location) => location?.trim())
          .filter((location): location is string => Boolean(location))
      : undefined,
    pubDate: typeof job.pubDate === "number" ? job.pubDate : undefined,
    expiryDate: typeof job.expiryDate === "number" ? job.expiryDate : undefined,
    guid: job.guid?.trim() || undefined,
    tags: Array.isArray(job.tags)
      ? job.tags
          .map((tag) => tag?.trim())
          .filter((tag): tag is string => Boolean(tag))
      : undefined,
    description: job.description || undefined,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    currency: job.currency,
    salary: formatSalary(job.minSalary, job.maxSalary, job.currency),
    details: cleanText(job.description),
    applicationLink: job.applicationLink?.trim() || job.guid?.trim() || "",
  }));
}
