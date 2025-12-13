import React, { createContext, useContext, useEffect } from "react";
import { message } from "antd";

type NotifyOptions = {
  duration?: number;
  key?: string;
  onClose?: () => void;
};

type NotificationApi = {
  success: (content: React.ReactNode, opts?: NotifyOptions) => void;
  error: (content: React.ReactNode, opts?: NotifyOptions) => void;
  info: (content: React.ReactNode, opts?: NotifyOptions) => void;
  warning: (content: React.ReactNode, opts?: NotifyOptions) => void;
  open: (args: Parameters<typeof message.open>[0]) => void;
};

const NotificationContext = createContext<NotificationApi | null>(null);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  config?: { top?: number; duration?: number; maxCount?: number };
}> = ({ children, config }) => {
  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    message.config({
      top: config?.top ?? 80,
      duration: config?.duration ?? 3,
      maxCount: config?.maxCount ?? 3,
    });
  }, [config]);

  const apiWrapper: NotificationApi = {
    success: (content, opts) =>
      api.open({
        type: "success",
        content,
        duration: opts?.duration,
        key: opts?.key,
        onClose: opts?.onClose,
      }),
    error: (content, opts) =>
      api.open({
        type: "error",
        content,
        duration: opts?.duration,
        key: opts?.key,
        onClose: opts?.onClose,
      }),
    info: (content, opts) =>
      api.open({
        type: "info",
        content,
        duration: opts?.duration,
        key: opts?.key,
        onClose: opts?.onClose,
      }),
    warning: (content, opts) =>
      api.open({
        type: "warning",
        content,
        duration: opts?.duration,
        key: opts?.key,
        onClose: opts?.onClose,
      }),
    open: (args) => api.open(args),
  };

  return (
    <NotificationContext.Provider value={apiWrapper}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationApi => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};
