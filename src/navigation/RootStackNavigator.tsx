import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useApplicationTracking } from "../context/ApplicationTrackingContext";
import { useTheme } from "../context/ThemeContext";
import { ApplicationFormScreen } from "../screens/ApplicationFormScreen";
import { CompanyJobsScreen } from "../screens/CompanyJobsScreen";
import { ComparisonScreen } from "../screens/ComparisonScreen";
import { JobDetailScreen } from "../screens/JobDetailScreen";
import { JobFinderScreen } from "../screens/JobFinderScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SavedJobsScreen } from "../screens/SavedJobsScreen";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabsNavigator() {
  const { colors } = useTheme();
  const { enhancedSavedJobs, appliedJobs } = useApplicationTracking();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === "JobFinder"
              ? "search"
              : route.name === "SavedJobs"
                ? "bookmark-outline"
                : "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="JobFinder"
        component={JobFinderScreen as React.ComponentType<object>}
        options={{ title: "Jobs" }}
      />
      <Tabs.Screen
        name="SavedJobs"
        component={SavedJobsScreen as React.ComponentType<object>}
        options={{
          title: "Saved",
          tabBarBadge:
            enhancedSavedJobs.length > 0 ? enhancedSavedJobs.length : undefined,
        }}
      />
      <Tabs.Screen
        name="AppliedProfile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarBadge: appliedJobs.length > 0 ? appliedJobs.length : undefined,
        }}
      />
    </Tabs.Navigator>
  );
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["jobfinder://"],
  config: {
    screens: {
      JobDetail: "jobdetail/:guid",
      CompanyJobs: "company/:companyName",
    },
  },
};

export function RootStackNavigator() {
  const { resolvedMode } = useTheme();

  return (
    <NavigationContainer
      theme={resolvedMode === "dark" ? DarkTheme : DefaultTheme}
      linking={linking}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
        <RootStack.Screen
          name="JobDetail"
          component={JobDetailScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <RootStack.Screen
          name="ApplicationForm"
          component={ApplicationFormScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <RootStack.Screen name="CompanyJobs" component={CompanyJobsScreen} />
        <RootStack.Screen
          name="Comparison"
          component={ComparisonScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
