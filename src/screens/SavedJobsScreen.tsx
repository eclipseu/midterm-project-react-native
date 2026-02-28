import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { JobCard } from "../components/JobCard";
import { useSavedJobs } from "../context/SavedJobsContext";
import { useTheme } from "../context/ThemeContext";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "SavedJobs">;

export function SavedJobsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { savedJobs, removeJob } = useSavedJobs();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            colors={colors}
            onRemove={removeJob}
            onApply={(job) =>
              navigation.navigate("ApplicationForm", { job, fromSaved: true })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No saved jobs yet.
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
  },
});
