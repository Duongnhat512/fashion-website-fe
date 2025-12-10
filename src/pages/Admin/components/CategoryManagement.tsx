import React, { useEffect, useState } from "react";
import { categoryService } from "../../../services/categoryService";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  Popconfirm,
  Tag,
  AutoComplete,
  Pagination,
  Select,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNotification } from "../../../components/NotificationProvider";

// Hàm chuyển đổi tiếng Việt có dấu sang slug
const slugify = (str: string): string => {
  const from =
    "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ";
  const to =
    "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";

  let slug = str.toLowerCase().trim();

  for (let i = 0; i < from.length; i++) {
    slug = slug.replace(new RegExp(from[i], "g"), to[i]);
  }

  slug = slug
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug;
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: Category[];
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const notify = useNotification();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRootCategory, setSelectedRootCategory] = useState<
    string | null
  >(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [parentName, setParentName] = useState<string>("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const allResponse = await categoryService.getAll();
      console.log("Raw API response:", allResponse);

      if (allResponse.data) {
        console.log("Categories data:", allResponse.data);
        // Sort by updatedAt or createdAt descending (newest first)
        const sortedData = [...allResponse.data].sort((a: any, b: any) => {
          const dateA =
            a.updatedAt || a.updated_at || a.createdAt || a.created_at;
          const dateB =
            b.updatedAt || b.updated_at || b.createdAt || b.created_at;
          if (!dateA || !dateB) return 0;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        console.log("Sorted data:", sortedData);
        setCategories(sortedData);
        setAllCategories(sortedData);
      } else {
        console.log("No data in response");
      }
    } catch (error) {
      notify.error("Không thể tải danh mục");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      notify.error("Vui lòng nhập tên danh mục");
      return;
    }

    setLoading(true);
    try {
      await categoryService.create({
        name: name.trim(),
        slug: slug || slugify(name),
        description: description.trim() || undefined,
        iconUrl:
          iconUrl.trim() ||
          "https://png.pngtree.com/png-clipart/20250516/original/pngtree-vest-icon-with-line-style--fashion-icon-png-image_4167915.png",
        parent_id: parentId,
      });

      notify.success("Tạo danh mục thành công");
      setCreateModalVisible(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      notify.error("Không thể tạo danh mục");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !name.trim()) {
      notify.error("Vui lòng nhập tên danh mục");
      return;
    }

    setLoading(true);
    try {
      await categoryService.update({
        id: editingCategory.id,
        name: name.trim(),
        slug: slug || slugify(name),
        description: description.trim() || undefined,
        iconUrl:
          iconUrl.trim() ||
          "https://png.pngtree.com/png-clipart/20250516/original/pngtree-vest-icon-with-line-style--fashion-icon-png-image_4167915.png",
        parent_id: parentId,
      });

      notify.success("Cập nhật danh mục thành công");
      setEditModalVisible(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      notify.error("Không thể cập nhật danh mục");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await categoryService.delete(id);
      notify.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      notify.error("Không thể xóa danh mục");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setIconUrl(category.iconUrl || "");

    // Xử lý parent - API trả về object parent
    if (category.parent) {
      setParentId(category.parent.id);
      setParentName(category.parent.name);
    } else {
      setParentId(null);
      setParentName("");
    }

    setEditModalVisible(true);
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setIconUrl("");
    setParentId(null);
    setParentName("");
    setEditingCategory(null);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text: string) => (
        <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
          {text.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Danh mục cha",
      key: "parent",
      render: (_: any, record: any) => {
        if (record.parent) {
          return <Tag color="green">{record.parent.name}</Tag>;
        }
        return <Tag color="default">Danh mục gốc</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 280,
      fixed: "right" as const,
      render: (_: any, record: Category) => (
        <Space size="small" wrap>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
          >
            Sửa
          </Button>
          <Button
            type="link"
            onClick={() => {
              setSelectedCategory(record);
              setDetailModalVisible(true);
            }}
            size="small"
          >
            Chi tiết
          </Button>
          <Popconfirm
            title="Xác nhận xóa danh mục?"
            description="Bạn có chắc chắn muốn xóa danh mục này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get root categories (categories without parent)
  const rootCategories = allCategories.filter((cat: any) => !cat.parent);

  // Filter categories by search term and selected root category
  const normalizedSearch = searchTerm.trim().toLowerCase();
  let filteredCategories = normalizedSearch
    ? categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(normalizedSearch) ||
          cat.slug.toLowerCase().includes(normalizedSearch)
      )
    : categories;

  // Further filter by selected root category
  if (selectedRootCategory) {
    filteredCategories = filteredCategories.filter((cat: any) => {
      // Include the root category itself
      if (cat.id === selectedRootCategory) return true;
      // Include children of the root category
      if (cat.parent && cat.parent.id === selectedRootCategory) return true;
      // Include grandchildren (need to check if parent's parent matches)
      if (cat.parent && cat.parent.id) {
        const parentCategory = allCategories.find(
          (c: any) => c.id === cat.parent.id
        );
        if (
          parentCategory &&
          parentCategory.parent &&
          parentCategory.parent.id === selectedRootCategory
        ) {
          return true;
        }
      }
      return false;
    });
  }

  // Sort filtered categories by updatedAt or createdAt descending
  filteredCategories = [...filteredCategories].sort((a: any, b: any) => {
    const dateA = a.updatedAt || a.updated_at || a.createdAt || a.created_at;
    const dateB = b.updatedAt || b.updated_at || b.createdAt || b.created_at;
    if (!dateA || !dateB) return 0;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <Input.Search
            placeholder="Tìm theo tên hoặc slug"
            allowClear
            onSearch={(val) => {
              setSearchTerm(val || "");
              setCurrentPage(1);
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={fetchCategories} loading={loading}>
            Làm mới
          </Button>
          <Select
            placeholder="Lọc theo danh mục gốc"
            allowClear
            style={{ width: 220 }}
            value={selectedRootCategory}
            onChange={(value) => {
              setSelectedRootCategory(value || null);
              setCurrentPage(1);
            }}
          >
            {rootCategories.map((cat: any) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          size="large"
        >
          Thêm danh mục
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Table
          columns={columns}
          dataSource={paginatedCategories}
          rowKey="id"
          loading={loading}
          childrenColumnName="___children___"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </div>

      {filteredCategories.length > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            total={filteredCategories.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showQuickJumper
            locale={{ jump_to: "Đi đến trang", page: "" }}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} danh mục`
            }
          />
        </div>
      )}

      {/* Modal tạo danh mục */}
      <Modal
        title="Thêm danh mục mới"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalVisible(false);
          resetForm();
        }}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập tên danh mục"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <Input
              placeholder="Slug tự động từ tên"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon URL
            </label>
            <Input
              placeholder="Nhập URL icon (để trống sẽ dùng icon mặc định)"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục cha
            </label>
            <AutoComplete
              placeholder="Gõ để tìm kiếm danh mục cha"
              value={parentName}
              onChange={(value) => setParentName(value)}
              onSelect={(value, option) => {
                setParentId(value);
                setParentName(option.label);
              }}
              onClear={() => {
                setParentId(null);
                setParentName("");
              }}
              size="large"
              style={{ width: "100%" }}
              options={allCategories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              filterOption={(inputValue, option) =>
                option!.label
                  .toLowerCase()
                  .indexOf(inputValue.toLowerCase()) !== -1
              }
              allowClear
            />
            <p className="text-xs text-gray-500 mt-1">
              Bỏ trống nếu đây là danh mục gốc
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal sửa danh mục */}
      <Modal
        title="Chỉnh sửa danh mục"
        open={editModalVisible}
        onOk={handleEdit}
        onCancel={() => {
          setEditModalVisible(false);
          resetForm();
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nhập tên danh mục"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <Input
              placeholder="Slug tự động từ tên"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon URL
            </label>
            <Input
              placeholder="Nhập URL icon (để trống sẽ dùng icon mặc định)"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục cha
            </label>
            <AutoComplete
              placeholder="Gõ để tìm kiếm danh mục cha"
              value={parentName}
              onChange={(value) => setParentName(value)}
              onSelect={(value, option) => {
                setParentId(value);
                setParentName(option.label);
              }}
              onClear={() => {
                setParentId(null);
                setParentName("");
              }}
              size="large"
              style={{ width: "100%" }}
              options={allCategories
                .filter((cat) => cat.id !== editingCategory?.id)
                .map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
              filterOption={(inputValue, option) =>
                option!.label
                  .toLowerCase()
                  .indexOf(inputValue.toLowerCase()) !== -1
              }
              allowClear
            />
            <p className="text-xs text-gray-500 mt-1">
              Bỏ trống nếu đây là danh mục gốc
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết danh mục"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedCategory && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">Thông tin danh mục</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Tên:</strong> {selectedCategory.name}
                </div>
                <div>
                  <strong>Slug:</strong> {selectedCategory.slug}
                </div>
                <div>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag
                    color={
                      selectedCategory.status === "active" ? "green" : "red"
                    }
                  >
                    {selectedCategory.status}
                  </Tag>
                </div>
                {selectedCategory.iconUrl && (
                  <div>
                    <strong>Icon:</strong>
                    <br />
                    <img
                      src={selectedCategory.iconUrl}
                      alt="icon"
                      className="w-12 h-12 mt-2"
                    />
                  </div>
                )}
              </div>
            </div>

            {selectedCategory.parent && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Danh mục cha</h3>
                <div className="bg-green-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    {selectedCategory.parent.iconUrl && (
                      <img
                        src={selectedCategory.parent.iconUrl}
                        alt="parent icon"
                        className="w-8 h-8"
                      />
                    )}
                    <div>
                      <div className="font-semibold">
                        {selectedCategory.parent.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedCategory.parent.slug}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory.children &&
              selectedCategory.children.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Danh mục con ({selectedCategory.children.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedCategory.children.map((child: any) => (
                      <div
                        key={child.id}
                        className="bg-blue-50 p-3 rounded flex items-center gap-2"
                      >
                        {child.iconUrl && (
                          <img
                            src={child.iconUrl}
                            alt="child icon"
                            className="w-8 h-8"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{child.name}</div>
                          <div className="text-sm text-gray-500">
                            {child.slug}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {!selectedCategory.parent &&
              (!selectedCategory.children ||
                selectedCategory.children.length === 0) && (
                <div className="text-center text-gray-500 py-4">
                  Danh mục này không có danh mục cha hoặc con
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryManagement;
