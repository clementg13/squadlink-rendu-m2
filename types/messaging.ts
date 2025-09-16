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
  // ISO de la date d'envoi pour le tri chronologique fiable
  sentAt?: string;
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

// Types pour les réponses Supabase
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}

export interface ConversationInsertData {
  id_group: number;
  id_sender: string;
  content: string;
  send_date?: string;
}

export interface DatabaseGroup {
  id: number;
  name: string;
  created_at: string;
}
