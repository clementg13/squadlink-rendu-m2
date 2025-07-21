import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Configuration globale pour les tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      {children}
    </SafeAreaProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };

// Mock data helpers with proper types
export const createMockProfile = (overrides: any = {}) => ({
  id_user: 'user1',
  firstname: 'John',
  lastname: 'Doe',
  score: 100,
  fully_completed: false,
  hobbies: [],
  sports: [],
  socialMedias: [],
  ...overrides
});

export const createMockSport = (overrides: any = {}) => ({
  id: 'sport1',
  name: 'Football',
  ...overrides
});

export const createMockSportLevel = (overrides: any = {}) => ({
  id: 'level1',
  name: 'Débutant',
  ...overrides
});

export const createMockSocialMedia = (overrides: any = {}) => ({
  id: 'sm1',
  name: 'Instagram',
  ...overrides
});

export const createMockHobby = (overrides: any = {}) => ({
  id: 'hobby1',
  name: 'Lecture',
  ...overrides
});
