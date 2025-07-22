import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/stores/authStore';

export default function OnboardingScreen() {
  const { user } = useAuth();
  
  // Empêcher la redirection automatique pendant l'onboarding
  useEffect(() => {
    console.log('📋 OnboardingScreen: User state:', user ? 'Connected' : 'Not connected');
    // Ne pas rediriger automatiquement - laisser l'onboarding se terminer
  }, [user]);

  return (
    <>
      <StatusBar style="dark" />
      <OnboardingContainer />
    </>
  );
}