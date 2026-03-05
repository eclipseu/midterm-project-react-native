import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  flex?: number;
  onSubmitEditing?: () => void;
  keyboardType?: TextInputProps["keyboardType"];
  multiline?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  autoCapitalize?: TextInputProps["autoCapitalize"];
};

export function IndeedInput({
  value,
  onChangeText,
  placeholder,
  iconName,
  flex,
  onSubmitEditing,
  keyboardType,
  multiline = false,
  inputStyle,
  autoCapitalize,
}: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.border,
          backgroundColor: colors.background,
          flex,
        },
      ]}
    >
      {iconName ? (
        <Ionicons
          name={iconName}
          size={16}
          color={colors.textSecondary}
          style={styles.icon}
        />
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        onSubmitEditing={onSubmitEditing}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          { color: colors.textPrimary },
          inputStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 100,
  },
});
