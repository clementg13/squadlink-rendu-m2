import { MatchService, MatchResult, Match } from '@/services/matchService';
import { supabase } from '@/lib/supabase';

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

// Mock console pour éviter le bruit dans les tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('MatchService', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateMatch', () => {
    const mockUser = {
      id: 'user123',
      email: 'john@example.com',
    };

    it('initie un match avec succès', async () => {
      // Mock de l'authentification
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock de la fonction RPC
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          success: true,
          message: 'Match initié avec succès',
          match_id: 456
        }],
        error: null,
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result).toEqual({
        success: true,
        message: 'Match initié avec succès',
        match_id: 456
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('initiate_match', {
        initiator_user_id: 'user123',
        target_user_id: 'target-user-456'
      });

      expect(console.log).toHaveBeenCalledWith(
        '💕 MatchService: Initiating match with user:',
        'target-user-456'
      );
    });

    it('gère l\'utilisateur non authentifié', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result).toEqual({
        success: false,
        message: 'Vous devez être connecté pour initier un match'
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: User not authenticated'
      );
    });

    it('gère les erreurs d\'authentification', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result).toEqual({
        success: false,
        message: 'Vous devez être connecté pour initier un match'
      });
    });

    it('gère les erreurs Supabase', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Un match existe déjà avec cette personne' },
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result).toEqual({
        success: false,
        message: 'Un match existe déjà avec cette personne'
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Match initiation failed:',
        { message: 'Un match existe déjà avec cette personne' }
      );
    });

    it('gère les réponses vides du serveur', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result).toEqual({
        success: false,
        message: 'Réponse inattendue du serveur'
      });
    });

    it('gère les erreurs inattendues', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result).toEqual({
        success: false,
        message: 'Erreur inattendue lors de l\'initiation du match'
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Unexpected error:',
        expect.any(Error)
      );
    });
  });

  describe('getUserMatches', () => {
    const mockUser = {
      id: 'user123',
      email: 'john@example.com',
    };

    const mockMatches: Match[] = [
      {
        id: 1,
        id_user_initiator: 'user123',
        id_user_receiver: 'user456',
        date_initiation: '2024-01-15T10:00:00Z',
        is_accepted: true,
        is_closed: false,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 2,
        id_user_initiator: 'user789',
        id_user_receiver: 'user123',
        date_initiation: '2024-01-14T10:00:00Z',
        is_accepted: null,
        is_closed: false,
        created_at: '2024-01-14T10:00:00Z',
      },
    ];

    it('récupère les matches de l\'utilisateur', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockMatches,
              error: null,
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.getUserMatches();

      expect(result).toEqual(mockMatches);
      expect(mockSupabase.from).toHaveBeenCalledWith('match');
    });

    it('gère l\'utilisateur non authentifié', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await MatchService.getUserMatches();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: User not authenticated'
      );
    });

    it('gère les erreurs Supabase', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.getUserMatches();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Failed to fetch matches:',
        { message: 'Database error' }
      );
    });

    it('gère les erreurs inattendues', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await MatchService.getUserMatches();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Unexpected error fetching matches:',
        expect.any(Error)
      );
    });
  });

  describe('hasExistingMatch', () => {
    const mockUser = {
      id: 'user123',
      email: 'john@example.com',
    };

    it('détecte un match existant', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock pour les chaînes multiples .or().or()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });

      const mockOr2 = jest.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockOr1 = jest.fn().mockReturnValue({
        or: mockOr2,
      });

      const mockSelect = jest.fn().mockReturnValue({
        or: mockOr1,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.hasExistingMatch('target-user-456');

      expect(result).toBe(true);
    });

    it('détecte l\'absence de match', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom());

      const result = await MatchService.hasExistingMatch('target-user-456');

      expect(result).toBe(false);
    });

    it('gère l\'utilisateur non authentifié', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await MatchService.hasExistingMatch('target-user-456');

      expect(result).toBe(false);
    });

    it('gère les erreurs Supabase', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.hasExistingMatch('target-user-456');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Unexpected error checking match:',
        expect.any(Error)
      );
    });
  });

  describe('getMatchStatus', () => {
    const mockUser = {
      id: 'user123',
      email: 'john@example.com',
    };

    it('récupère le statut d\'un match accepté où l\'utilisateur est initiateur', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock pour les chaînes multiples .or().or()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [{
          id: 1,
          is_accepted: true,
          id_user_initiator: 'user123',
          id_user_receiver: 'user456'
        }],
        error: null,
      });

      const mockOr2 = jest.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockOr1 = jest.fn().mockReturnValue({
        or: mockOr2,
      });

      const mockSelect = jest.fn().mockReturnValue({
        or: mockOr1,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.getMatchStatus('user456');

      expect(result).toEqual({
        exists: true,
        isAccepted: true,
        isInitiator: true,
        isRejected: false,
        isPending: false
      });
    });

    it('récupère le statut d\'un match en attente où l\'utilisateur est receveur', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock pour les chaînes multiples .or().or()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [{
          id: 1,
          is_accepted: null,
          id_user_initiator: 'user456',
          id_user_receiver: 'user123'
        }],
        error: null,
      });

      const mockOr2 = jest.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockOr1 = jest.fn().mockReturnValue({
        or: mockOr2,
      });

      const mockSelect = jest.fn().mockReturnValue({
        or: mockOr1,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.getMatchStatus('user456');

      expect(result).toEqual({
        exists: true,
        isAccepted: false,
        isInitiator: false,
        isRejected: false,
        isPending: true
      });
    });

    it('récupère le statut d\'un match refusé', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock pour les chaînes multiples .or().or()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [{
          id: 1,
          is_accepted: false,
          id_user_initiator: 'user123',
          id_user_receiver: 'user456'
        }],
        error: null,
      });

      const mockOr2 = jest.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockOr1 = jest.fn().mockReturnValue({
        or: mockOr2,
      });

      const mockSelect = jest.fn().mockReturnValue({
        or: mockOr1,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.getMatchStatus('user456');

      expect(result).toEqual({
        exists: true,
        isAccepted: false,
        isInitiator: true,
        isRejected: true,
        isPending: false
      });
    });

    it('gère l\'absence de match', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue(mockFrom());

      const result = await MatchService.getMatchStatus('user456');

      expect(result).toEqual({
        exists: false,
        isAccepted: false,
        isInitiator: false,
        isRejected: false,
        isPending: false
      });
    });

    it('gère l\'utilisateur non authentifié', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await MatchService.getMatchStatus('user456');

      expect(result).toEqual({
        exists: false,
        isAccepted: false,
        isInitiator: false,
        isRejected: false,
        isPending: false
      });
    });

    it('gère les erreurs Supabase', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await MatchService.getMatchStatus('user456');

      expect(result).toEqual({
        exists: false,
        isAccepted: false,
        isInitiator: false,
        isRejected: false,
        isPending: false
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Unexpected error getting match status:',
        expect.any(Error)
      );
    });
  });

  describe('getPendingReceivedMatches', () => {
    const mockUser = {
      id: 'user123',
      email: 'john@example.com',
    };

    const mockPendingMatches = [
      {
        id: 1,
        id_user_initiator: 'user456',
        id_user_receiver: 'user123',
        date_initiation: '2024-01-15T10:00:00Z',
        date_response: null,
        is_accepted: null,
        is_closed: false,
        id_user_initiator_details: {
          id_user: 'user456',
          firstname: 'Jane',
          lastname: 'Smith',
          birthdate: '1995-06-15',
          biography: 'Passionnée de sport'
        }
      }
    ];

    const mockRpcData = [
      {
        id: 1,
        id_user_initiator: 'user456',
        id_user_receiver: 'user123',
        date_initiation: '2024-01-15T10:00:00Z',
        date_response: null,
        is_accepted: null,
        is_closed: false,
        profile_id_user: 'user456',
        profile_firstname: 'Jane',
        profile_lastname: 'Smith',
        profile_birthdate: '1995-06-15',
        profile_biography: 'Passionnée de sport'
      }
    ];

    it('récupère les demandes d\'amis reçues en attente', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockRpcData,
        error: null,
      });

      const result = await MatchService.getPendingReceivedMatches();

      // Vérifier que les données sont transformées correctement
      expect(result).toEqual(mockPendingMatches);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_pending_received_matches', {
        user_id: 'user123'
      });
    });

    it('gère l\'utilisateur non authentifié', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await MatchService.getPendingReceivedMatches();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: User not authenticated'
      );
    });

    it('gère les erreurs Supabase', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await MatchService.getPendingReceivedMatches();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Failed to fetch pending received matches:',
        { message: 'Database error' }
      );
    });

    it('gère les erreurs inattendues', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await MatchService.getPendingReceivedMatches();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Unexpected error fetching pending received matches:',
        expect.any(Error)
      );
    });
  });

  describe('acceptMatch', () => {
    const mockUser = {
      id: 'user123',
      email: 'john@example.com',
    };

    it('accepte un match avec succès', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          success: true,
          message: 'Demande acceptée avec succès',
          group_id: 789
        }],
        error: null,
      });

      const result = await MatchService.acceptMatch(456);

      expect(result).toEqual({
        success: true,
        message: 'Demande acceptée avec succès',
        match_id: 456,
        group_id: 789
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('respond_to_match', {
        match_id: 456,
        user_id: 'user123',
        accept_match: true
      });

      expect(console.log).toHaveBeenCalledWith(
        '✅ MatchService: Accept match result:',
        { success: true, message: 'Demande acceptée avec succès', group_id: 789 }
      );
    });

    it('gère l\'utilisateur non authentifié', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await MatchService.acceptMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Vous devez être connecté pour accepter une demande'
      });
    });

    it('gère les erreurs Supabase', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Match not found' },
      });

      const result = await MatchService.acceptMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Match not found'
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Failed to accept match:',
        { message: 'Match not found' }
      );
    });

    it('gère les réponses vides du serveur', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await MatchService.acceptMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Réponse inattendue du serveur'
      });
    });

    it('gère les erreurs inattendues', async () => {
      mockSupabase.auth.getUser.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await MatchService.acceptMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Erreur inattendue lors de l\'acceptation de la demande'
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Unexpected error accepting match:',
        expect.any(Error)
      );
    });
  });

  describe('rejectMatch', () => {
    const mockUser = {
      id: 'user123',
      email: 'john@example.com',
    };

    it('refuse un match avec succès', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          success: true,
          message: 'Demande refusée avec succès'
        }],
        error: null,
      });

      const result = await MatchService.rejectMatch(456);

      expect(result).toEqual({
        success: true,
        message: 'Demande refusée avec succès',
        match_id: 456
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('respond_to_match', {
        match_id: 456,
        user_id: 'user123',
        accept_match: false
      });

      expect(console.log).toHaveBeenCalledWith(
        '✅ MatchService: Reject match result:',
        { success: true, message: 'Demande refusée avec succès' }
      );
    });

    it('gère l\'utilisateur non authentifié', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await MatchService.rejectMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Vous devez être connecté pour refuser une demande'
      });
    });

    it('gère les erreurs Supabase', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Match not found' },
      });

      const result = await MatchService.rejectMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Match not found'
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Failed to reject match:',
        { message: 'Match not found' }
      );
    });

    it('gère les réponses vides du serveur', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await MatchService.rejectMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Réponse inattendue du serveur'
      });
    });

    it('gère les erreurs inattendues', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await MatchService.rejectMatch(456);

      expect(result).toEqual({
        success: false,
        message: 'Erreur inattendue lors du refus de la demande'
      });

      expect(console.error).toHaveBeenCalledWith(
        '❌ MatchService: Unexpected error rejecting match:',
        expect.any(Error)
      );
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les erreurs de transformation de données', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
      };

      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock avec des données invalides
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          success: 'invalid-boolean',
          message: null,
          match_id: 'invalid-number'
        }],
        error: null,
      });

      const result = await MatchService.initiateMatch('target-user-456');

      // Le service devrait gérer les données invalides
      expect(result).toEqual({
        success: 'invalid-boolean',
        message: null,
        match_id: 'invalid-number'
      });
    });

    it('gère les profils avec des données partielles', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
      };

      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock avec des données partielles
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          success: true,
          message: 'Match initié',
          // match_id manquant
        }],
        error: null,
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result).toEqual({
        success: true,
        message: 'Match initié',
        match_id: undefined
      });
    });

    it('log les informations de débogage', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
      };

      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [{
          success: true,
          message: 'Match initié avec succès',
          match_id: 123
        }],
        error: null,
      });

      await MatchService.initiateMatch('target-user-456');

      expect(console.log).toHaveBeenCalledWith(
        '💕 MatchService: Initiating match with user:',
        'target-user-456'
      );

      expect(console.log).toHaveBeenCalledWith(
        '✅ MatchService: Match result:',
        { success: true, message: 'Match initié avec succès', match_id: 123 }
      );
    });
  });
}); 