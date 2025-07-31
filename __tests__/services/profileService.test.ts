// Mock Supabase avant les imports
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import { profileService } from '@/services/profileService';
import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const mockProfile = { id: '1', id_user: 'user1', score: 100 };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      } as any);

      const result = await profileService.getProfile('user1');
      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profile');
    });

    it('should return null when profile not found', async () => {
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

      const result = await profileService.getProfile('user1');
      expect(result).toBeNull();
    });

    it('should throw error when supabase error occurs', async () => {
      const mockError = { code: 'UNKNOWN_ERROR', message: 'Database error' };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      } as any);

      await expect(profileService.getProfile('user1')).rejects.toEqual(mockError);
    });
  });

  describe('createProfile', () => {
    it('should create and return new profile', async () => {
      const mockNewProfile = { 
        id: '1', 
        id_user: 'user1', 
        score: 0, 
        fully_completed: false,
        created_at: expect.any(String)
      };
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNewProfile,
              error: null
            })
          })
        })
      } as any);

      const result = await profileService.createProfile('user1');
      expect(result).toEqual(mockNewProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profile');
    });

    it('should throw error when creation fails', async () => {
      const mockError = { message: 'Creation failed' };
      
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

      await expect(profileService.createProfile('user1')).rejects.toEqual(mockError);
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      const mockUpdatedProfile = { 
        id: '1', 
        id_user: 'user1', 
        firstname: 'John' 
      };
      
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedProfile,
                error: null
              })
            })
          })
        })
      } as any);

      const result = await profileService.updateProfile('user1', { firstname: 'John' });
      expect(result).toEqual(mockUpdatedProfile);
    });
  });

  describe('getAllGyms', () => {
    it('should return all gyms', async () => {
      const mockGyms = [
        { id: '1', name: 'Gym A' },
        { id: '2', name: 'Gym B' }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockGyms,
            error: null
          })
        })
      } as any);

      const result = await profileService.getAllGyms();
      expect(result).toEqual(mockGyms);
      expect(mockSupabase.from).toHaveBeenCalledWith('gym');
    });
  });

  describe('getAllHobbies', () => {
    it('should return all hobbies', async () => {
      const mockHobbies = [
        { id: '1', name: 'Lecture' },
        { id: '2', name: 'Musique' }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockHobbies,
            error: null
          })
        })
      } as any);

      const result = await profileService.getAllHobbies();
      expect(result).toEqual(mockHobbies);
      expect(mockSupabase.from).toHaveBeenCalledWith('hobbie');
    });
  });

  describe('getLocationDetails', () => {
    it('should return location when found', async () => {
      const mockLocation = { 
        id: '1', 
        town: 'Paris', 
        postal_code: '75001' 
      };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockLocation,
              error: null
            })
          })
        })
      } as any);

      const result = await profileService.getLocationDetails('1');
      expect(result).toEqual(mockLocation);
    });

    it('should return null when location not found', async () => {
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

      const result = await profileService.getLocationDetails('1');
      expect(result).toBeNull();
    });
  });
});
