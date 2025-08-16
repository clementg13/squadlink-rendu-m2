// Mock complet de Supabase qui simule exactement le comportement réel
jest.mock('@/lib/supabase', () => {
  const mockSupabaseInstance = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    update: jest.fn(),
    single: jest.fn(),
    schema: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  };

  // Configuration du chaînage - chaque méthode retourne l'instance pour permettre le chaînage
  mockSupabaseInstance.from.mockReturnValue(mockSupabaseInstance);
  mockSupabaseInstance.select.mockReturnValue(mockSupabaseInstance);
  mockSupabaseInstance.eq.mockReturnValue(mockSupabaseInstance);
  mockSupabaseInstance.update.mockReturnValue(mockSupabaseInstance);
  mockSupabaseInstance.schema.mockReturnValue(mockSupabaseInstance);

  return {
    supabase: mockSupabaseInstance
  };
});

// Mock de profileService avec toutes les méthodes nécessaires
jest.mock('@/services/profileService', () => ({
  profileService: {
    invalidateProfileCache: jest.fn(),
    nukeAndReload: jest.fn().mockResolvedValue(null)
  }
}));

// Import après les mocks
import { gymService } from '@/services/gymService';
import { supabase } from '@/lib/supabase';
import { profileService } from '@/services/profileService';

// Cast pour TypeScript
const mockSupabase = supabase as any;
const mockProfileService = profileService as any;

