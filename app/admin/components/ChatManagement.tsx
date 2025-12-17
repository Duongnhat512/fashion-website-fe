"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, List, Button, Avatar, Input, message } from "antd";
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import {
  conversationService,
  type Conversation,
  type ChatMessage,
} from "../../../services/conversation/conversation.service";
import {
  socketService,
  type SocketMessage,
  type ConversationUpdate,
  type NewWaitingConversation,
} from "../../../services/socket/socket.service";
import { useAuth } from "../../../hooks/useAuth";

const { TextArea } = Input;

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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ChatManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [savedScroll, setSavedScroll] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<{
    [productId: string]: number;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const allConversationsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketService.connect();

    const unsubscribeConnect = socketService.onConnect(() => {
      console.log("✅ Admin WebSocket connected");
      setIsConnected(true);
      loadAllConversations();

      if (selectedConversation) {
        console.log(
          "🔄 Reconnecting - reloading messages for selected conversation"
        );
        conversationService
          .getConversationMessages(selectedConversation.id)
          .then((messages) => {
            setMessages(messages);
            socketService.joinConversation(selectedConversation.id);
          })
          .catch((error) => {
            console.error("Failed to reload messages on reconnect:", error);
          });
      }
    });

    const unsubscribeDisconnect = socketService.onDisconnect(() => {
      console.log("Admin WebSocket disconnected");
      setIsConnected(false);
    });

    const unsubscribeNewWaiting = socketService.onNewWaitingConversation(
      (data: NewWaitingConversation) => {
        message.info(`Có conversation mới đang chờ: ${data.conversationId}`);
        loadAllConversations();
      }
    );

    const unsubscribeMessage = socketService.onMessage(
      (socketMessage: SocketMessage) => {
        console.log("Admin received WebSocket message:", socketMessage);
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

          if (socketMessage.senderId !== user?.id) {
            setShouldScrollToBottom(true);
          }
        } else {
          console.log(
            "Message for another conversation, not updating messages state"
          );
        }
      }
    );

    const unsubscribeConversationUpdate = socketService.onConversationUpdate(
      (update: ConversationUpdate) => {
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
      socketService.disconnect();
    };
  }, [selectedConversation]);

  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (isConnected) {
        socketService.ping();
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected]);

  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

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
      const sortedConversations = conversations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setAllConversations(sortedConversations);

      if (isConnected) {
        sortedConversations.forEach((conversation) => {
          if (
            conversation.status === "active" ||
            conversation.status === "waiting"
          ) {
            socketService.joinConversation(conversation.id);
            console.log("🔗 Admin joined conversation:", conversation.id);
          }
        });
      }
    } catch (error) {
      message.error("Không thể tải tất cả conversations");
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    const currentScroll = allConversationsListRef.current?.scrollTop || 0;
    setSavedScroll(currentScroll);

    setSelectedConversation(conversation);

    try {
      const conversationMessages =
        await conversationService.getConversationMessages(conversation.id);
      setMessages(conversationMessages);

      if (isConnected) {
        socketService.joinConversation(conversation.id);
      }

      await conversationService.markAsRead(conversation.id);

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
        socketService.sendMessage(selectedConversation.id, inputValue);
        setInputValue("");
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
                        {/* Sender indicator */}
                        {message.senderId === user?.id ? (
                          <div className="text-xs text-blue-100 mb-1 flex items-center gap-1">
                            <UserOutlined /> Admin
                          </div>
                        ) : message.isFromBot ? (
                          <div className="text-xs text-green-100 mb-1 flex items-center gap-1">
                            <RobotOutlined /> Trợ lý BOOBOO
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <UserOutlined />{" "}
                            {selectedConversation.user?.fullname ||
                              "Khách hàng"}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>

                        {/* Hiển thị sản phẩm nếu có */}
                        {(() => {
                          const products =
                            (message.metadata?.products as Product[]) || [];
                          return products.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {products.map((product) => {
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
                                    className="block bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-lg p-2 transition-all duration-300 cursor-pointer border border-purple-200"
                                  >
                                    <div className="flex gap-2">
                                      <div className="relative">
                                        <img
                                          src={displayImage}
                                          alt={product.name}
                                          className="w-12 h-12 object-cover rounded-md shadow-sm"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              "https://via.placeholder.com/48x48?text=No+Image";
                                          }}
                                        />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                                          <span className="text-xs text-white">
                                            ✨
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate mb-1">
                                          {product.name}
                                        </p>
                                        <p className="text-sm font-bold text-purple-600 mb-1">
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
                                                    className={`w-4 h-4 rounded-full border shadow-sm cursor-pointer transition-all ${
                                                      selectedVariantIndex ===
                                                      idx
                                                        ? "border-purple-500 ring-1 ring-purple-200"
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
                                    <div className="mt-1 text-center">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(
                                            `/products/${product.slug}`
                                          );
                                        }}
                                        className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full hover:bg-purple-600 transition-colors"
                                      >
                                        Xem chi tiết
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null;
                        })()}

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
