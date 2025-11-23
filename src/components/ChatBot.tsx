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
  const [isInputFocused, setIsInputFocused] = useState(false);
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
            "🌟 Xin chào! Tôi là BooBoo - trợ lý ảo của bạn! 🤖\n\nTôi có thể giúp bạn:\n• Tìm kiếm sản phẩm yêu thích\n• Tư vấn về size và màu sắc\n• Hỗ trợ đặt hàng\n• Giải đáp thắc mắc về sản phẩm\n\nHãy hỏi tôi bất cứ điều gì nhé! 💫",
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
        const variants: any[] = [];
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
                window.location.href = "/login";
              }}
              className="px-8 py-2 h-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 border-none hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Đăng nhập ngay
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cửa sổ chat */}
      {isOpen && isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-emerald-100 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-white p-5 flex items-center justify-between relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <MessageOutlined className="text-2xl" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  Trợ lý BooBoo
                  <span className="text-lg animate-bounce">🤖</span>
                </h3>
                <p className="text-sm text-white/90 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Luôn sẵn sàng hỗ trợ bạn
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 relative z-10 group"
            >
              <CloseOutlined className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-purple-50/30 via-blue-50/20 to-cyan-50/30 min-h-0">
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
                      : "bg-white text-gray-800 shadow-lg border border-purple-100"
                  } rounded-2xl px-5 py-4 relative group`}
                >
                  {/* Message bubble tail */}
                  <div
                    className={`absolute top-4 w-3 h-3 ${
                      message.type === "user"
                        ? "right-0 translate-x-1/2 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500"
                        : "left-0 -translate-x-1/2 bg-white border-l border-t border-purple-100"
                    } transform rotate-45`}
                  ></div>
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
                          {message.products.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/products/${product.slug}`, {
                                  state: { product },
                                });
                              }}
                              className="block bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-3 transition-all duration-300 cursor-pointer border border-purple-200"
                            >
                              <div className="flex gap-3">
                                <div className="relative">
                                  <img
                                    src={product.imageUrl}
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
                                    {formatPrice(product.price)}
                                  </p>
                                  {product.variants &&
                                    product.variants.length > 0 && (
                                      <div className="flex gap-1">
                                        {product.variants
                                          .slice(0, 3)
                                          .map((variant, idx) => (
                                            <div
                                              key={idx}
                                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                              style={{
                                                backgroundColor:
                                                  variant.color.hex,
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
                        </div>
                      );
                    }

                    // Nếu không có API products, parse từ text
                    const parsedProducts = parseProductsFromMessage(
                      message.content
                    );
                    return parsedProducts.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {parsedProducts.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/products/${product.slug}`, {
                                state: { product },
                              });
                            }}
                            className="block bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-3 transition-all duration-300 cursor-pointer border border-purple-200"
                          >
                            <div className="flex gap-3">
                              <div className="relative">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/64x64?text=No+Image";
                                  }}
                                />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white">✨</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                                  {product.name}
                                </p>
                                <p className="text-lg font-bold text-purple-600 mb-2">
                                  {formatPrice(product.price)}
                                </p>
                                {product.variants &&
                                  product.variants.length > 0 && (
                                    <div className="flex gap-1">
                                      {product.variants
                                        .slice(0, 3)
                                        .map((variant, idx) => (
                                          <div
                                            key={idx}
                                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                            style={{
                                              backgroundColor:
                                                variant.color.hex,
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
          </div>

          <div
            className={`h-px mx-5 transition-all duration-300 ${
              isInputFocused
                ? "bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300"
                : "bg-gradient-to-r from-transparent via-purple-200 to-transparent"
            }`}
          ></div>

          <div
            className={`p-5 border-t transition-all duration-300 rounded-b-3xl ${
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
