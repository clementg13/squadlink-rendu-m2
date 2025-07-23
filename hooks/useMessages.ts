import { useState, useEffect, useRef } from 'react';
import { Conversation, Message, ImprovedMessageService, ConversationService } from '@/services/messagingInterface';
import { useAuthUser } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

// Hook pour gérer les conversations avec temps réel
export function useConversations(useImprovedService: boolean = false) {
  const user = useAuthUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

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
      
      const data = await ImprovedMessageService.getUserConversations(user.id);
      console.log('📋 Conversations reçues:', data);
      setConversations(data);
      
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

  // Configurer l'abonnement en temps réel pour les nouveaux messages
  const setupRealtimeSubscription = () => {
    if (!user?.id) return;

    console.log('🔔 Configuration de l\'abonnement temps réel pour les messages');

    // S'abonner aux changements dans la table message avec throttling
    let updateTimeout: any;
    
    subscriptionRef.current = supabase
      .channel('messages_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'musclemeet',
          table: 'message'
        },
        async (payload) => {
          console.log('🔔 Changement de message détecté:', payload);
          
          // Éviter les mises à jour trop fréquentes avec un debounce
          if (updateTimeout) {
            clearTimeout(updateTimeout);
          }
          
          updateTimeout = setTimeout(async () => {
            try {
              const updatedConversations = await ImprovedMessageService.getUserConversations(user.id);
              setConversations(updatedConversations);
              console.log('✅ Conversations mises à jour en temps réel');
            } catch (error) {
              console.error('❌ Erreur lors de la mise à jour des conversations:', error);
            }
          }, 500); // Attendre 500ms avant de mettre à jour
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut de l\'abonnement messages:', status);
      });
  };

  // Nettoyer l'abonnement
  const cleanupSubscription = () => {
    if (subscriptionRef.current) {
      console.log('🧹 Nettoyage de l\'abonnement temps réel');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  };

  // Charger au montage et quand l'utilisateur change
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // Log des changements de conversations
  useEffect(() => {
    console.log(`💬 Nombre de conversations: ${conversations.length}`);
  }, [conversations]);

  // Configurer l'abonnement temps réel
  useEffect(() => {
    if (user?.id) {
      console.log('👤 Utilisateur connecté, configuration de l\'abonnement temps réel');
      setupRealtimeSubscription();
    }

    return () => {
      cleanupSubscription();
    };
  }, [user?.id]);

  return {
    conversations,
    loading,
    error,
    refreshConversations,
    isRealtimeActive: !!subscriptionRef.current,
  };
}

// Hook pour gérer une conversation spécifique
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
