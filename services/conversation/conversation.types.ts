export interface User {
  id: string;
  fullname: string;
  email: string;
  avt?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId?: string;
  conversationType: 'bot' | 'human';
  status: 'active' | 'waiting' | 'resolved' | 'closed';
  title: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  isReplied?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId?: string;
  messageType: 'text' | 'image' | 'system';
  content: string;
  isFromBot: boolean;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: ChatMessage[];
}