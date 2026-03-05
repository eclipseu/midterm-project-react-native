import React, { createContext, useContext, useMemo, useState } from "react";

export interface FilterState {
  mainCategory: string | null;
  workModel: "Remote" | "Hybrid" | "On site" | null;
  seniorityLevel: string | null;
  jobType: string | null;
  locations: string[];
  hasSalaryOnly: boolean;
}

type FilterContextValue = {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  clearFilter: (key: keyof FilterState) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
};

const initialFilters: FilterState = {
  mainCategory: null,
  workModel: null,
  seniorityLevel: null,
  jobType: null,
  locations: [],
  hasSalaryOnly: false,
};

export const FilterContext = createContext<FilterContextValue | undefined>(
  undefined,
);

type Props = {
  children: React.ReactNode;
};

export function FilterProvider({ children }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const setFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const clearFilter = (key: keyof FilterState) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: initialFilters[key],
    }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.mainCategory) count += 1;
    if (filters.workModel) count += 1;
    if (filters.seniorityLevel) count += 1;
    if (filters.jobType) count += 1;
    if (filters.locations.length > 0) count += 1;
    if (filters.hasSalaryOnly) count += 1;

    return count;
  }, [filters]);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setFilter,
      clearFilter,
      clearAllFilters,
      activeFilterCount,
    }),
    [activeFilterCount, filters],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);

  if (context === undefined) {
    throw new Error("useFilters must be used within FilterProvider");
  }

  return context;
}
