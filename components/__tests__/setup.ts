import 'react-native-gesture-handler/jestSetup';
import { jest } from '@jest/globals';

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock all profile actions
jest.mock('../../stores/profile/profileActions', () => ({
  createProfileActions: () => ({
    setProfile: jest.fn(),
    setLoading: jest.fn(),
    setSaving: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    loadProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateLocation: jest.fn(),
    handleError: jest.fn(),
  }),
}));

jest.mock('../../stores/profile/hobbyActions', () => ({
  createHobbyActions: () => ({
    addUserHobby: jest.fn(),
    removeUserHobby: jest.fn(),
    toggleHighlightHobby: jest.fn(),
  }),
}));

jest.mock('../../stores/profile/sportActions', () => ({
  createSportActions: () => ({
    addUserSport: jest.fn(),
    removeUserSport: jest.fn(),
  }),
}));

jest.mock('../../stores/profile/socialMediaActions', () => ({
  createSocialMediaActions: () => ({
    addUserSocialMedia: jest.fn(),
    updateUserSocialMedia: jest.fn(),
    removeUserSocialMedia: jest.fn(),
  }),
}));

jest.mock('../../stores/profile/dataActions', () => ({
  createDataActions: () => ({
    loadAllGyms: jest.fn(),
    loadGymSubscriptions: jest.fn(),
    loadAllHobbies: jest.fn(),
    loadAllSports: jest.fn(),
    loadAllSportLevels: jest.fn(),
    loadAllSocialMedias: jest.fn(),
    initialize: jest.fn(),
    cleanup: jest.fn(),
  }),
}));

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn(),
    })),
  },
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native') as object;
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch for API calls
global.fetch = jest.fn(() => Promise.resolve({ 
  json: () => Promise.resolve({}), 
  ok: true, 
  status: 200 
} as Response));

// Setup global test timeout
jest.setTimeout(10000);
