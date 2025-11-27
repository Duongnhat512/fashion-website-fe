import { useState, useEffect, useRef } from "react";
import {
  Card,
  List,
  Button,
  Avatar,
  Badge,
  Tabs,
  Input,
  message,
  Modal,
  Select,
  Tag,
} from "antd";
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  UserAddOutlined,
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

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface Agent {
  id: string;
  name: string;
  email: string;
}

export default function ChatManagement() {
  const { user } = useAuth();
  const [waitingConversations, setWaitingConversations] = useState<
    Conversation[]
  >([]);
  const [agentConversations, setAgentConversations] = useState<Conversation[]>(
    []
  );
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedConversationForAssign, setSelectedConversationForAssign] =
    useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadWaitingConversations();
    loadAgentConversations();
    loadAllConversations();
    loadAgents();

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
        loadWaitingConversations();
      }
    );

    const unsubscribeMessage = webSocketService.onMessage(
      (socketMessage: SocketMessage) => {
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
        }
      }
    );

    const unsubscribeConversationUpdate = webSocketService.onConversationUpdate(
      (update: ConversationUpdate) => {
        // Refresh data when conversation status changes
        loadWaitingConversations();
        loadAgentConversations();
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadWaitingConversations = async () => {
    try {
      const conversations = await conversationService.getWaitingConversations();
      setWaitingConversations(conversations);
    } catch (error) {
      message.error("Không thể tải conversations đang chờ");
    }
  };

  const loadAgentConversations = async () => {
    try {
      const conversations = await conversationService.getAgentConversations();
      setAgentConversations(conversations);
    } catch (error) {
      message.error("Không thể tải conversations của agent");
    }
  };

  const loadAllConversations = async () => {
    try {
      const conversations =
        await conversationService.getAllConversationsWithStats();
      setAllConversations(conversations);
    } catch (error) {
      message.error("Không thể tải tất cả conversations");
    }
  };

  const loadAgents = async () => {
    // This would typically come from a user service
    // For now, we'll use mock data
    setAgents([
      { id: "agent-1", name: "Nguyễn Văn A", email: "agent1@example.com" },
      { id: "agent-2", name: "Trần Thị B", email: "agent2@example.com" },
      { id: "agent-3", name: "Lê Văn C", email: "agent3@example.com" },
    ]);
  };

  const selectConversation = async (conversation: Conversation) => {
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
      } else {
        // Fallback to API - though admin should always use WebSocket
        message.warning("WebSocket chưa kết nối, không thể gửi tin nhắn");
        return;
      }

      setInputValue("");
    } catch (error) {
      message.error("Không thể gửi tin nhắn");
    } finally {
      setIsLoading(false);
    }
  };

  const assignAgent = async (conversationId: string, agentId: string) => {
    try {
      const success = await conversationService.assignAgent(
        conversationId,
        agentId
      );
      if (success) {
        message.success("Đã assign agent thành công");
        loadWaitingConversations();
        loadAgentConversations();
        loadAllConversations();
        setAssignModalVisible(false);
      } else {
        message.error("Không thể assign agent");
      }
    } catch (error) {
      message.error("Lỗi khi assign agent");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "orange";
      case "active":
        return "green";
      case "resolved":
        return "blue";
      case "closed":
        return "gray";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Đang chờ";
      case "active":
        return "Đang chat";
      case "resolved":
        return "Đã giải quyết";
      case "closed":
        return "Đã đóng";
      default:
        return status;
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Chat</h1>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {isConnected ? "Đã kết nối WebSocket" : "Mất kết nối WebSocket"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card title="Conversations" className="h-[600px]">
            <Tabs defaultActiveKey="waiting" className="h-full">
              <TabPane
                tab={
                  <Badge count={waitingConversations.length} showZero>
                    <span>Đang chờ</span>
                  </Badge>
                }
                key="waiting"
              >
                <div className="h-96 overflow-y-auto">
                  <List
                    dataSource={waitingConversations}
                    renderItem={(conversation) => (
                      <List.Item
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => selectConversation(conversation)}
                        actions={[
                          <Button
                            key="assign"
                            size="small"
                            icon={<UserAddOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConversationForAssign(conversation.id);
                              setAssignModalVisible(true);
                            }}
                          >
                            Assign
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<ClockCircleOutlined />}
                              style={{ backgroundColor: "#faad14" }}
                            />
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <span>
                                Conversation {conversation.id.slice(-8)}
                              </span>
                              <Tag color={getStatusColor(conversation.status)}>
                                {getStatusText(conversation.status)}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div className="text-xs text-gray-500">
                                {conversation.lastMessage || "Chưa có tin nhắn"}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {formatTime(conversation.updatedAt)}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </TabPane>

              <TabPane
                tab={
                  <Badge count={agentConversations.length} showZero>
                    <span>Của tôi</span>
                  </Badge>
                }
                key="my-conversations"
              >
                <div className="h-96 overflow-y-auto">
                  <List
                    dataSource={agentConversations}
                    renderItem={(conversation) => (
                      <List.Item
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                        onClick={() => selectConversation(conversation)}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={
                                conversation.conversationType === "human" ? (
                                  <UserOutlined />
                                ) : (
                                  <MessageOutlined />
                                )
                              }
                              style={{
                                backgroundColor:
                                  conversation.conversationType === "human"
                                    ? "#1890ff"
                                    : "#52c41a",
                              }}
                            />
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <span>
                                Conversation {conversation.id.slice(-8)}
                              </span>
                              <Tag color={getStatusColor(conversation.status)}>
                                {getStatusText(conversation.status)}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div className="text-xs text-gray-500">
                                {conversation.lastMessage || "Chưa có tin nhắn"}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {formatTime(conversation.updatedAt)}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </TabPane>

              <TabPane tab="Tất cả" key="all">
                <div className="h-96 overflow-y-auto">
                  <List
                    dataSource={allConversations}
                    renderItem={(conversation) => (
                      <List.Item
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                        onClick={() => selectConversation(conversation)}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={
                                conversation.conversationType === "human" ? (
                                  <UserOutlined />
                                ) : (
                                  <MessageOutlined />
                                )
                              }
                              style={{
                                backgroundColor:
                                  conversation.conversationType === "human"
                                    ? "#1890ff"
                                    : "#52c41a",
                              }}
                            />
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <span>
                                Conversation {conversation.id.slice(-8)}
                              </span>
                              <Tag color={getStatusColor(conversation.status)}>
                                {getStatusText(conversation.status)}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div className="text-xs text-gray-500">
                                Agent:{" "}
                                {conversation.agentId
                                  ? "Đã assign"
                                  : "Chưa assign"}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {formatTime(conversation.updatedAt)}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      icon={
                        selectedConversation.conversationType === "human" ? (
                          <UserOutlined />
                        ) : (
                          <MessageOutlined />
                        )
                      }
                      style={{
                        backgroundColor:
                          selectedConversation.conversationType === "human"
                            ? "#1890ff"
                            : "#52c41a",
                      }}
                    />
                    <div>
                      <div className="font-semibold">
                        Conversation {selectedConversation.id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Tag
                          color={getStatusColor(selectedConversation.status)}
                        >
                          {getStatusText(selectedConversation.status)}
                        </Tag>
                        <span>•</span>
                        <span>
                          {selectedConversation.conversationType === "human"
                            ? "Chat với nhân viên"
                            : "Chat với bot"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedConversation.conversationType === "human" && (
                      <Button
                        size="small"
                        onClick={() => switchToBot(selectedConversation.id)}
                        icon={<MessageOutlined />}
                      >
                        Chuyển về bot
                      </Button>
                    )}
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        conversationService.markAsRead(selectedConversation.id)
                      }
                    >
                      Đánh dấu đã đọc
                    </Button>
                  </div>
                </div>
              }
              className="h-[600px] flex flex-col"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                        {formatTime(message.createdAt)}
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

              {/* Input */}
              <div className="p-4 border-t">
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

      {/* Assign Agent Modal */}
      <Modal
        title="Assign Agent"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={() => {
          if (selectedConversationForAssign) {
            // For demo, assign to first agent
            assignAgent(selectedConversationForAssign, agents[0].id);
          }
        }}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn Agent:
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn agent"
            defaultValue={agents[0]?.id}
          >
            {agents.map((agent) => (
              <Option key={agent.id} value={agent.id}>
                {agent.name} ({agent.email})
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
