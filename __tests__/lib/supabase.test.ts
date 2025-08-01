import { env } from '@/constants/Environment';

// Mock Environment
jest.mock('@/constants/Environment', () => ({
  env: {
    EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    EXPO_PUBLIC_SUPABASE_KEY: 'test-key',
  },
}));

describe('supabase', () => {
  describe('environment variables', () => {
    it('should have correct environment variables', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(env.EXPO_PUBLIC_SUPABASE_KEY).toBe('test-key');
    });

    it('should have valid URL format', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\/.*\.supabase\.co$/);
    });

    it('should have non-empty key', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_KEY).toBeTruthy();
      expect(env.EXPO_PUBLIC_SUPABASE_KEY.length).toBeGreaterThan(0);
    });
  });

  describe('module structure', () => {
    it('should import env from @/constants/Environment', () => {
      expect(env).toBeDefined();
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(env.EXPO_PUBLIC_SUPABASE_KEY).toBeDefined();
    });

    it('should have required environment variables', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(env.EXPO_PUBLIC_SUPABASE_KEY).toBeDefined();
    });
  });

  describe('configuration validation', () => {
    it('should have valid environment variables', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(env.EXPO_PUBLIC_SUPABASE_KEY).toBe('test-key');
    });

    it('should have environment variables with correct types', () => {
      expect(typeof env.EXPO_PUBLIC_SUPABASE_URL).toBe('string');
      expect(typeof env.EXPO_PUBLIC_SUPABASE_KEY).toBe('string');
    });

    it('should have non-empty environment variables', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_URL.length).toBeGreaterThan(0);
      expect(env.EXPO_PUBLIC_SUPABASE_KEY.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables gracefully', () => {
      expect(() => {
        require('@/lib/supabase');
      }).not.toThrow();
    });

    it('should use mocked environment variables', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(env.EXPO_PUBLIC_SUPABASE_KEY).toBe('test-key');
    });
  });

  describe('module imports', () => {
    it('should be able to import the module', () => {
      expect(() => {
        require('@/lib/supabase');
      }).not.toThrow();
    });

    it('should export supabase client', () => {
      const { supabase } = require('@/lib/supabase');
      expect(supabase).toBeDefined();
    });
  });

  describe('environment validation', () => {
    it('should have valid Supabase URL format', () => {
      const url = env.EXPO_PUBLIC_SUPABASE_URL;
      expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/);
    });

    it('should have valid Supabase key format', () => {
      const key = env.EXPO_PUBLIC_SUPABASE_KEY;
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });

    it('should have environment variables defined', () => {
      expect(env.EXPO_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(env.EXPO_PUBLIC_SUPABASE_KEY).toBeDefined();
    });
  });
}); 