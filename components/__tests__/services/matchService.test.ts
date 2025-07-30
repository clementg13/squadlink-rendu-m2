import { MatchService } from '@/services/matchService';
import { supabase } from '@/lib/supabase';

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        or: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe('MatchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateMatch', () => {
    it('should successfully initiate a match', async () => {
      // Mock de l'utilisateur authentifié
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock de la réponse de la fonction RPC
      const mockRpcResponse = {
        data: [{
          success: true,
          message: 'Match initié avec succès',
          match_id: 456,
        }],
        error: null,
      };
      (supabase.rpc as jest.Mock).mockResolvedValue(mockRpcResponse);

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Match initié avec succès');
      expect(result.match_id).toBe(456);
      expect(supabase.rpc).toHaveBeenCalledWith('initiate_match', {
        initiator_user_id: 'user-123',
        target_user_id: 'target-user-456',
      });
    });

    it('should handle authentication error', async () => {
      // Mock d'erreur d'authentification
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'User not authenticated' },
      });

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Vous devez être connecté pour initier un match');
    });

    it('should handle RPC error', async () => {
      // Mock de l'utilisateur authentifié
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock d'erreur RPC
      const mockRpcError = {
        data: null,
        error: { message: 'Un match existe déjà avec cette personne' },
      };
      (supabase.rpc as jest.Mock).mockResolvedValue(mockRpcError);

      const result = await MatchService.initiateMatch('target-user-456');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Un match existe déjà avec cette personne');
    });
  });

  describe('getUserMatches', () => {
    it('should return user matches', async () => {
      // Mock de l'utilisateur authentifié
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock de la réponse de la base de données
      const mockMatches = [
        {
          id: 1,
          id_user_initiator: 'user-123',
          id_user_receiver: 'user-456',
          date_initiation: '2024-01-01',
          is_accepted: null,
          is_closed: false,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockFromResponse = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockMatches,
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockFromResponse);

      const matches = await MatchService.getUserMatches();

      expect(matches).toEqual(mockMatches);
      expect(supabase.from).toHaveBeenCalledWith('match');
    });

    it('should return empty array when no matches', async () => {
      // Mock de l'utilisateur authentifié
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock de réponse vide
      const mockFromResponse = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockFromResponse);

      const matches = await MatchService.getUserMatches();

      expect(matches).toEqual([]);
    });
  });

  describe('hasExistingMatch', () => {
    it('should return true when match exists', async () => {
      // Mock de l'utilisateur authentifié
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock de réponse avec match existant
      const mockFromResponse = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [{ id: 1 }],
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockFromResponse);

      const hasMatch = await MatchService.hasExistingMatch('target-user-456');

      expect(hasMatch).toBe(true);
    });

    it('should return false when no match exists', async () => {
      // Mock de l'utilisateur authentifié
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock de réponse sans match
      const mockFromResponse = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockFromResponse);

      const hasMatch = await MatchService.hasExistingMatch('target-user-456');

      expect(hasMatch).toBe(false);
    });
  });
}); 