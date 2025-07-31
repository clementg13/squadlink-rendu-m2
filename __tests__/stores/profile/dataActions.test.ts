import { createDataActions, DataActions } from '@/stores/profile/dataActions';
import { profileService } from '@/services/profileService';
import { sportService } from '@/services/sportService';
import { socialMediaService } from '@/services/socialMediaService';
import { useAuthStore } from '@/stores/authStore';

// Mock des services
jest.mock('@/services/profileService');
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

describe('createDataActions', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let dataActions: DataActions;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSet = jest.fn();
    mockGet = jest.fn();
    
    dataActions = createDataActions(mockSet, mockGet);
  });

  describe('loadAllGyms', () => {
    it('charge les gyms avec succès', async () => {
      const mockGyms = [
        { id: '1', name: 'Fitness Club Paris' },
        { id: '2', name: 'Gym Lyon' }
      ];

      (profileService.getAllGyms as jest.Mock).mockResolvedValue(mockGyms);

      const result = await dataActions.loadAllGyms();

      expect(result.error).toBeNull();
      expect(profileService.getAllGyms).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ gyms: mockGyms });
    });

    it('gère les erreurs lors du chargement des gyms', async () => {
      const error = new Error('Erreur réseau');
      (profileService.getAllGyms as jest.Mock).mockRejectedValue(error);

      const result = await dataActions.loadAllGyms();

      expect(result.error).toBe(error);
      expect(console.error).toHaveBeenCalledWith(
        '❌ ProfileStore - loadAllGyms:',
        error
      );
    });
  });

  describe('loadGymSubscriptions', () => {
    it('charge les abonnements de gym avec succès', async () => {
      const mockSubscriptions = [
        { id: '1', name: 'Premium' },
        { id: '2', name: 'Basic' }
      ];

      (profileService.getGymSubscriptions as jest.Mock).mockResolvedValue(mockSubscriptions);

      const result = await dataActions.loadGymSubscriptions('gym-123');

      expect(result.error).toBeNull();
      expect(profileService.getGymSubscriptions).toHaveBeenCalledWith('gym-123');
      expect(mockSet).toHaveBeenCalledWith({ gymSubscriptions: mockSubscriptions });
    });

    it('charge les abonnements sans gymId', async () => {
      const mockSubscriptions = [
        { id: '1', name: 'Premium' }
      ];

      (profileService.getGymSubscriptions as jest.Mock).mockResolvedValue(mockSubscriptions);

      const result = await dataActions.loadGymSubscriptions();

      expect(result.error).toBeNull();
      expect(profileService.getGymSubscriptions).toHaveBeenCalledWith(undefined);
    });

    it('gère les erreurs lors du chargement des abonnements', async () => {
      const error = new Error('Erreur base de données');
      (profileService.getGymSubscriptions as jest.Mock).mockRejectedValue(error);

      const result = await dataActions.loadGymSubscriptions('gym-123');

      expect(result.error).toBe(error);
      expect(console.error).toHaveBeenCalledWith(
        '❌ ProfileStore - loadGymSubscriptions:',
        error
      );
    });
  });

  describe('loadAllHobbies', () => {
    it('charge les hobbies avec succès', async () => {
      const mockHobbies = [
        { id: '1', name: 'Lecture' },
        { id: '2', name: 'Musique' }
      ];

      (profileService.getAllHobbies as jest.Mock).mockResolvedValue(mockHobbies);

      const result = await dataActions.loadAllHobbies();

      expect(result.error).toBeNull();
      expect(profileService.getAllHobbies).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ hobbies: mockHobbies });
    });

    it('gère les erreurs lors du chargement des hobbies', async () => {
      const error = new Error('Erreur service');
      (profileService.getAllHobbies as jest.Mock).mockRejectedValue(error);

      const result = await dataActions.loadAllHobbies();

      expect(result.error).toBe(error);
      expect(console.error).toHaveBeenCalledWith(
        '❌ ProfileStore - loadAllHobbies:',
        error
      );
    });
  });

  describe('loadAllSports', () => {
    it('charge les sports avec succès', async () => {
      const mockSports = [
        { id: '1', name: 'Football' },
        { id: '2', name: 'Basketball' }
      ];

      (sportService.getAllSports as jest.Mock).mockResolvedValue(mockSports);

      const result = await dataActions.loadAllSports();

      expect(result.error).toBeNull();
      expect(sportService.getAllSports).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ sports: mockSports });
    });

    it('gère les erreurs lors du chargement des sports', async () => {
      const error = new Error('Erreur API');
      (sportService.getAllSports as jest.Mock).mockRejectedValue(error);

      const result = await dataActions.loadAllSports();

      expect(result.error).toBe(error);
      expect(console.error).toHaveBeenCalledWith(
        '❌ ProfileStore - loadAllSports:',
        error
      );
    });
  });

  describe('loadAllSportLevels', () => {
    it('charge les niveaux de sport avec succès', async () => {
      const mockLevels = [
        { id: '1', name: 'Débutant' },
        { id: '2', name: 'Intermédiaire' }
      ];

      (sportService.getAllSportLevels as jest.Mock).mockResolvedValue(mockLevels);

      const result = await dataActions.loadAllSportLevels();

      expect(result.error).toBeNull();
      expect(sportService.getAllSportLevels).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ sportLevels: mockLevels });
    });

    it('gère les erreurs lors du chargement des niveaux', async () => {
      const error = new Error('Erreur service');
      (sportService.getAllSportLevels as jest.Mock).mockRejectedValue(error);

      const result = await dataActions.loadAllSportLevels();

      expect(result.error).toBe(error);
      expect(console.error).toHaveBeenCalledWith(
        '❌ ProfileStore - loadAllSportLevels:',
        error
      );
    });
  });

  describe('loadAllSocialMedias', () => {
    it('charge les réseaux sociaux avec succès', async () => {
      const mockSocialMedias = [
        { id: '1', name: 'Instagram' },
        { id: '2', name: 'Twitter' }
      ];

      (socialMediaService.getAllSocialMedias as jest.Mock).mockResolvedValue(mockSocialMedias);

      const result = await dataActions.loadAllSocialMedias();

      expect(result.error).toBeNull();
      expect(socialMediaService.getAllSocialMedias).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ socialMedias: mockSocialMedias });
    });

    it('gère les erreurs lors du chargement des réseaux sociaux', async () => {
      const error = new Error('Erreur réseau');
      (socialMediaService.getAllSocialMedias as jest.Mock).mockRejectedValue(error);

      const result = await dataActions.loadAllSocialMedias();

      expect(result.error).toBe(error);
      expect(console.error).toHaveBeenCalledWith(
        '❌ ProfileStore - loadAllSocialMedias:',
        error
      );
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      // Mock des services pour initialize
      (sportService.getAllSports as jest.Mock).mockResolvedValue([]);
      (sportService.getAllSportLevels as jest.Mock).mockResolvedValue([]);
      (socialMediaService.getAllSocialMedias as jest.Mock).mockResolvedValue([]);
      (profileService.getAllGyms as jest.Mock).mockResolvedValue([]);
      (profileService.getGymSubscriptions as jest.Mock).mockResolvedValue([]);
      (profileService.getAllHobbies as jest.Mock).mockResolvedValue([]);
    });

    it('initialise le store avec succès', async () => {
      mockGet.mockReturnValue({
        sports: [],
        sportLevels: [],
        socialMedias: [],
        initialized: false
      });

      (useAuthStore.getState as jest.Mock).mockReturnValue({
        user: { id: 'user-123' }
      });

      await dataActions.initialize();

      // On vérifie que les appels à mockSet contiennent bien les objets attendus
      expect(mockSet.mock.calls).toEqual(
        expect.arrayContaining([
          [expect.objectContaining({ loading: true, error: null, initialized: false })],
          [expect.objectContaining({
            sports: [],
            sportLevels: [],
            hobbies: [],
            gyms: [],
            gymSubscriptions: [],
            socialMedias: []
          })],
          [expect.objectContaining({ initialized: true })]
        ])
      );
    });

    it('évite la réinitialisation si déjà initialisé', async () => {
      mockGet.mockReturnValue({
        sports: [{ id: '1', name: 'Football' }],
        sportLevels: [{ id: '1', name: 'Débutant' }],
        socialMedias: [{ id: '1', name: 'Instagram' }],
        initialized: true
      });

      await dataActions.initialize();

      // Ne devrait pas appeler les services si déjà initialisé
      expect(sportService.getAllSports).not.toHaveBeenCalled();
      expect(sportService.getAllSportLevels).not.toHaveBeenCalled();
      expect(socialMediaService.getAllSocialMedias).not.toHaveBeenCalled();
    });

    it('force la réinitialisation si données manquantes', async () => {
      mockGet.mockReturnValue({
        sports: [],
        sportLevels: [{ id: '1', name: 'Débutant' }],
        socialMedias: [],
        initialized: true
      });

      await dataActions.initialize();

      // Devrait appeler les services pour recharger les données manquantes
      expect(sportService.getAllSports).toHaveBeenCalled();
      expect(sportService.getAllSportLevels).toHaveBeenCalled();
      expect(socialMediaService.getAllSocialMedias).toHaveBeenCalled();
    });

    it('gère les erreurs lors de l\'initialisation', async () => {
      mockGet.mockReturnValue({
        sports: [],
        sportLevels: [],
        socialMedias: [],
        initialized: false
      });

      (sportService.getAllSports as jest.Mock).mockRejectedValue(new Error('Erreur réseau'));

      await dataActions.initialize();

      expect(mockSet).toHaveBeenCalledWith({
        loading: false,
        initialized: true,
        error: 'Erreur lors de l\'initialisation'
      });
    });

    it('gère l\'absence d\'utilisateur connecté', async () => {
      mockGet.mockReturnValue({
        sports: [],
        sportLevels: [],
        socialMedias: [],
        initialized: false
      });

      (useAuthStore.getState as jest.Mock).mockReturnValue({
        user: null
      });

      await dataActions.initialize();

      // On vérifie qu'un des appels à mockSet contient loading: false
      expect(mockSet.mock.calls).toEqual(
        expect.arrayContaining([
          [expect.objectContaining({ loading: false })]
        ])
      );
    });
  });

  describe('cleanup', () => {
    it('nettoie correctement l\'état du store', () => {
      dataActions.cleanup();

      expect(mockSet).toHaveBeenCalledWith({
        profile: null,
        gyms: [],
        gymSubscriptions: [],
        hobbies: [],
        sports: [],
        sportLevels: [],
        socialMedias: [],
        loading: false,
        saving: false,
        error: null,
        initialized: false
      });
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les services qui retournent des données vides', async () => {
      (profileService.getAllGyms as jest.Mock).mockResolvedValue([]);
      (sportService.getAllSports as jest.Mock).mockResolvedValue([]);

      const gymsResult = await dataActions.loadAllGyms();
      const sportsResult = await dataActions.loadAllSports();

      expect(gymsResult.error).toBeNull();
      expect(sportsResult.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({ gyms: [] });
      expect(mockSet).toHaveBeenCalledWith({ sports: [] });
    });

    it('gère les erreurs de type non-Error', async () => {
      const stringError = 'Erreur string';
      (profileService.getAllGyms as jest.Mock).mockRejectedValue(stringError);

      const result = await dataActions.loadAllGyms();

      expect(result.error).toBe(stringError);
    });

    it('gère les promesses qui échouent partiellement', async () => {
      mockGet.mockReturnValue({
        sports: [],
        sportLevels: [],
        socialMedias: [],
        initialized: false
      });

      (sportService.getAllSports as jest.Mock).mockResolvedValue([{ id: '1', name: 'Football' }]);
      (sportService.getAllSportLevels as jest.Mock).mockRejectedValue(new Error('Erreur niveaux'));
      (socialMediaService.getAllSocialMedias as jest.Mock).mockResolvedValue([{ id: '1', name: 'Instagram' }]);

      await dataActions.initialize();

      // On vérifie que le dernier appel à mockSet contient bien l'erreur d'initialisation
      const lastCall = mockSet.mock.calls[mockSet.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({
        error: "Erreur lors de l'initialisation",
        initialized: true,
        loading: false
      });
    });
  });
}); 