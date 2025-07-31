import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progressPercentage = Math.min(((currentStep + 1) / totalSteps) * 100, 100);

  return (
    <View style={styles.container} testID="progress-bar">
      <View style={styles.header}>
        <Text 
          style={styles.stepText}
          accessibilityLabel={`Étape ${currentStep + 1} sur ${totalSteps}`}
        >
          {currentStep + 1} / {totalSteps}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View 
          style={styles.progressBarBackground} 
          testID="progress-container"
          accessibilityLabel="Barre de progression de l'onboarding"
          accessibilityValue={{ now: progressPercentage, min: 0, max: 100 }}
          accessibilityRole="progressbar"
        >
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%` },
            ]}
            testID="progress-fill"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});
