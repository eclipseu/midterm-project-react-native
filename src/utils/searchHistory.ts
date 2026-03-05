import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_HISTORY_KEY = "@search_history";
const MAX_HISTORY = 10;

export async function getRecentSearches(): Promise<string[]> {
  try {
    const storedValue = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export async function addSearch(query: string): Promise<void> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return;
  }

  try {
    const existingSearches = await getRecentSearches();
    const nextSearches = [
      normalizedQuery,
      ...existingSearches.filter(
        (item) => item.toLowerCase() !== normalizedQuery.toLowerCase(),
      ),
    ].slice(0, MAX_HISTORY);

    await AsyncStorage.setItem(
      SEARCH_HISTORY_KEY,
      JSON.stringify(nextSearches),
    );
  } catch {
    // Intentionally no-op to avoid breaking UX when storage is unavailable.
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // Intentionally no-op.
  }
}
