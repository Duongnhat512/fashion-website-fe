import React from "react";
import {
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Dropdown, Button, Space } from "antd";
import type { MenuProps } from "antd";

interface AccountDropdownProps {
  onLoginClick: () => void;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ onLoginClick }) => {
  const items: MenuProps["items"] = [
    {
      key: "login",
      label: (
        <span className="group flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 transition-all duration-300 hover:brightness-125">
          <LoginOutlined className="mr-2 text-white transition-colors duration-300 group-hover:text-white" />
          <span className="text-white transition-colors duration-300 group-hover:text-white">
            Đăng nhập
          </span>
        </span>
      ),
      onClick: onLoginClick,
    },
    {
      key: "register",
      label: (
        <a
          href="/register"
          className="group flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 transition-all duration-300 hover:brightness-125"
        >
          <UserAddOutlined className="mr-2 text-white transition-colors duration-300 group-hover:text-white" />
          <span className="text-white transition-colors duration-300 group-hover:text-white">
            Đăng ký
          </span>
        </a>
      ),
    },
  ];

  return (
    <Space>
      <Dropdown
        menu={{ items }}
        placement="bottomRight"
        trigger={["click"]}
        overlayClassName="!rounded-lg shadow-xl !bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 !text-white"
      >
        <Button
          type="text"
          className="relative group flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
          icon={
            <UserOutlined className="h-5 w-5 text-white/70 group-hover:text-white transition-colors duration-300" />
          }
        >
          <span className="text-base">Tài khoản</span>
        </Button>
      </Dropdown>
    </Space>
  );
};

export default AccountDropdown;
