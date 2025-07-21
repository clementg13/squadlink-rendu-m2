import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { OnboardingData, OnboardingStep } from '@/types/onboarding';
import OnboardingWelcome from './steps/OnboardingWelcome';
import OnboardingCredentials from './steps/OnboardingCredentials';
import OnboardingProfile from './steps/OnboardingProfile';
import OnboardingSports from './steps/OnboardingSports';
import OnboardingGymOrHobbies from './steps/OnboardingGymOrHobbies';
import OnboardingCompletion from './steps/OnboardingCompletion';
import OnboardingProgress from './OnboardingProgress';



export default function OnboardingContainer() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const steps: OnboardingStep[] = ['welcome', 'credentials', 'profile', 'sports', 'gym-or-hobbies', 'completion'];
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
    switch (currentStep) {
      case 'welcome':
        return <OnboardingWelcome onNext={goToNextStep} />;
      
      case 'credentials':
        return (
          <OnboardingCredentials
            data={onboardingData.credentials}
            onNext={(credentialsData: OnboardingData['credentials']) => {
              updateOnboardingData({ credentials: credentialsData });
              goToNextStep();
            }}
            onBack={goToPreviousStep as () => void}
          />
        );
      
      case 'profile':
        return (
          <OnboardingProfile
            data={onboardingData.profile}
            onNext={(profile: OnboardingData['profile']) => {
              updateOnboardingData({ profile });
              goToNextStep();
            }}
            onBack={goToPreviousStep as () => void}
          />
        );
      
      case 'sports':
        return (
          <OnboardingSports
            data={onboardingData.sports}
            onNext={(sports: OnboardingData['sports']) => {
              updateOnboardingData({ sports });
              goToNextStep();
            }}
            onBack={goToPreviousStep as () => void}
          />
        );
      
      case 'gym-or-hobbies':
        return (
          <OnboardingGymOrHobbies
            sports={onboardingData.sports || []}
            gymData={onboardingData.gym}
            hobbiesData={onboardingData.hobbies}
            onNext={(gymAndHobbies: { gym?: OnboardingData['gym']; hobbies?: OnboardingData['hobbies'] }) => {
              updateOnboardingData(gymAndHobbies);
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        );
      
      case 'completion':
        return (
          <OnboardingCompletion
            onboardingData={onboardingData as OnboardingData}
          />
        );
      
      default:
        return <OnboardingWelcome onNext={goToNextStep} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep !== 'welcome' && currentStep !== 'completion' && (
        <OnboardingProgress 
          currentStep={currentStepIndex} 
          totalSteps={steps.length - 2} // Exclude welcome and completion
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
