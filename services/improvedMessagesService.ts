import { supabase } from '../lib/supabase';
import { Conversation } from './messagingInterface';

export class ImprovedMessageService {
  
  // Méthode principale pour récupérer toutes les conversations
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('🔍 Recherche conversations améliorée pour:', userId);
      
      // 1. Récupérer tous les groupes existants (depuis table groups si elle existe)
      const allGroups = await this.getAllGroups();
      
      // 2. Récupérer tous les messages
      const { data: messages, error: messageError } = await supabase
        .from('message')
        .select('*')
        .order('send_date', { ascending: false });

      if (messageError) {
        console.error('❌ Erreur récupération messages:', messageError);
      }
      
      console.log('📊 Groupes trouvés:', allGroups.length);
      console.log('📊 Messages trouvés:', messages?.length || 0);
      
      // 3. Créer une map des conversations avec TOUS les groupes
      const conversationsMap = new Map<number, {
        groupId: number;
        groupInfo?: any;
        messages: any[];
        lastMessage?: any;
        participants: Set<string>;
      }>();
      
      // Ajouter tous les groupes d'abord (même sans messages)
      allGroups.forEach(group => {
        conversationsMap.set(group.id, {
          groupId: group.id,
          groupInfo: group,
          messages: [],
          participants: new Set([userId])
        });
      });
      
      // Si aucun groupe défini, créer des groupes basés sur les id_group des messages
      if (messages && messages.length > 0) {
        messages.forEach(message => {
          const groupId = message.id_group;
          
          if (!conversationsMap.has(groupId)) {
            conversationsMap.set(groupId, {
              groupId,
              messages: [],
              participants: new Set()
            });
          }
          
          const conversation = conversationsMap.get(groupId)!;
          conversation.messages.push(message);
          conversation.participants.add(message.id_sender);
          
          // Garder le message le plus récent
          if (!conversation.lastMessage || 
              new Date(message.send_date) > new Date(conversation.lastMessage.send_date)) {
            conversation.lastMessage = message;
          }
        });
      }
      
      // 4. Convertir en format Conversation
      const conversations: Conversation[] = Array.from(conversationsMap.values()).map(conv => {
        const otherParticipants = Array.from(conv.participants).filter(p => p !== userId);
        const isGroup = conv.participants.size > 2 || (conv.groupInfo && conv.groupInfo.name);
        
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
      console.log('📋 Détail:', conversations.map(c => ({ 
        id: c.id, 
        name: c.name, 
        hasMessages: c.lastMessage !== 'Soyez le premier à écrire',
        messageCount: conversationsMap.get(c.id)?.messages.length || 0
      })));
      
      return conversations;

    } catch (error) {
      console.error('❌ Erreur getUserConversations améliorée:', error);
      
      // Fallback avec des groupes fictifs pour tester l'affichage
      return [
        {
          id: 1,
          name: 'Équipe Marketing',
          lastMessage: 'Soyez le premier à écrire',
          lastMessageTime: '',
          unreadCount: 0,
          isGroup: true,
          isOnline: false,
        },
        {
          id: 2,
          name: 'Projet Alpha',
          lastMessage: 'Soyez le premier à écrire',
          lastMessageTime: '',
          unreadCount: 0,
          isGroup: true,
          isOnline: false,
        },
        {
          id: 3,
          name: 'Support Client',
          lastMessage: 'Soyez le premier à écrire',
          lastMessageTime: '',
          unreadCount: 0,
          isGroup: true,
          isOnline: false,
        }
      ];
    }
  }

  // Récupérer tous les groupes depuis la table dédiée
  private static async getAllGroups(): Promise<any[]> {
    try {
      console.log('🔍 Récupération des groupes depuis la table "group"...');
      
      const { data: groups, error } = await supabase
        .from('group')
        .select('*');
        
      if (error) {
        console.error('❌ Erreur accès table group:', error);
        console.log('🔄 Utilisation de groupes par défaut...');
        
        // Retourner des groupes par défaut si la table n'est pas accessible
        return [
          { id: 1, name: 'Équipe Marketing', description: 'Discussions équipe' },
          { id: 2, name: 'Projet Alpha', description: 'Messages projet' },
          { id: 3, name: 'Support Client', description: 'Aide et support' },
          { id: 4, name: 'Groupe Vide', description: 'Groupe sans messages' }
        ];
      }
      
      console.log(`✅ ${groups?.length || 0} groupes récupérés depuis la table "group"`);
      
      if (groups && groups.length > 0) {
        console.log('📋 Structure du groupe:', Object.keys(groups[0]));
        console.log('📋 Groupes:', groups.map(g => ({ id: g.id, name: g.name })));
      }
      
      return groups || [];
      
    } catch (error) {
      console.error('❌ Erreur récupération groupes:', error);
      return [];
    }
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
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
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }
}
