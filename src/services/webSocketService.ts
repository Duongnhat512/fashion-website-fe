import { io, Socket } from 'socket.io-client';

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

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event listeners
  private messageListeners: ((message: SocketMessage) => void)[] = [];
  private conversationUpdateListeners: ((update: ConversationUpdate) => void)[] = [];
  private typingListeners: ((data: TypingData) => void)[] = [];
  private waitingConversationListeners: ((data: NewWaitingConversation) => void)[] = [];
  private errorListeners: ((error: Error) => void)[] = [];
  private connectListeners: (() => void)[] = [];
  private disconnectListeners: (() => void)[] = [];

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found for WebSocket connection');
      return;
    }

    this.socket = io('/', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectListeners.forEach(listener => listener());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.disconnectListeners.forEach(listener => listener());

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.errorListeners.forEach(listener => listener(error));
      this.attemptReconnect();
    });

    // Message events
    this.socket.on('new_message', (message: SocketMessage) => {
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('conversation_updated', (update: ConversationUpdate) => {
      this.conversationUpdateListeners.forEach(listener => listener(update));
    });

    this.socket.on('typing', (data: TypingData) => {
      this.typingListeners.forEach(listener => listener(data));
    });

    this.socket.on('new_waiting_conversation', (data: NewWaitingConversation) => {
      this.waitingConversationListeners.forEach(listener => listener(data));
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.errorListeners.forEach(listener => listener(error));
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  // Join a conversation room
  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  // Send a message
  sendMessage(conversationId: string, message: string): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { conversationId, message });
    }
  }

  // Switch to human chat
  switchToHuman(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('switch_to_human', { conversationId });
    }
  }

  // Switch to bot chat
  switchToBot(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('switch_to_bot', { conversationId });
    }
  }

  // Mark messages as read
  markAsRead(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_as_read', { conversationId });
    }
  }

  // Event listener management
  onMessage(listener: (message: SocketMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  onConversationUpdate(listener: (update: ConversationUpdate) => void): () => void {
    this.conversationUpdateListeners.push(listener);
    return () => {
      this.conversationUpdateListeners = this.conversationUpdateListeners.filter(l => l !== listener);
    };
  }

  onTyping(listener: (data: TypingData) => void): () => void {
    this.typingListeners.push(listener);
    return () => {
      this.typingListeners = this.typingListeners.filter(l => l !== listener);
    };
  }

  onNewWaitingConversation(listener: (data: NewWaitingConversation) => void): () => void {
    this.waitingConversationListeners.push(listener);
    return () => {
      this.waitingConversationListeners = this.waitingConversationListeners.filter(l => l !== listener);
    };
  }

  onError(listener: (error: Error) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  onConnect(listener: () => void): () => void {
    this.connectListeners.push(listener);
    return () => {
      this.connectListeners = this.connectListeners.filter(l => l !== listener);
    };
  }

  onDisconnect(listener: () => void): () => void {
    this.disconnectListeners.push(listener);
    return () => {
      this.disconnectListeners = this.disconnectListeners.filter(l => l !== listener);
    };
  }

  // Get connection status
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const webSocketService = new WebSocketService();