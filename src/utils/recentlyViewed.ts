import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Job } from "../types/job";

const RECENTLY_VIEWED_KEY = "@recently_viewed";
const MAX_RECENTLY_VIEWED = 20;

function getJobIdentity(job: Job): string {
  return (job.guid || job.id).toLowerCase();
}

export async function getRecentlyViewed(): Promise<Job[]> {
  try {
    const storedValue = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is Job => {
      if (!item || typeof item !== "object") {
        return false;
      }

      return (
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.company === "string"
      );
    });
  } catch {
    return [];
  }
}

export async function addRecentlyViewed(job: Job): Promise<void> {
  try {
    const existing = await getRecentlyViewed();
    const targetIdentity = getJobIdentity(job);

    const deduped = existing.filter(
      (existingJob) => getJobIdentity(existingJob) !== targetIdentity,
    );

    const next = [job, ...deduped].slice(0, MAX_RECENTLY_VIEWED);
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    // Intentionally no-op to avoid breaking UX when storage is unavailable.
  }
}

export async function clearRecentlyViewed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch {
    // Intentionally no-op.
  }
}
