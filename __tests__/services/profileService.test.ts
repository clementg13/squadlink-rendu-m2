// Mock Supabase - Solution finale qui bypasse le problème de chaînage
jest.mock('@/lib/supabase', () => {
  // Au lieu de créer un chaînage complexe, on intercepte directement les appels
  const mockQuery = {
    data: null,
    error: null
  };

  const mockSupabase = {
    // Méthodes qui retournent directement des promesses
    schema: jest.fn((): any => mockSupabase),
    from: jest.fn((): any => mockSupabase),
    select: jest.fn((): any => mockSupabase),
    eq: jest.fn((): any => mockSupabase),
    insert: jest.fn((): any => mockSupabase),
    update: jest.fn((): any => mockSupabase),
    delete: jest.fn((): any => mockSupabase),

    // Méthodes finales qui retournent des promesses
    single: jest.fn(() => Promise.resolve(mockQuery)),
    order: jest.fn(() => Promise.resolve(mockQuery)),
    
    // RPC method
    rpc: jest.fn(() => Promise.resolve(mockQuery)),
    
    // Auth
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'user-123' } },
        error: null
      }))
    },

    // Méthode pour configurer les réponses
    __setMockResponse: (response: any) => {
      mockQuery.data = response.data;
      mockQuery.error = response.error;
    },

    // Méthode pour reset le mock
    __reset: () => {
      mockQuery.data = null;
      mockQuery.error = null;
      // Rétablir le chaînage
      mockSupabase.schema.mockReturnValue(mockSupabase);
      mockSupabase.from.mockReturnValue(mockSupabase);
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockReturnValue(mockSupabase);
      mockSupabase.insert.mockReturnValue(mockSupabase);
      mockSupabase.update.mockReturnValue(mockSupabase);
      mockSupabase.delete.mockReturnValue(mockSupabase);
    }
  };

  // Initialiser le chaînage
  mockSupabase.__reset();

  return {
    supabase: mockSupabase
  };
});

import { profileService } from '@/services/profileService';
import { UserProfile, Location, Gym, GymSubscription, Hobbie } from '@/types/profile';
import { supabase } from '@/lib/supabase';

// Cast pour TypeScript
const mockSupabase = supabase as any;

