import { MessageService } from '@/services/MessagesService';
import { Conversation, DatabaseMessage } from '@/types/messaging';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('MessageService', () => {
  describe('formatDate', () => {
    it('should format recent time as "À l\'instant"', () => {
      const now = new Date();
      const recentTime = now.toISOString();
      
      // Test avec une date très récente (moins d'une minute)
      const result = MessageService['formatDate'](recentTime);
      
      expect(result).toBe('À l\'instant');
    });

    it('should format time in minutes', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](fiveMinutesAgo);
      
      expect(result).toBe('5m');
    });

    it('should format time in hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](twoHoursAgo);
      
      expect(result).toBe('2h');
    });

    it('should format time in days', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](threeDaysAgo);
      
      expect(result).toBe('3j');
    });

    it('should format old dates with locale', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago
      
      const result = MessageService['formatDate'](oldDate);
      
      // Should return DD/MM format
      expect(result).toMatch(/^\d{2}\/\d{2}$/);
    });

    it('should handle edge case of exactly 1 minute', () => {
      const exactlyOneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](exactlyOneMinuteAgo);
      
      expect(result).toBe('1m');
    });

    it('should handle edge case of exactly 1 hour', () => {
      const exactlyOneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](exactlyOneHourAgo);
      
      expect(result).toBe('1h');
    });

    it('should handle edge case of exactly 1 day', () => {
      const exactlyOneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](exactlyOneDayAgo);
      
      expect(result).toBe('1j');
    });

    it('should handle edge case of exactly 7 days', () => {
      const exactlySevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](exactlySevenDaysAgo);
      
      // Should return DD/MM format for 7 days or more
      expect(result).toMatch(/^\d{2}\/\d{2}$/);
    });
  });

  describe('static methods existence', () => {
    it('should have getUserConversations method', () => {
      expect(typeof MessageService.getUserConversations).toBe('function');
    });

    it('should have private formatDate method', () => {
      expect(typeof MessageService['formatDate']).toBe('function');
    });
  });

  describe('formatDate edge cases', () => {
    it('should handle invalid date string', () => {
      const invalidDate = 'invalid-date';
      
      const result = MessageService['formatDate'](invalidDate);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle null date', () => {
      const result = MessageService['formatDate'](null as any);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle undefined date', () => {
      const result = MessageService['formatDate'](undefined as any);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty string', () => {
      const result = MessageService['formatDate']('');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDate time ranges', () => {
    it('should handle very recent time (less than 1 minute)', () => {
      const veryRecent = new Date(Date.now() - 30 * 1000).toISOString(); // 30 seconds ago
      
      const result = MessageService['formatDate'](veryRecent);
      
      expect(result).toBe('À l\'instant');
    });

    it('should handle time between 1 and 59 minutes', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](thirtyMinutesAgo);
      
      expect(result).toBe('30m');
    });

    it('should handle time between 1 and 23 hours', () => {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](twelveHoursAgo);
      
      expect(result).toBe('12h');
    });

    it('should handle time between 1 and 6 days', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](fiveDaysAgo);
      
      expect(result).toBe('5j');
    });

    it('should handle time 7 days or more', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      
      const result = MessageService['formatDate'](tenDaysAgo);
      
      // Should return DD/MM format
      expect(result).toMatch(/^\d{2}\/\d{2}$/);
    });
  });

  describe('formatDate locale', () => {
    it('should use French locale for date formatting', () => {
      const oldDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(); // 15 days ago
      
      const result = MessageService['formatDate'](oldDate);
      
      // Should use French locale (fr-FR) with DD/MM format
      expect(result).toMatch(/^\d{2}\/\d{2}$/);
    });
  });

  describe('formatDate precision', () => {
    it('should handle milliseconds precision', () => {
      const now = new Date();
      const recentTime = now.toISOString();
      
      const result = MessageService['formatDate'](recentTime);
      
      expect(result).toBe('À l\'instant');
    });

    it('should handle different time zones', () => {
      const utcDate = '2024-01-15T10:30:00.000Z';
      
      const result = MessageService['formatDate'](utcDate);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
}); 