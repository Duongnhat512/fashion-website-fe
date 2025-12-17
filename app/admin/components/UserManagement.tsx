"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Pagination, Input, Switch } from "antd";
import { userService } from "../../../services/user/user.service";
import type { User } from "../../../services/user/user.service";
import { useNotification } from "../../../components/common/NotificationProvider";

const UserManagement: React.FC = () => {
  const notify = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const data = await userService.getAllUsers();
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUsers(sortedData);
    } catch (error) {
      notify.error("Không thể tải danh sách người dùng");
      console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      await userService.toggleUserStatus(userId, !currentStatus);
      notify.success(
        `Đã ${!currentStatus ? "kích hoạt" : "vô hiệu hóa"} người dùng!`
      );
      fetchUsers();
    } catch (error) {
      notify.error("Không thể cập nhật trạng thái");
      console.error(error);
    }
  };

  const userColumns = [
    {
      title: "Avatar",
      dataIndex: "avt",
      key: "avt",
      render: (avt: string | null, record: User) => (
        <img
          src={
            avt ||
            `https://api.dicebear.com/8.x/initials/svg?seed=${record.fullname}`
          }
          className="w-10 h-10 rounded-full object-cover border"
          alt={record.fullname}
        />
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
      render: (name: string) => <span className="font-semibold">{name}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (dob: string) =>
        dob ? new Date(dob).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) => (
        <Tag color={gender === "male" ? "blue" : "pink"}>
          {gender === "male" ? "Nam" : "Nữ"}
        </Tag>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "green"}>
          {role === "admin" ? "Admin" : "User"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record: User) => (
        <Switch
          checked={status}
          onChange={() => handleToggleUserStatus(record.id, status)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a: User, b: User) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
    },
  ];

  const userStartIndex = (userCurrentPage - 1) * userPageSize;
  const userEndIndex = userStartIndex + userPageSize;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredUsers = normalizedSearch
    ? users.filter((user) =>
        user.email.toLowerCase().includes(normalizedSearch)
      )
    : users;

  const paginatedUsers = filteredUsers.slice(userStartIndex, userEndIndex);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <Input.Search
            placeholder="Tìm theo email"
            allowClear
            onSearch={(val) => {
              setSearchTerm(val || "");
              setUserCurrentPage(1);
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setUserCurrentPage(1);
            }}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={fetchUsers} loading={userLoading}>
            Làm mới
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Table
          columns={userColumns}
          dataSource={paginatedUsers}
          loading={userLoading}
          rowKey="id"
          pagination={false}
        />
      </div>

      {filteredUsers.length > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={userCurrentPage}
            total={filteredUsers.length}
            pageSize={userPageSize}
            onChange={(page) => setUserCurrentPage(page)}
            showSizeChanger={false}
            showQuickJumper
            locale={{ jump_to: "Đi đến trang", page: "" }}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`
            }
          />
        </div>
      )}

      {/* Modal cập nhật người dùng */}
      {/* <Modal
        title={
          <div className="text-lg font-bold">Cập nhật thông tin người dùng</div>
        }
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
          className="mt-4"
        >
          <Form.Item
            label="Họ tên"
            name="fullname"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input size="large" disabled />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Ngày sinh" name="dob">
            <DatePicker
              size="large"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select size="large">
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select size="large">
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setUserModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal> */}
    </div>
  );
};

export default UserManagement;
