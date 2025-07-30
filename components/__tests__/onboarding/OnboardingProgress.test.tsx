import React from 'react';
import { render } from '@testing-library/react-native';
import OnboardingProgress from '../../onboarding/OnboardingProgress';

describe('OnboardingProgress', () => {
  it('renders with correct step count', () => {
    const { getByText } = render(
      <OnboardingProgress currentStep={1} totalSteps={4} />
    );
    
    expect(getByText('2 / 4')).toBeTruthy();
  });

  it('handles first step correctly', () => {
    const { getByText } = render(
      <OnboardingProgress currentStep={0} totalSteps={4} />
    );
    
    expect(getByText('1 / 4')).toBeTruthy();
  });

  it('handles last step correctly', () => {
    const { getByText } = render(
      <OnboardingProgress currentStep={3} totalSteps={4} />
    );
    
    expect(getByText('4 / 4')).toBeTruthy();
  });

  it('handles edge case with single step', () => {
    const { getByText } = render(
      <OnboardingProgress currentStep={0} totalSteps={1} />
    );
    
    expect(getByText('1 / 1')).toBeTruthy();
  });

  it('applies correct styling', () => {
    const { getByTestId } = render(
      <OnboardingProgress currentStep={1} totalSteps={4} />
    );
    
    const progressContainer = getByTestId('progress-container');
    expect(progressContainer.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
      })
    );
  });
});
