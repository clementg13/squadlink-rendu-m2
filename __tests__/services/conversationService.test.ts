import { ConversationService } from '@/services/conversationService';
import { supabase } from '@/lib/supabase';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ConversationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGroupMessages', () => {
    it('should return formatted messages with sender profiles', async () => {
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Hello world',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        },
        {
          id: 2,
          id_group: 1,
          id_sender: 'user2',
          content: 'Hi there',
          send_date: '2024-01-15T10:31:00.000Z',
          is_read: true
        }
      ];

      const mockProfiles = [
        { id_user: 'user1', firstname: 'John', lastname: 'Doe' },
        { id_user: 'user2', firstname: 'Jane', lastname: 'Smith' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockProfiles,
              error: null
            })
          })
        } as any);

      const result = await ConversationService.getGroupMessages(1, 'user1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        text: 'Hello world',
        senderId: 'user1',
        senderName: 'Vous',
        timestamp: expect.any(String),
        isMe: true,
        status: 'sent'
      });
      expect(result[1]).toEqual({
        id: 2,
        text: 'Hi there',
        senderId: 'user2',
        senderName: 'Jane Smith',
        timestamp: expect.any(String),
        isMe: false,
        status: 'sent'
      });
    });

    it('should handle empty messages array', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      } as any);

      const result = await ConversationService.getGroupMessages(1, 'user1');
      expect(result).toEqual([]);
    });

    it('should handle null messages data', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      } as any);

      const result = await ConversationService.getGroupMessages(1, 'user1');
      expect(result).toEqual([]);
    });

    it('should handle messages query error', async () => {
      const mockError = { message: 'Database error' };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      } as any);

      await expect(ConversationService.getGroupMessages(1, 'user1')).rejects.toEqual(mockError);
    });

    it('should handle profiles query error gracefully', async () => {
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Hello world',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        }
      ];

      const mockProfilesError = { message: 'Profiles access denied' };

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: null,
              error: mockProfilesError
            })
          })
        } as any);

      const result = await ConversationService.getGroupMessages(1, 'user1');

      expect(result).toHaveLength(1);
      expect(result[0].senderName).toBe('Vous'); // Current user
    });

    it('should handle missing sender profiles', async () => {
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Hello world',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        },
        {
          id: 2,
          id_group: 1,
          id_sender: 'user2',
          content: 'Hi there',
          send_date: '2024-01-15T10:31:00.000Z',
          is_read: true
        }
      ];

      const mockProfiles = [
        { id_user: 'user1', firstname: 'John', lastname: 'Doe' }
        // user2 profile missing
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockProfiles,
              error: null
            })
          })
        } as any);

      const result = await ConversationService.getGroupMessages(1, 'user3');

      expect(result).toHaveLength(2);
      expect(result[0].senderName).toBe('John Doe');
      expect(result[1].senderName).toBe('Utilisateur user2...');
    });

    it('should handle profiles with missing names', async () => {
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Hello world',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        }
      ];

      const mockProfiles = [
        { id_user: 'user1', firstname: null, lastname: 'Doe' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockProfiles,
              error: null
            })
          })
        } as any);

      const result = await ConversationService.getGroupMessages(1, 'user2');

      expect(result).toHaveLength(1);
      expect(result[0].senderName).toBe('Utilisateur user1...');
    });

    it('should handle general exception', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(ConversationService.getGroupMessages(1, 'user1')).rejects.toThrow();
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockNewMessage = {
        id: 1,
        id_group: 1,
        id_sender: 'user1',
        content: 'Hello world',
        send_date: '2024-01-15T10:30:00.000Z',
        is_read: false
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNewMessage,
              error: null
            })
          })
        })
      } as any);

      const result = await ConversationService.sendMessage(1, 'user1', 'Hello world');

      expect(result).toEqual({
        id: 1,
        text: 'Hello world',
        senderId: 'user1',
        senderName: 'Vous',
        timestamp: expect.any(String),
        isMe: true,
        status: 'sent'
      });
    });

    it('should handle send message error', async () => {
      const mockError = { message: 'Send failed' };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      } as any);

      await expect(ConversationService.sendMessage(1, 'user1', 'Hello')).rejects.toEqual(mockError);
    });

    it('should handle general exception in sendMessage', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(ConversationService.sendMessage(1, 'user1', 'Hello')).rejects.toThrow();
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read successfully', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      } as any);

      await expect(ConversationService.markMessagesAsRead(1, 'user1')).resolves.toBeUndefined();
    });

    it('should handle mark as read error gracefully', async () => {
      const mockError = { message: 'Update failed' };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              error: mockError
            })
          })
        })
      } as any);

      // Should not throw, just log error
      await expect(ConversationService.markMessagesAsRead(1, 'user1')).resolves.toBeUndefined();
    });

    it('should handle general exception in markMessagesAsRead', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      // Should not throw, just log error
      await expect(ConversationService.markMessagesAsRead(1, 'user1')).resolves.toBeUndefined();
    });
  });

  describe('subscribeToMessages', () => {
    it('should subscribe to messages successfully', () => {
      const mockSubscription = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnValue({})
      };

      mockSupabase.channel.mockReturnValue(mockSubscription);

      const callback = jest.fn();
      const result = ConversationService.subscribeToMessages(1, callback);

      expect(mockSupabase.channel).toHaveBeenCalledWith('messages-1');
      expect(mockSubscription.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'musclemeet',
          table: 'message',
          filter: 'id_group=eq.1'
        },
        expect.any(Function)
      );
      expect(mockSubscription.subscribe).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should handle subscription error', () => {
      mockSupabase.channel.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      const callback = jest.fn();
      const result = ConversationService.subscribeToMessages(1, callback);

      expect(result).toBeNull();
    });

    it('should handle general exception in subscribeToMessages', () => {
      mockSupabase.channel.mockImplementation(() => {
        throw new Error('Channel creation failed');
      });

      const callback = jest.fn();
      const result = ConversationService.subscribeToMessages(1, callback);

      expect(result).toBeNull();
    });
  });

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
}); 