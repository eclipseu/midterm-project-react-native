import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApplicationTracking } from "../context/ApplicationTrackingContext";
import { useTheme, type ThemeMode } from "../context/ThemeContext";

function ThemeModeButton({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: {
    border: string;
    buttonPrimary: string;
    buttonText: string;
    text: string;
    card: string;
  };
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.modeButton,
        {
          borderColor: selected ? colors.buttonPrimary : colors.border,
          backgroundColor: selected ? colors.buttonPrimary : colors.card,
        },
      ]}
    >
      <Text
        style={[
          styles.modeButtonText,
          { color: selected ? colors.buttonText : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ProgressRow({
  label,
  count,
  colors,
}: {
  label: string;
  count: number;
  colors: {
    textPrimary: string;
    border: string;
    card: string;
  };
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.statHeader}>
        <Text style={[styles.statLabel, { color: colors.textPrimary }]}>
          {label}
        </Text>
        <Text style={[styles.statCount, { color: colors.textPrimary }]}>
          {count}
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const { colors, mode, resolvedMode, setMode } = useTheme();
  const { appliedJobs, enhancedSavedJobs } = useApplicationTracking();

  const appliedCount = appliedJobs.length;
  const savedCount = enhancedSavedJobs.length;

  const themeModes: Array<{ key: ThemeMode; label: string }> = [
    { key: "system", label: "System" },
    { key: "light", label: "Light" },
    { key: "dark", label: "Dark" },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Ionicons
            name="person-circle-outline"
            size={30}
            color={colors.primary}
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Profile
          </Text>
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Theme
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Current: {mode === "system" ? `System (${resolvedMode})` : mode}
          </Text>
          <View style={styles.modeRow}>
            {themeModes.map((themeMode) => (
              <ThemeModeButton
                key={themeMode.key}
                label={themeMode.label}
                selected={mode === themeMode.key}
                onPress={() => setMode(themeMode.key)}
                colors={{
                  border: colors.border,
                  buttonPrimary: colors.buttonPrimary,
                  buttonText: colors.buttonText,
                  text: colors.text,
                  card: colors.card,
                }}
              />
            ))}
          </View>
        </View>

        <Text style={[styles.statsHeading, { color: colors.textPrimary }]}>
          Stats
        </Text>
        <ProgressRow
          label="Applied Jobs"
          count={appliedCount}
          colors={{
            textPrimary: colors.textPrimary,
            border: colors.border,
            card: colors.card,
          }}
        />
        <ProgressRow
          label="Saved Jobs"
          count={savedCount}
          colors={{
            textPrimary: colors.textPrimary,
            border: colors.border,
            card: colors.card,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionSubtitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  statsHeading: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "800",
  },
});
