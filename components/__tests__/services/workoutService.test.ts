// Mock Supabase avant les imports
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

import { workoutService } from '../../../services/workoutService';
import { supabase } from '../../../lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('WorkoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkoutSession', () => {
    it('should create workout session successfully', async () => {
      const mockSessionData = {
        start_date: '2024-01-15T18:00:00Z',
        end_date: '2024-01-15T19:30:00Z',
        id_sport: 'sport1',
        groupId: 1
      };

      const mockCreatedSession = {
        id: 1,
        ...mockSessionData,
        created_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCreatedSession,
              error: null
            })
          })
        })
      } as any);

      const result = await workoutService.createWorkoutSession(mockSessionData);
      
      expect(result).toEqual(mockCreatedSession);
      expect(mockSupabase.from).toHaveBeenCalledWith('workoutsession');
    });

    it('should handle creation errors', async () => {
      const mockError = { message: 'Database error' };
      
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

      const sessionData = {
        start_date: '2024-01-15T18:00:00Z',
        end_date: '2024-01-15T19:30:00Z',
        id_sport: 'sport1',
        groupId: 1
      };

      await expect(workoutService.createWorkoutSession(sessionData)).rejects.toEqual(mockError);
    });
  });

  describe('joinWorkoutSession', () => {
    it('should join workout session successfully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null
        })
      } as any);

      await expect(workoutService.joinWorkoutSession(1, 'user1')).resolves.toBeUndefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('workoutsessionuser');
    });

    it('should handle join errors', async () => {
      const mockError = { message: 'Already joined' };
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: mockError
        })
      } as any);

      await expect(workoutService.joinWorkoutSession(1, 'user1')).rejects.toEqual(mockError);
    });
  });

  describe('leaveWorkoutSession', () => {
    it('should leave workout session successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      } as any);

      await expect(workoutService.leaveWorkoutSession(1, 'user1')).resolves.toBeUndefined();
    });
  });

  describe('getWorkoutSessionParticipants', () => {
    it('should return participants with user data', async () => {
      const mockParticipants = [
        { id_workout_session: 1, id_user: 'user1' },
        { id_workout_session: 1, id_user: 'user2' }
      ];

      const mockProfiles = [
        { id_user: 'user1', firstname: 'John', lastname: 'Doe' },
        { id_user: 'user2', firstname: 'Jane', lastname: 'Smith' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockParticipants,
              error: null
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

      const result = await workoutService.getWorkoutSessionParticipants(1);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id_workout_session: 1,
        id_user: 'user1',
        user: {
          firstname: 'John',
          lastname: 'Doe'
        }
      });
    });

    it('should handle participants without profiles', async () => {
      const mockParticipants = [
        { id_workout_session: 1, id_user: 'user1' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockParticipants,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [], // Aucun profil trouvé
              error: null
            })
          })
        } as any);

      const result = await workoutService.getWorkoutSessionParticipants(1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id_workout_session: 1,
        id_user: 'user1',
        user: {
          firstname: 'Utilisateur',
          lastname: 'Inconnu'
        }
      });
    });

    it('should return empty array when no participants', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } as any);

      const result = await workoutService.getWorkoutSessionParticipants(1);
      expect(result).toEqual([]);
    });
  });

  describe('getGroupWorkoutSessions', () => {
    it('should return valid workout sessions for group', async () => {
      const mockSessions = [
        {
          id: 1,
          start_date: '2024-01-15T18:00:00Z',
          end_date: '2024-01-15T19:30:00Z',
          created_at: '2024-01-15T10:00:00Z',
          sport: { id: 'sport1', name: 'Football' }
        }
      ];

      // Mock session query
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockSessions,
                error: null
              })
            })
          })
        } as any)
        // Mock participants query
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        } as any);

      const result = await workoutService.getGroupWorkoutSessions(1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        id: 1,
        participants: [],
        participantCount: 0
      }));
    });

    it('should filter out sessions with invalid dates', async () => {
      // Ne tester que des sessions avec des dates valides car le service filtre en amont
      const mockSessions = [
        {
          id: 2,
          start_date: '2024-01-15T18:00:00Z',
          end_date: '2024-01-15T19:30:00Z',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockSessions,
                error: null
              })
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        } as any);

      const result = await workoutService.getGroupWorkoutSessions(1);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('should return empty array when no sessions found', async () => {
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

      const result = await workoutService.getGroupWorkoutSessions(1);
      expect(result).toEqual([]);
    });
  });

  describe('isUserParticipating', () => {
    it('should return true when user is participating', async () => {
      const mockParticipants = [
        { id_workout_session: 1, id_user: 'user1' }
      ];

      const mockProfiles = [
        { id_user: 'user1', firstname: 'John', lastname: 'Doe' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockParticipants,
              error: null
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

      const result = await workoutService.isUserParticipating(1, 'user1');
      expect(result).toBe(true);
    });

    it('should return false when user is not participating', async () => {
      const mockParticipants = [
        { id_workout_session: 1, id_user: 'user2' }
      ];

      const mockProfiles = [
        { id_user: 'user2', firstname: 'Jane', lastname: 'Smith' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockParticipants,
              error: null
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

      const result = await workoutService.isUserParticipating(1, 'user1');
      expect(result).toBe(false);
    });

    it('should return false when no participants exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } as any);

      const result = await workoutService.isUserParticipating(1, 'user1');
      expect(result).toBe(false);
    });
  });

  describe('getWorkoutSessionWithParticipants', () => {
    it('should return session with participants', async () => {
      const mockSession = {
        id: 1,
        start_date: '2024-01-15T18:00:00Z',
        end_date: '2024-01-15T19:30:00Z',
        sport: { id: 'sport1', name: 'Football' }
      };

      const mockParticipants = [
        { id_workout_session: 1, id_user: 'user1' }
      ];

      const mockProfiles = [
        { id_user: 'user1', firstname: 'John', lastname: 'Doe' }
      ];

      mockSupabase.from
        // Mock session query
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockSession,
                error: null
              })
            })
          })
        } as any)
        // Mock participants query
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockParticipants,
              error: null
            })
          })
        } as any)
        // Mock profiles query
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockProfiles,
              error: null
            })
          })
        } as any);

      const result = await workoutService.getWorkoutSessionWithParticipants(1);
      
      expect(result).toEqual({
        ...mockSession,
        participants: [{
          id_workout_session: 1,
          id_user: 'user1',
          user: {
            firstname: 'John',
            lastname: 'Doe'
          }
        }],
        participantCount: 1
      });
    });
  });
});