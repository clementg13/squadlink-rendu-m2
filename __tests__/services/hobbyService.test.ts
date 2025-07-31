// Mock Supabase avant les imports
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import { hobbyService } from '@/services/hobbyService';
import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('HobbyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserHobbies', () => {
    it('should return user hobbies', async () => {
      const mockProfile = { id: 'profile1' };
      const mockUserHobbies = [
        {
          id_profile: 'profile1',
          id_hobbie: 'hobby1',
          is_highlighted: false,
          hobbie: { id: 'hobby1', name: 'Lecture' }
        }
      ];

      // Mock profile lookup
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            })
          })
        } as any)
        // Mock hobbies query
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserHobbies,
              error: null
            })
          })
        } as any);

      const result = await hobbyService.getUserHobbies('user1');
      expect(result).toEqual(mockUserHobbies);
    });

    it('should return empty array when no profile found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      } as any);

      const result = await hobbyService.getUserHobbies('user1');
      expect(result).toEqual([]);
    });
  });

  describe('addUserHobby', () => {
    it('should add hobby to user profile', async () => {
      const mockProfile = { id: 'profile1' };
      const mockNewHobby = {
        id_profile: 'profile1',
        id_hobbie: 'hobby1',
        is_highlighted: false,
        hobbie: { id: 'hobby1', name: 'Lecture' }
      };

      // Mock profile lookup
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            })
          })
        } as any)
        // Mock hobby insertion
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockNewHobby,
                error: null
              })
            })
          })
        } as any);

      const result = await hobbyService.addUserHobby('user1', 'hobby1', false);
      expect(result).toEqual(mockNewHobby);
    });
  });

  describe('removeUserHobby', () => {
    it('should remove hobby from user profile', async () => {
      const mockProfile = { id: 'profile1' };

      // Mock profile lookup
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            })
          })
        } as any)
        // Mock hobby deletion
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null
              })
            })
          })
        } as any);

      await expect(hobbyService.removeUserHobby('user1', 'hobby1')).resolves.toBeUndefined();
    });
  });

  describe('toggleHighlightHobby', () => {
    it('should toggle hobby highlight status', async () => {
      const mockProfile = { id: 'profile1' };

      // Mock profile lookup
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            })
          })
        } as any)
        // Mock update
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null
              })
            })
          })
        } as any);

      await expect(hobbyService.toggleHighlightHobby('user1', 'hobby1', true))
        .resolves.toBeUndefined();
    });
  });
});
