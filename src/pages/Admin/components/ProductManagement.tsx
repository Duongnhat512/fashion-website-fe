import React, { useEffect, useState } from "react";
import { categoryService } from "../../../services/categoryService";
import { colorService } from "../../../services/colorService";
import { authService } from "../../../services/authService";
import { productService } from "../../../services/productService";
import {
  Table,
  Button,
  Pagination,
  Input,
  Modal,
  Select,
  Upload,
  Space,
  Tag,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useNotification } from "../../../components/NotificationProvider";
import type { Product } from "../../../types/product.types";

// Hàm chuyển đổi tiếng Việt có dấu sang slug
const slugify = (str: string): string => {
  // Bảng chuyển đổi ký tự tiếng Việt
  const from =
    "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ";
  const to =
    "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";

  let slug = str.toLowerCase().trim();

  // Thay thế ký tự tiếng Việt
  for (let i = 0; i < from.length; i++) {
    slug = slug.replace(new RegExp(from[i], "g"), to[i]);
  }

  // Xóa ký tự đặc biệt, chỉ giữ chữ, số và dấu gạch ngang
  slug = slug
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-") // Xóa dấu gạch ngang thừa
    .replace(/^-+|-+$/g, ""); // Xóa dấu gạch ngang ở đầu/cuối

  return slug;
};

