import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Modal, Input, Button } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  MessageOutlined,
  UserOutlined,
  RobotOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { API_CONFIG } from "../config/api.config";
import {
  conversationService,
  type Conversation,
} from "../services/conversationService";
import {
  webSocketService,
  type SocketMessage,
  type ConversationUpdate,
  type TypingData,
} from "../services/webSocketService";
import LoginDialog from "./LoginDialog";

interface Message {
  id: string;
  type: "user" | "bot" | "agent";
  content: string;
  timestamp: Date;
  products?: Product[];
  isRead?: boolean;
  senderId?: string;
  metadata?: Record<string, unknown>;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
  price: number;
  variants?: Variant[];
}

interface Variant {
  id: string;
  color: {
    name: string;
    hex: string;
    imageUrl?: string;
  };
  size: string;
  price: number;
  availableQuantity: number;
  imageUrl?: string;
}

export default function ChatBot() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<{
    [productId: string]: number;
  }>({});

  // New state for realtime chat
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async (
    conversationId: string,
    limit: number = 9999
  ) => {
    try {
      const messages = await conversationService.getConversationMessages(
        conversationId,
        limit
      );

      const formattedMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        type: msg.isFromBot
          ? "bot"
          : msg.senderId === user?.id
          ? "user"
          : "agent",
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        isRead: msg.isRead,
        senderId: msg.senderId,
        metadata: msg.metadata,
        products: (msg.metadata?.products as Product[]) || [],
      }));

      if (formattedMessages.length === 0) {
        setMessages([]);
      } else {
        // Replace all messages instead of merging to avoid duplicates
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
      // Don't set messages to empty on error to preserve existing messages
    }
  };

  const loadActiveConversation = async () => {
    try {
      setIsLoadingConversation(true);
      // Get all user conversations
      const userConversations = await conversationService.getConversations();

      if (userConversations && userConversations.length > 0) {
        // Find the most recent active conversation, or fallback to the first one
        const activeConversation =
          userConversations.find((conv) => conv.status === "active") ||
          userConversations[0];

        setCurrentConversation(activeConversation);

        // Load conversation messages using the dedicated function
        await loadChatHistory(activeConversation.id);

        // Join WebSocket room AFTER loading history
        if (isConnected) {
          webSocketService.joinConversation(activeConversation.id);
        }
      } else {
        console.log("📝 No existing conversations found");
      }
    } catch (error) {
      console.error("❌ Error loading active conversation:", error);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const refreshConversation = async () => {
    if (!currentConversation) return;

    try {
      const updatedConversation = await conversationService.getConversationById(
        currentConversation.id
      );
      if (updatedConversation) {
        setCurrentConversation(updatedConversation);
      }
    } catch (error) {
      console.error("Error refreshing conversation:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection management - FIX TIMING ISSUES
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      webSocketService.connect();

      const unsubscribeConnect = webSocketService.onConnect(() => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        // Load conversation after WebSocket connects
        if (!currentConversation) {
          loadActiveConversation();
        }
      });

      const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
        console.log("❌ WebSocket disconnected");
        setIsConnected(false);
      });

      const unsubscribeMessage = webSocketService.onMessage(
        (socketMessage: SocketMessage) => {
          // Skip bot messages if conversation is in human mode
          if (
            currentConversation?.conversationType === "human" &&
            socketMessage.isFromBot
          ) {
            setIsTyping(false);
            return;
          }

          const newMessage: Message = {
            id: socketMessage.id,
            type: socketMessage.isFromBot
              ? "bot"
              : socketMessage.senderId === user?.id
              ? "user"
              : "agent",
            content: socketMessage.content,
            timestamp: new Date(socketMessage.createdAt),
            isRead: false,
            senderId: socketMessage.senderId,
            metadata: socketMessage.metadata,
            products: (socketMessage.metadata?.products as Product[]) || [],
          };
          setMessages((prev) => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(
              (msg) => msg.id === socketMessage.id
            );
            if (messageExists) {
              return prev;
            }
            return [...prev, newMessage];
          });
          setIsTyping(false);
        }
      );

      const unsubscribeConversationUpdate =
        webSocketService.onConversationUpdate((update: ConversationUpdate) => {
          setCurrentConversation((prev) =>
            prev ? { ...prev, ...update } : null
          );
          if (
            update.conversationType === "human" &&
            update.status === "waiting"
          ) {
            // Show waiting message
            const systemMessage: Message = {
              id: `system-${Date.now()}`,
              type: "bot",
              content:
                "Khách hàng thân mến, nhân viên sẽ trả lời nhanh nhất có thể.",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, systemMessage]);
          }
        });

      const unsubscribeTyping = webSocketService.onTyping(
        (data: TypingData) => {
          setIsTyping(data.isTyping);
        }
      );

      return () => {
        unsubscribeConnect();
        unsubscribeDisconnect();
        unsubscribeMessage();
        unsubscribeConversationUpdate();
        unsubscribeTyping();
        webSocketService.disconnect();
        setIsConnected(false);
      };
    } else {
      webSocketService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, isOpen, user?.id]); // Removed currentConversation from deps

  // Load conversation when opening chat - FIX TIMING
  useEffect(() => {
    if (isAuthenticated && isOpen && isConnected && !currentConversation) {
      loadActiveConversation();
    }
  }, [isAuthenticated, isOpen, isConnected, currentConversation]); // Added isConnected dependency

  // Periodic refresh of conversation status when waiting for agent
  useEffect(() => {
    if (
      currentConversation?.conversationType === "human" &&
      currentConversation?.status === "waiting"
    ) {
      const interval = setInterval(() => {
        refreshConversation();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentConversation]);

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setIsOpen(true);
    // Don't set welcome message here - it will be loaded from conversation history
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Create conversation if none exists
      let conversation = currentConversation;
      if (!conversation) {
        conversation = await conversationService.getActiveConversation();
        if (conversation) {
          setCurrentConversation(conversation);
          // Load conversation messages
          await loadChatHistory(conversation.id);
          // Join WebSocket room
          if (isConnected) {
            webSocketService.joinConversation(conversation.id);
          }
        }
      }

      if (!conversation) {
        console.error("Failed to create or get conversation");
        return;
      }

      // **LUÔN ƯU TIÊN GỬI QUA WEBSOCKET** nếu có kết nối
      if (isConnected && conversation) {
        // **KHÔNG THÊM MESSAGE LOCALLY** - để WebSocket listener xử lý
        webSocketService.sendMessage(conversation.id, messageContent);
      } else if (conversation.conversationType === "human") {
        // **TRONG HUMAN MODE, KHÔNG BAO GIỜ GỌI BOT API** - chỉ hiển thị thông báo chờ
        const waitingMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content:
            "Khách hàng thân mến, nhân viên sẽ trả lời nhanh nhất có thể.",
          timestamp: new Date(),
          isRead: false,
        };
        setMessages((prev) => [...prev, waitingMessage]);
      } else {
        // **CHỈ GỌI BOT API KHI ĐANG Ở BOT MODE**

        // Thêm user message locally khi dùng HTTP API
        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          type: "user",
          content: messageContent,
          timestamp: new Date(),
          isRead: true,
          senderId: user?.id,
        };
        setMessages((prev) => [...prev, userMessage]);

        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_BOT.SEND_MESSAGE}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              message: messageContent,
              conversationId: conversation.id,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: data.data.message,
            timestamp: new Date(),
            products: data.data.products || [],
            isRead: false,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error(data.message || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "Xin lỗi, tôi gặp sự cố khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToHuman = async () => {
    if (!currentConversation) return;

    try {
      // **CẬP NHẬT STATE NGAY LẬP TỨC** để tránh race condition
      setCurrentConversation((prev) =>
        prev
          ? {
              ...prev,
              conversationType: "human",
              status: "waiting",
              agentId: undefined,
            }
          : null
      );

      if (isConnected) {
        webSocketService.switchToHuman(currentConversation.id);
      } else {
        await conversationService.switchToHuman(currentConversation.id);
      }
    } catch (error) {
      console.error("Error switching to human:", error);
    }
  };

  const handleSwitchToBot = async () => {
    if (!currentConversation) return;

    try {
      if (isConnected) {
        webSocketService.switchToBot(currentConversation.id);
      } else {
        await conversationService.switchToBot(currentConversation.id);
      }
    } catch (error) {
      console.error("Error switching to bot:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const parseProductsFromMessage = (message: string) => {
    const products: any[] = [];
    const lines = message.split("\n");

    for (const line of lines) {
      // Match pattern: * Product Name (Ảnh: imageUrl), giá price, có màu color (size), color (size)
      const productMatch = line.match(
        /^\*\s+(.+?)\s+\(Ảnh:\s*(.+?)\),\s+giá\s+(.+?),\s+có màu\s+(.+)$/
      );

      if (productMatch) {
        const [, name, imageUrl, priceRange, variantsText] = productMatch;

        // Parse price range
        const priceMatch = priceRange.match(
          /(\d+(?:\.\d+)?)đ(?:\s*-\s*(\d+(?:\.\d+)?)đ)?/
        );
        const price = priceMatch
          ? parseFloat(priceMatch[1].replace(".", ""))
          : 0;

        // Parse variants
        const variants: Variant[] = [];
        const variantMatches = variantsText.matchAll(/([^\(]+)\s*\(([^)]+)\)/g);

        for (const match of variantMatches) {
          const colorName = match[1].trim();
          const size = match[2].trim();

          // Map common colors to hex codes
          const colorMap: { [key: string]: string } = {
            Trắng: "#FFFFFF",
            Đen: "#000000",
            "Xanh đậm": "#1e40af",
            "Xanh nhạt": "#93c5fd",
            "Xanh ghi": "#64748b",
            "Ghi Sáng": "#cbd5e1",
            "Tím than": "#581c87",
            Đỏ: "#dc2626",
            Vàng: "#eab308",
            "Xanh lá": "#16a34a",
            Hồng: "#ec4899",
            Cam: "#ea580c",
          };

          variants.push({
            id: `variant-${Date.now()}-${variants.length}`,
            color: {
              name: colorName,
              hex: colorMap[colorName] || "#6b7280",
            },
            size: size,
            price: price,
            availableQuantity: 10,
          });
        }

        products.push({
          id: `parsed-${Date.now()}-${products.length}`,
          name: name,
          imageUrl: imageUrl,
          slug: name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, ""),
          price: price,
          variants: variants,
        });
      }
    }

    return products;
  };

  return (
    <>
      {/* Nút mở chatbot - floating button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleOpenChat}
            className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-110 flex items-center justify-center group overflow-hidden animate-bounce-gentle"
          >
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full animate-pulse opacity-75"></div>

            {/* Icon with wave animation */}
            <div className="relative z-10 animate-wave">
              <MessageOutlined className="text-2xl" />
            </div>

            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-bounce border-2 border-white"></div>

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
          </button>

          {/* Floating text */}
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat với BooBoo! 💬
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(10deg);
          }
          75% {
            transform: rotate(-10deg);
          }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }

        /* Custom scrollbar styles */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-purple-300::-webkit-scrollbar-thumb {
          background-color: rgb(196 181 253);
          border-radius: 3px;
        }
        .scrollbar-thumb-purple-300::-webkit-scrollbar-thumb:hover {
          background-color: rgb(167 139 250);
        }
        .scrollbar-track-purple-100::-webkit-scrollbar-track {
          background-color: rgb(245 243 255);
          border-radius: 3px;
        }
        .hover\\:scrollbar-thumb-purple-400::-webkit-scrollbar-thumb:hover {
          background-color: rgb(147 51 234);
        }
      `}</style>

      {/* Modal yêu cầu đăng nhập */}
      <Modal
        open={showLoginPrompt}
        onCancel={() => setShowLoginPrompt(false)}
        footer={null}
        centered
        closable={false}
        className="chatbot-modal"
        styles={{
          body: { padding: 0 },
          mask: { backdropFilter: "blur(4px)" },
        }}
      >
        <div className="text-center py-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-6 relative">
            <MessageOutlined className="text-4xl text-purple-600" />
            <div className="absolute inset-0 rounded-full border-2 border-purple-200 animate-spin opacity-20"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Vui lòng đăng nhập
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Bạn cần đăng nhập để trò chuyện với trợ lý ảo BooBoo của chúng tôi!
            ✨
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setShowLoginPrompt(false)}
              className="px-8 py-2 h-auto text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 transition-all duration-300"
            >
              Để sau
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setShowLoginPrompt(false);
                setShowLoginDialog(true);
              }}
              className="px-8 py-2 h-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 border-none hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </Modal>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />

      {/* Cửa sổ chat */}
      {isOpen && isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-emerald-100 animate-in slide-in-from-bottom-4 duration-500 max-h-[80vh]">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-white p-5 flex items-center justify-between relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                {currentConversation?.conversationType === "human" ? (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <UserOutlined className="text-2xl" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <RobotOutlined className="text-2xl" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  {currentConversation?.conversationType === "human"
                    ? "Hỗ trợ viên"
                    : "Trợ lý BooBoo"}
                  <span className="text-lg animate-bounce">
                    {currentConversation?.conversationType === "human"
                      ? "👨‍💼"
                      : "🤖"}
                  </span>
                </h3>
                <div className="text-sm text-white/90 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-green-400"></div>
                  {currentConversation?.status === "active" ? (
                    <span className="flex items-center gap-1">
                      <CheckCircleOutlined /> Đang trò chuyện
                    </span>
                  ) : (
                    "Luôn sẵn sàng hỗ trợ bạn"
                  )}
                </div>
                {currentConversation?.agentId && (
                  <div className="text-xs text-white/80 mt-1">
                    Nhân viên đang hỗ trợ
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
              >
                <CloseOutlined className="text-sm group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
          {/* Chat mode indicator */}
          <div className="flex-shrink-0 bg-gradient-to-r from-purple-100 to-blue-100 border-b border-purple-200 px-5 py-2 flex items-center justify-between">
            <span className="text-sm text-purple-800 font-medium">
              {currentConversation?.conversationType === "human"
                ? "Đang trò chuyện với Nhân viên"
                : "Đang trò chuyện với Bot"}
            </span>
            <Button
              size="small"
              onClick={
                currentConversation?.conversationType === "human"
                  ? handleSwitchToBot
                  : handleSwitchToHuman
              }
              className="bg-gradient-to-r from-purple-500 to-blue-500 border-none text-white hover:from-purple-600 hover:to-blue-600 text-xs"
              icon={
                currentConversation?.conversationType === "human" ? (
                  <RobotOutlined />
                ) : (
                  <UserOutlined />
                )
              }
            >
              {currentConversation?.conversationType === "human"
                ? "Chuyển sang Bot"
                : "Chuyển sang Nhân viên"}
            </Button>
          </div>
          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-gradient-to-b from-purple-50/30 via-blue-50/20 to-cyan-50/30 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 hover:scrollbar-thumb-purple-400">
            <div className="space-y-4">
              {isLoadingConversation && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-3 text-purple-600">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm">Đang tải tin nhắn...</span>
                  </div>
                </div>
              )}

              {messages.length === 0 && !isLoadingConversation && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white text-gray-800 shadow-lg rounded-2xl px-5 py-4 border border-purple-100">
                    {/* Sender indicator for bot welcome message */}
                    <div className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                      <RobotOutlined /> Trợ lý BOOBOO
                    </div>
                    <div className="text-sm">
                      {currentConversation?.conversationType === "human"
                        ? "Quý khách vui lòng cho câu hỏi hoặc tư vấn vui lòng gửi tin nhắn nhân viên sẽ trả lời nhanh nhất có thể."
                        : "Xin chào! Tôi là trợ lý BOOBOO của cửa hàng. Tôi có thể giúp gì cho bạn?"}
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
                        : message.type === "agent"
                        ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20"
                        : "bg-white text-gray-800 shadow-lg border border-purple-100"
                    } rounded-2xl px-5 py-4 relative group`}
                  >
                    {/* Message bubble tail */}
                    <div
                      className={`absolute top-4 w-3 h-3 ${
                        message.type === "user"
                          ? "right-0 translate-x-1/2 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500"
                          : message.type === "agent"
                          ? "left-0 -translate-x-1/2 bg-gradient-to-br from-green-500 to-emerald-500"
                          : "left-0 -translate-x-1/2 bg-white border-l border-t border-purple-100"
                      } transform rotate-45`}
                    ></div>
                    {/* Sender indicator for agent messages */}
                    {message.type === "agent" && (
                      <div className="text-xs text-green-100 mb-1 flex items-center gap-1">
                        <UserOutlined /> Nhân viên hỗ trợ
                      </div>
                    )}
                    {/* Sender indicator for bot messages */}
                    {message.type === "bot" && (
                      <div className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                        <RobotOutlined /> Trợ lý BOOBOO
                      </div>
                    )}
                    {/* Sender indicator for user messages */}
                    {message.type === "user" && (
                      <div className="text-xs text-purple-100 mb-1 flex items-center gap-1">
                        <UserOutlined /> Bạn
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {/* Loại bỏ link ảnh khỏi text hiển thị */}
                      {message.content.replace(
                        /\s*\(Ảnh:\s*https?:\/\/[^\)]+\)/g,
                        ""
                      )}
                    </div>
                    {/* Hiển thị sản phẩm - ưu tiên API object, nếu không có thì parse từ text */}
                    {(() => {
                      // Nếu có products từ API, hiển thị từ API
                      if (message.products && message.products.length > 0) {
                        return (
                          <div className="mt-4 space-y-3">
                            {message.products.map((product) => {
                              const selectedVariantIndex =
                                selectedVariants[product.id] ?? 0;
                              const selectedVariant =
                                product.variants?.[selectedVariantIndex];
                              const displayImage =
                                selectedVariant?.imageUrl || product.imageUrl;
                              const displayPrice =
                                selectedVariant?.price || product.price;

                              return (
                                <div
                                  key={product.id}
                                  className="block bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-3 transition-all duration-300 cursor-pointer border border-purple-200"
                                >
                                  <div className="flex gap-3">
                                    <div className="relative">
                                      <img
                                        src={displayImage}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                        onError={(e) => {
                                          // Fallback if image fails to load
                                          (e.target as HTMLImageElement).src =
                                            "https://via.placeholder.com/64x64?text=No+Image";
                                        }}
                                      />
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white">
                                          ✨
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                                        {product.name}
                                      </p>
                                      <p className="text-lg font-bold text-purple-600 mb-2">
                                        {formatPrice(displayPrice)}
                                      </p>
                                      {product.variants &&
                                        product.variants.length > 0 && (
                                          <div className="flex gap-1 flex-wrap">
                                            {product.variants.map(
                                              (
                                                variant: Variant,
                                                idx: number
                                              ) => (
                                                <div
                                                  key={idx}
                                                  className={`w-6 h-6 rounded-full border-2 shadow-sm cursor-pointer transition-all ${
                                                    selectedVariantIndex === idx
                                                      ? "border-purple-500 ring-2 ring-purple-200"
                                                      : "border-gray-300 hover:border-gray-400"
                                                  }`}
                                                  style={{
                                                    backgroundColor:
                                                      variant.color.hex,
                                                  }}
                                                  title={`${variant.color.name} - ${variant.size}`}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVariants(
                                                      (prev) => ({
                                                        ...prev,
                                                        [product.id]: idx,
                                                      })
                                                    );
                                                  }}
                                                />
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <div className="mt-2 text-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        navigate(`/products/${product.slug}`, {
                                          state: { product },
                                        });
                                      }}
                                      className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600 transition-colors"
                                    >
                                      Xem chi tiết
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      // Nếu không có API products, parse từ text
                      const parsedProducts = parseProductsFromMessage(
                        message.content
                      );
                      return parsedProducts.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {parsedProducts.map((product) => {
                            const selectedVariantIndex =
                              selectedVariants[product.id] ?? 0;
                            const selectedVariant =
                              product.variants?.[selectedVariantIndex];
                            const displayImage =
                              selectedVariant?.imageUrl || product.imageUrl;
                            const displayPrice =
                              selectedVariant?.price || product.price;

                            return (
                              <div
                                key={product.id}
                                className="block bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-3 transition-all duration-300 cursor-pointer border border-purple-200"
                              >
                                <div className="flex gap-3">
                                  <div className="relative">
                                    <img
                                      src={displayImage}
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                      onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLImageElement).src =
                                          "https://via.placeholder.com/64x64?text=No+Image";
                                      }}
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs text-white">
                                        ✨
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                                      {product.name}
                                    </p>
                                    <p className="text-lg font-bold text-purple-600 mb-2">
                                      {formatPrice(displayPrice)}
                                    </p>
                                    {product.variants &&
                                      product.variants.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                          {product.variants.map(
                                            (variant: Variant, idx: number) => (
                                              <div
                                                key={idx}
                                                className={`w-6 h-6 rounded-full border-2 shadow-sm cursor-pointer transition-all ${
                                                  selectedVariantIndex === idx
                                                    ? "border-purple-500 ring-2 ring-purple-200"
                                                    : "border-gray-300 hover:border-gray-400"
                                                }`}
                                                style={{
                                                  backgroundColor:
                                                    variant.color.hex,
                                                }}
                                                title={`${variant.color.name} - ${variant.size}`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedVariants(
                                                    (prev) => ({
                                                      ...prev,
                                                      [product.id]: idx,
                                                    })
                                                  );
                                                }}
                                              />
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                                <div className="mt-2 text-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsOpen(false);
                                      navigate(`/products/${product.slug}`, {
                                        state: { product },
                                      });
                                    }}
                                    className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600 transition-colors"
                                  >
                                    Xem chi tiết
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null;
                    })()}{" "}
                    <p
                      className={`text-xs mt-3 ${
                        message.type === "user"
                          ? "text-white/70"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white text-gray-800 shadow-lg rounded-2xl px-5 py-4 border border-purple-100">
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {currentConversation?.conversationType === "human"
                        ? "Nhân viên đang trả lời..."
                        : "BooBoo đang trả lời..."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white text-gray-800 shadow-lg rounded-2xl px-5 py-4 border border-purple-100">
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      BooBoo đang trả lời...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>{" "}
          <div
            className={`flex-shrink-0 h-px mx-5 transition-all duration-300 ${
              isInputFocused
                ? "bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300"
                : "bg-gradient-to-r from-transparent via-purple-200 to-transparent"
            }`}
          ></div>
          <div
            className={`flex-shrink-0 p-5 border-t transition-all duration-300 rounded-b-3xl ${
              isInputFocused
                ? "bg-white border-purple-300"
                : "bg-gray-50/30 backdrop-blur-sm border-purple-100"
            }`}
          >
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input.TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Nhập tin nhắn của bạn... "
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  disabled={isLoading}
                  className={`resize-none pr-12 border-2 rounded-xl shadow-sm transition-all duration-300 ${
                    isInputFocused
                      ? "border-purple-400 bg-white"
                      : "border-purple-200 focus:border-purple-400 bg-white"
                  }`}
                />
              </div>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={isLoading}
                disabled={!inputValue.trim() || isLoading}
                className={`h-auto px-6 border-none shadow-lg transition-all duration-300 transform rounded-xl ${
                  isInputFocused
                    ? "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600"
                    : "bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
                }`}
                size="large"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
