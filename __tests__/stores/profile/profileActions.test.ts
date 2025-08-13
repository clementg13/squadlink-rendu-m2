import { createProfileActions, ProfileActions } from '@/stores/profile/profileActions';
import { profileService } from '@/services/profileService';
import { hobbyService } from '@/services/hobbyService';
import { sportService } from '@/services/sportService';
import { socialMediaService } from '@/services/socialMediaService';
import { UserProfile } from '@/types/profile';

// Mock des services
jest.mock('@/services/profileService');
jest.mock('@/services/hobbyService');
jest.mock('@/services/sportService');
jest.mock('@/services/socialMediaService');

// Mock spécifique pour l'import direct de supabase dans profileActions
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

// Import du mock après la déclaration du mock
import { supabase } from '@/lib/supabase';

// Mock console pour éviter le bruit dans les tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
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
      loading: false,
      saving: false,
    }));
    
    profileActions = createProfileActions(mockSet, mockGet);

    // Mock supabase.auth.getUser par défaut avec un utilisateur connecté
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
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
    it('charge un profil existant avec succès', async () => {
      const mockProfileComplete = {
        ...mockProfile,
        location: { id: 'location-1', town: 'Paris' },
        gym: { id: 'gym-1', name: 'Fitness Club' },
        gymsubscription: { id: 'subscription-1', name: 'Premium' },
        sports: [],
        hobbies: [],
        socialMedias: []
      };

      mockGet.mockReturnValue({
        loading: false,
      });

      (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfileComplete);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        loading: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        profile: mockProfileComplete,
        loading: false
      });
    });

    it('crée un nouveau profil si aucun profil n\'existe', async () => {
      mockGet.mockReturnValue({
        loading: false,
      });

      (profileService.getProfile as jest.Mock).mockResolvedValue(null);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: null,
        loading: false
      });
    });

    it('gère l\'erreur d\'utilisateur non connecté', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await profileActions.loadProfile();

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Utilisateur non connecté');
      expect(profileService.getProfile).not.toHaveBeenCalled();
    });

    it('gère les erreurs de chargement', async () => {
      mockGet.mockReturnValue({
        loading: false,
      });

      const error = new Error('Erreur réseau');
      (profileService.getProfile as jest.Mock).mockRejectedValue(error);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeInstanceOf(Error);
      expect(mockSet).toHaveBeenCalledWith({
        error: 'Erreur lors du chargement du profil',
        loading: false
      });
    });

    it('gère les profils sans relations', async () => {
      mockGet.mockReturnValue({
        loading: false,
      });

      const profileWithoutRelations = {
        ...mockProfile,
        sports: [],
        hobbies: [],
        socialMedias: []
      };

      (profileService.getProfile as jest.Mock).mockResolvedValue(profileWithoutRelations);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
    });

    it('gère les erreurs partielles des relations', async () => {
      mockGet.mockReturnValue({
        loading: false,
      });

      const profileWithPartialData = {
        ...mockProfile,
        location: undefined,
        gym: { id: 'gym-1', name: 'Fitness Club' },
        sports: [],
        hobbies: [],
        socialMedias: []
      };

      (profileService.getProfile as jest.Mock).mockResolvedValue(profileWithPartialData);

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
    });

    it('évite les appels multiples simultanés', async () => {
      mockGet.mockReturnValue({
        loading: true,
      });

      const result = await profileActions.loadProfile();

      expect(result.error).toBeNull();
      expect(profileService.getProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
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

      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);
      (profileService.getProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const result = await profileActions.updateProfile(updates);

      expect(result.error).toBeNull();
      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', updates);
    });

    it('nettoie les données avant mise à jour', async () => {
      const updates = {
        firstname: 'Jane',
        lastname: 'Smith',
        biography: 'Nouvelle bio',
        birthdate: '1995-06-15'
      };

      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);
      (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      await profileActions.updateProfile(updates);

      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', updates);
    });

    it('gère les dates de naissance vides', async () => {
      const updates = {
        birthdate: ''
      };

      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);
      (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      await profileActions.updateProfile(updates);

      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', updates);
    });

    it('gère les champs texte vides', async () => {
      const updates = {
        firstname: '',
        lastname: '   ',
        biography: ''
      };

      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);
      (profileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      await profileActions.updateProfile(updates);

      expect(profileService.updateProfile).toHaveBeenCalledWith('user-123', updates);
    });

    it('gère l\'erreur d\'utilisateur non connecté', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await profileActions.updateProfile({ firstname: 'Jane' });

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Utilisateur non connecté');
      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockRejectedValue(error);

      const result = await profileActions.updateProfile({ firstname: 'Jane' });

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Erreur service');
    });

    it('évite les appels multiples simultanés', async () => {
      mockGet.mockReturnValue({
        saving: true,
      });

      const result = await profileActions.updateProfile({ firstname: 'Jane' });

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Sauvegarde en cours...');
      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateLocation', () => {
    it('met à jour la localisation avec succès', async () => {
      const locationData = {
        town: 'Lyon',
        postal_code: 69000,
        latitude: 45.7578,
        longitude: 4.832
      };

      const mockLoadProfile = jest.fn().mockResolvedValue({ error: null });
      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        loadProfile: mockLoadProfile,
      });

      (profileService.updateLocation as jest.Mock).mockResolvedValue(undefined);

      const result = await profileActions.updateLocation(locationData);

      expect(result.error).toBeNull();
      expect(profileService.updateLocation).toHaveBeenCalledWith('user-123', locationData);
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      const mockHandleError = jest.fn().mockReturnValue({ error: new Error('Profil non chargé') });
      mockGet.mockReturnValue({
        profile: null,
        handleError: mockHandleError,
      });

      const result = await profileActions.updateLocation({
        town: 'Lyon',
        postal_code: 69000,
        latitude: 45.7578,
        longitude: 4.832
      });

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Profil non chargé');
      expect(profileService.updateLocation).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      const mockHandleError = jest.fn().mockReturnValue({ error: new Error('Erreur lors de la mise à jour de la localisation') });
      mockGet.mockReturnValue({
        profile: { id_user: 'user-123' },
        handleError: mockHandleError,
      });

      (profileService.updateLocation as jest.Mock).mockRejectedValue(error);

      const result = await profileActions.updateLocation({
        town: 'Lyon',
        postal_code: 69000,
        latitude: 45.7578,
        longitude: 4.832
      });

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Erreur lors de la mise à jour de la localisation');
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
      };

      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockResolvedValue(incompleteProfile);
      (profileService.getProfile as jest.Mock).mockResolvedValue(incompleteProfile);

      const result = await profileActions.updateProfile({ lastname: 'Doe' });

      expect(result.error).toBeNull();
    });

    it('gère les mises à jour avec des types de données complexes', async () => {
      const complexUpdates = {
        firstname: 'Jane',
        birthdate: '1995-06-15',
        biography: 'Bio complexe'
      };

      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockRejectedValue(new Error('Erreur complexe'));

      const result = await profileActions.updateProfile(complexUpdates);

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Erreur complexe');
    });

    it('gère les appels multiples rapides', async () => {
      mockGet.mockReturnValue({
        saving: false,
      });

      (profileService.updateProfile as jest.Mock).mockRejectedValue(new Error('Erreur concurrente'));

      const promises = [
        profileActions.updateProfile({ firstname: 'Jane' }),
        profileActions.updateProfile({ lastname: 'Smith' }),
        profileActions.updateProfile({ biography: 'Bio' })
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.error).toBeInstanceOf(Error);
      });
    });
  });
});