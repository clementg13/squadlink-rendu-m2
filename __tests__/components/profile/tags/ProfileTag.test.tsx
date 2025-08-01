import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileTag from '@/components/profile/tags/ProfileTag';

describe('ProfileTag', () => {
  it('renders text correctly', () => {
    const { getByText } = render(
      <ProfileTag text="Test Tag" />
    );

    expect(getByText('Test Tag')).toBeTruthy();
  });

  it('renders with hobby variant by default', () => {
    const { getByText } = render(
      <ProfileTag text="Hobby Tag" />
    );

    expect(getByText('Hobby Tag')).toBeTruthy();
  });

  it('renders with sport variant', () => {
    const { getByText } = render(
      <ProfileTag text="Sport Tag" variant="sport" />
    );

    expect(getByText('Sport Tag')).toBeTruthy();
  });

  it('renders with location variant', () => {
    const { getByText } = render(
      <ProfileTag text="Location Tag" variant="location" />
    );

    expect(getByText('Location Tag')).toBeTruthy();
  });

  it('renders with social variant', () => {
    const { getByText } = render(
      <ProfileTag text="Social Tag" variant="social" />
    );

    expect(getByText('Social Tag')).toBeTruthy();
  });

  it('renders with gym variant', () => {
    const { getByText } = render(
      <ProfileTag text="Gym Tag" variant="gym" />
    );

    expect(getByText('Gym Tag')).toBeTruthy();
  });

  it('renders with age variant', () => {
    const { getByText } = render(
      <ProfileTag text="Age Tag" variant="age" />
    );

    expect(getByText('Age Tag')).toBeTruthy();
  });

  it('renders with small size', () => {
    const { getByText } = render(
      <ProfileTag text="Small Tag" size="small" />
    );

    expect(getByText('Small Tag')).toBeTruthy();
  });

  it('renders with medium size by default', () => {
    const { getByText } = render(
      <ProfileTag text="Medium Tag" />
    );

    expect(getByText('Medium Tag')).toBeTruthy();
  });

  it('renders highlighted tag correctly', () => {
    const { getByText } = render(
      <ProfileTag text="Highlighted Tag" highlighted={true} />
    );

    expect(getByText('Highlighted Tag')).toBeTruthy();
  });

  it('renders non-highlighted tag correctly', () => {
    const { getByText } = render(
      <ProfileTag text="Normal Tag" highlighted={false} />
    );

    expect(getByText('Normal Tag')).toBeTruthy();
  });

  it('handles long text with numberOfLines', () => {
    const longText = 'This is a very long tag text that should be truncated';
    const { getByText } = render(
      <ProfileTag text={longText} />
    );

    expect(getByText(longText)).toBeTruthy();
  });

  it('renders with different variants and sizes', () => {
    const { getByText: getByTextSport } = render(
      <ProfileTag text="Sport Small" variant="sport" size="small" />
    );

    const { getByText: getByTextLocation } = render(
      <ProfileTag text="Location Medium" variant="location" size="medium" />
    );

    expect(getByTextSport('Sport Small')).toBeTruthy();
    expect(getByTextLocation('Location Medium')).toBeTruthy();
  });

  it('renders highlighted tag with different variants', () => {
    const { getByText: getByTextHobby } = render(
      <ProfileTag text="Highlighted Hobby" variant="hobby" highlighted={true} />
    );

    const { getByText: getByTextSport } = render(
      <ProfileTag text="Highlighted Sport" variant="sport" highlighted={true} />
    );

    expect(getByTextHobby('Highlighted Hobby')).toBeTruthy();
    expect(getByTextSport('Highlighted Sport')).toBeTruthy();
  });

  it('handles empty text gracefully', () => {
    const { getByText } = render(
      <ProfileTag text="" />
    );

    expect(getByText('')).toBeTruthy();
  });

  it('handles special characters in text', () => {
    const specialText = 'Tag with émojis 🏃‍♂️ and accents';
    const { getByText } = render(
      <ProfileTag text={specialText} />
    );

    expect(getByText(specialText)).toBeTruthy();
  });

  it('applies correct styling for different variants', () => {
    const { getByText: getByTextHobby } = render(
      <ProfileTag text="Hobby" variant="hobby" />
    );

    const { getByText: getByTextSport } = render(
      <ProfileTag text="Sport" variant="sport" />
    );

    const { getByText: getByTextLocation } = render(
      <ProfileTag text="Location" variant="location" />
    );

    expect(getByTextHobby('Hobby')).toBeTruthy();
    expect(getByTextSport('Sport')).toBeTruthy();
    expect(getByTextLocation('Location')).toBeTruthy();
  });

  it('applies correct styling for highlighted state', () => {
    const { getByText } = render(
      <ProfileTag text="Highlighted" highlighted={true} />
    );

    const tagElement = getByText('Highlighted').parent;
    expect(tagElement).toBeTruthy();
  });

  it('applies correct styling for non-highlighted state', () => {
    const { getByText } = render(
      <ProfileTag text="Normal" highlighted={false} />
    );

    const tagElement = getByText('Normal').parent;
    expect(tagElement).toBeTruthy();
  });

  it('renders with all combinations of props', () => {
    const { getByText } = render(
      <ProfileTag 
        text="Complete Tag" 
        variant="social" 
        highlighted={true} 
        size="small" 
      />
    );

    expect(getByText('Complete Tag')).toBeTruthy();
  });
}); 