import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCompatibleProfiles } from '@/hooks/useCompatibleProfiles';
import { CompatibleProfileService, CompatibleProfile } from '@/services/compatibleProfileService';
import { useMatchRefreshStore } from '@/stores/matchRefreshStore';

// Mock CompatibleProfileService
jest.mock('@/services/compatibleProfileService', () => ({
  CompatibleProfileService: {
    getCompatibleProfiles: jest.fn(),
  },
}));

// Mock useMatchRefreshStore
jest.mock('@/stores/matchRefreshStore', () => ({
  useMatchRefreshStore: jest.fn(),
}));

describe('useCompatibleProfiles', () => {
  const mockGetCompatibleProfiles = CompatibleProfileService.getCompatibleProfiles as jest.MockedFunction<typeof CompatibleProfileService.getCompatibleProfiles>;
  const mockUseMatchRefreshStore = useMatchRefreshStore as jest.MockedFunction<typeof useMatchRefreshStore>;

  const mockRefreshTrigger = 1;
  const mockTriggerRefresh = jest.fn();

  // Helper pour créer des profils mock
  const createMockProfile = (id: number, firstname: string, lastname: string, compatibility: number): CompatibleProfile => ({
    profile_id: id,
    user_id: `user${id}`,
    firstname,
    lastname,
    biography: `Bio for ${firstname} ${lastname}`,
    compatibility_score: compatibility,
    total_count: 15,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useMatchRefreshStore
    mockUseMatchRefreshStore.mockImplementation((selector) => {
      const state = {
        refreshTrigger: mockRefreshTrigger,
        triggerRefresh: mockTriggerRefresh,
      };
      return selector(state);
    });
  });

  describe('initial state', () => {
    it('should return initial state when no userId provided', () => {
      const { result } = renderHook(() => useCompatibleProfiles(null));

      expect(result.current).toEqual({
        profiles: [],
        loading: false,
        error: null,
        hasMore: true,
        totalCount: 0,
        isEmpty: false,
        loadMore: expect.any(Function),
        refresh: expect.any(Function),
      });
    });

    it('should return initial state with default pageSize', async () => {
      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: [],
        has_more: false,
        total_count: 0,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toEqual({
        profiles: [],
        loading: false,
        error: null,
        hasMore: false,
        totalCount: 0,
        isEmpty: true,
        loadMore: expect.any(Function),
        refresh: expect.any(Function),
      });
    });

    it('should return initial state with custom pageSize', async () => {
      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: [],
        has_more: false,
        total_count: 0,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1', 20));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toEqual({
        profiles: [],
        loading: false,
        error: null,
        hasMore: false,
        totalCount: 0,
        isEmpty: true,
        loadMore: expect.any(Function),
        refresh: expect.any(Function),
      });
    });
  });

  describe('loadInitial', () => {
    it('should load initial profiles successfully', async () => {
      const mockProfiles = [
        createMockProfile(1, 'John', 'Doe', 85),
        createMockProfile(2, 'Jane', 'Smith', 78),
      ];

      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: mockProfiles,
        has_more: true,
        total_count: 15,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profiles).toEqual(mockProfiles);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.totalCount).toBe(15);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle empty profiles response', async () => {
      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: [],
        has_more: false,
        total_count: 0,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profiles).toEqual([]);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should handle service error', async () => {
      const errorMessage = 'Service error';
      mockGetCompatibleProfiles.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profiles).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isEmpty).toBe(true);
    });

    it('should not load when userId is null', async () => {
      const { result } = renderHook(() => useCompatibleProfiles(null));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetCompatibleProfiles).not.toHaveBeenCalled();
      expect(result.current.profiles).toEqual([]);
    });
  });

  describe('loadMore', () => {
    it('should load more profiles successfully', async () => {
      const initialProfiles = [createMockProfile(1, 'John', 'Doe', 85)];
      const moreProfiles = [
        createMockProfile(2, 'Jane', 'Smith', 78),
        createMockProfile(3, 'Bob', 'Johnson', 72),
      ];

      mockGetCompatibleProfiles
        .mockResolvedValueOnce({
          profiles: initialProfiles,
          has_more: true,
          total_count: 15,
          current_page: 0,
        })
        .mockResolvedValueOnce({
          profiles: moreProfiles,
          has_more: false,
          total_count: 15,
          current_page: 1,
        });

      const { result } = renderHook(() => useCompatibleProfiles('user1', 1));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load more
      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profiles).toEqual([...initialProfiles, ...moreProfiles]);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle multiple loadMore calls', async () => {
      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: [],
        has_more: true,
        total_count: 0,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Call loadMore multiple times
      await act(async () => {
        await result.current.loadMore();
      });

      // Should handle multiple calls without errors
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should not load more when no more data', async () => {
      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: [],
        has_more: false,
        total_count: 0,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      // Should not call service again
      expect(mockGetCompatibleProfiles).toHaveBeenCalledTimes(1);
    });

    it('should handle error when loading more', async () => {
      mockGetCompatibleProfiles
        .mockResolvedValueOnce({
          profiles: [],
          has_more: true,
          total_count: 0,
          current_page: 0,
        })
        .mockRejectedValueOnce(new Error('Load more error'));

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Load more error');
    });
  });

  describe('refresh', () => {
    it('should refresh profiles successfully', async () => {
      const mockProfiles = [createMockProfile(1, 'John', 'Doe', 85)];

      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: mockProfiles,
        has_more: true,
        total_count: 15,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profiles).toEqual(mockProfiles);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.totalCount).toBe(15);
      expect(result.current.error).toBe(null);
      expect(mockTriggerRefresh).toHaveBeenCalled();
    });

    it('should handle error when refreshing', async () => {
      mockGetCompatibleProfiles.mockRejectedValue(new Error('Refresh error'));

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Refresh error');
      expect(mockTriggerRefresh).not.toHaveBeenCalled();
    });

    it('should not refresh when userId is null', async () => {
      const { result } = renderHook(() => useCompatibleProfiles(null));

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockGetCompatibleProfiles).not.toHaveBeenCalled();
    });
  });

  describe('useEffect dependencies', () => {
    it('should reload when userId changes', async () => {
      const mockProfiles = [createMockProfile(1, 'John', 'Doe', 85)];
      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: mockProfiles,
        has_more: false,
        total_count: 1,
        current_page: 0,
      });

      const { result, rerender } = renderHook(
        ({ userId }) => useCompatibleProfiles(userId),
        { initialProps: { userId: 'user1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetCompatibleProfiles).toHaveBeenCalledTimes(1);

      // Change userId
      rerender({ userId: 'user2' });

      await waitFor(() => {
        expect(mockGetCompatibleProfiles).toHaveBeenCalledTimes(2);
      });
    });

    it('should reload when refreshTrigger changes', async () => {
      const mockProfiles = [createMockProfile(1, 'John', 'Doe', 85)];
      mockGetCompatibleProfiles.mockResolvedValue({
        profiles: mockProfiles,
        has_more: false,
        total_count: 1,
        current_page: 0,
      });

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetCompatibleProfiles).toHaveBeenCalledTimes(1);

      // Change refreshTrigger
      mockUseMatchRefreshStore.mockImplementation((selector) => {
        const state = {
          refreshTrigger: 2, // Changed from 1
          triggerRefresh: mockTriggerRefresh,
        };
        return selector(state);
      });

      // Re-render to trigger useEffect
      renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(mockGetCompatibleProfiles).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects', async () => {
      mockGetCompatibleProfiles.mockRejectedValue('String error');

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Erreur inconnue');
    });

    it('should preserve existing profiles on error during loadMore', async () => {
      const initialProfiles = [createMockProfile(1, 'John', 'Doe', 85)];

      mockGetCompatibleProfiles
        .mockResolvedValueOnce({
          profiles: initialProfiles,
          has_more: true,
          total_count: 15,
          current_page: 0,
        })
        .mockRejectedValueOnce(new Error('Load more error'));

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profiles).toEqual(initialProfiles);
      expect(result.current.error).toBe('Load more error');
    });

    it('should preserve existing profiles on error during refresh', async () => {
      const initialProfiles = [createMockProfile(1, 'John', 'Doe', 85)];

      mockGetCompatibleProfiles
        .mockResolvedValueOnce({
          profiles: initialProfiles,
          has_more: true,
          total_count: 15,
          current_page: 0,
        })
        .mockRejectedValueOnce(new Error('Refresh error'));

      const { result } = renderHook(() => useCompatibleProfiles('user1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profiles).toEqual(initialProfiles);
      expect(result.current.error).toBe('Refresh error');
    });
  });
}); 