import { useState, useEffect } from 'react';
import { Conversation, Message, ImprovedMessageService, ConversationService } from '@/lib/index';
import { useAuthUser } from '@/stores/authStore';

// Hook pour gérer les conversations
export function useConversations(useImprovedService: boolean = false) {
  const user = useAuthUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les conversations
  const loadConversations = async () => {
    if (!user?.id) {
      console.log('⚠️ Pas d\'utilisateur connecté');
      return;
    }

    console.log('🔄 Chargement des conversations pour:', user.id);

    try {
      setLoading(true);
      setError(null);
      
      if (useImprovedService) {
        console.log('🚀 Utilisation du service amélioré avec table group');
        const data = await ImprovedMessageService.getUserConversations(user.id);
        console.log('📋 Conversations du service amélioré:', data);
        setConversations(data);
      } else {
        // Utiliser aussi le service amélioré par défaut
        console.log('🚀 Utilisation du service amélioré par défaut');
        const data = await ImprovedMessageService.getUserConversations(user.id);
        console.log('📋 Conversations reçues:', data);
        setConversations(data);
      }
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger les conversations: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les conversations
  const refreshConversations = () => {
    loadConversations();
  };

  // Charger au montage et quand l'utilisateur change
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  return {
    conversations,
    loading,
    error,
    refreshConversations,
  };
}

// Hook pour gérer une conversation spécifique (groupId au lieu de conversationId)
export function useConversation(groupId: number) {
  const user = useAuthUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Charger les messages
  const loadMessages = async () => {
    if (!user?.id || !groupId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await ConversationService.getGroupMessages(groupId, user.id);
      setMessages(data);
      
      // Marquer les messages comme lus
      await ConversationService.markMessagesAsRead(groupId, user.id);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user?.id || !groupId || !content.trim()) return false;

    try {
      setSending(true);
      
      const newMessage = await ConversationService.sendMessage(
        groupId,
        user.id,
        content.trim()
      );
      
      // Ajouter le message à la liste locale
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (err) {
      console.error('❌ Erreur lors de l\'envoi du message:', err);
      setError('Impossible d\'envoyer le message');
      return false;
    } finally {
      setSending(false);
    }
  };

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!groupId || !user?.id) return;

    let subscription: any;

    const setupSubscription = async () => {
      try {
        subscription = ConversationService.subscribeToMessages(
          groupId,
          (payload: any) => {
            const newMessage = payload.new;
            
            // Éviter de dupliquer nos propres messages
            if (newMessage.id_sender === user.id) return;
            
            // Convertir le message de la base de données en format UI
            const uiMessage: Message = {
              id: newMessage.id,
              text: newMessage.content,
              senderId: newMessage.id_sender,
              senderName: `Utilisateur ${newMessage.id_sender.slice(0, 8)}...`,
              timestamp: ConversationService.formatMessageTime(newMessage.send_date),
              isMe: false,
              status: 'sent',
            };

            setMessages(prev => [...prev, uiMessage]);
          }
        );
      } catch (error) {
        console.error('❌ Erreur lors de la configuration de la subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [groupId, user?.id]);

  // Charger au montage
  useEffect(() => {
    loadMessages();
  }, [groupId, user?.id]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    refreshMessages: loadMessages,
  };
}
