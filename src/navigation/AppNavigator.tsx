import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, Text } from "react-native";
import { useSavedJobs } from "../context/SavedJobsContext";
import { useTheme } from "../context/ThemeContext";
import { ApplicationFormScreen } from "../screens/ApplicationFormScreen";
import { JobFinderScreen } from "../screens/JobFinderScreen";
import { SavedJobsScreen } from "../screens/SavedJobsScreen";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { mode, colors, toggleTheme } = useTheme();
  const { savedJobs } = useSavedJobs();

  return (
    <NavigationContainer theme={mode === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTitleStyle: {
            color: colors.text,
          },
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerRight: () => (
            <Pressable onPress={toggleTheme}>
              <Text style={{ color: colors.buttonPrimary, fontWeight: "700" }}>
                {mode === "dark" ? "Light" : "Dark"}
              </Text>
            </Pressable>
          ),
        }}
      >
        <Stack.Screen
          name="JobFinder"
          component={JobFinderScreen}
          options={{ title: "Job Finder" }}
        />
        <Stack.Screen
          name="SavedJobs"
          component={SavedJobsScreen}
          options={{ title: `Saved Jobs (${savedJobs.length})` }}
        />
        <Stack.Screen
          name="ApplicationForm"
          component={ApplicationFormScreen}
          options={{ title: "Application Form" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
