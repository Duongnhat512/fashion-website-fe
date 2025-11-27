import { API_CONFIG } from '../config/api.config';

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

class ConversationService {
  private getAuthHeaders(includeContentType: boolean = true) {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  async getActiveConversation(): Promise<Conversation | null> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_ACTIVE}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(false),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting active conversation:', error);
      return null;
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_ALL}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(false),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_BY_ID.replace(':id', id)}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(false),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting conversation by ID:', error);
      return null;
    }
  }

  async getConversationMessages(id: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_MESSAGES.replace(':id', id)}?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(false),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  async switchToHuman(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.SWITCH_TO_HUMAN.replace(':id', id)}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(false),
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error switching to human:', error);
      return false;
    }
  }

  async switchToBot(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.SWITCH_TO_BOT.replace(':id', id)}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(false),
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error switching to bot:', error);
      return false;
    }
  }

  async assignAgent(conversationId: string, agentId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.ASSIGN_AGENT.replace(':id', conversationId)}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ agentId }),
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error assigning agent:', error);
      return false;
    }
  }

  async getWaitingConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_WAITING}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(false),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting waiting conversations:', error);
      return [];
    }
  }

  async markAsRead(conversationId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.MARK_AS_READ.replace(':id', conversationId)}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error marking as read:', error);
      return false;
    }
  }

  async getConversationStats(conversationId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_STATS.replace(':id', conversationId)}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return null;
    }
  }

  async getAllConversationsWithStats(): Promise<Conversation[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_ALL_ADMIN}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting all conversations with stats:', error);
      return [];
    }
  }

  async getAgentConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONVERSATIONS.GET_AGENT_CONVERSATIONS}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting agent conversations:', error);
      return [];
    }
  }
}

export const conversationService = new ConversationService();