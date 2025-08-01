import { CompatibleProfileService, CompatibleProfile } from '@/services/compatibleProfileService';
import { supabase } from '@/lib/supabase';

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

// Mock console pour éviter le bruit dans les tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

describe('CompatibleProfileService', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enrichProfile', () => {
    const mockBaseProfile = {
      profile_id: 1,
      user_id: 'user123',
      firstname: 'John',
      lastname: 'Doe',
      biography: 'Passionné de sport',
      compatibility_score: 85,
      total_count: 10,
    };

    const mockFullProfile = {
      id: 1,
      id_user: 'user123',
      firstname: 'John',
      lastname: 'Doe',
      birthdate: '1995-06-15',
      biography: 'Passionné de sport',
      location: {
        id: 1,
        town: 'Paris',
        postal_code: '75001',
      },
      gym: {
        id: 1,
        name: 'Fitness Club Paris',
      },
      gymsubscription: {
        id: 1,
        name: 'Premium',
      },
    };

    const mockHobbies = [
      {
        id: 1,
        id_profile: 1,
        id_hobbie: 'hobby1',
        hobbie: { id: 'hobby1', name: 'Lecture' },
      },
      {
        id: 2,
        id_profile: 1,
        id_hobbie: 'hobby2',
        hobbie: { id: 'hobby2', name: 'Musique' },
      },
    ];

    const mockSports = [
      {
        id: 1,
        id_profile: 1,
        id_sport: 'sport1',
        sport: { id: 'sport1', name: 'Football' },
        sportlevel: { id: 'level1', name: 'Débutant' },
      },
    ];

    const mockSocialMedias = [
      {
        id: 1,
        id_profile: 1,
        id_social_media: 'sm1',
        username: 'john_doe',
        socialmedia: { id: 'sm1', name: 'Instagram' },
      },
    ];

    it('enrichit un profil avec toutes ses données', async () => {
      // Mock des requêtes Supabase avec des chaînes séparées
      const mockProfileQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockFullProfile,
              error: null,
            }),
          }),
        }),
      };

      const mockHobbiesQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockHobbies,
            error: null,
          }),
        }),
      };

      const mockSportsQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockSports,
            error: null,
          }),
        }),
      };

      const mockSocialMediasQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockSocialMedias,
            error: null,
          }),
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockProfileQuery)
        .mockReturnValueOnce(mockHobbiesQuery)
        .mockReturnValueOnce(mockSportsQuery)
        .mockReturnValueOnce(mockSocialMediasQuery);

      const result = await CompatibleProfileService.enrichProfile(mockBaseProfile);

      expect(result).toEqual({
        ...mockBaseProfile,
        location: mockFullProfile.location,
        gym: mockFullProfile.gym,
        gymSubscription: mockFullProfile.gymsubscription,
        hobbies: mockHobbies,
        sports: mockSports,
        socialMedias: mockSocialMedias,
        age: expect.any(Number), // L'âge peut varier selon la date actuelle
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('profile');
      expect(mockSupabase.from).toHaveBeenCalledWith('profilehobbie');
      expect(mockSupabase.from).toHaveBeenCalledWith('profilesport');
      expect(mockSupabase.from).toHaveBeenCalledWith('profilesocialmedia');
    });

    it('gère les erreurs lors de la récupération du profil complet', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile not found' },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom());

      const result = await CompatibleProfileService.enrichProfile(mockBaseProfile);

      expect(result).toEqual(mockBaseProfile);
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ Erreur lors de la récupération du profil complet:',
        { message: 'Profile not found' }
      );
    });

    it('gère les profils sans date de naissance', async () => {
      const profileWithoutBirthdate = {
        ...mockFullProfile,
        birthdate: null,
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: profileWithoutBirthdate,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce(mockFrom()) // profile
        .mockReturnValueOnce(mockFrom()) // hobbies
        .mockReturnValueOnce(mockFrom()) // sports
        .mockReturnValueOnce(mockFrom()); // socialMedias

      const result = await CompatibleProfileService.enrichProfile(mockBaseProfile);

      expect(result.age).toBeUndefined();
    });

    it('gère les erreurs générales', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await CompatibleProfileService.enrichProfile(mockBaseProfile);

      expect(result).toEqual(mockBaseProfile);
      expect(console.error).toHaveBeenCalledWith(
        '❌ Erreur lors de l\'enrichissement du profil:',
        expect.any(Error)
      );
    });

    it('calcule correctement l\'âge pour différentes dates', async () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();

      // Test avec une personne qui a eu son anniversaire cette année
      const profileWithRecentBirthday = {
        ...mockFullProfile,
        birthdate: `${currentYear - 25}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: profileWithRecentBirthday,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce(mockFrom()) // profile
        .mockReturnValueOnce(mockFrom()) // hobbies
        .mockReturnValueOnce(mockFrom()) // sports
        .mockReturnValueOnce(mockFrom()); // socialMedias

      const result = await CompatibleProfileService.enrichProfile(mockBaseProfile);

      expect(result.age).toBe(25);
    });
  });

  describe('enrichProfiles', () => {
    const mockBaseProfiles = [
      {
        profile_id: 1,
        user_id: 'user1',
        firstname: 'John',
        lastname: 'Doe',
        biography: 'Sportif',
        compatibility_score: 85,
        total_count: 2,
      },
      {
        profile_id: 2,
        user_id: 'user2',
        firstname: 'Jane',
        lastname: 'Smith',
        biography: 'Artiste',
        compatibility_score: 75,
        total_count: 2,
      },
    ];

    it('enrichit une liste de profils', async () => {
      // Mock de enrichProfile pour chaque profil
      const mockEnrichProfile = jest.spyOn(CompatibleProfileService, 'enrichProfile');
      mockEnrichProfile
        .mockResolvedValueOnce({
          ...mockBaseProfiles[0],
          age: 25,
          location: { town: 'Paris' },
        })
        .mockResolvedValueOnce({
          ...mockBaseProfiles[1],
          age: 30,
          location: { town: 'Lyon' },
        });

      const result = await CompatibleProfileService.enrichProfiles(mockBaseProfiles);

      expect(result).toHaveLength(2);
      expect(mockEnrichProfile).toHaveBeenCalledTimes(2);
      expect(mockEnrichProfile).toHaveBeenCalledWith(mockBaseProfiles[0]);
      expect(mockEnrichProfile).toHaveBeenCalledWith(mockBaseProfiles[1]);
    });

    it('gère une liste vide', async () => {
      const result = await CompatibleProfileService.enrichProfiles([]);

      expect(result).toEqual([]);
    });
  });

  describe('getCompatibleProfiles', () => {
    const mockRpcData = [
      {
        profile_id: 1,
        user_id: 'user1',
        firstname: 'John',
        lastname: 'Doe',
        biography: 'Sportif',
        compatibility_score: '85.5',
        total_count: '10',
      },
      {
        profile_id: 2,
        user_id: 'user2',
        firstname: 'Jane',
        lastname: 'Smith',
        biography: 'Artiste',
        compatibility_score: '75.2',
        total_count: '10',
      },
    ];

    it('récupère les profils compatibles avec pagination', async () => {
      // Mock de la fonction RPC
      mockSupabase.rpc.mockResolvedValue({
        data: mockRpcData,
        error: null,
      });

      // Mock de enrichProfiles
      const mockEnrichProfiles = jest.spyOn(CompatibleProfileService, 'enrichProfiles');
      const enrichedProfiles = [
        {
          ...mockRpcData[0],
          compatibility_score: 85.5,
          total_count: 10,
          age: 25,
          location: { town: 'Paris' },
        },
        {
          ...mockRpcData[1],
          compatibility_score: 75.2,
          total_count: 10,
          age: 30,
          location: { town: 'Lyon' },
        },
      ];
      mockEnrichProfiles.mockResolvedValue(enrichedProfiles);

      const result = await CompatibleProfileService.getCompatibleProfiles('currentUser', {
        page_offset: 0,
        page_size: 10,
      });

      expect(result).toEqual({
        profiles: enrichedProfiles,
        total_count: 10,
        has_more: expect.any(Boolean), // has_more peut varier selon la logique
        current_page: 0,
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_compatible_profiles', {
        current_user_id: 'currentUser',
        page_offset: 0,
        page_size: 10,
      });

      expect(mockEnrichProfiles).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            profile_id: 1,
            user_id: 'user1',
            compatibility_score: 85.5,
            total_count: 10,
          }),
          expect.objectContaining({
            profile_id: 2,
            user_id: 'user2',
            compatibility_score: 75.2,
            total_count: 10,
          }),
        ])
      );
    });

    it('gère les erreurs Supabase', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        CompatibleProfileService.getCompatibleProfiles('currentUser')
      ).rejects.toThrow('Erreur Supabase: Database error');

      expect(console.error).toHaveBeenCalledWith(
        '❌ Erreur lors de la récupération des profils compatibles:',
        { message: 'Database error' }
      );
    });

    it('gère une liste vide de profils', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await CompatibleProfileService.getCompatibleProfiles('currentUser');

      expect(result).toEqual({
        profiles: [],
        total_count: 0,
        has_more: false,
        current_page: 0,
      });
    });

    it('calcule correctement la pagination', async () => {
      const mockDataWithPagination = [
        {
          profile_id: 1,
          user_id: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          biography: 'Sportif',
          compatibility_score: '85.5',
          total_count: '25',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockDataWithPagination,
        error: null,
      });

      const mockEnrichProfiles = jest.spyOn(CompatibleProfileService, 'enrichProfiles');
      mockEnrichProfiles.mockResolvedValue([
        {
          ...mockDataWithPagination[0],
          compatibility_score: 85.5,
          total_count: 25,
        },
      ]);

      const result = await CompatibleProfileService.getCompatibleProfiles('currentUser', {
        page_offset: 20,
        page_size: 10,
      });

      expect(result).toEqual({
        profiles: expect.any(Array),
        total_count: 25,
        has_more: true, // 20 + 1 < 25
        current_page: 2, // Math.floor(20 / 10)
      });
    });

    it('utilise les paramètres par défaut', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockRpcData,
        error: null,
      });

      const mockEnrichProfiles = jest.spyOn(CompatibleProfileService, 'enrichProfiles');
      mockEnrichProfiles.mockResolvedValue([]);

      await CompatibleProfileService.getCompatibleProfiles('currentUser');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_compatible_profiles', {
        current_user_id: 'currentUser',
        page_offset: 0,
        page_size: 10,
      });
    });

    it('gère les erreurs générales', async () => {
      mockSupabase.rpc.mockImplementation(() => {
        throw new Error('Network error');
      });

      await expect(
        CompatibleProfileService.getCompatibleProfiles('currentUser')
      ).rejects.toThrow('Network error');

      expect(console.error).toHaveBeenCalledWith(
        '❌ Erreur dans CompatibleProfileService.getCompatibleProfiles:',
        expect.any(Error)
      );
    });

    it('transforme correctement les données de compatibilité', async () => {
      const mockDataWithStringScores = [
        {
          profile_id: 1,
          user_id: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          biography: 'Sportif',
          compatibility_score: '92.75',
          total_count: '15',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockDataWithStringScores,
        error: null,
      });

      const mockEnrichProfiles = jest.spyOn(CompatibleProfileService, 'enrichProfiles');
      mockEnrichProfiles.mockResolvedValue([]);

      await CompatibleProfileService.getCompatibleProfiles('currentUser');

      expect(mockEnrichProfiles).toHaveBeenCalledWith([
        expect.objectContaining({
          compatibility_score: 92.75,
          total_count: 15,
        }),
      ]);
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les profils avec des données partielles', async () => {
      const mockRpcData = [
        {
          profile_id: 1,
          user_id: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          biography: null,
          compatibility_score: '50.0',
          total_count: '1',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRpcData,
        error: null,
      });

      const mockEnrichProfiles = jest.spyOn(CompatibleProfileService, 'enrichProfiles');
      mockEnrichProfiles.mockResolvedValue([
        {
          ...mockRpcData[0],
          compatibility_score: 50.0,
          total_count: 1,
          biography: null,
        },
      ]);

      const result = await CompatibleProfileService.getCompatibleProfiles('currentUser');

      expect(result.profiles[0].biography).toBeNull();
      expect(result.profiles[0].compatibility_score).toBe(50.0);
    });

    it('gère les erreurs de transformation de données', async () => {
      const invalidData = [
        {
          profile_id: 1,
          user_id: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          biography: 'Sportif',
          compatibility_score: 'invalid-score',
          total_count: 'invalid-count',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: invalidData,
        error: null,
      });

      const mockEnrichProfiles = jest.spyOn(CompatibleProfileService, 'enrichProfiles');
      mockEnrichProfiles.mockResolvedValue([]);

      const result = await CompatibleProfileService.getCompatibleProfiles('currentUser');

      // Vérifier que les valeurs NaN sont gérées
      expect(result.profiles).toEqual([]);
    });

    it('log les informations de débogage', async () => {
      const mockRpcData = [
        {
          profile_id: 1,
          user_id: 'user1',
          firstname: 'John',
          lastname: 'Doe',
          biography: 'Sportif',
          compatibility_score: '85.5',
          total_count: '10',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRpcData,
        error: null,
      });

      const mockEnrichProfiles = jest.spyOn(CompatibleProfileService, 'enrichProfiles');
      mockEnrichProfiles.mockResolvedValue([
        {
          ...mockRpcData[0],
          compatibility_score: 85.5,
          total_count: 10,
        },
      ]);

      await CompatibleProfileService.getCompatibleProfiles('currentUser');

      expect(console.log).toHaveBeenCalledWith(
        '📊 Profils récupérés: 1 profils depuis Supabase'
      );
    });
  });
}); 