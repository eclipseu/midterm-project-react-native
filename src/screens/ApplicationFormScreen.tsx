import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { IndeedButton } from "../components/common/IndeedButton";
import { IndeedCard } from "../components/common/IndeedCard";
import { IndeedInput } from "../components/common/IndeedInput";
import { useApplicationTracking } from "../context/ApplicationTrackingContext";
import { useTheme } from "../context/ThemeContext";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ApplicationForm">;

type FormData = {
  name: string;
  email: string;
  phoneNumber: string;
  whyHireYou: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  whyHireYou?: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  phoneNumber: "",
  whyHireYou: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxChars = 500;

export function ApplicationFormScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { jobId, source } = route.params;
  const { getJobById, markAsApplied } = useApplicationTracking();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const job = getJobById(jobId);
  const jobTitle = job?.title || "This role";
  const companyName = job?.companyName || job?.company || "Company";

  const phoneDigits = formData.phoneNumber.replace(/\D/g, "");

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (formData.name.trim().length === 0) {
      nextErrors.name = "Name is required.";
    }

    if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (phoneDigits.length < 10) {
      nextErrors.phoneNumber = "Phone number must be at least 10 digits.";
    }

    if (formData.whyHireYou.trim().length === 0) {
      nextErrors.whyHireYou = "This field is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      emailRegex.test(formData.email.trim()) &&
      phoneDigits.length >= 10 &&
      formData.whyHireYou.trim().length > 0
    );
  }, [formData.email, formData.name, formData.whyHireYou, phoneDigits.length]);

  const submit = async () => {
    if (!validate()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSubmitting(true);

    try {
      await markAsApplied(jobId);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowSuccess(true);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismissSuccess = () => {
    setShowSuccess(false);
    resetForm();

    if (source === "savedJobs") {
      navigation.navigate("MainTabs", {
        screen: "JobFinder",
      });
      return;
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scroller}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={[styles.backText, { color: colors.primary }]}>‹</Text>
          </Pressable>

          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            Apply to {companyName}
          </Text>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            {jobTitle}
          </Text>

          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            Step 1 of 1
          </Text>

          <IndeedCard style={styles.sectionCard}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Full name
            </Text>
            <IndeedInput
              value={formData.name}
              onChangeText={(name) =>
                setFormData((prev) => ({ ...prev, name }))
              }
              placeholder="Enter your name"
            />
            {errors.name ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.name}
              </Text>
            ) : null}

            <Text
              style={[
                styles.label,
                styles.spacedLabel,
                { color: colors.textPrimary },
              ]}
            >
              Email address
            </Text>
            <IndeedInput
              value={formData.email}
              onChangeText={(email) =>
                setFormData((prev) => ({ ...prev, email }))
              }
              placeholder="name@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.email}
              </Text>
            ) : null}

            <Text
              style={[
                styles.label,
                styles.spacedLabel,
                { color: colors.textPrimary },
              ]}
            >
              Phone number
            </Text>
            <IndeedInput
              value={formData.phoneNumber}
              onChangeText={(phoneNumber) =>
                setFormData((prev) => ({ ...prev, phoneNumber }))
              }
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.phoneNumber}
              </Text>
            ) : null}
          </IndeedCard>

          <IndeedCard style={styles.sectionCard}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Why should we hire you?
            </Text>
            <View
              style={[
                styles.multiWrap,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <IndeedInput
                value={formData.whyHireYou}
                onChangeText={(whyHireYou) =>
                  setFormData((prev) => ({
                    ...prev,
                    whyHireYou: whyHireYou.slice(0, maxChars),
                  }))
                }
                placeholder="Tell us why you are a strong fit"
                multiline
                inputStyle={styles.multiInput}
              />
            </View>
            <Text style={[styles.counter, { color: colors.textSecondary }]}>
              {formData.whyHireYou.length} / {maxChars}
            </Text>
            {errors.whyHireYou ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.whyHireYou}
              </Text>
            ) : null}
          </IndeedCard>

          <IndeedCard style={styles.sectionCard}>
            <View style={styles.resumeHeader}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Attach resume
              </Text>
              <Text style={[styles.optional, { color: colors.textSecondary }]}>
                Optional
              </Text>
            </View>
            <IndeedButton
              label="Attach resume"
              onPress={() => {}}
              variant="ghost"
            />
          </IndeedCard>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Pressable
            disabled={submitting}
            onPress={() => {
              void submit();
            }}
            style={[
              styles.submitButton,
              {
                backgroundColor:
                  !isFormValid || submitting
                    ? colors.buttonSecondary
                    : colors.buttonPrimary,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <Text style={[styles.submitText, { color: colors.buttonText }]}>
                Submit application
              </Text>
            )}
          </Pressable>
        </View>

        <Modal
          visible={showSuccess}
          transparent
          animationType="fade"
          onRequestClose={handleDismissSuccess}
        >
          <View style={styles.modalRoot}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.successIcon}>✅</Text>
              <Text
                style={[styles.successTitle, { color: colors.textPrimary }]}
              >
                Application submitted!
              </Text>
              <Text
                style={[styles.successBody, { color: colors.textSecondary }]}
              >
                Good luck with your application.
              </Text>
              <IndeedButton
                label="Okay"
                onPress={handleDismissSuccess}
                variant="primary"
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
    gap: 24,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backText: {
    fontSize: 30,
    fontWeight: "700",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
  },
  caption: {
    fontSize: 14,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: -14,
  },
  sectionCard: {
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  spacedLabel: {
    marginTop: 12,
  },
  multiWrap: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 120,
    justifyContent: "flex-start",
  },
  multiInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
  },
  counter: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "right",
  },
  resumeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optional: {
    fontSize: 12,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  submitButton: {
    borderRadius: 8,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    fontWeight: "700",
    fontSize: 15,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  successIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  successBody: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
});
