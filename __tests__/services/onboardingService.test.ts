// Mock Supabase avant les imports
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import { OnboardingService } from '../../../services/onboardingService';
import { supabase } from '../../../lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('OnboardingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserProfile', () => {
    it('should update profile successfully', async () => {
      const mockProfileData = {
        lastname: 'Doe',
        firstname: 'John',
        birthdate: new Date('1990-01-01'),
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null
          })
        })
      } as any);

      const result = await OnboardingService.updateUserProfile('user1', mockProfileData);
      expect(result.success).toBe(true);
    });

    it('should create location when provided', async () => {
      const mockProfileData = {
        lastname: 'Doe',
        firstname: 'John',
        birthdate: new Date('1990-01-01'),
        location: {
          town: 'Paris',
          postal_code: 75001,
          latitude: 48.8566,
          longitude: 2.3522
        }
      };

      const mockLocationData = { id: 'location1' };

      mockSupabase.from
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockLocationData,
                error: null
              })
            })
          })
        } as any)
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        } as any);

      const result = await OnboardingService.updateUserProfile('user1', mockProfileData);
      expect(result.success).toBe(true);
    });

    it('should handle location creation failure gracefully', async () => {
      const mockProfileData = {
        lastname: 'Doe',
        firstname: 'John',
        birthdate: new Date('1990-01-01'),
        location: {
          town: 'Paris',
          postal_code: 75001,
          latitude: 48.8566,
          longitude: 2.3522
        }
      };

      mockSupabase.from
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Location error' }
              })
            })
          })
        } as any)
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        } as any);

      const result = await OnboardingService.updateUserProfile('user1', mockProfileData);
      expect(result.success).toBe(true); // Should continue without location
    });
  });

  describe('updateUserSports', () => {
    it('should update user sports successfully', async () => {
      const mockSports = [
        { sportId: '1', levelId: '1' },
        { sportId: '2', levelId: '2' }
      ];

      const mockProfile = { id: 'profile1' };

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
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            error: null
          })
        } as any);

      const result = await OnboardingService.updateUserSports('user1', mockSports);
      expect(result.success).toBe(true);
    });

    it('should handle profile not found error', async () => {
      const mockSports = [{ sportId: '1', levelId: '1' }];

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

      const result = await OnboardingService.updateUserSports('user1', mockSports);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Impossible de récupérer le profil');
    });
  });

  describe('updateUserHobbies', () => {
    it('should update user hobbies and mark profile complete', async () => {
      const mockHobbies = { hobbyIds: ['1', '2', '3'] };
      const mockProfile = { id: 'profile1' };

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
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({
            error: null
          })
        } as any)
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        } as any);

      const result = await OnboardingService.updateUserHobbies('user1', mockHobbies);
      expect(result.success).toBe(true);
    });
  });

  describe('validateCredentials', () => {
    it('should return no errors for valid credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const errors = OnboardingService.validateCredentials(credentials);
      expect(errors).toEqual([]);
    });

    it('should return errors for invalid email', () => {
      const credentials = {
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const errors = OnboardingService.validateCredentials(credentials);
      expect(errors).toContain("L'email n'est pas valide");
    });

    it('should return errors for short password', () => {
      const credentials = {
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123'
      };

      const errors = OnboardingService.validateCredentials(credentials);
      expect(errors).toContain('Le mot de passe doit contenir au moins 6 caractères');
    });

    it('should return errors for mismatched passwords', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123'
      };

      const errors = OnboardingService.validateCredentials(credentials);
      expect(errors).toContain('Les mots de passe ne correspondent pas');
    });
  });

  describe('validateProfile', () => {
    it('should return no errors for valid profile', () => {
      const profile = {
        firstname: 'John',
        lastname: 'Doe',
        birthdate: new Date('1990-01-01')
      };

      const errors = OnboardingService.validateProfile(profile);
      expect(errors).toEqual([]);
    });

    it('should return errors for missing fields', () => {
      const profile = {
        firstname: '',
        lastname: '',
        birthdate: null as any
      };

      const errors = OnboardingService.validateProfile(profile);
      expect(errors).toContain('Le prénom est requis');
      expect(errors).toContain('Le nom est requis');
      expect(errors).toContain('La date de naissance est requise');
    });
  });
});