const ProductManagement: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  // products list kept server-side but not stored as top-level state anymore; variants are flattened into variantRows
  const [productLoading, setProductLoading] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productPageSize] = useState(10);
  const [variantRows, setVariantRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotification();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [status] = useState("active");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [variantSize, setVariantSize] = useState("M");
  const [variantPrice, setVariantPrice] = useState<number>(0);
  const [variantStock, setVariantStock] = useState<number>(0);
  const [variantColorId, setVariantColorId] = useState<string | null>(null);

  // File upload state
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImageFileList, setProductImageFileList] = useState<
    UploadFile[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const catRes = await categoryService.getTree();
        setCategories(catRes.data || []);
      } catch (e) {
        console.error("Load categories failed", e);
      }

      try {
        const colorRes = await colorService.getAll();
        setColors(colorRes.data || []);
      } catch (e) {
        console.error("Load colors failed", e);
      }
      // load products
      fetchProducts();
    })();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      // Load tất cả sản phẩm với limit lớn để hiển thị hết
      const res = await productService.getAllProducts(1, 1000);
      // res expected to be { items, total, page, limit } or similar depending on API
      // try common shapes
      let prods: Product[] = [];
      if ((res as any).items) prods = (res as any).items || [];
      else if ((res as any).products) prods = (res as any).products || [];
      else if (Array.isArray(res)) prods = res as any;
      else prods = [];

      console.log("📦 Loaded products:", prods.length);

      // Flatten variants into rows: one row per variant with product context
      const rows: any[] = [];
      prods.forEach((p) => {
        (p.variants || []).forEach((v) => {
          rows.push({
            id: v.id,
            productId: p.id,
            productName: p.name,
            slug: p.slug,
            imageUrl: v.imageUrl || p.imageUrl,
            sku: v.sku,
            size: v.size,
            price: v.price,
            discountPrice: v.discountPrice,
            stock: (v as any).stock || 0,
            color: v.color,
            status: p.status === "active" ? "Hoạt động" : "Không hoạt động",
            categoryId: (p as any).categoryId || (p as any).category?.id,
            createdAt: p.createdAt, // Thêm ngày tạo từ product
          });
        });
      });

      rows.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      console.log("📦 Flattened variant rows:", rows.length);
      setVariantRows(rows);
      setProductPage(1);
    } catch (err) {
      console.error("Load products failed", err);
      notify.error("Không thể tải danh sách sản phẩm");
    } finally {
      setProductLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      notify.warning("Vui lòng chọn danh mục");
      return;
    }
    if (!variantColorId) {
      notify.warning("Vui lòng chọn màu");
      return;
    }
    if (!productImageFile) {
      notify.warning("Vui lòng chọn ảnh sản phẩm");
      return;
    }

    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        notify.error("Vui lòng đăng nhập");
        return;
      }

      // Tạo FormData để gửi file
      const formData = new FormData();

      // Thêm product image file
      formData.append("productImage", productImageFile);
      // Thêm cùng file cho variant image (variant[0][image])
      formData.append("variants[0][image]", productImageFile);

      // Tạo productData object
      const productData = {
        name,
        slug,
        shortDescription,
        brand,
        status,
        tags,
        category: { id: categoryId },
        variants: [
          {
            sku: `${slug || "SKU"}-${variantSize}`,
            size: variantSize,
            price: variantPrice,
            discountPrice: variantPrice,
            discountPercent: 0,
            stock: variantStock,
            onSales: false,
            saleNote: "",
            color: { id: variantColorId },
          },
        ],
      };

      // Thêm productData vào FormData
      formData.append("productData", JSON.stringify(productData));

      // Gửi request với FormData
      const response = await fetch(`/api/v1/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Không set Content-Type, để browser tự set multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        // Kiểm tra response có phải JSON không
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi khi tạo sản phẩm");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Lỗi khi tạo sản phẩm");
        }
      }

      // Kiểm tra response có phải JSON không trước khi parse
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server trả về response không phải JSON");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Lỗi khi tạo sản phẩm");
      }

      notify.success("Tạo sản phẩm thành công");

      // reset form
      setName("");
      setSlug("");
      setShortDescription("");
      setBrand("");
      setTags("");
      setVariantPrice(0);
      setVariantStock(0);
      setCategoryId(null);
      setVariantColorId(null);
      setProductImageFile(null);
      setProductImageFileList([]);

      // Close modal and reload products
      setCreateModalVisible(false);
      await fetchProducts();
    } catch (err: any) {
      console.error("Create product error", err);
      notify.error(err.message || "Lỗi khi tạo sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (record: any) => {
    // Load full product data
    try {
      const token = authService.getToken();
      if (!token) {
        notify.error("Vui lòng đăng nhập");
        return;
      }

      const productData = await productService.getProductById(
        record.productId,
        token
      );
      setEditingProduct(productData);

      // Reset file upload state
      setProductImageFile(null);
      setProductImageFileList([]);

      // Fill form với data hiện tại
      setName(productData.name || "");
      setSlug(productData.slug || "");
      setShortDescription(productData.shortDescription || "");
      setBrand(productData.brand || "");
      setTags(productData.tags || "");
      setCategoryId(
        (productData as any).category?.id ||
          (productData as any).categoryId ||
          null
      );

      // Nếu có variants, lấy variant đầu tiên để fill form
      if (productData.variants && productData.variants.length > 0) {
        const firstVariant = productData.variants[0];
        setVariantSize(firstVariant.size || "M");
        setVariantPrice(firstVariant.price || 0);
        setVariantStock((firstVariant as any).stock || 0);
        setVariantColorId(firstVariant.color?.id || null);
      }

      setEditModalVisible(true);
    } catch (err: any) {
      console.error("Load product error", err);
      notify.error("Không thể tải thông tin sản phẩm");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!categoryId) {
      notify.warning("Vui lòng chọn danh mục");
      return;
    }

    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        notify.error("Vui lòng đăng nhập");
        return;
      }

      // Payload theo UpdateProductRequestDto
      const payload = {
        id: editingProduct.id,
        name,
        slug,
        shortDescription,
        imageUrl: editingProduct.imageUrl, // Giữ imageUrl cũ
        brand,
        status,
        tags,
        category: { id: categoryId },
        // Giữ nguyên variants cũ
        variants:
          editingProduct.variants?.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            price: v.price,
            discountPrice: v.discountPrice,
            discountPercent: v.discountPercent,
            imageUrl: v.imageUrl, // Giữ imageUrl cũ của variant
            onSales: v.onSales,
            saleNote: v.saleNote,
            color: { id: v.color?.id },
          })) || [],
      };

      // Backend luôn dùng FormData (uploadProductWithVariants middleware)
      const formData = new FormData();

      // Thêm file nếu có upload mới
      if (productImageFile) {
        formData.append("productImage", productImageFile);
        formData.append("variants[0][image]", productImageFile);
      }

      // Luôn luôn thêm productData vào FormData
      formData.append("productData", JSON.stringify(payload));

      const response = await fetch(`/api/v1/products`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Không set Content-Type, để browser tự set multipart/form-data với boundary
        },
        body: formData,
      });

      if (!response.ok) {
        // Kiểm tra response có phải JSON không
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi khi cập nhật sản phẩm");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Lỗi khi cập nhật sản phẩm");
        }
      }

      // Kiểm tra response có phải JSON không trước khi parse
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server trả về response không phải JSON");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Lỗi khi cập nhật sản phẩm");
      }

      notify.success("Cập nhật sản phẩm thành công");

      // Reset form và đóng modal
      setEditModalVisible(false);
      setEditingProduct(null);
      setProductImageFile(null);
      setProductImageFileList([]);
      await fetchProducts();
    } catch (err: any) {
      console.error("Update product error", err);
      notify.error(err.message || "Lỗi khi cập nhật sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    // Sử dụng alert để xác nhận xóa sản phẩm
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`
    );

    if (isConfirmed) {
      try {
        const token = authService.getToken();
        if (!token) {
          notify.error("Vui lòng đăng nhập");
          return;
        }

        await productService.deleteProduct(productId, token);
        notify.success("Xóa sản phẩm thành công");
        // Reload products
        await fetchProducts();
      } catch (err: any) {
        console.error("Delete product error", err);
        notify.error(err.message || "Lỗi khi xóa sản phẩm");
      }
    }
  };

  const productColumns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url: string, record: Product) => (
        <img
          src={(url as string) || (record as any).imageUrl}
          alt={(record as any).productName || record.name}
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (v: string) => <span className="font-semibold">{v}</span>,
    },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Size", dataIndex: "size", key: "size" },
    {
      title: "Màu",
      dataIndex: ["color", "name"],
      key: "color",
      render: (_: any, record: any) => record.color?.name || "N/A",
    },
    {
      title: "Giá bán",
      key: "price",
      sorter: (a: any, b: any) => {
        // Sắp xếp theo giá sau giảm (discountPrice), nếu không có thì lấy price
        const priceA = a.discountPrice < a.price ? a.discountPrice : a.price;
        const priceB = b.discountPrice < b.price ? b.discountPrice : b.price;
        return priceA - priceB;
      },
      render: (_: any, record: any) => {
        const vPrice = (record as any).price;
        const vDiscount = (record as any).discountPrice;
        return vDiscount < vPrice ? (
          <div>
            <span className="line-through text-sm text-gray-400">
              {vPrice.toLocaleString("vi-VN")}₫
            </span>
            <div className="text-red-600 font-bold">
              {vDiscount.toLocaleString("vi-VN")}₫
            </div>
          </div>
        ) : (
          <div className="font-bold">{vPrice.toLocaleString("vi-VN")}₫</div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Hoạt động" ? "green" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: any, b: any) => {
        // Sắp xếp theo thời gian (mới nhất trước)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      },
      render: (date: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            block
          >
            Sửa
          </Button>
          {/* <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.productId, record.productName)}
            block
          >
            Xoá
          </Button> */}
        </Space>
      ),
    },
  ];

  const startIndex = (productPage - 1) * productPageSize;
  const endIndex = startIndex + productPageSize;

  // Filter variant rows by search term (product name)
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredVariantRows = normalizedSearch
    ? variantRows.filter((r) =>
        (r.productName || "").toLowerCase().includes(normalizedSearch)
      )
    : variantRows;
  // products is kept for context; table displays flattened variantRows instead

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
        <div className="flex gap-3 items-center">
          <Input.Search
            placeholder="Tìm theo tên sản phẩm"
            allowClear
            onSearch={(val) => {
              setSearchTerm(val || "");
              setProductPage(1);
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setProductPage(1);
            }}
            style={{ width: 340 }}
          />
          <Button onClick={() => fetchProducts()}>Làm mới</Button>
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <Table
          columns={productColumns}
          dataSource={
            filteredVariantRows.length
              ? filteredVariantRows.slice(startIndex, endIndex)
              : []
          }
          loading={productLoading}
          rowKey="id"
          pagination={false}
        />
      </div>

      {filteredVariantRows.length > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={productPage}
            total={filteredVariantRows.length}
            pageSize={productPageSize}
            onChange={(p) => {
              setProductPage(p);
              // Phân trang client-side, không cần gọi lại API
            }}
            showSizeChanger={false}
            showQuickJumper
            locale={{ jump_to: "Đi đến trang", page: "" }}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} sản phẩm`
            }
          />
        </div>
      )}

      <Modal
        title="Tạo sản phẩm mới"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Tên sản phẩm
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setName(newName);
                  // Tự động tạo slug từ tên sản phẩm
                  setSlug(slugify(newName));
                }}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Mô tả ngắn
              </label>
              <Input.TextArea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Mô tả ngắn"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Ảnh sản phẩm
              </label>
              <Upload
                listType="picture"
                maxCount={1}
                fileList={productImageFileList}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    notify.error("Chỉ được upload file ảnh!");
                    return Upload.LIST_IGNORE;
                  }
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    notify.error("Ảnh phải nhỏ hơn 5MB!");
                    return Upload.LIST_IGNORE;
                  }
                  setProductImageFile(file);
                  setProductImageFileList([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: "done",
                      url: URL.createObjectURL(file),
                    },
                  ]);
                  return false;
                }}
                onRemove={() => {
                  setProductImageFile(null);
                  setProductImageFileList([]);
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Thương hiệu
              </label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Thương hiệu"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Danh mục</label>
              <Select
                style={{ width: "100%" }}
                value={categoryId || undefined}
                onChange={(value) => setCategoryId(value || null)}
                placeholder="Chọn danh mục"
                allowClear
              >
                {categories.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Tags (comma separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tags (comma separated)"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Thông tin variant</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Size</label>
                <Input
                  value={variantSize}
                  onChange={(e) => setVariantSize(e.target.value)}
                  placeholder="Size"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Giá</label>
                <Input
                  type="number"
                  value={variantPrice}
                  onChange={(e) => setVariantPrice(Number(e.target.value))}
                  placeholder="Giá"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Tồn kho
                </label>
                <Input
                  type="number"
                  value={variantStock}
                  onChange={(e) => setVariantStock(Number(e.target.value))}
                  placeholder="Tồn kho"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium">Màu</label>
              <Select
                style={{ width: "100%" }}
                value={variantColorId || undefined}
                onChange={(value) => setVariantColorId(value || null)}
                placeholder="Chọn màu"
                allowClear
              >
                {colors.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Tạo sản phẩm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Sửa sản phẩm */}
      <Modal
        title="Sửa sản phẩm"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingProduct(null);
        }}
        footer={null}
        width={800}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Tên sản phẩm
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setName(newName);
                  setSlug(slugify(newName));
                }}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Mô tả ngắn
              </label>
              <Input.TextArea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Mô tả ngắn"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Ảnh sản phẩm
              </label>
              <Upload
                listType="picture"
                maxCount={1}
                fileList={productImageFileList}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    notify.error("Chỉ được upload file ảnh!");
                    return Upload.LIST_IGNORE;
                  }
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    notify.error("Ảnh phải nhỏ hơn 5MB!");
                    return Upload.LIST_IGNORE;
                  }
                  setProductImageFile(file);
                  setProductImageFileList([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: "done",
                      url: URL.createObjectURL(file),
                    },
                  ]);
                  return false;
                }}
                onRemove={() => {
                  setProductImageFile(null);
                  setProductImageFileList([]);
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
              </Upload>
              {editingProduct?.imageUrl && !productImageFile && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Ảnh hiện tại:</p>
                  <img
                    src={editingProduct.imageUrl}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Thương hiệu
              </label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Thương hiệu"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Danh mục</label>
              <Select
                style={{ width: "100%" }}
                value={categoryId || undefined}
                onChange={(value) => setCategoryId(value || null)}
                placeholder="Chọn danh mục"
                allowClear
              >
                {categories.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Tags (comma separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tags (comma separated)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setEditingProduct(null);
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Cập nhật
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
