import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { Conversation, Message, DatabaseMessage } from '@/types/messaging';
import { MessageService } from '@/services/MessagesService';
import { ConversationService } from '@/services/conversationService';
import { useAuthUser } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Hook pour gérer les conversations avec temps réel
export function useConversations(_useImprovedService: boolean = false) {
  const user = useAuthUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ Pas d\'utilisateur connecté');
      return;
    }

    console.log('🔄 Chargement des conversations pour:', user.id);

    try {
      setLoading(true);
      setError(null);
      
      const data = await MessageService.getUserConversations(user.id);
      console.log('📋 Conversations reçues:', data);
      setConversations(data);
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger les conversations: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Rafraîchir les conversations
  const refreshConversations = () => {
    loadConversations();
  };

  // Configurer l'abonnement en temps réel pour les nouveaux messages
  const setupRealtimeSubscription = useCallback(() => {
    if (!user?.id) return;

    console.log('🔔 Configuration de l\'abonnement temps réel pour les messages');

    // S'abonner aux changements dans la table message avec throttling
    let updateTimeout: ReturnType<typeof setTimeout>;
    
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
              const updatedConversations = await MessageService.getUserConversations(user.id);
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
  }, [user?.id]);

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
  }, [user?.id, loadConversations]);

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
  }, [user?.id, setupRealtimeSubscription]);

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
  const senderNameCacheRef = useRef<Map<string, string>>(new Map());

  // Charger les messages
  const loadMessages = useCallback(async () => {
    if (!user?.id || !groupId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await ConversationService.getGroupMessages(groupId, user.id);
      setMessages(data);
      // Pré-remplir un cache des noms pour accélérer la résolution ultérieure
      data.forEach((msg) => {
        if (msg.senderId && msg.senderName) {
          senderNameCacheRef.current.set(msg.senderId, msg.senderName);
        }
      });
      
      // Marquer les messages comme lus
      await ConversationService.markMessagesAsRead(groupId, user.id);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [user?.id, groupId]);

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
      
      // Ajouter le message à la liste locale et injecter une clé de tri interne ISO
      try {
        Object.defineProperty(newMessage as any, '__sortDate', {
          value: new Date().toISOString(),
          enumerable: false,
          configurable: false,
          writable: false,
        });
      } catch {
        void 0;
      }
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

    let subscription: RealtimeChannel | null;

    const setupSubscription = async () => {
      try {
        subscription = ConversationService.subscribeToMessages(
          groupId,
          (payload: RealtimePostgresInsertPayload<DatabaseMessage>) => {
            const newMessage = payload.new;
            
            // Éviter de dupliquer nos propres messages
            if (newMessage.id_sender === user.id) return;
            
            // Déterminer un nom d'expéditeur instantané via cache (sinon fallback)
            const cachedName = senderNameCacheRef.current.get(newMessage.id_sender);

            // Convertir le message de la base de données en format UI (nom provisoire)
            const uiMessage: Message = {
              id: newMessage.id,
              text: newMessage.content,
              senderId: newMessage.id_sender,
              senderName: cachedName || `Utilisateur ${newMessage.id_sender.slice(0, 8)}...`,
              timestamp: ConversationService.formatMessageTime(newMessage.send_date),
              isMe: false,
              status: 'sent',
            };
            try {
              Object.defineProperty(uiMessage as any, '__sortDate', {
                value: new Date(newMessage.send_date).toISOString(),
                enumerable: false,
                configurable: false,
                writable: false,
              });
            } catch {
              void 0;
            }

            setMessages(prev => [...prev, uiMessage]);

            // Si pas dans le cache, récupérer prénom/nom et mettre à jour le message inséré
            if (!cachedName) {
              (async () => {
                try {
                  const { data: profile, error: profileError } = await supabase
                    .from('profile')
                    .select('firstname, lastname')
                    .eq('id_user', newMessage.id_sender)
                    .single();

                  if (!profileError && profile && (profile.firstname || profile.lastname)) {
                    const resolvedName = `${profile.firstname || ''} ${profile.lastname || ''}`.trim();
                    if (resolvedName.length > 0) {
                      senderNameCacheRef.current.set(newMessage.id_sender, resolvedName);
                      // Mettre à jour le message correspondant dans le state
                      setMessages(prev => prev.map(m => (
                        m.id === newMessage.id ? { ...m, senderName: resolvedName } : m
                      )));
                    }
                  }
                } catch {
                  // silencieux: garder le fallback si la résolution échoue
                }
              })();
            }
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
  }, [groupId, user?.id, loadMessages]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    refreshMessages: loadMessages,
  };
}
