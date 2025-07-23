import { supabase } from '../lib/supabase';
import { Message } from './messagingInterface';

export class ConversationService {
  
  // Récupérer tous les messages d'un groupe
  static async getGroupMessages(groupId: number, userId: string): Promise<Message[]> {
    try {
      console.log('📩 Chargement des messages pour le groupe:', groupId);
      
      const { data: messages, error } = await supabase
        .from('message')
        .select('*')
        .eq('id_group', groupId)
        .order('send_date', { ascending: true });

      if (error) {
        console.error('❌ Erreur récupération messages:', error);
        throw error;
      }

      console.log('📨 Messages du groupe', groupId, ':', messages?.length || 0);

      if (!messages || messages.length === 0) {
        return [];
      }

      // Convertir en format Message pour l'UI
      const uiMessages: Message[] = messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        senderId: msg.id_sender,
        senderName: msg.id_sender === userId ? 'Vous' : `Utilisateur ${msg.id_sender.slice(0, 8)}...`,
        timestamp: this.formatMessageTime(msg.send_date),
        isMe: msg.id_sender === userId,
        status: 'sent',
      }));

      return uiMessages;

    } catch (error) {
      console.error('❌ Erreur getGroupMessages:', error);
      throw error;
    }
  }

  // Envoyer un nouveau message
  static async sendMessage(groupId: number, senderId: string, content: string): Promise<Message> {
    try {
      console.log('📤 Envoi message vers groupe:', groupId);
      
      const newMessage = {
        id_group: groupId,
        id_sender: senderId,
        content: content,
        send_date: new Date().toISOString(),
        is_read: false
      };

      const { data, error } = await supabase
        .from('message')
        .insert([newMessage])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur envoi message:', error);
        throw error;
      }

      console.log('✅ Message envoyé:', data);

      // Convertir en format UI
      const uiMessage: Message = {
        id: data.id,
        text: data.content,
        senderId: data.id_sender,
        senderName: 'Vous',
        timestamp: this.formatMessageTime(data.send_date),
        isMe: true,
        status: 'sent',
      };

      return uiMessage;

    } catch (error) {
      console.error('❌ Erreur sendMessage:', error);
      throw error;
    }
  }

  // Marquer les messages comme lus
  static async markMessagesAsRead(groupId: number, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message')
        .update({ is_read: true })
        .eq('id_group', groupId)
        .neq('id_sender', userId); // Ne pas marquer ses propres messages

      if (error) {
        console.error('⚠️ Erreur marquage lecture:', error);
        // Ne pas throw, ce n'est pas critique
      }
    } catch (error) {
      console.error('⚠️ Erreur markMessagesAsRead:', error);
    }
  }

  // S'abonner aux nouveaux messages en temps réel
  static subscribeToMessages(groupId: number, callback: (payload: any) => void) {
    try {
      console.log('🔔 Abonnement aux messages du groupe:', groupId);
      
      const subscription = supabase
        .channel(`messages-${groupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'musclemeet',
            table: 'message',
            filter: `id_group=eq.${groupId}`
          },
          (payload) => {
            console.log('🔔 Nouveau message reçu:', payload);
            callback(payload);
          }
        )
        .subscribe();

      return subscription;

    } catch (error) {
      console.error('❌ Erreur abonnement messages:', error);
      return null;
    }
  }

  // Formater l'heure d'un message
  static formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
}
