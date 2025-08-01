import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';

// Mock useColorScheme
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

describe('Themed Components', () => {
  const mockUseColorScheme = require('@/components/useColorScheme').useColorScheme;

  beforeEach(() => {
    mockUseColorScheme.mockClear();
  });

  describe('useThemeColor', () => {
    it('returns light color when theme is light', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const result = useThemeColor({ light: '#ff0000', dark: '#00ff00' }, 'text');
      
      expect(result).toBe('#ff0000');
    });

    it('returns dark color when theme is dark', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const result = useThemeColor({ light: '#ff0000', dark: '#00ff00' }, 'text');
      
      expect(result).toBe('#00ff00');
    });

    it('returns default color from Colors when no prop color is provided for light theme', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const result = useThemeColor({}, 'text');
      
      expect(result).toBe(Colors.light.text);
    });

    it('returns default color from Colors when no prop color is provided for dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const result = useThemeColor({}, 'background');
      
      expect(result).toBe(Colors.dark.background);
    });

    it('returns default color from Colors when no props are provided for light theme', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const result = useThemeColor({}, 'tint');
      
      expect(result).toBe(Colors.light.tint);
    });

    it('returns default color from Colors when no props are provided for dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const result = useThemeColor({}, 'tint');
      
      expect(result).toBe(Colors.dark.tint);
    });

    it('handles undefined theme by defaulting to light', () => {
      mockUseColorScheme.mockReturnValue(undefined);
      
      const result = useThemeColor({ light: '#ff0000', dark: '#00ff00' }, 'text');
      
      expect(result).toBe('#ff0000');
    });

    it('handles null theme by defaulting to light', () => {
      mockUseColorScheme.mockReturnValue(null);
      
      const result = useThemeColor({ light: '#ff0000', dark: '#00ff00' }, 'text');
      
      expect(result).toBe('#ff0000');
    });

    it('works with all color keys', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const textResult = useThemeColor({}, 'text');
      const backgroundResult = useThemeColor({}, 'background');
      const tintResult = useThemeColor({}, 'tint');
      const tabIconDefaultResult = useThemeColor({}, 'tabIconDefault');
      const tabIconSelectedResult = useThemeColor({}, 'tabIconSelected');
      
      expect(textResult).toBe(Colors.light.text);
      expect(backgroundResult).toBe(Colors.light.background);
      expect(tintResult).toBe(Colors.light.tint);
      expect(tabIconDefaultResult).toBe(Colors.light.tabIconDefault);
      expect(tabIconSelectedResult).toBe(Colors.light.tabIconSelected);
    });

    it('works with all color keys for dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const textResult = useThemeColor({}, 'text');
      const backgroundResult = useThemeColor({}, 'background');
      const tintResult = useThemeColor({}, 'tint');
      const tabIconDefaultResult = useThemeColor({}, 'tabIconDefault');
      const tabIconSelectedResult = useThemeColor({}, 'tabIconSelected');
      
      expect(textResult).toBe(Colors.dark.text);
      expect(backgroundResult).toBe(Colors.dark.background);
      expect(tintResult).toBe(Colors.dark.tint);
      expect(tabIconDefaultResult).toBe(Colors.dark.tabIconDefault);
      expect(tabIconSelectedResult).toBe(Colors.dark.tabIconSelected);
    });
  });

  describe('Text Component', () => {
    it('renders with light theme colors', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <Text>Test Text</Text>
      );
      
      expect(getByText('Test Text')).toBeTruthy();
    });

    it('renders with dark theme colors', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const { getByText } = render(
        <Text>Test Text</Text>
      );
      
      expect(getByText('Test Text')).toBeTruthy();
    });

    it('renders with custom light color', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <Text lightColor="#ff0000">Custom Light Text</Text>
      );
      
      expect(getByText('Custom Light Text')).toBeTruthy();
    });

    it('renders with custom dark color', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const { getByText } = render(
        <Text darkColor="#00ff00">Custom Dark Text</Text>
      );
      
      expect(getByText('Custom Dark Text')).toBeTruthy();
    });

    it('renders with custom style', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <Text style={{ fontSize: 20 }}>Styled Text</Text>
      );
      
      expect(getByText('Styled Text')).toBeTruthy();
    });

    it('renders with both custom colors and style', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <Text 
          lightColor="#ff0000" 
          darkColor="#00ff00" 
          style={{ fontSize: 20 }}
        >
          Complex Text
        </Text>
      );
      
      expect(getByText('Complex Text')).toBeTruthy();
    });

    it('handles undefined theme', () => {
      mockUseColorScheme.mockReturnValue(undefined);
      
      const { getByText } = render(
        <Text>Undefined Theme Text</Text>
      );
      
      expect(getByText('Undefined Theme Text')).toBeTruthy();
    });

    it('handles null theme', () => {
      mockUseColorScheme.mockReturnValue(null);
      
      const { getByText } = render(
        <Text>Null Theme Text</Text>
      );
      
      expect(getByText('Null Theme Text')).toBeTruthy();
    });
  });

  describe('View Component', () => {
    it('renders with light theme colors', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByTestId } = render(
        <View testID="test-view">Test Content</View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('renders with dark theme colors', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const { getByTestId } = render(
        <View testID="test-view">Test Content</View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('renders with custom light background color', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByTestId } = render(
        <View testID="test-view" lightColor="#ff0000">
          Custom Light Background
        </View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('renders with custom dark background color', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      const { getByTestId } = render(
        <View testID="test-view" darkColor="#00ff00">
          Custom Dark Background
        </View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('renders with custom style', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByTestId } = render(
        <View testID="test-view" style={{ padding: 10 }}>
          Styled View
        </View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('renders with both custom colors and style', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByTestId } = render(
        <View 
          testID="test-view"
          lightColor="#ff0000" 
          darkColor="#00ff00" 
          style={{ padding: 10 }}
        >
          Complex View
        </View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('handles undefined theme', () => {
      mockUseColorScheme.mockReturnValue(undefined);
      
      const { getByTestId } = render(
        <View testID="test-view">Undefined Theme View</View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('handles null theme', () => {
      mockUseColorScheme.mockReturnValue(null);
      
      const { getByTestId } = render(
        <View testID="test-view">Null Theme View</View>
      );
      
      expect(getByTestId('test-view')).toBeTruthy();
    });

    it('renders children correctly', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <View testID="test-view">
          <Text>Child Text</Text>
        </View>
      );
      
      expect(getByText('Child Text')).toBeTruthy();
    });

    it('renders multiple children correctly', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <View testID="test-view">
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </View>
      );
      
      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });
  });
}); 