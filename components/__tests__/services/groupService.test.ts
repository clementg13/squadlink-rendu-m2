// Mock Supabase avant les imports
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

import { groupService } from '../../../services/groupService';
import { supabase } from '../../../lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('GroupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGroupMembers', () => {
    it('should return group members using fallback method', async () => {
      const mockGroupUsers = [{ id_user: 'user1' }, { id_user: 'user2' }];
      const mockProfiles = [
        { id_user: 'user1', firstname: 'John', lastname: 'Doe' },
        { id_user: 'user2', firstname: 'Jane', lastname: 'Smith' }
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockGroupUsers,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockProfiles,
              error: null
            })
          })
        } as any);

      const result = await groupService.getGroupMembers(1);
      
      expect(result).toEqual([
        {
          id_user: 'user1',
          user: {
            firstname: 'John',
            lastname: 'Doe'
          }
        },
        {
          id_user: 'user2',
          user: {
            firstname: 'Jane',
            lastname: 'Smith'
          }
        }
      ]);
    });

    it('should handle profile query errors gracefully', async () => {
      const mockGroupUsers = [{ id_user: 'user1' }];
      const mockError = { message: 'Profile access denied' };
      
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockGroupUsers,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        } as any);

      const result = await groupService.getGroupMembers(1);
      
      expect(result).toEqual([
        {
          id_user: 'user1',
          user: {
            firstname: 'Membre',
            lastname: 'user1'.substring(0, 8)
          }
        }
      ]);
    });

    it('should handle members without profiles', async () => {
      const mockGroupUsers = [{ id_user: 'user1' }];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockGroupUsers,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [], // Aucun profil trouvé
              error: null
            })
          })
        } as any);

      const result = await groupService.getGroupMembers(1);
      
      expect(result).toEqual([
        {
          id_user: 'user1',
          user: {
            firstname: 'Membre',
            lastname: 'user1'.substring(0, 8)
          }
        }
      ]);
    });

    it('should return empty array for invalid group ID', async () => {
      const result = await groupService.getGroupMembers(0);
      expect(result).toEqual([]);
    });

    it('should return empty array when no members found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } as any);

      const result = await groupService.getGroupMembers(1);
      expect(result).toEqual([]);
    });

    it('should handle group users query errors', async () => {
      const mockError = { message: 'Group access denied' };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      } as any);

      const result = await groupService.getGroupMembers(1);
      expect(result).toEqual([]);
    });
  });

  describe('getGroupMembersFallback', () => {
    it('should handle fallback method correctly', async () => {
      const mockGroupUsers = [{ id_user: 'user1' }];
      const mockProfiles = [{ id_user: 'user1', firstname: 'John', lastname: 'Doe' }];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockGroupUsers,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockProfiles,
              error: null
            })
          })
        } as any);

      const result = await groupService.getGroupMembersFallback(1);
      
      expect(result).toEqual([
        {
          id_user: 'user1',
          user: {
            firstname: 'John',
            lastname: 'Doe'
          }
        }
      ]);
    });

    it('should create fallback profiles for missing users', async () => {
      const mockGroupUsers = [{ id_user: 'user1' }, { id_user: 'user2' }];
      const mockProfiles = [{ id_user: 'user1', firstname: 'John', lastname: 'Doe' }];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockGroupUsers,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: mockProfiles,
              error: null
            })
          })
        } as any);

      const result = await groupService.getGroupMembersFallback(1);
      
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({
        id_user: 'user2',
        user: {
          firstname: 'Membre',
          lastname: 'user2'.substring(0, 8)
        }
      });
    });

    it('should handle empty profiles array', async () => {
      const mockGroupUsers = [{ id_user: 'user1' }];

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockGroupUsers,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        } as any);

      const result = await groupService.getGroupMembersFallback(1);
      
      expect(result).toEqual([
        {
          id_user: 'user1',
          user: {
            firstname: 'Membre',
            lastname: 'user1'.substring(0, 8)
          }
        }
      ]);
    });
  });
});
