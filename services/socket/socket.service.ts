import { io, Socket } from 'socket.io-client';
import type { SocketMessage, ConversationUpdate, TypingData, NewWaitingConversation } from './socket.types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

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

    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
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
      this.reconnectAttempts = 0;
      this.connectListeners.forEach(listener => listener());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected, reason:', reason);
      this.disconnectListeners.forEach(listener => listener());

      if (reason === 'io server disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.errorListeners.forEach(listener => listener(error));
      this.attemptReconnect();
    });

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

    this.socket.on('pong', () => {
      console.log('🏓 WebSocket pong received');
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
      this.connect();
    }, delay);
  }

  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  sendMessage(conversationId: string, message: string): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { conversationId, message });
    }
  }

  switchToHuman(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('switch_to_human', { conversationId });
    }
  }

  switchToBot(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('switch_to_bot', { conversationId });
    }
  }

  markAsRead(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_as_read', { conversationId });
    }
  }

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

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new WebSocketService();
export type { SocketMessage, ConversationUpdate, TypingData, NewWaitingConversation } from './socket.types';