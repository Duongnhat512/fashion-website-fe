import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Modal, Input, Button } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { API_CONFIG } from "../config/api.config";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  products?: Product[];
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
}

export default function ChatBot() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setIsOpen(true);
    if (messages.length === 0) {
      // Tin nhắn chào mừng
      setMessages([
        {
          id: Date.now().toString(),
          type: "bot",
          content:
            "Xin chào! Tôi có thể giúp gì cho bạn? 😊\nBạn có thể hỏi tôi về sản phẩm, giá cả, hoặc bất kỳ thắc mắc nào.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_BOT.SEND_MESSAGE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: inputValue }),
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
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.message || "Có lỗi xảy ra");
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

  return (
    <>
      {/* Nút mở chatbot - floating button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <MessageOutlined className="text-2xl group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Modal yêu cầu đăng nhập */}
      <Modal
        open={showLoginPrompt}
        onCancel={() => setShowLoginPrompt(false)}
        footer={null}
        centered
        closable={false}
      >
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageOutlined className="text-3xl text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Vui lòng đăng nhập
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để sử dụng tính năng chat với trợ lý ảo
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowLoginPrompt(false)} className="px-6">
              Đóng
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setShowLoginPrompt(false);
                window.location.href = "/login";
              }}
              className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 border-none"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cửa sổ chat */}
      {isOpen && isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Trợ lý ảo BooBoo</h3>
                <p className="text-xs text-white/80">
                  Luôn sẵn sàng hỗ trợ bạn
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <CloseOutlined />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white text-gray-800 shadow-md"
                  } rounded-2xl px-4 py-3`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>

                  {/* Hiển thị sản phẩm nếu có */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.slice(0, 3).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/products/${product.slug}`, {
                              state: { product },
                            });
                          }}
                          className="block bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex gap-2">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs font-semibold text-purple-600 mt-1">
                                {formatPrice(product.price)}
                              </p>
                              {product.variants &&
                                product.variants.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {product.variants
                                      .slice(0, 3)
                                      .map((variant, idx) => (
                                        <div
                                          key={idx}
                                          className="w-4 h-4 rounded-full border border-gray-300"
                                          style={{
                                            backgroundColor: variant.color.hex,
                                          }}
                                          title={`${variant.color.name} - ${variant.size}`}
                                        />
                                      ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {message.products.length > 3 && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          và {message.products.length - 3} sản phẩm khác...
                        </p>
                      )}
                    </div>
                  )}

                  <p
                    className={`text-xs mt-2 ${
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

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-md rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                autoSize={{ minRows: 1, maxRows: 3 }}
                disabled={isLoading}
                className="flex-1 resize-none"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={isLoading}
                disabled={!inputValue.trim() || isLoading}
                className="h-auto bg-gradient-to-r from-purple-600 to-blue-600 border-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
