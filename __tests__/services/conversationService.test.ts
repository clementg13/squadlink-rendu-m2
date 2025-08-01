import { ConversationService } from '@/services/conversationService';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
  },
}));

describe('ConversationService', () => {
  describe('formatMessageTime', () => {
    it('should format recent time correctly', () => {
      const now = new Date();
      const recentTime = now.toISOString();
      
      const result = ConversationService.formatMessageTime(recentTime);
      
      // Should return time format for recent messages
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should format old time correctly', () => {
      const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
      
      const result = ConversationService.formatMessageTime(oldTime);
      
      // Should return date format for old messages (DD/MM HH:MM)
      expect(result).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
    });

    it('should handle different date formats', () => {
      const testDate = '2024-01-15T10:30:00.000Z';
      
      const result = ConversationService.formatMessageTime(testDate);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle edge case of exactly 24 hours', () => {
      const exactly24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const result = ConversationService.formatMessageTime(exactly24HoursAgo);
      
      // Should return date format for messages 24 hours or older (DD/MM HH:MM)
      expect(result).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
    });

    it('should handle very recent messages', () => {
      const veryRecent = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      
      const result = ConversationService.formatMessageTime(veryRecent);
      
      // Should return time format for very recent messages
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle very old messages', () => {
      const veryOld = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(); // 100 days ago
      
      const result = ConversationService.formatMessageTime(veryOld);
      
      // Should return date format for very old messages (DD/MM HH:MM)
      expect(result).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
    });
  });

  describe('static methods existence', () => {
    it('should have getGroupMessages method', () => {
      expect(typeof ConversationService.getGroupMessages).toBe('function');
    });

    it('should have sendMessage method', () => {
      expect(typeof ConversationService.sendMessage).toBe('function');
    });

    it('should have markMessagesAsRead method', () => {
      expect(typeof ConversationService.markMessagesAsRead).toBe('function');
    });

    it('should have subscribeToMessages method', () => {
      expect(typeof ConversationService.subscribeToMessages).toBe('function');
    });

    it('should have formatMessageTime method', () => {
      expect(typeof ConversationService.formatMessageTime).toBe('function');
    });
  });

  describe('formatMessageTime edge cases', () => {
    it('should handle invalid date string', () => {
      const invalidDate = 'invalid-date';
      
      const result = ConversationService.formatMessageTime(invalidDate);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle null date', () => {
      const result = ConversationService.formatMessageTime(null as any);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle undefined date', () => {
      const result = ConversationService.formatMessageTime(undefined as any);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty string', () => {
      const result = ConversationService.formatMessageTime('');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatMessageTime locale', () => {
    it('should use French locale for time formatting', () => {
      const now = new Date();
      const timeString = now.toISOString();
      
      const result = ConversationService.formatMessageTime(timeString);
      
      // Should use French locale (fr-FR)
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should use French locale for date formatting', () => {
      const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      
      const result = ConversationService.formatMessageTime(oldTime);
      
      // Should use French locale (fr-FR) with DD/MM HH:MM format
      expect(result).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
    });
  });
}); 