describe('GymService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Réinitialiser le chaînage pour chaque test
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.schema.mockReturnValue(mockSupabase);

    // Mock par défaut pour getUser
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    // Reset des mocks du profileService
    mockProfileService.invalidateProfileCache.mockClear();
    mockProfileService.nukeAndReload.mockResolvedValue(null);
  });

  describe('getAllGyms', () => {
    it('should return gyms from public schema', async () => {
      const mockGyms = [
        { id: '1', name: 'Fitness Club Paris' },
        { id: '2', name: 'Gym Lyon' }
      ];

      // Mock le premier appel (public schema) qui réussit
      mockSupabase.order.mockResolvedValueOnce({
        data: mockGyms,
        error: null
      });

      const result = await gymService.getAllGyms();

      expect(result).toEqual(mockGyms);
      expect(mockSupabase.from).toHaveBeenCalledWith('gym');
      expect(mockSupabase.select).toHaveBeenCalledWith('id, name');
      expect(mockSupabase.order).toHaveBeenCalledWith('name');
    });

    it('should fallback to musclemeet schema when public fails', async () => {
      const mockGyms = [
        { id: '1', name: 'Gym A' },
        { id: '2', name: 'Gym B' }
      ];

      // Premier appel (public) retourne vide, deuxième (musclemeet) retourne des données
      mockSupabase.order
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: mockGyms, error: null });

      const result = await gymService.getAllGyms();

      expect(result).toEqual(mockGyms);
      expect(mockSupabase.schema).toHaveBeenCalledWith('musclemeet');
    });

    it('should reconstruct from subscriptions when both schemas fail', async () => {
      const mockGym = { id: '1', name: 'Reconstructed Gym' };

      // Tous les appels de gym échouent, mais subscriptions retourne des données
      mockSupabase.order
        .mockResolvedValueOnce({ data: [], error: null }) // public gym
        .mockResolvedValueOnce({ data: [], error: null }) // musclemeet gym
        .mockResolvedValueOnce({ data: [{ id_gym: '1' }], error: null }); // subscriptions

      // Mock pour la reconstruction depuis subscriptions
      mockSupabase.single.mockResolvedValueOnce({
        data: mockGym,
        error: null
      });

      const result = await gymService.getAllGyms();

      expect(result).toEqual([mockGym]);
    });

    it('should handle auth errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      });

      const result = await gymService.getAllGyms();

      expect(result).toEqual([]);
    });

    it('should return empty array when all methods fail', async () => {
      // Tous les appels retournent vide
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      const result = await gymService.getAllGyms();

      expect(result).toEqual([]);
    });
  });

  describe('getAllGymSubscriptions', () => {
    it('should return all gym subscriptions', async () => {
      const mockSubscriptions = [
        { id: '1', name: 'Premium', id_gym: '1' },
        { id: '2', name: 'Basic', id_gym: '1' }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockSubscriptions,
        error: null
      });

      const result = await gymService.getAllGymSubscriptions();

      expect(result).toEqual(mockSubscriptions);
      expect(mockSupabase.from).toHaveBeenCalledWith('gymsubscription');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('name');
    });

    it('should handle database errors', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await gymService.getAllGymSubscriptions();

      expect(result).toEqual([]);
    });
  });

  describe('getGymSubscriptions', () => {
    it('should return subscriptions for specific gym', async () => {
      const mockSubscriptions = [
        { id: '1', name: 'Premium', id_gym: 'gym1' },
        { id: '2', name: 'Basic', id_gym: 'gym1' }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockSubscriptions,
        error: null
      });

      const result = await gymService.getGymSubscriptions('gym1');

      expect(result).toEqual(mockSubscriptions);
      expect(mockSupabase.from).toHaveBeenCalledWith('gymsubscription');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id_gym', 'gym1');
      expect(mockSupabase.order).toHaveBeenCalledWith('name');
    });

    it('should return empty array for invalid gym ID', async () => {
      expect(await gymService.getGymSubscriptions('')).toEqual([]);
      expect(await gymService.getGymSubscriptions(null as any)).toEqual([]);
      expect(await gymService.getGymSubscriptions(undefined as any)).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await gymService.getGymSubscriptions('gym1');

      expect(result).toEqual([]);
    });
  });

  describe('updateUserGymSubscription', () => {
    it('should update user gym subscription successfully', async () => {
      // Mock pour le succès de la mise à jour
      mockSupabase.eq.mockResolvedValue({
        error: null
      });

      await expect(
        gymService.updateUserGymSubscription('user1', '1', '1')
      ).resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('profile');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        id_gym: 1,
        id_gymsubscription: 1
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id_user', 'user1');
      expect(mockProfileService.invalidateProfileCache).toHaveBeenCalledWith('user1');
      expect(mockProfileService.nukeAndReload).toHaveBeenCalledWith('user1');
    });

    it('should validate parameters', async () => {
      await expect(
        gymService.updateUserGymSubscription('', '1', '1')
      ).rejects.toThrow('Paramètres invalides pour la mise à jour de l\'abonnement');

      await expect(
        gymService.updateUserGymSubscription('user1', '', '1')
      ).rejects.toThrow('Paramètres invalides pour la mise à jour de l\'abonnement');

      await expect(
        gymService.updateUserGymSubscription('user1', '1', '')
      ).rejects.toThrow('Paramètres invalides pour la mise à jour de l\'abonnement');
    });

    it('should validate numeric IDs', async () => {
      await expect(
        gymService.updateUserGymSubscription('user1', 'not-a-number', '1')
      ).rejects.toThrow('Les IDs doivent être des nombres valides');

      await expect(
        gymService.updateUserGymSubscription('user1', '1', 'not-a-number')
      ).rejects.toThrow('Les IDs doivent être des nombres valides');
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' };
      mockSupabase.eq.mockResolvedValue({
        error: mockError
      });

      await expect(
        gymService.updateUserGymSubscription('user1', '1', '1')
      ).rejects.toEqual(mockError);
    });
  });

  describe('getUserCurrentSubscription', () => {
    it('should return user current subscription', async () => {
      const mockProfile = { id_gym: '1', id_gymsubscription: '1' };
      const mockGym = { id: '1', name: 'Test Gym' };
      const mockSubscription = { id: '1', name: 'Premium', id_gym: '1' };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockGym, error: null })
        .mockResolvedValueOnce({ data: mockSubscription, error: null });

      const result = await gymService.getUserCurrentSubscription('user1');

      expect(result).toEqual({
        gym: mockGym,
        subscription: mockSubscription
      });
    });

    it('should return null for invalid user ID', async () => {
      expect(await gymService.getUserCurrentSubscription('')).toEqual({ gym: null, subscription: null });
    });

    it('should handle missing profile', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result = await gymService.getUserCurrentSubscription('user1');

      expect(result).toEqual({ gym: null, subscription: null });
    });

    it('should handle partial data', async () => {
      const mockProfile = { id_gym: '1', id_gym_subscription: null };
      const mockGym = { id: '1', name: 'Test Gym' };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockGym, error: null });

      const result = await gymService.getUserCurrentSubscription('user1');

      expect(result).toEqual({
        gym: mockGym,
        subscription: null
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabase.order.mockRejectedValue(new Error('Network error'));

      const result = await gymService.getAllGyms();

      expect(result).toEqual([]);
    });

    it('should handle malformed data', async () => {
      const malformedData = [{ id: null, name: undefined }];
      mockSupabase.order.mockResolvedValue({
        data: malformedData,
        error: null
      });

      const result = await gymService.getAllGyms();

      expect(result).toEqual(malformedData);
    });

    it('should handle exceptions in updateUserGymSubscription', async () => {
      // Mock une exception dans la chaîne d'appels
      mockSupabase.update.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(
        gymService.updateUserGymSubscription('user1', '1', '1')
      ).rejects.toThrow('Unexpected error');
    });
  });

  describe('validateId behavior through public methods', () => {
    it('should handle various invalid inputs', async () => {
      // Ces appels ne doivent pas déclencher d'appels à la base de données car ils sont invalides
      const results = await Promise.all([
        gymService.getGymSubscriptions(''),
        gymService.getGymSubscriptions('undefined'),
        gymService.getGymSubscriptions('null')
      ]);
      
      // Tous les résultats devraient être des tableaux vides
      results.forEach(result => {
        expect(result).toEqual([]);
      });
      
      // Comme ces IDs sont invalides, aucun appel de base de données ne devrait être fait
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should accept valid IDs and make database calls', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null
      });

      await gymService.getGymSubscriptions('123');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('gymsubscription');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id_gym', '123');
    });
  });

  describe('Service integration', () => {
    it('should handle complete workflow', async () => {
      // Test d'un workflow complet : récupérer gyms -> abonnements -> mise à jour
      const mockGyms = [{ id: '1', name: 'Test Gym' }];
      const mockSubscriptions = [{ id: '1', name: 'Premium', id_gym: '1' }];

      // Mock pour getAllGyms (premier appel)
      mockSupabase.order.mockResolvedValueOnce({
        data: mockGyms,
        error: null
      });

      // Mock pour getGymSubscriptions (deuxième appel)
      // Il faut s'assurer que le chaînage est maintenu
      mockSupabase.from.mockReturnValueOnce(mockSupabase);
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.eq.mockReturnValueOnce(mockSupabase);
      mockSupabase.order.mockResolvedValueOnce({
        data: mockSubscriptions,
        error: null
      });

      // Mock pour updateUserGymSubscription (troisième appel)
      mockSupabase.from.mockReturnValueOnce(mockSupabase);
      mockSupabase.update.mockReturnValueOnce(mockSupabase);
      mockSupabase.eq.mockResolvedValue({
        error: null
      });

      // Exécuter le workflow
      const gyms = await gymService.getAllGyms();
      expect(gyms).toEqual(mockGyms);

      const subscriptions = await gymService.getGymSubscriptions('1');
      expect(subscriptions).toEqual(mockSubscriptions);

      await expect(
        gymService.updateUserGymSubscription('user1', '1', '1')
      ).resolves.not.toThrow();
    });
  });
});