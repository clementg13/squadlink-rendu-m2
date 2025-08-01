import { createSocialMediaActions, SocialMediaActions } from '@/stores/profile/socialMediaActions';
import { socialMediaService } from '@/services/socialMediaService';
import { ProfileSocialMedia } from '@/types/profile';

// Mock des services
jest.mock('@/services/socialMediaService');

// Mock console pour éviter le bruit dans les tests
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('createSocialMediaActions', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let socialMediaActions: SocialMediaActions;

  const mockProfile = {
    id_user: 'user-123',
    socialMedias: [
      { id_social_media: 'sm-1', username: 'john_doe' },
      { id_social_media: 'sm-2', username: 'jane_smith' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSet = jest.fn();
    mockGet = jest.fn(() => ({
      handleError: jest.fn().mockReturnValue({ error: new Error('Erreur par défaut') }),
    }));
    
    socialMediaActions = createSocialMediaActions(mockSet, mockGet);
  });

  describe('addUserSocialMedia', () => {
    it('ajoute un réseau social avec succès', async () => {
      const newSocialMedia: ProfileSocialMedia = {
        id_social_media: 'sm-3',
        username: 'jane_doe'
      };

      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (socialMediaService.addUserSocialMedia as jest.Mock).mockResolvedValue(newSocialMedia);

      const result = await socialMediaActions.addUserSocialMedia('sm-3', 'jane_doe');

      expect(result.error).toBeNull();
      expect(socialMediaService.addUserSocialMedia).toHaveBeenCalledWith('user-123', 'sm-3', 'jane_doe');
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          socialMedias: [...mockProfile.socialMedias, newSocialMedia]
        },
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await socialMediaActions.addUserSocialMedia('sm-3', 'jane_doe');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(socialMediaService.addUserSocialMedia).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de l\'ajout du réseau social') }),
      });

      (socialMediaService.addUserSocialMedia as jest.Mock).mockRejectedValue(error);

      const result = await socialMediaActions.addUserSocialMedia('sm-3', 'jane_doe');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de l\'ajout du réseau social');
    });

    it('gère les profils sans réseaux sociaux', async () => {
      const profileWithoutSocialMedias = {
        ...mockProfile,
        socialMedias: []
      };

      const newSocialMedia: ProfileSocialMedia = {
        id_social_media: 'sm-1',
        username: 'first_user'
      };

      mockGet.mockReturnValue({
        profile: profileWithoutSocialMedias
      });

      (socialMediaService.addUserSocialMedia as jest.Mock).mockResolvedValue(newSocialMedia);

      const result = await socialMediaActions.addUserSocialMedia('sm-1', 'first_user');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithoutSocialMedias,
          socialMedias: [newSocialMedia]
        },
        saving: false
      });
    });
  });

  describe('updateUserSocialMedia', () => {
    it('met à jour un réseau social avec succès', async () => {
      const updatedSocialMedia: ProfileSocialMedia = {
        id_social_media: 'sm-1',
        username: 'john_updated'
      };

      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (socialMediaService.updateUserSocialMedia as jest.Mock).mockResolvedValue(updatedSocialMedia);

      const result = await socialMediaActions.updateUserSocialMedia('sm-1', 'john_updated');

      expect(result.error).toBeNull();
      expect(socialMediaService.updateUserSocialMedia).toHaveBeenCalledWith('user-123', 'sm-1', 'john_updated');
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          socialMedias: mockProfile.socialMedias.map(sm => 
            sm.id_social_media === 'sm-1' ? updatedSocialMedia : sm
          )
        },
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await socialMediaActions.updateUserSocialMedia('sm-1', 'john_updated');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(socialMediaService.updateUserSocialMedia).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la mise à jour du réseau social') }),
      });

      (socialMediaService.updateUserSocialMedia as jest.Mock).mockRejectedValue(error);

      const result = await socialMediaActions.updateUserSocialMedia('sm-1', 'john_updated');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la mise à jour du réseau social');
    });

    it('gère les réseaux sociaux inexistants', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (socialMediaService.updateUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.updateUserSocialMedia('sm-inexistant', 'new_username');

      expect(result.error).toBeNull();
      // Le réseau social inexistant ne devrait pas être modifié
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          socialMedias: mockProfile.socialMedias // Aucun changement
        },
        saving: false
      });
    });
  });

  describe('removeUserSocialMedia', () => {
    it('supprime un réseau social avec succès', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn(),
      });

      (socialMediaService.removeUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.removeUserSocialMedia('sm-1');

      expect(result.error).toBeNull();
      expect(socialMediaService.removeUserSocialMedia).toHaveBeenCalledWith('user-123', 'sm-1');
      expect(mockSet).toHaveBeenCalledWith({
        saving: true,
        error: null
      });
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          socialMedias: mockProfile.socialMedias.filter(sm => sm.id_social_media !== 'sm-1')
        },
        saving: false
      });
    });

    it('gère l\'erreur de profil non chargé', async () => {
      mockGet.mockReturnValue({
        profile: null,
        handleError: jest.fn().mockReturnValue({ error: new Error('Profil non chargé') }),
      });

      const result = await socialMediaActions.removeUserSocialMedia('sm-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Profil non chargé');
      expect(socialMediaService.removeUserSocialMedia).not.toHaveBeenCalled();
    });

    it('gère les erreurs du service', async () => {
      const error = new Error('Erreur service');
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de la suppression du réseau social') }),
      });

      (socialMediaService.removeUserSocialMedia as jest.Mock).mockRejectedValue(error);

      const result = await socialMediaActions.removeUserSocialMedia('sm-1');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de la suppression du réseau social');
    });

    it('gère les profils sans réseaux sociaux', async () => {
      const profileWithoutSocialMedias = {
        ...mockProfile,
        socialMedias: []
      };

      mockGet.mockReturnValue({
        profile: profileWithoutSocialMedias
      });

      (socialMediaService.removeUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.removeUserSocialMedia('sm-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithoutSocialMedias,
          socialMedias: []
        },
        saving: false
      });
    });

    it('gère les réseaux sociaux inexistants', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (socialMediaService.removeUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.removeUserSocialMedia('sm-inexistant');

      expect(result.error).toBeNull();
      // Le réseau social inexistant ne devrait pas affecter la liste
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...mockProfile,
          socialMedias: mockProfile.socialMedias // Aucun changement
        },
        saving: false
      });
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les profils avec des réseaux sociaux null/undefined', async () => {
      const profileWithNullSocialMedias = {
        ...mockProfile,
        socialMedias: null
      };

      const newSocialMedia: ProfileSocialMedia = {
        id_social_media: 'sm-1',
        username: 'first_user'
      };

      mockGet.mockReturnValue({
        profile: profileWithNullSocialMedias
      });

      (socialMediaService.addUserSocialMedia as jest.Mock).mockResolvedValue(newSocialMedia);

      const result = await socialMediaActions.addUserSocialMedia('sm-1', 'first_user');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithNullSocialMedias,
          socialMedias: [newSocialMedia]
        },
        saving: false
      });
    });

    it('gère les erreurs de type non-Error', async () => {
      const stringError = 'Erreur string';
      mockGet.mockReturnValue({
        profile: mockProfile,
        handleError: jest.fn().mockReturnValue({ error: new Error('Erreur lors de l\'ajout du réseau social') }),
      });

      (socialMediaService.addUserSocialMedia as jest.Mock).mockRejectedValue(stringError);

      const result = await socialMediaActions.addUserSocialMedia('sm-3', 'jane_doe');

      expect(result).toBeDefined();
      expect(result?.error).toBeInstanceOf(Error);
      expect(result?.error?.message).toBe('Erreur lors de l\'ajout du réseau social');
    });

    it('gère les réseaux sociaux avec des propriétés manquantes', async () => {
      const profileWithIncompleteSocialMedias = {
        ...mockProfile,
        socialMedias: [
          { id_social_media: 'sm-1' }, // username manquant
          { username: 'user_only' }     // id_social_media manquant
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithIncompleteSocialMedias
      });

      (socialMediaService.removeUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.removeUserSocialMedia('sm-1');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithIncompleteSocialMedias,
          socialMedias: [{ username: 'user_only' }]
        },
        saving: false
      });
    });

    it('gère les appels multiples rapides', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (socialMediaService.addUserSocialMedia as jest.Mock).mockResolvedValue({
        id_social_media: 'sm-3',
        username: 'user3'
      });

      const promises = [
        socialMediaActions.addUserSocialMedia('sm-3', 'user3'),
        socialMediaActions.addUserSocialMedia('sm-4', 'user4'),
        socialMediaActions.addUserSocialMedia('sm-5', 'user5')
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.error).toBeNull();
      });
    });

    it('gère les usernames avec des espaces', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (socialMediaService.updateUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.updateUserSocialMedia('sm-1', '  user_with_spaces  ');

      expect(result.error).toBeNull();
      expect(socialMediaService.updateUserSocialMedia).toHaveBeenCalledWith('user-123', 'sm-1', '  user_with_spaces  ');
    });

    it('gère les usernames vides', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (socialMediaService.updateUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.updateUserSocialMedia('sm-1', '');

      expect(result.error).toBeNull();
      expect(socialMediaService.updateUserSocialMedia).toHaveBeenCalledWith('user-123', 'sm-1', '');
    });

    it('gère les caractères spéciaux dans les usernames', async () => {
      mockGet.mockReturnValue({
        profile: mockProfile
      });

      (socialMediaService.addUserSocialMedia as jest.Mock).mockResolvedValue({
        id_social_media: 'sm-3',
        username: 'user@domain.com'
      });

      const result = await socialMediaActions.addUserSocialMedia('sm-3', 'user@domain.com');

      expect(result.error).toBeNull();
      expect(socialMediaService.addUserSocialMedia).toHaveBeenCalledWith('user-123', 'sm-3', 'user@domain.com');
    });

    it('gère les réseaux sociaux avec des IDs complexes', async () => {
      const profileWithComplexIds = {
        ...mockProfile,
        socialMedias: [
          { id_social_media: 'instagram-123', username: 'john_doe' },
          { id_social_media: 'twitter-456', username: 'jane_smith' }
        ]
      };

      mockGet.mockReturnValue({
        profile: profileWithComplexIds
      });

      (socialMediaService.removeUserSocialMedia as jest.Mock).mockResolvedValue(undefined);

      const result = await socialMediaActions.removeUserSocialMedia('instagram-123');

      expect(result.error).toBeNull();
      expect(mockSet).toHaveBeenCalledWith({
        profile: {
          ...profileWithComplexIds,
          socialMedias: [{ id_social_media: 'twitter-456', username: 'jane_smith' }]
        },
        saving: false
      });
    });
  });
}); 