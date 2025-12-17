export interface SocketMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId?: string;
  isFromBot: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationUpdate {
  conversationId: string;
  conversationType: 'bot' | 'human';
  status: 'active' | 'waiting' | 'resolved' | 'closed';
}

export interface TypingData {
  conversationId: string;
  isTyping: boolean;
}

export interface NewWaitingConversation {
  conversationId: string;
  userId: string;
  createdAt: string;
}