describe('ProfileService', () => {
  beforeEach(() => {
    // Reset le mock avant chaque test
    mockSupabase.__reset();

    // Mock auth par défaut
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    // Vider le cache avant chaque test
    (profileService as any).constructor.profileCache.clear();
    (profileService as any).constructor.lastCacheUpdate.clear();
  });

  describe('getProfile', () => {
    const mockProfile = {
      id: 'profile-1',
      id_user: 'user-123',
      firstname: 'John',
      lastname: 'Doe',
      birthdate: '1995-06-15',
      biography: 'Test bio',
      location: { id: 'loc-1', town: 'Paris' },
      gym: { id: 'gym-1', name: 'Fitness Club' },
      gymsubscription: { id: 'sub-1', name: 'Premium' }
    };

    it('should return null when profile not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result = await profileService.getProfile('user-123');

      expect(result).toBeNull();
    });

    it('should throw error on database error', async () => {
      const error = { code: 'UNKNOWN', message: 'Database error' };
      mockSupabase.single.mockResolvedValue({
        data: null,
        error
      });

      await expect(profileService.getProfile('user-123')).rejects.toEqual(error);
    });
  });

  describe('createProfile', () => {
    it('should create new profile successfully', async () => {
      const newProfile = {
        id: 'profile-1',
        id_user: 'user-123',
        fully_completed: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.single.mockResolvedValue({
        data: newProfile,
        error: null
      });

      const result = await profileService.createProfile('user-123');

      expect(result).toEqual(newProfile);
      expect(mockSupabase.insert).toHaveBeenCalledWith([{
        id_user: 'user-123',
        fully_completed: false,
        created_at: expect.any(String)
      }]);
    });

    it('should throw error when creation fails', async () => {
      const error = { code: 'UNKNOWN', message: 'Database error' };
      mockSupabase.single.mockResolvedValue({
        data: null,
        error
      });

      await expect(profileService.createProfile('user-123')).rejects.toEqual(error);
    });
  });

  describe('updateProfile', () => {

    it('should throw error when profile not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      await expect(
        profileService.updateProfile('user-123', { firstname: 'Jane' })
      ).rejects.toThrow('Profil utilisateur non trouvé');
    });
  });

  describe('updateLocation', () => {
    const locationData = {
      town: 'Lyon',
      postal_code: 69000,
      latitude: 45.7578,
      longitude: 4.832
    };

    it('should create location and update profile', async () => {
      const newLocation = { id: 'loc-1', ...locationData };

      let callCount = 0;
      mockSupabase.single.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: newLocation, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });

      mockSupabase.eq.mockResolvedValue({ error: null });

      await profileService.updateLocation('user-123', locationData);

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        town: 'Lyon',
        postal_code: 69000,
        location: 'POINT(4.832 45.7578)'
      });
      expect(mockSupabase.update).toHaveBeenCalledWith({ id_location: 'loc-1' });
    });

    it('should throw error when location creation fails', async () => {
      const error = { message: 'Location creation failed' };
      mockSupabase.single.mockResolvedValue({
        data: null,
        error
      });

      await expect(
        profileService.updateLocation('user-123', locationData)
      ).rejects.toEqual(error);
    });
  });

  describe('Related data fetchers', () => {
    describe('getLocationDetails', () => {
      it('should return location when found', async () => {
        const location: Location = { 
          id: '1', 
          town: 'Paris', 
          postal_code: '75001', 
          location: 'POINT(2.3522 48.8566)' 
        };
        
        mockSupabase.single.mockResolvedValue({
          data: location,
          error: null
        });

        const result = await profileService.getLocationDetails('loc-1');

        expect(result).toEqual(location);
      });

      it('should return null when not found', async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await profileService.getLocationDetails('loc-1');

        expect(result).toBeNull();
      });
    });

    describe('getGymDetails', () => {
      it('should return gym when found', async () => {
        const gym: Gym = { id: 'gym-1', name: 'Fitness Club' };
        
        mockSupabase.single.mockResolvedValue({
          data: gym,
          error: null
        });

        const result = await profileService.getGymDetails('gym-1');

        expect(result).toEqual(gym);
      });
    });

    describe('getGymSubscriptionDetails', () => {
      it('should return subscription when found', async () => {
        const subscription: GymSubscription = { 
          id: 'sub-1', 
          name: 'Premium', 
          id_gym: 'gym-1' 
        };
        
        mockSupabase.single.mockResolvedValue({
          data: subscription,
          error: null
        });

        const result = await profileService.getGymSubscriptionDetails('sub-1');

        expect(result).toEqual(subscription);
      });
    });
  });

  describe('Cache management', () => {
    describe('invalidateProfileCache', () => {
      it('should clear cache for specific user', () => {
        const cacheKey = 'profile_user-123';
        (profileService as any).constructor.profileCache.set(cacheKey, {});
        (profileService as any).constructor.lastCacheUpdate.set(cacheKey, Date.now());

        profileService.invalidateProfileCache('user-123');

        expect((profileService as any).constructor.profileCache.has(cacheKey)).toBe(false);
        expect((profileService as any).constructor.lastCacheUpdate.has(cacheKey)).toBe(false);
      });
    });
  });

  describe('getProfileDetails', () => {
    it('should return compatible profile using RPC', async () => {
      const mockRPCData = [{
        profile_id: 'profile-1',
        user_id: 'user-123',
        firstname: 'John',
        lastname: 'Doe',
        biography: 'Test bio',
        age: 28,
        location: { town: 'Paris' },
        gym: { name: 'Fitness Club' },
        gym_subscription: { name: 'Premium' },
        hobbies: [],
        sports: [],
        social_medias: []
      }];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRPCData,
        error: null
      });

      const result = await profileService.getProfileDetails('user-123');

      expect(result).toEqual({
        profile_id: 'profile-1',
        user_id: 'user-123',
        firstname: 'John',
        lastname: 'Doe',
        biography: 'Test bio',
        compatibility_score: 0,
        total_count: 0,
        age: 28,
        location: { town: 'Paris' },
        gym: { name: 'Fitness Club' },
        gymSubscription: { name: 'Premium' },
        hobbies: [],
        sports: [],
        socialMedias: []
      });
    });

    it('should return null when RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' }
      });

      const result = await profileService.getProfileDetails('user-123');

      expect(result).toBeNull();
    });

    it('should return cached result on subsequent calls', async () => {
      const mockRPCData = [{
        profile_id: 'profile-1',
        user_id: 'user-123',
        firstname: 'John'
      }];

      let callCount = 0;
      mockSupabase.rpc.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ data: mockRPCData, error: null });
      });

      await profileService.getProfileDetails('user-123');
      const result = await profileService.getProfileDetails('user-123');

      expect(result).toBeDefined();
      expect(callCount).toBe(1); // Deuxième appel utilise le cache
    });
  });

  describe('Reference data', () => {
    describe('getAllGyms', () => {
      it('should return all gyms ordered by name', async () => {
        const gyms: Gym[] = [
          { id: 'gym-1', name: 'Fitness Club A' },
          { id: 'gym-2', name: 'Fitness Club B' }
        ];

        mockSupabase.order.mockResolvedValue({
          data: gyms,
          error: null
        });

        const result = await profileService.getAllGyms();

        expect(result).toEqual(gyms);
      });
    });

    describe('getAllHobbies', () => {
      it('should return all hobbies ordered by name', async () => {
        const hobbies: Hobbie[] = [
          { id: 'hobby-1', name: 'Lecture' },
          { id: 'hobby-2', name: 'Musique' }
        ];

        mockSupabase.order.mockResolvedValue({
          data: hobbies,
          error: null
        });

        const result = await profileService.getAllHobbies();

        expect(result).toEqual(hobbies);
      });
    });
  });

  describe('Gym subscription management', () => {
    describe('updateGymSubscription', () => {
      it('should update gym subscription with valid IDs', async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });

        await profileService.updateGymSubscription('user-123', '1', '2');

        expect(mockSupabase.update).toHaveBeenCalledWith({
          id_gym: 1,
          id_gymsubscription: 2
        });
      });

      it('should validate user ID', async () => {
        await expect(
          profileService.updateGymSubscription('', '1', '2')
        ).rejects.toThrow('User ID invalide');
      });
    });

    describe('removeGymSubscription', () => {
      it('should remove gym subscription', async () => {
        mockSupabase.eq.mockResolvedValue({ error: null });

        await profileService.removeGymSubscription('user-123');

        expect(mockSupabase.update).toHaveBeenCalledWith({
          id_gym: null,
          id_gymsubscription: null
        });
      });
    });

    describe('getAllGymSubscriptions', () => {
      it('should return all gym subscriptions', async () => {
        const subscriptions: GymSubscription[] = [
          { id: 'sub-1', name: 'Premium', id_gym: 'gym-1' },
          { id: 'sub-2', name: 'Basic', id_gym: 'gym-1' }
        ];

        mockSupabase.order.mockResolvedValue({
          data: subscriptions,
          error: null
        });

        const result = await profileService.getAllGymSubscriptions();

        expect(result).toEqual(subscriptions);
      });
    });

    describe('getGymSubscriptions', () => {
      it('should return subscriptions for specific gym', async () => {
        const subscriptions: GymSubscription[] = [
          { id: 'sub-1', name: 'Premium', id_gym: 'gym-1' }
        ];

        mockSupabase.order.mockResolvedValue({
          data: subscriptions,
          error: null
        });

        const result = await profileService.getGymSubscriptions('gym-1');

        expect(result).toEqual(subscriptions);
      });

      it('should return empty array for invalid gym ID', async () => {
        const result = await profileService.getGymSubscriptions('');
        expect(result).toEqual([]);
      });
    });

    describe('getUserGymSubscription', () => {
      it('should return gym and subscription for user', async () => {
        const profile = { id_gym: 'gym-1', id_gymsubscription: 'sub-1' };
        const gym = { id: 'gym-1', name: 'Fitness Club' };
        const subscription = { id: 'sub-1', name: 'Premium' };

        let callCount = 0;
        mockSupabase.single.mockImplementation(() => {
          callCount++;
          switch (callCount) {
            case 1: return Promise.resolve({ data: profile, error: null });
            case 2: return Promise.resolve({ data: gym, error: null });
            case 3: return Promise.resolve({ data: subscription, error: null });
            default: return Promise.resolve({ data: null, error: null });
          }
        });

        const result = await profileService.getUserGymSubscription('user-123');

        expect(result).toEqual({ gym, subscription });
      });

      it('should handle missing profile', async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        const result = await profileService.getUserGymSubscription('user-123');

        expect(result).toEqual({ gym: null, subscription: null });
      });
    });
  });

  describe('deleteAccountAndData', () => {
    it('should delete profile and user account', async () => {
      mockSupabase.eq.mockResolvedValue({ error: null });
      mockSupabase.rpc.mockResolvedValue({ 
        error: null, 
        data: null 
      });

      const result = await profileService.deleteAccountAndData();

      expect(result).toEqual({});
    });

    it('should handle auth error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      });

      const result = await profileService.deleteAccountAndData();

      expect(result.error).toBe('Impossible de récupérer votre compte.');
    });
  });

  describe('Force reload methods', () => {
    describe('nukeAndReload', () => {
      it('should clear all cache and reload profile', async () => {
        const mockProfile = { id: 'profile-1', id_user: 'user-123' };

        mockSupabase.single.mockResolvedValue({
          data: mockProfile,
          error: null
        });

        mockSupabase.select.mockImplementation(() => ({
          ...mockSupabase,
          eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }));

        const result = await profileService.nukeAndReload('user-123');

        expect(result).toBeDefined();
      });
    });
  });

  describe('Error handling and edge cases', () => {

    it('should handle network timeout gracefully', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Network timeout'));

      await expect(profileService.getProfile('user-123')).rejects.toThrow('Network timeout');
    });

  });
});