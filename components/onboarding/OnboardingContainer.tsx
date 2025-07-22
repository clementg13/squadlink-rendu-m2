import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { OnboardingData, OnboardingStep } from '@/types/onboarding';
import { useAuth } from '@/stores/authStore';
import OnboardingCredentialsStep from './steps/OnboardingCredentials';
import OnboardingProfileStep from './steps/OnboardingProfile';
import OnboardingSports from './steps/OnboardingSports';
import OnboardingHobbiesStep from './steps/OnboardingHobbies';
import OnboardingCompletion from './steps/OnboardingCompletion';
import OnboardingProgress from './OnboardingProgress';
import OnboardingWelcome from './steps/OnboardingWelcome';

export default function OnboardingContainer() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const { setIsOnboarding } = useAuth();

  // Indiquer qu'on est en onboarding
  useEffect(() => {
    console.log('📋 OnboardingContainer: Setting onboarding mode');
    setIsOnboarding(true);
    
    // Nettoyer quand le composant est démonté
    return () => {
      console.log('📋 OnboardingContainer: Cleaning onboarding mode');
      setIsOnboarding(false);
    };
  }, [setIsOnboarding]);

  const steps: OnboardingStep[] = ['welcome', 'credentials', 'profile', 'sports', 'hobbies', 'completion'];
  const currentStepIndex = steps.indexOf(currentStep);

  const updateOnboardingData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const renderCurrentStep = () => {
    console.log('🔄 OnboardingContainer: Rendering step:', currentStep);
    
    switch (currentStep) {
      case 'welcome':
        return (
          <OnboardingWelcome
            onNext={() => {
              console.log('👋 OnboardingContainer: Welcome completed, proceeding to credentials');
              goToNextStep();
            }}
          />
        );

      case 'credentials':
        return (
          <OnboardingCredentialsStep
            data={onboardingData.credentials}
            onNext={(credentialsData: OnboardingData['credentials'], createdUserId: string) => {
              console.log('📝 OnboardingContainer: Credentials completed, proceeding to profile');
              console.log('📝 OnboardingContainer: User ID received:', createdUserId);
              updateOnboardingData({ credentials: credentialsData });
              setUserId(createdUserId);
              goToNextStep();
            }}
          />
        );
      
      case 'profile':
        console.log('👤 OnboardingContainer: Rendering profile step with userId:', userId);
        if (!userId) {
          console.error('❌ OnboardingContainer: No userId for profile step');
          return null;
        }
        return (
          <OnboardingProfileStep 
            data={onboardingData.profile}
            userId={userId}
            onNext={(profile: OnboardingData['profile']) => {
              console.log('📝 OnboardingContainer: Profile completed, proceeding to sports');
              updateOnboardingData({ profile });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        );
      
      case 'sports':
        return (
          <OnboardingSports
            data={onboardingData.sports}
            userId={userId!}
            onNext={(sports: OnboardingData['sports']) => {
              console.log('🏃 OnboardingContainer: Sports completed, proceeding to hobbies');
              updateOnboardingData({ sports });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        );
      
      case 'hobbies':
        return (
          <OnboardingHobbiesStep
            data={onboardingData.hobbies}
            userId={userId!}
            onNext={(hobbies: OnboardingData['hobbies']) => {
              console.log('🎯 OnboardingContainer: Hobbies completed, proceeding to completion');
              updateOnboardingData({ hobbies });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        );
      
      case 'completion':
        return <OnboardingCompletion />;
      
      default:
        return (
          <OnboardingCredentialsStep
            data={onboardingData.credentials}
            onNext={(credentialsData: OnboardingData['credentials'], createdUserId: string) => {
              updateOnboardingData({ credentials: credentialsData });
              setUserId(createdUserId);
              goToNextStep();
            }}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep !== 'completion' && currentStep !== 'welcome' && (
        <OnboardingProgress 
          currentStep={currentStepIndex} 
          totalSteps={steps.length - 2} // Exclude completion and welcome
        />
      )}
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});