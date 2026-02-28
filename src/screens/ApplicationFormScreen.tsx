import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ApplicationForm">;

type FormData = {
  name: string;
  email: string;
  contactNumber: string;
  whyHireYou: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  contactNumber?: string;
  whyHireYou?: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  contactNumber: "",
  whyHireYou: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ApplicationFormScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { job, fromSaved } = route.params;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (formData.name.trim().length < 3) {
      nextErrors.name = "Name must be at least 3 characters.";
    }

    if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!/^\d{10,}$/.test(formData.contactNumber.trim())) {
      nextErrors.contactNumber =
        "Contact number must be numeric and at least 10 digits.";
    }

    if (formData.whyHireYou.trim().length < 20) {
      nextErrors.whyHireYou = "This field must be at least 20 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      return;
    }

    setFormData(initialFormData);
    setErrors({});

    Alert.alert(
      "Application Submitted",
      `Your application for ${job.title} has been sent successfully.`,
      [
        {
          text: "OK",
          onPress: () => {
            if (fromSaved) {
              navigation.navigate("JobFinder");
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Apply for {job.title}
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Name</Text>
        <TextInput
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
        {errors.name ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.name}
          </Text>
        ) : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, email: text }))
          }
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
        {errors.email ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.email}
          </Text>
        ) : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Contact number
        </Text>
        <TextInput
          keyboardType="number-pad"
          value={formData.contactNumber}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              contactNumber: text.replace(/\D/g, ""),
            }))
          }
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
        {errors.contactNumber ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.contactNumber}
          </Text>
        ) : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.text }]}>
          Why hire you?
        </Text>
        <TextInput
          multiline
          value={formData.whyHireYou}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, whyHireYou: text }))
          }
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
        {errors.whyHireYou ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errors.whyHireYou}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={submit}
        style={[styles.submitButton, { backgroundColor: colors.buttonPrimary }]}
      >
        <Text style={[styles.submitText, { color: colors.buttonText }]}>
          Submit
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitText: {
    fontWeight: "700",
  },
});
