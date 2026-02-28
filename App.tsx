import { StatusBar } from "react-native";
import { SavedJobsProvider } from "./src/context/SavedJobsContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

function AppContent() {
  const { mode } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SavedJobsProvider>
        <AppContent />
      </SavedJobsProvider>
    </ThemeProvider>
  );
}
