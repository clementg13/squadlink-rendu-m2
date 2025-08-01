import { createProfileActions, ProfileActions } from '@/stores/profile/profileActions';
import { profileService } from '@/services/profileService';
import { hobbyService } from '@/services/hobbyService';
import { sportService } from '@/services/sportService';
import { socialMediaService } from '@/services/socialMediaService';
import { useAuthStore } from '@/stores/authStore';
import { UserProfile } from '@/types/profile';

// Mock des services
jest.mock('@/services/profileService');
jest.mock('@/services/hobbyService');
jest.mock('@/services/sportService');
jest.mock('@/services/socialMediaService');
jest.mock('@/stores/authStore');

// Mock console pour éviter le bruit dans les tests
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('createProfileActions', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let profileActions: ProfileActions;

  const mockUser = { id: 'user-123' };
  const mockProfile: UserProfile = {
    id_user: 'user-123',
    firstname: 'John',
    lastname: 'Doe',
    birthdate: '1995-06-15',
    biography: 'Passionné de sport',
    id_location: 'location-1',
    id_gym: 'gym-1',
    id_gymsubscription: 'subscription-1',
    fully_completed: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSet = jest.fn();
    mockGet = jest.fn(() => ({
      handleError: jest.fn().mockReturnValue({ error: new Error('Erreur par défaut') }),
    }));
    
    profileActions = createProfileActions(mockSet, mockGet);
  });

  describe('setProfile', () => {
    it('définit le profil correctement', () => {
      profileActions.setProfile(mockProfile);

      expect(mockSet).toHaveBeenCalledWith({ profile: mockProfile });
    });

    it('peut définir un profil null', () => {
      profileActions.setProfile(null);

      expect(mockSet).toHaveBeenCalledWith({ profile: null });
    });
  });

  describe('setLoading', () => {
    it('définit l\'état de chargement', () => {
      profileActions.setLoading(true);

      expect(mockSet).toHaveBeenCalledWith({ loading: true });
    });

    it('peut désactiver le chargement', () => {
      profileActions.setLoading(false);

      expect(mockSet).toHaveBeenCalledWith({ loading: false });
    });
  });

  describe('setSaving', () => {
    it('définit l\'état de sauvegarde', () => {
      profileActions.setSaving(true);

      expect(mockSet).toHaveBeenCalledWith({ saving: true });
    });

    it('peut désactiver la sauvegarde', () => {
      profileActions.setSaving(false);

      expect(mockSet).toHaveBeenCalledWith({ saving: false });
    });
  });

  describe('setError', () => {
    it('définit une erreur', () => {
      profileActions.setError('Erreur test');

      expect(mockSet).toHaveBeenCalledWith({ error: 'Erreur test' });
    });

    it('peut définir une erreur null', () => {
      profileActions.setError(null);

      expect(mockSet).toHaveBeenCalledWith({ error: null });
    });
  });

  describe('clearError', () => {
    it('efface l\'erreur', () => {
      profileActions.clearError();

      expect(mockSet).toHaveBeenCalledWith({ error: null });
    });
  });

  describe('loadProfile', () => {
    beforeEach(() => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: mockUser });
    });

    it('charge un profil existant avec succès', async () => {
      const mockProfile = {
        id_user: 'user-123',
        firstname: 'John',
        lastname: 'Doe',
        biography: 'Passionné de sport',
        birthdate: '1995-06-15',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        fully_completed: true,
        id_gym: 'gym-1',
        id_gymsubscription: 'subscription-1',
        id_location: 'location-1',
        gym: { id: 'gym-1', name: 'Fitness Club' },
        gymsubscription: { id: 'subscription-1', name: 'Premium' },
        location: { id: 'location-1', town: 'Paris' },
        hobbies: [{ id_hobbie: 'hobby-1', is_highlighted: true }],
        sports: [{ id_sport: 'sport-1', id_sportlevel: 'level-1' }],
        socialMedias: [{ id_social_media: 'sm-1', username: 'john_doe' }]
      };

      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn(),
      });

      (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      await profileActions.loadProfile();

      expect(mockSet).toHaveBeenCalledWith({
        loading: true,
        error: null
      });
      // Vérifier que le dernier appel contient le profil avec les données enrichies
      const lastCall = mockSet.mock.calls[mockSet.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({
        profile: expect.objectContaining({
          id_user: 'user-123',
          firstname: 'John',
          lastname: 'Doe',
          biography: 'Passionné de sport',
          birthdate: '1995-06-15',
          fully_completed: true,
          id_gym: 'gym-1',
          id_gymsubscription: 'subscription-1',
          id_location: 'location-1',
          hobbies: [],
          sports: [],
          socialMedias: []
        }),
        loading: false
      });
    });

    it('crée un nouveau profil si aucun profil n\'existe', async () => {
      (profileService.getProfile as jest.Mock).mockResolvedValue(null);
      (profileService.createProfile as jest.Mock).mockResolvedValue(mockProfile);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
      expect(profileService.createProfile).toHaveBeenCalledWith('user-123');
      expect(mockSet).toHaveBeenCalledWith({
        profile: mockProfile,
        loading: false
      });
    });

    it('gère l\'erreur d\'utilisateur non connecté', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: null });

      const result = await profileActions.loadProfile();

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Utilisateur non connecté');
      expect(profileService.getProfile).not.toHaveBeenCalled();
    });

    it('gère les erreurs de chargement', async () => {
      const error = new Error('Erreur réseau');
      (profileService.getProfile as jest.Mock).mockRejectedValue(error);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeInstanceOf(Error);
      expect(mockSet).toHaveBeenCalledWith({
        error: 'Erreur réseau',
        loading: false
      });
    });

    it('gère les profils sans relations', async () => {
      const profileWithoutRelations = {
        ...mockProfile,
        id_location: null,
        id_gym: null,
        id_gymsubscription: null
      };

      (profileService.getProfile as jest.Mock).mockResolvedValue(profileWithoutRelations);
      (hobbyService.getUserHobbies as jest.Mock).mockResolvedValue([]);
      (sportService.getUserSports as jest.Mock).mockResolvedValue([]);
      (socialMediaService.getUserSocialMedias as jest.Mock).mockResolvedValue([]);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
      expect(profileService.getLocationDetails).not.toHaveBeenCalled();
      expect(profileService.getGymDetails).not.toHaveBeenCalled();
      expect(profileService.getGymSubscriptionDetails).not.toHaveBeenCalled();
    });

    it('gère les erreurs partielles des relations', async () => {
      (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
      (profileService.getLocationDetails as jest.Mock).mockRejectedValue(new Error('Erreur location'));
      (profileService.getGymDetails as jest.Mock).mockResolvedValue({ id: 'gym-1', name: 'Fitness Club' });
      (hobbyService.getUserHobbies as jest.Mock).mockResolvedValue([]);
      (sportService.getUserSports as jest.Mock).mockResolvedValue([]);
      (socialMediaService.getUserSocialMedias as jest.Mock).mockResolvedValue([]);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
      // Le profil devrait être chargé même avec des erreurs partielles
      expect(mockSet).toHaveBeenCalledWith({
        profile: expect.objectContaining({
          location: undefined,
          gym: { id: 'gym-1', name: 'Fitness Club' }
        }),
        loading: false
      });
    });
  });

  describe('updateProfile', () => {
    beforeEach(() => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });
    });

    it('met à jour le profil avec succès', async () => {
      const updates = {
        firstname: 'Jane',
        lastname: 'Smith',
        biography: 'Nouvelle bio'
      };

      const updatedProfile = {
        ...mockProfile,
        ...updates
      };

      (profileService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const result = await profileActions.updateProfile(updates);

      expect(result.error).toBeNull();
      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', updates);
      expect(mockSet).toHaveBeenCalledWith({
        profile: updatedProfile,
        saving: false
      });
    });

    it('nettoie les données avant mise à jour', async () => {
      const updates = {
        firstname: 'Jane',
        lastname: 'Smith',
        biography: 'Nouvelle bio',
        birthdate: '1995-06-15'
      };

      const cleanedUpdates = {
        firstname: 'Jane',
        lastname: 'Smith',
        biography: 'Nouvelle bio',
        birthdate: '1995-06-15'
      };

      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        handleError: jest.fn(),
      });

      (profileService.updateProfile as jest.Mock).mockResolvedValue(undefined);

      await profileActions.updateProfile(updates);

      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', cleanedUpdates);
    });

    it('gère les dates de naissance vides', async () => {
      const updates = {
        birthdate: ''
      };

      (profileService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);

      await profileActions.updateProfile(updates);

      // birthdate devrait être supprimé du payload
      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', {});
    });

    it('gère les champs texte vides', async () => {
      const updates = {
        firstname: '',
        lastname: '   ',
        biography: ''
      };

      (profileService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);

      await profileActions.updateProfile(updates);

      // Les champs vides devraient être supprimés
      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', {});
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await profileActions.updateProfile({ firstname: 'Jane' });

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la mise à jour du profil') }),
      });

      (profileService.updateProfile as jest.Mock).mockRejectedValue(error);

      const result = await profileActions.updateProfile({ firstname: 'Jane' });

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la mise à jour du profil');
    });

    it('retourne le profil actuel si aucune donnée à mettre à jour', async () => {
      const currentProfile = { id_user: 'user-123', firstname: 'John' };
      mockGet.mockReturnValue({
        profile: currentProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Aucune donnée à mettre à jour') }),
      });

      const result = await profileActions.updateProfile({});

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Aucune donnée à mettre à jour');
    });
  });

  describe('updateLocation', () => {
    beforeEach(() => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });
    });

    it('met à jour la localisation avec succès', async () => {
      const locationData = {
        town: 'Lyon',
        postal_code: 69000,
        latitude: 45.7578,
        longitude: 4.832
      };

      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        handleError: jest.fn(),
      });

      (profileService.updateLocation as jest.Mock).mockResolvedValue(undefined);
      (profileService.getProfile as jest.Mock).mockResolvedValue({ id_user: 'user-123' });

      await profileActions.updateLocation(locationData);

      expect(profileService.updateLocation).toHaveBeenCalledWith('user-123', locationData);
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      // Vérifier que les appels attendus ont été faits
      expect(mockSet).toHaveBeenCalled();
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await profileActions.updateLocation({
        town: 'Lyon',
        postal_code: 69000,
        latitude: 45.7578,
        longitude: 4.832
      });

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(profileService.updateLocation).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la mise à jour de la localisation') }),
      });

      (profileService.updateLocation as jest.Mock).mockRejectedValue(error);

      const result = await profileActions.updateLocation({
        town: 'Lyon',
        postal_code: 69000,
        latitude: 45.7578,
        longitude: 4.832
      });

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la mise à jour de la localisation');
    });
  });

  describe('handleError', () => {
    it('gère les erreurs avec message par défaut', () => {
      const error = new Error('Erreur spécifique');
      const result = profileActions.handleError('testAction', error, 'Message par défaut');

      expect(result.error.message).toBe('Erreur spécifique');
      expect(mockSet).toHaveBeenCalledWith({
        saving: false,
        loading: false,
        error: 'Erreur spécifique'
      });
    });

    it('gère les erreurs non-Error', () => {
      const stringError = 'Erreur string';
      const result = profileActions.handleError('testAction', stringError, 'Message par défaut');

      expect(result.error.message).toBe('Message par défaut');
      expect(mockSet).toHaveBeenCalledWith({
        saving: false,
        loading: false,
        error: 'Message par défaut'
      });
    });

    it('gère les erreurs null/undefined', () => {
      const result = profileActions.handleError('testAction', null, 'Message par défaut');

      expect(result.error.message).toBe('Message par défaut');
      expect(mockSet).toHaveBeenCalledWith({
        saving: false,
        loading: false,
        error: 'Message par défaut'
      });
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les profils avec des données partielles', async () => {
      const incompleteProfile = {
        id_user: 'user-123',
        firstname: 'John',
        // Autres champs manquants
      };

      mockGet.mockReturnValue({
        profile: incompleteProfile
      });

      (profileService.updateProfile as jest.Mock).mockResolvedValue(incompleteProfile);

      const result = await profileActions.updateProfile({ lastname: 'Doe' });

      expect(result.error).toBeNull();
    });

    it('gère les mises à jour avec des types de données complexes', async () => {
      const complexUpdates = {
        firstname: 'Jane',
        birthdate: new Date('1995-06-15'),
        hobbies: ['hobby1', 'hobby2'],
        metadata: { key: 'value' }
      };

      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la mise à jour du profil') }),
      });

      (profileService.updateProfile as jest.Mock).mockRejectedValue(new Error('Erreur complexe'));

      const result = await profileActions.updateProfile(complexUpdates);

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la mise à jour du profil');
    });

    it('gère les appels multiples rapides', async () => {
      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la mise à jour du profil') }),
      });

      (profileService.updateProfile as jest.Mock).mockRejectedValue(new Error('Erreur concurrente'));

      const promises = [
        profileActions.updateProfile({ firstname: 'Jane' }),
        profileActions.updateProfile({ lastname: 'Smith' }),
        profileActions.updateProfile({ biography: 'Bio' })
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result?.error).toBeInstanceOf(Error);
      });
    });
  });
}); 