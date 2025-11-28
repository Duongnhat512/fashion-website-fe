import { useState, useEffect, useRef } from "react";
import { Card, List, Button, Avatar, Tabs, Input, message } from "antd";
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  conversationService,
  type Conversation,
  type ChatMessage,
} from "../../../services/conversationService";
import {
  webSocketService,
  type SocketMessage,
  type ConversationUpdate,
  type NewWaitingConversation,
} from "../../../services/webSocketService";
import { useAuth } from "../../../contexts/AuthContext";

const { TextArea } = Input;

const getInitials = (fullname: string) => {
  return fullname
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

export default function ChatManagement() {
  const { user } = useAuth();
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [savedScroll, setSavedScroll] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const allConversationsListRef = useRef<HTMLDivElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadAllConversations();

    // WebSocket connection for admin
    webSocketService.connect();

    const unsubscribeConnect = webSocketService.onConnect(() => {
      setIsConnected(true);
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      setIsConnected(false);
    });

    const unsubscribeNewWaiting = webSocketService.onNewWaitingConversation(
      (data: NewWaitingConversation) => {
        message.info(`Có conversation mới đang chờ: ${data.conversationId}`);
        loadAllConversations();
      }
    );

    const unsubscribeMessage = webSocketService.onMessage(
      (socketMessage: SocketMessage) => {
        // Reload conversation list to update latest messages
        loadAllConversations();

        if (
          selectedConversation &&
          socketMessage.conversationId === selectedConversation.id
        ) {
          const newMessage: ChatMessage = {
            id: socketMessage.id,
            conversationId: socketMessage.conversationId,
            senderId: socketMessage.senderId,
            messageType: "text",
            content: socketMessage.content,
            isFromBot: socketMessage.isFromBot,
            isRead: false,
            metadata: socketMessage.metadata,
            createdAt: socketMessage.createdAt,
            updatedAt: socketMessage.createdAt,
          };
          setMessages((prev) => [...prev, newMessage]);

          // Only scroll to bottom for incoming messages (from user/bot), not when admin sends
          if (socketMessage.senderId !== user?.id) {
            setShouldScrollToBottom(true);
          }
        }
      }
    );

    const unsubscribeConversationUpdate = webSocketService.onConversationUpdate(
      (update: ConversationUpdate) => {
        // Refresh data when conversation status changes
        loadAllConversations();

        if (
          selectedConversation &&
          selectedConversation.id === update.conversationId
        ) {
          setSelectedConversation((prev) =>
            prev ? { ...prev, ...update } : null
          );
        }
      }
    );

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeNewWaiting();
      unsubscribeMessage();
      unsubscribeConversationUpdate();
      webSocketService.disconnect();
    };
  }, [selectedConversation]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  // Restore scroll position after selecting conversation
  useEffect(() => {
    if (savedScroll && allConversationsListRef.current) {
      allConversationsListRef.current.scrollTop = savedScroll;
      setSavedScroll(0);
    }
  }, [messages, savedScroll]);

  const loadAllConversations = async () => {
    try {
      const conversations =
        await conversationService.getAllConversationsWithStats();
      setAllConversations(conversations);
    } catch (error) {
      message.error("Không thể tải tất cả conversations");
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    // Save current scroll position
    const currentScroll = allConversationsListRef.current?.scrollTop || 0;
    setSavedScroll(currentScroll);

    setSelectedConversation(conversation);

    try {
      const conversationMessages =
        await conversationService.getConversationMessages(conversation.id);
      setMessages(conversationMessages);

      // Join WebSocket room
      if (isConnected) {
        webSocketService.joinConversation(conversation.id);
      }

      // Mark as read
      await conversationService.markAsRead(conversation.id);

      // Scroll to bottom after loading messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      message.error("Không thể tải tin nhắn");
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation) return;

    setIsLoading(true);
    try {
      if (isConnected) {
        webSocketService.sendMessage(selectedConversation.id, inputValue);
        setInputValue("");
        // Scroll to bottom after sending message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        message.warning("WebSocket chưa kết nối, không thể gửi tin nhắn");
        return;
      }
    } catch (error) {
      message.error("Không thể gửi tin nhắn");
    } finally {
      setIsLoading(false);
    }
  };

  const switchToBot = async (conversationId: string) => {
    try {
      if (isConnected) {
        webSocketService.switchToBot(conversationId);
      } else {
        await conversationService.switchToBot(conversationId);
      }
      message.success("Đã chuyển về chat với bot");
    } catch (error) {
      message.error("Không thể chuyển về bot");
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List - BÊN TRÁI */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
          <Card
            title="Danh sách cuộc trò chuyện"
            className="flex flex-col"
            style={{ height: "calc(100vh - 64px)" }}
            bodyStyle={{
              padding: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex-1 min-h-0">
              <div
                className="h-full max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 hover:scrollbar-thumb-purple-400 p-2"
                ref={allConversationsListRef}
              >
                <List
                  className="overflow-hidden"
                  dataSource={allConversations}
                  renderItem={(conversation) => (
                    <List.Item
                      key={conversation.id}
                      className={`cursor-pointer hover:bg-gray-50 px-2 py-3 ${
                        selectedConversation?.id === conversation.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => selectConversation(conversation)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={conversation.user?.avt}
                            alt={conversation.user?.fullname}
                          >
                            {conversation.user
                              ? getInitials(conversation.user.fullname)
                              : "?"}
                          </Avatar>
                        }
                        title={
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="truncate text-sm">
                              {conversation.user?.fullname || "Unknown User"}
                            </span>
                          </div>
                        }
                        description={
                          <div className="space-y-1">
                            <div
                              className={`text-xs truncate ${
                                conversation.isReplied === false
                                  ? "font-bold text-gray-800"
                                  : "text-gray-500"
                              }`}
                            >
                              {conversation.lastMessage || "Chưa có tin nhắn"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getRelativeTime(conversation.updatedAt)}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Interface - BÊN PHẢI */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card
              title={
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedConversation.user?.avt}
                    alt={selectedConversation.user?.fullname}
                  >
                    {selectedConversation.user
                      ? getInitials(selectedConversation.user.fullname)
                      : "?"}
                  </Avatar>
                  <div className="font-semibold">
                    {selectedConversation.user?.fullname || "Unknown User"}
                  </div>
                </div>
              }
              className="h-[600px] flex flex-col"
              bodyStyle={{
                padding: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Messages Container */}
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Messages */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 hover:scrollbar-thumb-purple-400">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? "bg-blue-500 text-white"
                            : message.isFromBot
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.senderId === user?.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {getRelativeTime(message.createdAt)}
                          {message.senderId === user?.id && (
                            <span className="ml-2">
                              {message.isRead ? (
                                <CheckCircleOutlined />
                              ) : (
                                <ClockCircleOutlined />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input - Fixed at bottom */}
              <div className="flex-shrink-0 p-4 border-t bg-white">
                <div className="flex gap-2">
                  <TextArea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={!isConnected}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    loading={isLoading}
                    disabled={!inputValue.trim() || !isConnected}
                  >
                    Gửi
                  </Button>
                </div>
                {!isConnected && (
                  <div className="text-xs text-red-500 mt-1">
                    WebSocket chưa kết nối, không thể gửi tin nhắn
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageOutlined className="text-4xl mb-4" />
                <div>Chọn một conversation để bắt đầu chat</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
