import type { FilterState } from "../types/job";

type FilterableJob = {
  salary?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  mainCategory?: string;
  category?: string;
  workModel?: string;
  seniorityLevel?: string;
  jobType?: string;
  location?: string;
  locations?: string[];
  [key: string]: unknown;
};

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined,
): string | "Salary Not Disclosed" {
  const hasMin = typeof min === "number" && Number.isFinite(min);
  const hasMax = typeof max === "number" && Number.isFinite(max);

  if (!hasMin && !hasMax) {
    return "Salary Not Disclosed";
  }

  const currencyCode = currency ?? "USD";
  const formatter = (() => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
      });
    } catch {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });
    }
  })();

  if (hasMin && hasMax) {
    const normalizedMin = Math.min(min as number, max as number);
    const normalizedMax = Math.max(min as number, max as number);
    return `${formatter.format(normalizedMin)} - ${formatter.format(normalizedMax)}`;
  }

  if (hasMin) {
    return `${formatter.format(min as number)}+`;
  }

  return `Up to ${formatter.format(max as number)}`;
}

export function calculateDaysSincePosted(pubDate: number): number {
  if (!Number.isFinite(pubDate)) {
    return 0;
  }

  const timestamp = pubDate < 1_000_000_000_000 ? pubDate * 1000 : pubDate;
  const elapsedMs = Date.now() - timestamp;

  if (elapsedMs <= 0) {
    return 0;
  }

  return Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
}

export function getWorkModelEmoji(workModel: string): string {
  const normalized = workModel.trim().toLowerCase();

  if (
    normalized.includes("remote") ||
    normalized.includes("wfh") ||
    normalized.includes("work from home")
  ) {
    return "🌐";
  }

  if (normalized.includes("hybrid")) {
    return "🏢";
  }

  return "🏭";
}

function matchesStringFilter(value: unknown, filterValue: string): boolean {
  if (!filterValue || filterValue.toLowerCase() === "all") {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  return value.trim().toLowerCase() === filterValue.trim().toLowerCase();
}

function hasSalaryInfo(job: FilterableJob): boolean {
  if (typeof job.minSalary === "number" || typeof job.maxSalary === "number") {
    return true;
  }

  if (typeof job.salary !== "string") {
    return false;
  }

  const normalizedSalary = job.salary.trim().toLowerCase();
  return (
    normalizedSalary.length > 0 &&
    normalizedSalary !== "salary not disclosed" &&
    normalizedSalary !== "not disclosed"
  );
}

export function filterJobs<T extends FilterableJob>(
  jobs: T[],
  filters: FilterState,
): T[] {
  return jobs.filter((job) => {
    const mainCategoryValue =
      typeof job.mainCategory === "string"
        ? job.mainCategory
        : typeof job.category === "string"
          ? job.category
          : "";

    const locations = Array.isArray(job.locations)
      ? job.locations
      : typeof job.location === "string" && job.location.trim().length > 0
        ? [job.location]
        : [];

    const hasLocationMatch =
      filters.locations.length === 0 ||
      locations.some((location) =>
        filters.locations.some(
          (filterLocation) =>
            location.trim().toLowerCase() ===
            filterLocation.trim().toLowerCase(),
        ),
      );

    return (
      matchesStringFilter(mainCategoryValue, filters.mainCategory) &&
      matchesStringFilter(job.workModel, filters.workModel) &&
      matchesStringFilter(job.seniorityLevel, filters.seniorityLevel) &&
      matchesStringFilter(job.jobType, filters.jobType) &&
      hasLocationMatch &&
      (!filters.hasSalaryOnly || hasSalaryInfo(job))
    );
  });
}

export function getUniqueValues<T extends Record<string, unknown>>(
  jobs: T[],
  field: keyof T,
): string[] {
  const unique = new Set<string>();

  jobs.forEach((job) => {
    const value = job[field];

    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized) {
        unique.add(normalized);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry !== "string") {
          return;
        }

        const normalized = entry.trim();
        if (normalized) {
          unique.add(normalized);
        }
      });
    }
  });

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}
