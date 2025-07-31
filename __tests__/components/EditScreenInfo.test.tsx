import React from 'react';
import { render } from '@testing-library/react-native';
import EditScreenInfo from '@/components/EditScreenInfo';

describe('EditScreenInfo', () => {
  const mockPath = 'app/index.tsx';

  it('renders correctly with path prop', () => {
    const { getByText } = render(
      <EditScreenInfo path={mockPath} />
    );

    expect(getByText('Open up the code for this screen:')).toBeTruthy();
    expect(getByText(mockPath)).toBeTruthy();
    expect(getByText('Change any of the text, save the file, and your app will automatically update.')).toBeTruthy();
    expect(getByText('Tap here if your app doesn\'t automatically update after making changes')).toBeTruthy();
  });

  it('renders with different path values', () => {
    const differentPath = 'components/Profile.tsx';
    const { getByText } = render(
      <EditScreenInfo path={differentPath} />
    );

    expect(getByText(differentPath)).toBeTruthy();
  });

  it('renders with empty path', () => {
    const { getByText } = render(
      <EditScreenInfo path="" />
    );

    expect(getByText('')).toBeTruthy();
  });

  it('renders with long path', () => {
    const longPath = 'app/(protected)/(tabs)/profile.tsx';
    const { getByText } = render(
      <EditScreenInfo path={longPath} />
    );

    expect(getByText(longPath)).toBeTruthy();
  });

  it('renders with path containing special characters', () => {
    const pathWithSpecialChars = 'app/components/Profile-Info.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithSpecialChars} />
    );

    expect(getByText(pathWithSpecialChars)).toBeTruthy();
  });

  it('renders with path containing numbers', () => {
    const pathWithNumbers = 'app/components/Profile1.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithNumbers} />
    );

    expect(getByText(pathWithNumbers)).toBeTruthy();
  });

  it('renders with path containing underscores', () => {
    const pathWithUnderscores = 'app/components/profile_info.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithUnderscores} />
    );

    expect(getByText(pathWithUnderscores)).toBeTruthy();
  });

  it('renders with path containing dots', () => {
    const pathWithDots = 'app/components.profile.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithDots} />
    );

    expect(getByText(pathWithDots)).toBeTruthy();
  });

  it('renders with path containing spaces', () => {
    const pathWithSpaces = 'app/components/Profile Info.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithSpaces} />
    );

    expect(getByText(pathWithSpaces)).toBeTruthy();
  });

  it('renders with path containing parentheses', () => {
    const pathWithParentheses = 'app/(protected)/profile.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithParentheses} />
    );

    expect(getByText(pathWithParentheses)).toBeTruthy();
  });

  it('renders with path containing slashes', () => {
    const pathWithSlashes = 'app/components/profile/index.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithSlashes} />
    );

    expect(getByText(pathWithSlashes)).toBeTruthy();
  });

  it('renders with path containing backslashes', () => {
    const pathWithBackslashes = 'app\\components\\profile.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithBackslashes} />
    );

    expect(getByText(pathWithBackslashes)).toBeTruthy();
  });

  it('renders with path containing mixed separators', () => {
    const pathWithMixedSeparators = 'app/components/profile-info/index.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithMixedSeparators} />
    );

    expect(getByText(pathWithMixedSeparators)).toBeTruthy();
  });

  it('renders with path containing unicode characters', () => {
    const pathWithUnicode = 'app/components/Prófilé.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithUnicode} />
    );

    expect(getByText(pathWithUnicode)).toBeTruthy();
  });

  it('renders with path containing emojis', () => {
    const pathWithEmojis = 'app/components/Profile🚀.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithEmojis} />
    );

    expect(getByText(pathWithEmojis)).toBeTruthy();
  });

  it('renders with very long path', () => {
    const veryLongPath = 'app/components/profile/user/settings/preferences/display/theme/dark/advanced/options.tsx';
    const { getByText } = render(
      <EditScreenInfo path={veryLongPath} />
    );

    expect(getByText(veryLongPath)).toBeTruthy();
  });

  it('renders with path containing file extensions', () => {
    const pathWithExtensions = 'app/components/Profile.jsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithExtensions} />
    );

    expect(getByText(pathWithExtensions)).toBeTruthy();
  });

  it('renders with path containing multiple file extensions', () => {
    const pathWithMultipleExtensions = 'app/components/Profile.test.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithMultipleExtensions} />
    );

    expect(getByText(pathWithMultipleExtensions)).toBeTruthy();
  });

  it('renders with path containing version numbers', () => {
    const pathWithVersion = 'app/components/Profile-v2.1.0.tsx';
    const { getByText } = render(
      <EditScreenInfo path={pathWithVersion} />
    );

    expect(getByText(pathWithVersion)).toBeTruthy();
  });

  it('renders with path containing query parameters', () => {
    const pathWithQuery = 'app/components/Profile?version=1.0.0';
    const { getByText } = render(
      <EditScreenInfo path={pathWithQuery} />
    );

    expect(getByText(pathWithQuery)).toBeTruthy();
  });

  it('renders with path containing hash fragments', () => {
    const pathWithHash = 'app/components/Profile#section1';
    const { getByText } = render(
      <EditScreenInfo path={pathWithHash} />
    );

    expect(getByText(pathWithHash)).toBeTruthy();
  });

  it('renders with path containing all special characters', () => {
    const pathWithAllSpecial = 'app/(protected)/components/Profile-Info_v2.1.0.test.tsx?version=1.0.0#section1';
    const { getByText } = render(
      <EditScreenInfo path={pathWithAllSpecial} />
    );

    expect(getByText(pathWithAllSpecial)).toBeTruthy();
  });
}); 