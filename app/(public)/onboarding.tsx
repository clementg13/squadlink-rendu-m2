import React from 'react';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';

export default function OnboardingScreen() {
  return (
    <SafeAreaWrapper backgroundColor="#fff" statusBarStyle="dark">
      <OnboardingContainer />
    </SafeAreaWrapper>
  );
}