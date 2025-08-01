import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useConversations, useConversation } from '@/hooks/useMessages';

// Mock authStore
jest.mock('@/stores/authStore', () => ({
  useAuthUser: jest.fn(),
}));

// Mock MessageService
jest.mock('@/services/MessagesService', () => ({
  MessageService: {
    getUserConversations: jest.fn(),
  },
}));

// Mock ConversationService
jest.mock('@/services/conversationService', () => ({
  ConversationService: {
    getGroupMessages: jest.fn(),
    sendMessage: jest.fn(),
    markMessagesAsRead: jest.fn(),
    subscribeToMessages: jest.fn(),
    formatMessageTime: jest.fn(),
  },
}));

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

describe('useMessages', () => {
  const mockUseAuthUser = require('@/stores/authStore').useAuthUser;
  const mockMessageService = require('@/services/MessagesService').MessageService;
  const mockConversationService = require('@/services/conversationService').ConversationService;
  const mockSupabase = require('@/lib/supabase').supabase;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock supabase channel
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    };
    mockSupabase.channel.mockReturnValue(mockChannel);
    mockSupabase.removeChannel.mockImplementation(() => {});
  });

  describe('useConversations', () => {
    describe('initial state', () => {
      it('should return initial state when no user', () => {
        mockUseAuthUser.mockReturnValue(null);

        const { result } = renderHook(() => useConversations());

        expect(result.current).toEqual({
          conversations: [],
          loading: true,
          error: null,
          refreshConversations: expect.any(Function),
          isRealtimeActive: false,
        });
      });

      it('should return initial state when user exists', () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockMessageService.getUserConversations.mockResolvedValue([]);

        const { result } = renderHook(() => useConversations());

        expect(result.current).toEqual({
          conversations: [],
          loading: true,
          error: null,
          refreshConversations: expect.any(Function),
          isRealtimeActive: false,
        });
      });
    });

    describe('loadConversations', () => {
      it('should load conversations successfully', async () => {
        const mockConversations = [
          { id: 1, name: 'Conversation 1', lastMessage: 'Hello' },
          { id: 2, name: 'Conversation 2', lastMessage: 'Hi' },
        ];

        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockMessageService.getUserConversations.mockResolvedValue(mockConversations);

        const { result } = renderHook(() => useConversations());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.conversations).toEqual(mockConversations);
        expect(result.current.error).toBe(null);
        expect(mockMessageService.getUserConversations).toHaveBeenCalledWith('user1');
      });

      it('should handle loading error', async () => {
        const errorMessage = 'Network error';
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockMessageService.getUserConversations.mockRejectedValue(new Error(errorMessage));

        const { result } = renderHook(() => useConversations());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.conversations).toEqual([]);
        expect(result.current.error).toBe(`Impossible de charger les conversations: ${errorMessage}`);
      });

      it('should not load when no user', async () => {
        mockUseAuthUser.mockReturnValue(null);

        const { result } = renderHook(() => useConversations());

        // When no user, loading should remain true
        expect(result.current.loading).toBe(true);
        expect(mockMessageService.getUserConversations).not.toHaveBeenCalled();
        expect(result.current.conversations).toEqual([]);
      });
    });

    describe('refreshConversations', () => {
      it('should refresh conversations', async () => {
        const mockConversations = [{ id: 1, name: 'Conversation 1' }];
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockMessageService.getUserConversations.mockResolvedValue(mockConversations);

        const { result } = renderHook(() => useConversations());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Reset mock to verify it's called again
        mockMessageService.getUserConversations.mockClear();

        await act(async () => {
          result.current.refreshConversations();
        });

        expect(mockMessageService.getUserConversations).toHaveBeenCalledWith('user1');
      });
    });

    describe('realtime subscription', () => {
      it('should setup realtime subscription when user exists', async () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockMessageService.getUserConversations.mockResolvedValue([]);

        const { result } = renderHook(() => useConversations());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(mockSupabase.channel).toHaveBeenCalledWith('messages_realtime');
      });

      it('should not setup realtime subscription when no user', () => {
        mockUseAuthUser.mockReturnValue(null);

        renderHook(() => useConversations());

        expect(mockSupabase.channel).not.toHaveBeenCalled();
      });

      it('should cleanup subscription on unmount', () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockMessageService.getUserConversations.mockResolvedValue([]);

        const { unmount } = renderHook(() => useConversations());

        unmount();

        expect(mockSupabase.removeChannel).toHaveBeenCalled();
      });
    });
  });

  describe('useConversation', () => {
    const groupId = 1;

    describe('initial state', () => {
      it('should return initial state when no user', () => {
        mockUseAuthUser.mockReturnValue(null);

        const { result } = renderHook(() => useConversation(groupId));

        expect(result.current).toEqual({
          messages: [],
          loading: true,
          error: null,
          sending: false,
          sendMessage: expect.any(Function),
          refreshMessages: expect.any(Function),
        });
      });

      it('should return initial state when no groupId', () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });

        const { result } = renderHook(() => useConversation(0));

        expect(result.current).toEqual({
          messages: [],
          loading: true,
          error: null,
          sending: false,
          sendMessage: expect.any(Function),
          refreshMessages: expect.any(Function),
        });
      });
    });

    describe('loadMessages', () => {
      it('should load messages successfully', async () => {
        const mockMessages = [
          { id: 1, text: 'Hello', senderId: 'user1', timestamp: '10:00', isMe: true },
          { id: 2, text: 'Hi', senderId: 'user2', timestamp: '10:01', isMe: false },
        ];

        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue(mockMessages);
        mockConversationService.markMessagesAsRead.mockResolvedValue(undefined);

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.messages).toEqual(mockMessages);
        expect(result.current.error).toBe(null);
        expect(mockConversationService.getGroupMessages).toHaveBeenCalledWith(groupId, 'user1');
        expect(mockConversationService.markMessagesAsRead).toHaveBeenCalledWith(groupId, 'user1');
      });

      it('should handle loading error', async () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.messages).toEqual([]);
        expect(result.current.error).toBe('Impossible de charger les messages');
      });

      it('should not load when no user or groupId', async () => {
        mockUseAuthUser.mockReturnValue(null);

        const { result } = renderHook(() => useConversation(groupId));

        // When no user, loading should remain true
        expect(result.current.loading).toBe(true);
        expect(mockConversationService.getGroupMessages).not.toHaveBeenCalled();
        expect(result.current.messages).toEqual([]);
      });
    });

    describe('sendMessage', () => {
      it('should send message successfully', async () => {
        const mockNewMessage = {
          id: 3,
          text: 'New message',
          senderId: 'user1',
          timestamp: '10:02',
          isMe: true,
        };

        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue([]);
        mockConversationService.sendMessage.mockResolvedValue(mockNewMessage);

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          const success = await result.current.sendMessage('New message');
          expect(success).toBe(true);
        });

        expect(mockConversationService.sendMessage).toHaveBeenCalledWith(groupId, 'user1', 'New message');
        expect(result.current.messages).toContain(mockNewMessage);
        expect(result.current.sending).toBe(false);
      });

      it('should not send empty message', async () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue([]);

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          const success = await result.current.sendMessage('');
          expect(success).toBe(false);
        });

        expect(mockConversationService.sendMessage).not.toHaveBeenCalled();
      });

      it('should not send message with only whitespace', async () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue([]);

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          const success = await result.current.sendMessage('   ');
          expect(success).toBe(false);
        });

        expect(mockConversationService.sendMessage).not.toHaveBeenCalled();
      });

      it('should handle send error', async () => {
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue([]);
        mockConversationService.sendMessage.mockRejectedValue(new Error('Send error'));

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          const success = await result.current.sendMessage('Test message');
          expect(success).toBe(false);
        });

        expect(result.current.error).toBe('Impossible d\'envoyer le message');
        expect(result.current.sending).toBe(false);
      });

      it('should not send when no user or groupId', async () => {
        mockUseAuthUser.mockReturnValue(null);
        mockConversationService.getGroupMessages.mockResolvedValue([]);

        const { result } = renderHook(() => useConversation(groupId));

        // When no user, loading should remain true
        expect(result.current.loading).toBe(true);

        await act(async () => {
          const success = await result.current.sendMessage('Test message');
          expect(success).toBe(false);
        });

        expect(mockConversationService.sendMessage).not.toHaveBeenCalled();
      });
    });

    describe('realtime subscription', () => {
      it('should setup subscription for new messages', async () => {
        const mockSubscription = {
          unsubscribe: jest.fn(),
        };

        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue([]);
        mockConversationService.subscribeToMessages.mockReturnValue(mockSubscription);

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(mockConversationService.subscribeToMessages).toHaveBeenCalledWith(
          groupId,
          expect.any(Function)
        );
      });

      it('should not setup subscription when no user or groupId', () => {
        mockUseAuthUser.mockReturnValue(null);

        renderHook(() => useConversation(groupId));

        expect(mockConversationService.subscribeToMessages).not.toHaveBeenCalled();
      });

      it('should cleanup subscription on unmount', async () => {
        const mockSubscription = {
          unsubscribe: jest.fn(),
        };

        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue([]);
        mockConversationService.subscribeToMessages.mockReturnValue(mockSubscription);

        const { unmount } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(mockConversationService.subscribeToMessages).toHaveBeenCalled();
        });

        unmount();

        expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      });
    });

    describe('refreshMessages', () => {
      it('should refresh messages', async () => {
        const mockMessages = [{ id: 1, text: 'Hello', senderId: 'user1', timestamp: '10:00', isMe: true }];
        mockUseAuthUser.mockReturnValue({ id: 'user1' });
        mockConversationService.getGroupMessages.mockResolvedValue(mockMessages);
        mockConversationService.markMessagesAsRead.mockResolvedValue(undefined);

        const { result } = renderHook(() => useConversation(groupId));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Reset mock to verify it's called again
        mockConversationService.getGroupMessages.mockClear();

        await act(async () => {
          await result.current.refreshMessages();
        });

        expect(mockConversationService.getGroupMessages).toHaveBeenCalledWith(groupId, 'user1');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle user change in useConversations', async () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockMessageService.getUserConversations.mockResolvedValue([]);

      const { result, rerender } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockMessageService.getUserConversations).toHaveBeenCalledWith('user1');

      // Change user
      mockUseAuthUser.mockReturnValue({ id: 'user2' });
      mockMessageService.getUserConversations.mockClear();

      rerender();

      await waitFor(() => {
        expect(mockMessageService.getUserConversations).toHaveBeenCalledWith('user2');
      });
    });

    it('should handle groupId change in useConversation', async () => {
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockConversationService.getGroupMessages.mockResolvedValue([]);

      const { result, rerender } = renderHook(({ groupId }) => useConversation(groupId), {
        initialProps: { groupId: 1 },
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockConversationService.getGroupMessages).toHaveBeenCalledWith(1, 'user1');

      // Change groupId
      mockConversationService.getGroupMessages.mockClear();

      rerender({ groupId: 2 });

      await waitFor(() => {
        expect(mockConversationService.getGroupMessages).toHaveBeenCalledWith(2, 'user1');
      });
    });

    it('should handle sending state correctly', async () => {
      const testGroupId = 1;
      mockUseAuthUser.mockReturnValue({ id: 'user1' });
      mockConversationService.getGroupMessages.mockResolvedValue([]);
      mockConversationService.sendMessage.mockResolvedValue({
        id: 1,
        text: 'Test message',
        senderId: 'user1',
        timestamp: '10:00',
        isMe: true,
      });

      const { result } = renderHook(() => useConversation(testGroupId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.sendMessage('Test message');
        expect(success).toBe(true);
      });

      // Should not be sending after completion
      expect(result.current.sending).toBe(false);
    });
  });
}); 