// Types pour les messages et conversations
export interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
  isGroup: boolean;
}

export interface Message {
  id: number;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface DatabaseMessage {
  id: number;
  id_group: number;
  id_sender: string;
  content: string;
  send_date: string;
  is_read: boolean;
}

// Re-export des services principaux
export { ImprovedMessageService } from '../services/improvedMessagesService';
export { ConversationService } from '../services/conversationService';
