import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ApplicationTrackingProvider } from "./src/context/ApplicationTrackingContext";
import { FilterProvider } from "./src/context/FilterContext";
import { SavedJobsProvider } from "./src/context/SavedJobsContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { RootStackNavigator } from "./src/navigation/RootStackNavigator";

function AppContent() {
  const { mode } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
      />
      <RootStackNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ApplicationTrackingProvider>
          <SavedJobsProvider>
            <FilterProvider>
              <AppContent />
            </FilterProvider>
          </SavedJobsProvider>
        </ApplicationTrackingProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
