import { createHobbyActions, HobbyActions } from '@/stores/profile/hobbyActions';
import { hobbyService } from '@/services/hobbyService';
import { ProfileHobby } from '@/types/profile';

// Mock des services
jest.mock('@/services/hobbyService');

// Mock console pour éviter le bruit dans les tests
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('createHobbyActions', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let hobbyActions: HobbyActions;

  const mockProfile = {
    id_user: 'user-123',
    hobbies: [
      { id_hobbie: 'hobby-1', is_highlighted: true },
      { id_hobbie: 'hobby-2', is_highlighted: false }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSet = jest.fn();
    mockGet = jest.fn(() => ({
      handleError: jest.fn().mockReturnValue({ error: new Error('Erreur par défaut') }),
    }));
    
    hobbyActions = createHobbyActions(mockSet, mockGet);
  });

  describe('addUserHobby', () => {
    it('ajoute un hobby avec succès', async () => {
      const newHobby: ProfileHobby = {
        id_hobbie: 'hobby-3',
        is_highlighted: false
      };

      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (hobbyService.addUserHobby as jest.Mock).mockResolvedValue(newHobby);

      const result = await hobbyActions.addUserHobby('hobby-3');

      expect(result.error).toBeNull();
      expect(hobbyService.addUserHobby).toHaveBeenCalledWith('user-123', 'hobby-3', false);
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          hobbies: [...mockProfile.hobbies, newHobby]
        },
        saving: false
      });
    });

    it('ajoute un hobby en favori avec succès', async () => {
      const newHobby: ProfileHobby = {
        id_hobbie: 'hobby-3',
        is_highlighted: true
      };

      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (hobbyService.addUserHobby as jest.Mock).mockResolvedValue(newHobby);

      const result = await hobbyActions.addUserHobby('hobby-3', true);

      expect(result.error).toBeNull();
      expect(hobbyService.addUserHobby).toHaveBeenCalledWith('user-123', 'hobby-3', true);
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await hobbyActions.addUserHobby('hobby-3');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(hobbyService.addUserHobby).not.toHaveBeenCalled();
    });

    it('gère l\'erreur de limite de favoris', async () => {
      const profileWithMaxHighlights = {
        ...mockProfile,
        hobbies: [
          { id_hobbie: 'hobby-1', is_highlighted: true },
          { id_hobbie: 'hobby-2', is_highlighted: true },
          { id_hobbie: 'hobby-3', is_highlighted: true }
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithMaxHighlights,
        handleError: jest.fn().mockReturnValue({ error: new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum') }),
      });

      const result = await hobbyActions.addUserHobby('hobby-4', true);

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
      expect(hobbyService.addUserHobby).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de l\'ajout du hobby') }),
      });

      (hobbyService.addUserHobby as jest.Mock).mockRejectedValue(error);

      const result = await hobbyActions.addUserHobby('hobby-3');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de l\'ajout du hobby');
    });
  });

  describe('removeUserHobby', () => {
    it('supprime un hobby avec succès', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (hobbyService.removeUserHobby as jest.Mock).mockResolvedValue(undefined);

      const result = await hobbyActions.removeUserHobby('hobby-1');

      expect(result.error).toBeNull();
      expect(hobbyService.removeUserHobby).toHaveBeenCalledWith('user-123', 'hobby-1');
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          hobbies: [{ id_hobbie: 'hobby-2', is_highlighted: false }]
        },
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await hobbyActions.removeUserHobby('hobby-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(hobbyService.removeUserHobby).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la suppression du hobby') }),
      });

      (hobbyService.removeUserHobby as jest.Mock).mockRejectedValue(error);

      const result = await hobbyActions.removeUserHobby('hobby-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la suppression du hobby');
    });

    it('gère les profils sans hobbies', async () => {
      const profileWithoutHobbies = {
        ...mockProfile,
        hobbies: []
      };

      mockGet.mockReturnValue({
        profile: profileWithoutHobbies,
        handleError: jest.fn(),
      });

      (hobbyService.removeUserHobby as jest.Mock).mockResolvedValue(undefined);

      const result = await hobbyActions.removeUserHobby('hobby-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithoutHobbies,
          hobbies: []
        },
        saving: false
      });
    });
  });

  describe('toggleHighlightHobby', () => {
    it('active un hobby en favori avec succès', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (hobbyService.toggleHighlightHobby as jest.Mock).mockResolvedValue(undefined);

      const result = await hobbyActions.toggleHighlightHobby('hobby-2');

      expect(result.error).toBeNull();
      expect(hobbyService.toggleHighlightHobby).toHaveBeenCalledWith('user-123', 'hobby-2', true);
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          hobbies: [
            { id_hobbie: 'hobby-1', is_highlighted: true },
            { id_hobbie: 'hobby-2', is_highlighted: true }
          ]
        },
        saving: false
      });
    });

    it('désactive un hobby en favori avec succès', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (hobbyService.toggleHighlightHobby as jest.Mock).mockResolvedValue(undefined);

      const result = await hobbyActions.toggleHighlightHobby('hobby-1');

      expect(result.error).toBeNull();
      expect(hobbyService.toggleHighlightHobby).toHaveBeenCalledWith('user-123', 'hobby-1', false);
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          hobbies: [
            { id_hobbie: 'hobby-1', is_highlighted: false },
            { id_hobbie: 'hobby-2', is_highlighted: false }
          ]
        },
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await hobbyActions.toggleHighlightHobby('hobby-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(hobbyService.toggleHighlightHobby).not.toHaveBeenCalled();
    });

    it('gère l\'erreur de hobby non trouvé', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Hobby non trouvé') }),
      });

      const result = await hobbyActions.toggleHighlightHobby('hobby-inexistant');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Hobby non trouvé');
      expect(hobbyService.toggleHighlightHobby).not.toHaveBeenCalled();
    });

    it('gère l\'erreur de limite de favoris lors de l\'activation', async () => {
      const profileWithMaxHighlights = {
        ...mockProfile,
        hobbies: [
          { id_hobbie: 'hobby-1', is_highlighted: true },
          { id_hobbie: 'hobby-2', is_highlighted: true },
          { id_hobbie: 'hobby-3', is_highlighted: true },
          { id_hobbie: 'hobby-4', is_highlighted: false }
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithMaxHighlights,
        handleError: jest.fn().mockReturnValue({ error: new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum') }),
      });

      const result = await hobbyActions.toggleHighlightHobby('hobby-4');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
      expect(hobbyService.toggleHighlightHobby).not.toHaveBeenCalled();
    });

    it('permet la désactivation même avec le maximum de favoris', async () => {
      const profileWithMaxHighlights = {
        ...mockProfile,
        hobbies: [
          { id_hobbie: 'hobby-1', is_highlighted: true },
          { id_hobbie: 'hobby-2', is_highlighted: true },
          { id_hobbie: 'hobby-3', is_highlighted: true }
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithMaxHighlights,
        handleError: jest.fn(),
      });

      (hobbyService.toggleHighlightHobby as jest.Mock).mockResolvedValue(undefined);

      const result = await hobbyActions.toggleHighlightHobby('hobby-1');

      expect(result.error).toBeNull();
      expect(hobbyService.toggleHighlightHobby).toHaveBeenCalledWith('user-123', 'hobby-1', false);
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la modification du favori') }),
      });

      (hobbyService.toggleHighlightHobby as jest.Mock).mockRejectedValue(error);

      const result = await hobbyActions.toggleHighlightHobby('hobby-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la modification du favori');
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les profils avec des hobbies null/undefined', async () => {
      const profileWithNullHobbies = {
        ...mockProfile,
        hobbies: null
      };

      mockGet.mockReturnValue({
        profile: profileWithNullHobbies,
        handleError: jest.fn(),
      });

      (hobbyService.addUserHobby as jest.Mock).mockResolvedValue({
        id_hobbie: 'hobby-3',
        is_highlighted: false
      });

      const result = await hobbyActions.addUserHobby('hobby-3');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithNullHobbies,
          hobbies: [{ id_hobbie: 'hobby-3', is_highlighted: false }]
        },
        saving: false
      });
    });

    it('gère les erreurs de type non-Error', async () => {
      const stringError = 'Erreur string';
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de l\'ajout du hobby') }),
      });

      (hobbyService.addUserHobby as jest.Mock).mockRejectedValue(stringError);

      const result = await hobbyActions.addUserHobby('hobby-3');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de l\'ajout du hobby');
    });

    it('gère les hobbies avec des propriétés manquantes', async () => {
      const profileWithIncompleteHobbies = {
        ...mockProfile,
        hobbies: [
          { id_hobbie: 'hobby-1' }, // is_highlighted manquant
          { is_highlighted: false }  // id_hobbie manquant
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithIncompleteHobbies,
        handleError: jest.fn(),
      });

      const result = await hobbyActions.removeUserHobby('hobby-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithIncompleteHobbies,
          hobbies: [{ is_highlighted: false }]
        },
        saving: false
      });
    });

    it('gère les appels multiples rapides', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (hobbyService.addUserHobby as jest.Mock).mockResolvedValue({
        id_hobbie: 'hobby-3',
        is_highlighted: false
      });

      const promises = [
        hobbyActions.addUserHobby('hobby-3'),
        hobbyActions.addUserHobby('hobby-4'),
        hobbyActions.addUserHobby('hobby-5')
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.error).toBeNull();
      });
    });
  });
}); 