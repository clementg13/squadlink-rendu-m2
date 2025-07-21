import React from 'react';
import { StatusBar } from 'expo-status-bar';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';

export default function OnboardingScreen() {
  return (
    <>
      <StatusBar style="dark" />
      <OnboardingContainer />
    </>
  );
}
