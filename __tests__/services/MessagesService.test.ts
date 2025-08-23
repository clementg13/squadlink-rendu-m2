import { MessageService } from '@/services/MessagesService';
import { supabase } from '@/lib/supabase';
import { Conversation, DatabaseMessage } from '@/types/messaging';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('MessageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserConversations', () => {
    it('should return conversations with group info and messages', async () => {
      const mockUserGroups = [
        { id_group: 1 },
        { id_group: 2 }
      ];

      const mockGroups = [
        { id: 1, name: 'Groupe Sport', description: 'Groupe pour le sport' },
        { id: 2, name: 'Groupe Musique', description: 'Groupe pour la musique' }
      ];

      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Salut tout le monde !',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        },
        {
          id: 2,
          id_group: 1,
          id_sender: 'user2',
          content: 'Bonjour !',
          send_date: '2024-01-15T11:00:00.000Z',
          is_read: true
        },
        {
          id: 3,
          id_group: 2,
          id_sender: 'user1',
          content: 'Qui fait de la musique ?',
          send_date: '2024-01-15T12:00:00.000Z',
          is_read: false
        }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any);

      const result = await MessageService.getUserConversations('user1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Groupe Sport',
        lastMessage: 'Bonjour !',
        lastMessageTime: expect.any(String),
        unreadCount: 0, // Le message de user2 est marqué comme lu
        isGroup: true,
        isOnline: expect.any(Boolean)
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Groupe Musique',
        lastMessage: 'Qui fait de la musique ?',
        lastMessageTime: expect.any(String),
        unreadCount: 0, // Le message de user1 est marqué comme non lu mais c'est l'utilisateur actuel
        isGroup: true,
        isOnline: expect.any(Boolean)
      });
    });

    it('should handle empty user groups', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } as any);

      const result = await MessageService.getUserConversations('user1');
      expect(result).toEqual([]);
    });

    it('should handle user groups query error', async () => {
      const mockError = { message: 'Database error' };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      } as any);

      const result = await MessageService.getUserConversations('user1');
      expect(result).toEqual([]);
    });

    it('should handle groups query error gracefully', async () => {
      const mockUserGroups = [{ id_group: 1 }];
      const mockGroupsError = { message: 'Groups access denied' };

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: null,
              error: mockGroupsError
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        } as any);

      const result = await MessageService.getUserConversations('user1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Groupe 1');
    });

    it('should handle messages query error gracefully', async () => {
      const mockUserGroups = [{ id_group: 1 }];
      const mockGroups = [{ id: 1, name: 'Groupe Test' }];
      const mockMessagesError = { message: 'Messages access denied' };

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: mockMessagesError
              })
            })
          })
        } as any);

      const result = await MessageService.getUserConversations('user1');

      expect(result).toHaveLength(1);
      expect(result[0].lastMessage).toBe('Soyez le premier à écrire');
      expect(result[0].lastMessageTime).toBe('');
    });

    it('should handle conversation without group info', async () => {
      const mockUserGroups = [{ id_group: 1 }];
      const mockGroups = []; // Pas d'info de groupe
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Salut !',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        },
        {
          id: 2,
          id_group: 1,
          id_sender: 'user2',
          content: 'Bonjour !',
          send_date: '2024-01-15T11:00:00.000Z',
          is_read: true
        }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any);

      const result = await MessageService.getUserConversations('user1');

      // Quand il n'y a pas d'infos de groupe, aucune conversation n'est créée
      expect(result).toHaveLength(0);
    });

    it('should handle single participant conversation', async () => {
      const mockUserGroups = [{ id_group: 1 }];
      const mockGroups = [];
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Salut !',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any);

      const result = await MessageService.getUserConversations('user1');

      // Quand il n'y a pas d'infos de groupe, aucune conversation n'est créée
      expect(result).toHaveLength(0);
    });

    it('should handle two participant conversation', async () => {
      const mockUserGroups = [{ id_group: 1 }];
      const mockGroups = [];
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1',
          content: 'Salut !',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        },
        {
          id: 2,
          id_group: 1,
          id_sender: 'user2',
          content: 'Bonjour !',
          send_date: '2024-01-15T11:00:00.000Z',
          is_read: true
        }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any);

      const result = await MessageService.getUserConversations('user1');

      // Quand il n'y a pas d'infos de groupe, aucune conversation n'est créée
      expect(result).toHaveLength(0);
    });

    it('should handle general exception', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await MessageService.getUserConversations('user1');
      expect(result).toEqual([]);
    });

    it('should calculate unread count correctly', async () => {
      const mockUserGroups = [{ id_group: 1 }];
      const mockGroups = [{ id: 1, name: 'Groupe Test' }];
      const mockMessages = [
        {
          id: 1,
          id_group: 1,
          id_sender: 'user1', // Message de l'utilisateur actuel
          content: 'Salut !',
          send_date: '2024-01-15T10:30:00.000Z',
          is_read: false
        },
        {
          id: 2,
          id_group: 1,
          id_sender: 'user2', // Message d'un autre utilisateur, non lu
          content: 'Bonjour !',
          send_date: '2024-01-15T11:00:00.000Z',
          is_read: false
        },
        {
          id: 3,
          id_group: 1,
          id_sender: 'user2', // Message d'un autre utilisateur, lu
          content: 'Comment ça va ?',
          send_date: '2024-01-15T12:00:00.000Z',
          is_read: true
        }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockGroups,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null
              })
            })
          })
        } as any);

      const result = await MessageService.getUserConversations('user1');

      expect(result).toHaveLength(1);
      expect(result[0].unreadCount).toBe(1); // Seulement le message non lu de user2
    });
  });

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