import { useColorScheme } from '@/components/useColorScheme';

describe('useColorScheme', () => {
  it('exports useColorScheme from react-native', () => {
    // Test that the module exports the useColorScheme function
    expect(typeof useColorScheme).toBe('function');
  });

  it('can be called without parameters', () => {
    // Test that the function can be called
    expect(() => useColorScheme()).not.toThrow();
  });

  it('returns a value when called', () => {
    const result = useColorScheme();
    expect(result).toBeDefined();
  });

  it('returns a string value', () => {
    const result = useColorScheme();
    expect(typeof result).toBe('string');
  });

  it('returns either light or dark theme', () => {
    const result = useColorScheme();
    expect(['light', 'dark']).toContain(result);
  });

  it('returns consistent value on multiple calls', () => {
    const result1 = useColorScheme();
    const result2 = useColorScheme();
    expect(result1).toBe(result2);
  });

  it('handles multiple calls without errors', () => {
    expect(() => {
      useColorScheme();
      useColorScheme();
      useColorScheme();
    }).not.toThrow();
  });

  it('returns light theme by default', () => {
    const result = useColorScheme();
    expect(result).toBe('light');
  });

  it('can be called in different contexts', () => {
    const testFunction = () => useColorScheme();
    const testArrowFunction = () => useColorScheme();
    
    expect(testFunction()).toBe('light');
    expect(testArrowFunction()).toBe('light');
  });

  it('works with destructuring', () => {
    const { useColorScheme: destructuredUseColorScheme } = require('@/components/useColorScheme');
    expect(destructuredUseColorScheme()).toBe('light');
  });

  it('works with require syntax', () => {
    const useColorSchemeModule = require('@/components/useColorScheme');
    expect(useColorSchemeModule.useColorScheme()).toBe('light');
  });
}); 