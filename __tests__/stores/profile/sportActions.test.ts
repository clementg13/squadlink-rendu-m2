import { createSportActions, SportActions } from '@/stores/profile/sportActions';
import { sportService } from '@/services/sportService';
import { ProfileSport } from '@/types/profile';

// Mock des services
jest.mock('@/services/sportService');

// Mock console pour éviter le bruit dans les tests
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('createSportActions', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let sportActions: SportActions;

  const mockProfile = {
    id_user: 'user-123',
    sports: [
      { id_sport: 'sport-1', id_sportlevel: 'level-1' },
      { id_sport: 'sport-2', id_sportlevel: 'level-2' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSet = jest.fn();
    mockGet = jest.fn(() => ({
      handleError: jest.fn().mockReturnValue({ error: new Error('Erreur par défaut') }),
    }));
    
    sportActions = createSportActions(mockSet, mockGet);
  });

  describe('addUserSport', () => {
    it('ajoute un sport avec succès', async () => {
      const newSport: ProfileSport = {
        id_sport: 'sport-3',
        id_sportlevel: 'level-3'
      };

      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('sport-3', 'level-3');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'sport-3', 'level-3');
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          sports: [...mockProfile.sports, newSport]
        },
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await sportActions.addUserSport('sport-3', 'level-3');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(sportService.addUserSport).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de l\'ajout du sport') }),
      });

      (sportService.addUserSport as jest.Mock).mockRejectedValue(error);

      const result = await sportActions.addUserSport('sport-3', 'level-3');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de l\'ajout du sport');
    });

    it('gère les profils sans sports', async () => {
      const profileWithoutSports = {
        ...mockProfile,
        sports: []
      };

      const newSport: ProfileSport = {
        id_sport: 'sport-1',
        id_sportlevel: 'level-1'
      };

      mockGet.mockReturnValue({
        profile: profileWithoutSports
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('sport-1', 'level-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithoutSports,
          sports: [newSport]
        },
        saving: false
      });
    });

    it('gère les sports avec des niveaux complexes', async () => {
      const newSport: ProfileSport = {
        id_sport: 'football',
        id_sportlevel: 'expert'
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('football', 'expert');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'football', 'expert');
    });
  });

  describe('removeUserSport', () => {
    it('supprime un sport avec succès', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (sportService.removeUserSport as jest.Mock).mockResolvedValue(undefined);

      const result = await sportActions.removeUserSport('sport-1');

      expect(result.error).toBeNull();
      expect(sportService.removeUserSport).toHaveBeenCalledWith('user-123', 'sport-1');
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          sports: mockProfile.sports.filter(s => s.id_sport !== 'sport-1')
        },
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await sportActions.removeUserSport('sport-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(sportService.removeUserSport).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la suppression du sport') }),
      });

      (sportService.removeUserSport as jest.Mock).mockRejectedValue(error);

      const result = await sportActions.removeUserSport('sport-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la suppression du sport');
    });

    it('gère les profils sans sports', async () => {
      const profileWithoutSports = {
        ...mockProfile,
        sports: []
      };

      mockGet.mockReturnValue({
        profile: profileWithoutSports
      });

      (sportService.removeUserSport as jest.Mock).mockResolvedValue(undefined);

      const result = await sportActions.removeUserSport('sport-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithoutSports,
          sports: []
        },
        saving: false
      });
    });

    it('gère les sports inexistants', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.removeUserSport as jest.Mock).mockResolvedValue(undefined);

      const result = await sportActions.removeUserSport('sport-inexistant');

      expect(result.error).toBeNull();
      // Le sport inexistant ne devrait pas affecter la liste
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          sports: mockProfile.sports // Aucun changement
        },
        saving: false
      });
    });

    it('gère les sports avec des IDs complexes', async () => {
      const profileWithComplexSports = {
        ...mockProfile,
        sports: [
          { id_sport: 'football-123', id_sportlevel: 'beginner' },
          { id_sport: 'basketball-456', id_sportlevel: 'intermediate' }
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithComplexSports
      });

      (sportService.removeUserSport as jest.Mock).mockResolvedValue(undefined);

      const result = await sportActions.removeUserSport('football-123');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithComplexSports,
          sports: [{ id_sport: 'basketball-456', id_sportlevel: 'intermediate' }]
        },
        saving: false
      });
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les profils avec des sports null/undefined', async () => {
      const profileWithNullSports = {
        ...mockProfile,
        sports: null
      };

      const newSport: ProfileSport = {
        id_sport: 'sport-1',
        id_sportlevel: 'level-1'
      };

      mockGet.mockReturnValue({
        profile: profileWithNullSports
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('sport-1', 'level-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithNullSports,
          sports: [newSport]
        },
        saving: false
      });
    });

    it('gère les erreurs de type non-Error', async () => {
      const stringError = 'Erreur string';
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de l\'ajout du sport') }),
      });

      (sportService.addUserSport as jest.Mock).mockRejectedValue(stringError);

      const result = await sportActions.addUserSport('sport-3', 'level-3');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de l\'ajout du sport');
    });

    it('gère les sports avec des propriétés manquantes', async () => {
      const profileWithIncompleteSports = {
        ...mockProfile,
        sports: [
          { id_sport: 'sport-1' }, // id_sportlevel manquant
          { id_sportlevel: 'level-2' } // id_sport manquant
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithIncompleteSports
      });

      (sportService.removeUserSport as jest.Mock).mockResolvedValue(undefined);

      const result = await sportActions.removeUserSport('sport-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithIncompleteSports,
          sports: [{ id_sportlevel: 'level-2' }]
        },
        saving: false
      });
    });

    it('gère les appels multiples rapides', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue({
        id_sport: 'sport-3',
        id_sportlevel: 'level-3'
      });

      const promises = [
        sportActions.addUserSport('sport-3', 'level-3'),
        sportActions.addUserSport('sport-4', 'level-4'),
        sportActions.addUserSport('sport-5', 'level-5')
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.error).toBeNull();
      });
    });

    it('gère les sports avec des niveaux spéciaux', async () => {
      const newSport: ProfileSport = {
        id_sport: 'tennis',
        id_sportlevel: 'pro'
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('tennis', 'pro');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'tennis', 'pro');
    });

    it('gère les sports avec des IDs numériques', async () => {
      const newSport: ProfileSport = {
        id_sport: '1',
        id_sportlevel: '2'
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('1', '2');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', '1', '2');
    });

    it('gère les sports avec des niveaux vides', async () => {
      const newSport: ProfileSport = {
        id_sport: 'sport-3',
        id_sportlevel: ''
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('sport-3', '');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'sport-3', '');
    });

    it('gère les sports avec des niveaux avec espaces', async () => {
      const newSport: ProfileSport = {
        id_sport: 'sport-3',
        id_sportlevel: '  level with spaces  '
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('sport-3', '  level with spaces  ');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'sport-3', '  level with spaces  ');
    });

    it('gère les sports avec des caractères spéciaux', async () => {
      const newSport: ProfileSport = {
        id_sport: 'sport-with-dashes',
        id_sportlevel: 'level_with_underscores'
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('sport-with-dashes', 'level_with_underscores');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'sport-with-dashes', 'level_with_underscores');
    });

    it('gère les sports avec des niveaux en majuscules', async () => {
      const newSport: ProfileSport = {
        id_sport: 'football',
        id_sportlevel: 'EXPERT'
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('football', 'EXPERT');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'football', 'EXPERT');
    });

    it('gère les sports avec des niveaux mixtes', async () => {
      const newSport: ProfileSport = {
        id_sport: 'basketball',
        id_sportlevel: 'InTeRmEdIaTe'
      };

      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (sportService.addUserSport as jest.Mock).mockResolvedValue(newSport);

      const result = await sportActions.addUserSport('basketball', 'InTeRmEdIaTe');

      expect(result.error).toBeNull();
      expect(sportService.addUserSport).toHaveBeenCalledWith('user-123', 'basketball', 'InTeRmEdIaTe');
    });
  });
}); 