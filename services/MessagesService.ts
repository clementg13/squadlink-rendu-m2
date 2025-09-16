import { supabase } from '@/lib/supabase';
import { Conversation, DatabaseMessage } from '@/types/messaging';

interface GroupInfo {
  id: number;
  name: string;
  description?: string;
}

interface ConversationData {
  groupId: number;
  groupInfo?: GroupInfo;
  messages: DatabaseMessage[];
  lastMessage?: DatabaseMessage;
  participants: Set<string>;
}

export class MessageService {
  
  // Méthode principale pour récupérer toutes les conversations
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('🔍 Recherche conversations améliorée pour:', userId);
      
      // 1. Récupérer les groupes dont l'utilisateur fait partie
      const userGroups = await this.getUserGroups(userId);
      
      // 2. Récupérer tous les messages pour ces groupes
      const groupIds = userGroups.map(g => g.id);
      const { data: messages, error: messageError } = await supabase
        .from('message')
        .select('*')
        .in('id_group', groupIds)
        .order('send_date', { ascending: false });

      if (messageError) {
        console.error('❌ Erreur récupération messages:', messageError);
      }
      
      console.log('📊 Groupes utilisateur trouvés:', userGroups.length);
      console.log('📊 Messages trouvés:', messages?.length || 0);
      
      // 3. Créer une map des conversations avec les groupes de l'utilisateur
      const conversationsMap = new Map<number, ConversationData>();
      
      // Ajouter tous les groupes utilisateur d'abord (même sans messages)
      userGroups.forEach(group => {
        conversationsMap.set(group.id, {
          groupId: group.id,
          groupInfo: group,
          messages: [],
          participants: new Set([userId])
        });
      });
      
      // Ajouter les messages
      if (messages && messages.length > 0) {
        messages.forEach(message => {
          const groupId = message.id_group;
          
          if (conversationsMap.has(groupId)) {
            const conversation = conversationsMap.get(groupId)!;
            conversation.messages.push(message);
            conversation.participants.add(message.id_sender);
            
            // Garder le message le plus récent
            if (!conversation.lastMessage || 
                new Date(message.send_date) > new Date(conversation.lastMessage.send_date)) {
              conversation.lastMessage = message;
            }
          }
        });
      }
      
      // 4. Convertir en format Conversation
      const conversations: Conversation[] = Array.from(conversationsMap.values()).map(conv => {
        const otherParticipants = Array.from(conv.participants).filter(p => p !== userId);
        const isGroup = conv.participants.size > 2 || Boolean(conv.groupInfo && conv.groupInfo.name);
        
        // Déterminer le nom de la conversation
        let conversationName = '';
        if (conv.groupInfo && conv.groupInfo.name) {
          conversationName = conv.groupInfo.name;
        } else if (isGroup) {
          conversationName = `Groupe ${conv.groupId}`;
        } else if (otherParticipants.length > 0) {
          conversationName = `Chat avec utilisateur ${otherParticipants[0].substring(0, 8)}...`;
        } else {
          conversationName = `Conversation ${conv.groupId}`;
        }
        
        return {
          id: conv.groupId,
          name: conversationName,
          lastMessage: conv.lastMessage?.content || 'Soyez le premier à écrire',
          lastMessageTime: conv.lastMessage ? this.formatDate(conv.lastMessage.send_date) : '',
          unreadCount: conv.messages.filter(m => !m.is_read && m.id_sender !== userId).length,
          isGroup,
          isOnline: Math.random() > 0.5, // Mock pour l'instant
        };
      });

      console.log('📋 Conversations finales:', conversations.length);
      
      return conversations;

    } catch (error) {
      console.error('❌ Erreur getUserConversations améliorée:', error);
      return [];
    }
  }

  // Récupérer les groupes dont l'utilisateur fait partie
  private static async getUserGroups(userId: string): Promise<GroupInfo[]> {
    try {
      console.log('🔍 Récupération des groupes pour l\'utilisateur:', userId);
      
      // Récupérer les IDs des groupes dont l'utilisateur fait partie
      const { data: userGroupsData, error: userGroupsError } = await supabase
        .from('groupuser')
        .select('id_group')
        .eq('id_user', userId);

      if (userGroupsError) {
        console.error('❌ Erreur récupération groupuser:', userGroupsError);
        return [];
      }

      if (!userGroupsData || userGroupsData.length === 0) {
        console.log('📋 Aucun groupe trouvé pour l\'utilisateur');
        return [];
      }

      const groupIds = userGroupsData.map(ug => ug.id_group);
      console.log('🔍 IDs des groupes utilisateur:', groupIds);

      // Récupérer les informations des groupes
      const { data: groupsData, error: groupsError } = await supabase
        .from('group')
        .select('*')
        .in('id', groupIds);
        
      if (groupsError) {
        console.error('❌ Erreur accès table group:', groupsError);
        // Créer des groupes par défaut avec les IDs récupérés
        return groupIds.map(id => ({
          id,
          name: `Groupe ${id}`,
          description: 'Groupe utilisateur'
        }));
      }
      
      console.log(`✅ ${groupsData?.length || 0} groupes récupérés pour l'utilisateur`);
      
      return groupsData || [];
      
    } catch (error) {
      console.error('❌ Erreur getUserGroups:', error);
      return [];
    }
  }

  private static formatDate(dateString: string): string {
    const ensureUtc = (value: string) => {
      if (typeof value === 'string' && value.length > 0 && !/[zZ]|[\+\-]\d{2}:?\d{2}$/.test(value)) {
        return `${value.replace(/\s+/g, 'T')}${value.includes('T') ? '' : 'T00:00:00'}Z`;
      }
      return value;
    };

    const date = new Date(ensureUtc(dateString));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'À l\'instant';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}j`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        day: '2-digit',
        month: '2-digit',
      }).format(date);
    }
  }
}
