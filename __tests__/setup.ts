import { jest } from '@jest/globals';

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

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  SafeAreaView: 'SafeAreaView',
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
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

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
  Feather: 'Feather',
  Entypo: 'Entypo',
  EvilIcons: 'EvilIcons',
  FontAwesome5: 'FontAwesome5',
  Foundation: 'Foundation',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Octicons: 'Octicons',
  SimpleLineIcons: 'SimpleLineIcons',
  Zocial: 'Zocial',
}));

// Mock useColorScheme
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

// Mock react-native with comprehensive implementation
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: any) => obj.ios),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  },
  // Composants de base
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  ScrollView: 'ScrollView',
  FlatList: ({ data, renderItem, keyExtractor, ...props }: any) => {
    // Mock FlatList qui rend ses éléments
    const React = require('react');
    return React.createElement('View', props, 
      data?.map((item: any, index: number) => 
        React.createElement('View', { key: keyExtractor ? keyExtractor(item, index) : index }, 
          renderItem({ item, index })
        )
      )
    );
  },
  Image: 'Image',
  TextInput: 'TextInput',
  Modal: 'Modal',
  Pressable: 'Pressable',
  Switch: 'Switch',
  Slider: 'Slider',
  ActivityIndicator: 'ActivityIndicator',
  RefreshControl: 'RefreshControl',
  StatusBar: 'StatusBar',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  SafeAreaView: 'SafeAreaView',
                // Animated
              Animated: {
                Value: jest.fn(() => ({
                  setValue: jest.fn(),
                  start: jest.fn(),
                })),
                timing: jest.fn(() => ({
                  start: jest.fn(),
                })),
                spring: jest.fn(() => ({
                  start: jest.fn(),
                })),
                sequence: jest.fn(() => ({
                  start: jest.fn(),
                })),
                View: 'Animated.View',
                Text: 'Animated.Text',
                Image: 'Animated.Image',
                ScrollView: 'Animated.ScrollView',
              },
  // Layout
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Presets: {
      easeInEaseOut: {},
      linear: {},
      spring: {},
    },
  },
  // Interaction
  PanResponder: {
    create: jest.fn(),
  },
  // Linking
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
  },
  // Permissions
  PermissionsAndroid: {
    request: jest.fn(),
    PERMISSIONS: {},
    RESULTS: {},
  },
  // BackHandler
  BackHandler: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  // AppState
  AppState: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    currentState: 'active',
  },
  // NetInfo
  NetInfo: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    fetch: jest.fn(),
  },
}));

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
