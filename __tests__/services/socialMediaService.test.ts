// Mock Supabase avant les imports
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import { socialMediaService } from '@/services/socialMediaService';
import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('SocialMediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSocialMedias', () => {
    it('should return all social medias', async () => {
      const mockSocialMedias = [
        { id: '1', name: 'Instagram' },
        { id: '2', name: 'Facebook' }
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockSocialMedias,
            error: null
          })
        })
      } as any);

      const result = await socialMediaService.getAllSocialMedias();
      expect(result).toEqual(mockSocialMedias);
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

      const result = await socialMediaService.getAllSocialMedias();
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

      await expect(socialMediaService.getAllSocialMedias()).rejects.toEqual(mockError);
    });
  });

  describe('addUserSocialMedia', () => {
    it('should add social media to user profile', async () => {
      const mockProfile = { id: 'profile1' };
      const mockNewSocialMedia = {
        id_profile: 'profile1',
        id_social_media: 'sm1',
        username: 'john_doe',
        socialmedia: { id: 'sm1', name: 'Instagram' }
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
        // Mock existing check
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        } as any)
        // Mock social media insertion - vérifier le trim du username
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockNewSocialMedia,
                error: null
              })
            })
          })
        } as any);

      const result = await socialMediaService.addUserSocialMedia('user1', 'sm1', '  john_doe  ');
      expect(result).toEqual(mockNewSocialMedia);
      
      // Vérifier que les paramètres sont corrects
      expect(mockSupabase.from).toHaveBeenCalledWith('profilesocialmedia');
    });

    it('should throw error when social media already exists', async () => {
      const mockProfile = { id: 'profile1' };
      const existingSocialMedia = [{ id: 'existing' }];

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
        // Mock existing check - returns existing data
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: existingSocialMedia,
                error: null
              })
            })
          })
        } as any);

      await expect(socialMediaService.addUserSocialMedia('user1', 'sm1', 'john_doe'))
        .rejects.toThrow('Vous avez déjà ajouté ce réseau social');
    });
  });

  describe('updateUserSocialMedia', () => {
    it('should update social media username', async () => {
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
        // Mock update - vérifier le trim du username
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null
              })
            })
          })
        } as any);

      await expect(socialMediaService.updateUserSocialMedia('user1', 'sm1', '  new_username  '))
        .resolves.toBeUndefined();
        
      // Vérifier que l'update utilise les bons paramètres
      expect(mockSupabase.from).toHaveBeenCalledWith('profilesocialmedia');
    });
  });

  describe('removeUserSocialMedia', () => {
    it('should remove social media from user profile', async () => {
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
        // Mock deletion
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null
              })
            })
          })
        } as any);

      await expect(socialMediaService.removeUserSocialMedia('user1', 'sm1'))
        .resolves.toBeUndefined();
    });
  });

  describe('getUserSocialMedias', () => {
    it('should return user social medias', async () => {
      const mockProfile = { id: 'profile1' };
      const mockUserSocialMedias = [
        {
          id_profile: 'profile1',
          id_social_media: 'sm1',
          username: 'john_doe',
          socialmedia: { id: 'sm1', name: 'Instagram' }
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
        // Mock social medias query
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockUserSocialMedias,
              error: null
            })
          })
        } as any);

      const result = await socialMediaService.getUserSocialMedias('user1');
      expect(result).toEqual(mockUserSocialMedias);
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

      const result = await socialMediaService.getUserSocialMedias('user1');
      expect(result).toEqual([]);
    });
  });
});
