// Mock Supabase avant les imports
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import { sportService } from '../../../services/sportService';
import { supabase } from '../../../lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('SportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSports', () => {
    it('should return all sports', async () => {
      const mockSports = [
        { id: '1', name: 'Football' },
        { id: '2', name: 'Basketball' }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockSports,
            error: null
          })
        })
      } as any);

      const result = await sportService.getAllSports();
      expect(result).toEqual(mockSports);
    });

    it('should return empty array when no data', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      } as any);

      const result = await sportService.getAllSports();
      expect(result).toEqual([]);
    });

    it('should throw error when supabase error occurs', async () => {
      const mockError = { message: 'Database error' };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      } as any);

      await expect(sportService.getAllSports()).rejects.toEqual(mockError);
    });
  });

  describe('getAllSportLevels', () => {
    it('should return all sport levels', async () => {
      const mockLevels = [
        { id: '1', name: 'Débutant' },
        { id: '2', name: 'Intermédiaire' }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockLevels,
            error: null
          })
        })
      } as any);

      const result = await sportService.getAllSportLevels();
      expect(result).toEqual(mockLevels);
    });
  });

  describe('addUserSport', () => {
    it('should add sport to user profile', async () => {
      const mockProfile = { id: 'profile1' };
      const mockNewSport = {
        id_profile: 'profile1',
        id_sport: 'sport1',
        id_sport_level: 'level1',
        sport: { id: 'sport1', name: 'Football' },
        sportlevel: { id: 'level1', name: 'Débutant' }
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
        // Mock sport insertion - mise à jour pour les nouveaux types
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockNewSport,
                error: null
              })
            })
          })
        } as any);

      const result = await sportService.addUserSport('user1', 'sport1', 'level1');
      expect(result).toEqual(mockNewSport);
      
      // Vérifier que les paramètres sont corrects (string au lieu de parseInt)
      expect(mockSupabase.from).toHaveBeenCalledWith('profilesport');
    });

    it('should throw error when profile not found', async () => {
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

      await expect(sportService.addUserSport('user1', 'sport1', 'level1'))
        .rejects.toThrow('Impossible de récupérer l\'ID du profil');
    });
  });

  describe('removeUserSport', () => {
    it('should remove sport from user profile', async () => {
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
        // Mock sport deletion
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null
              })
            })
          })
        } as any);

      await expect(sportService.removeUserSport('user1', 'sport1')).resolves.toBeUndefined();
      
      // Vérifier que la suppression utilise les bons paramètres
      expect(mockSupabase.from).toHaveBeenCalledWith('profilesport');
    });
  });

  describe('getUserSports', () => {
    it('should return user sports', async () => {
      const mockProfile = { id: 'profile1' };
      const mockUserSports = [
        {
          id_profile: 'profile1',
          id_sport: 'sport1',
          id_sport_level: 'level1',
          sport: { id: 'sport1', name: 'Football' },
          sportlevel: { id: 'level1', name: 'Débutant' }
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
        // Mock sports query
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserSports,
              error: null
            })
          })
        } as any);

      const result = await sportService.getUserSports('user1');
      expect(result).toEqual(mockUserSports);
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

      const result = await sportService.getUserSports('user1');
      expect(result).toEqual([]);
    });
  });
});
