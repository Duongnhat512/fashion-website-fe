import React, { useEffect, useState } from "react";
import { categoryService } from "../../../services/categoryService";
import { colorService } from "../../../services/colorService";
import { authService } from "../../../services/authService";
import { productService } from "../../../services/productService";
import { API_CONFIG } from "../../../config/api.config";
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
  AutoComplete,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  SearchOutlined,
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
  // State cho tìm kiếm thông minh
  const [searchValue, setSearchValue] = useState("");
  const [searchOptions, setSearchOptions] = useState<any[]>([]);
  const notify = useNotification();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [status] = useState("active");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // State cho giá bán khi edit
  const [editingPrice, setEditingPrice] = useState<number>(0);

  // Variant list state - cho phép thêm nhiều variants
  const [variants, setVariants] = useState<any[]>([]);
  const [currentVariant, setCurrentVariant] = useState({
    size: "M",
    price: 0,
    stock: 0,
    colorId: null as string | null,
  });

  // File upload state
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImageFileList, setProductImageFileList] = useState<
    UploadFile[]
  >([]);

  // File upload state cho variant hiện tại
  const [currentVariantImageFile, setCurrentVariantImageFile] =
    useState<File | null>(null);
  const [currentVariantImageFileList, setCurrentVariantImageFileList] =
    useState<UploadFile[]>([]);

  // Import state
  // Import state
  const [importingProducts, setImportingProducts] = useState(false);
  const [importingVariants, setImportingVariants] = useState(false);
  const productImportRef = React.useRef<HTMLInputElement>(null);
  const variantImportRef = React.useRef<HTMLInputElement>(null);

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
      // res expected to be { products, pagination } or similar depending on API
      // try common shapes
      let prods: Product[] = [];
      if ((res as any).products) prods = (res as any).products || [];
      else if ((res as any).items) prods = (res as any).items || [];
      else if (Array.isArray(res)) prods = res as any;
      else prods = [];

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

      setVariantRows(rows);
      setProductPage(1);
    } catch (err) {
      console.error("Load products failed", err);
      notify.error("Không thể tải danh sách sản phẩm");
    } finally {
      setProductLoading(false);
    }
  };

  const handleSearchProducts = async (value: string) => {
    if (!value.trim()) {
      setSearchOptions([]);
      return;
    }

    try {
      // Kiểm tra xem input có phải là ID không
      const trimmed = value.trim();

      // Regex cho Product ID (PRO-XXXXXX-XXXX)
      const isProductId = /^PRO-\d{6,20}-[A-Z0-9]{4,10}$/i.test(trimmed);

      // UUID
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          trimmed
        );

      // Mongo ObjectId
      const isObjectId = /^[0-9a-f]{24}$/i.test(trimmed);

      // Variant ID (có thể là UUID hoặc ObjectId)
      const isIdSearch =
        (isProductId || isUUID || isObjectId) && trimmed.length >= 12;

      let products: any[] = [];

      if (isIdSearch) {
        // Tìm kiếm trực tiếp theo ID
        try {
          const token = authService.getToken();
          if (!token) {
            throw new Error("Vui lòng đăng nhập");
          }
          const product = await productService.getProductById(trimmed, token);
          products = [product];
        } catch (error) {
          // Nếu không tìm thấy, products sẽ là mảng rỗng
          products = [];
        }
      } else {
        // Tìm kiếm theo tên
        const response = await productService.searchProducts({
          search: value,
          limit: 10,
        });
        products = response.products || [];
      }

      const options = products.map((product: any) => ({
        value: product.id,
        label: (
          <div className="flex items-center gap-3">
            <img
              src={
                product.imageUrl ||
                product.variants?.[0]?.imageUrl ||
                "https://via.placeholder.com/40"
              }
              alt={product.name}
              className="w-8 h-8 object-cover rounded"
            />
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-gray-500">
                ID: {product.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        ),
        product: product,
      }));

      setSearchOptions(options);
    } catch (error) {
      console.error("Search products error:", error);
      setSearchOptions([]);
    } finally {
    }
  };

  const handleSelectProduct = (_value: string, option: any) => {
    // Khi chọn sản phẩm từ dropdown, set searchValue thành ID để filter
    setSearchValue(option.product.id);
    setSearchOptions([]);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSearchOptions([]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      notify.warning("Vui lòng chọn danh mục");
      return;
    }
    if (variants.length === 0) {
      notify.warning("Vui lòng thêm ít nhất 1 variant!");
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

      // QUAN TRỌNG: Phải gửi đúng số lượng ảnh = số variants
      variants.forEach((variant, index) => {
        // Sử dụng ảnh riêng của variant nếu có, không thì dùng ảnh product
        const variantImage = variant.imageFile || productImageFile;
        formData.append(`variants[${index}][image]`, variantImage);
      });

      // Tạo productData object với nhiều variants
      const productData = {
        name,
        slug,
        shortDescription,
        brand,
        status,
        tags,
        category: { id: categoryId },
        variants: variants.map((v) => ({
          sku: `${slug || "SKU"}-${v.size}-${v.colorId}`,
          size: v.size,
          price: v.price,
          discountPrice: v.price,
          discountPercent: 0,
          stock: v.stock,
          onSales: false,
          saleNote: "",
          color: { id: v.colorId },
        })),
      };

      // Thêm productData vào FormData
      formData.append("productData", JSON.stringify(productData));

      // Sử dụng productService thay vì gọi fetch trực tiếp
      const result = await productService.createProduct(formData, token);

      // IMPORTANT: Alert to verify variant count
      const variantCount = result?.variants?.length || 0;
      console.warn(
        `⚠️ KIỂM TRA: Đã tạo ${variantCount} variants (mong đợi ${variants.length})`
      );
      if (variantCount !== variants.length) {
        notify.error(
          `LỖI: Chỉ tạo được ${variantCount} variants, mong đợi ${variants.length}`
        );
      }

      notify.success(`Tạo sản phẩm thành công với ${variantCount} variants`);

      // reset form
      setName("");
      setSlug("");
      setShortDescription("");
      setBrand("");
      setTags("");
      setVariants([]);
      setCurrentVariant({
        size: "M",
        price: 0,
        stock: 0,
        colorId: null,
      });
      setCategoryId(null);
      setProductImageFile(null);
      setProductImageFileList([]);
      setCurrentVariantImageFile(null);
      setCurrentVariantImageFileList([]);

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

      // Lọc chỉ variant được chọn từ row (record.id là variant id)
      const selectedVariant = productData.variants?.find(
        (v: any) => v.id === record.id
      );

      // Chỉ lưu variant được chọn
      setEditingProduct({
        ...productData,
        selectedVariant: selectedVariant, // Thêm thông tin variant được chọn
      });

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

      // Set giá bán từ variant được chọn
      setEditingPrice(selectedVariant?.price || 0);

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
        // Cập nhật giá cho variant được chọn
        variants:
          editingProduct.variants?.map((v: any) => {
            const isSelectedVariant =
              String(v.id) === String(editingProduct.selectedVariant?.id);
            return {
              id: v.id,
              sku: v.sku,
              size: v.size,
              // Chỉ cập nhật price của variant được chọn
              price: isSelectedVariant ? editingPrice : v.price,
              // Giữ nguyên discountPrice
              discountPrice: v.discountPrice,
              discountPercent: v.discountPercent,
              imageUrl: v.imageUrl, // Giữ imageUrl cũ của variant
              onSales: v.onSales,
              saleNote: v.saleNote,
              color: { id: v.color?.id },
            };
          }) || [],
      };

      // Backend luôn dùng FormData (uploadProductWithVariants middleware)
      const formData = new FormData();

      // Tìm index của variant được chọn
      const selectedVariantIndex =
        editingProduct.variants?.findIndex(
          (v: any) =>
            String(v.id) === String(editingProduct.selectedVariant?.id)
        ) ?? 0;

      // Thêm file nếu có upload mới
      if (productImageFile) {
        formData.append("productImage", productImageFile);
        // Append vào đúng variant được chọn
        formData.append(
          `variants[${selectedVariantIndex}][image]`,
          productImageFile
        );
      }

      // Luôn luôn thêm productData vào FormData
      formData.append("productData", JSON.stringify(payload));

      // Sử dụng productService thay vì gọi fetch trực tiếp
      await productService.updateProduct(formData, token);
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

  // const handleDelete = async (productId: string, productName: string) => {
  //   // Sử dụng alert để xác nhận xóa sản phẩm
  //   const isConfirmed = window.confirm(
  //     `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`
  //   );

  //   if (isConfirmed) {
  //     try {
  //       const token = authService.getToken();
  //       if (!token) {
  //         notify.error("Vui lòng đăng nhập");
  //         return;
  //       }

  //       await productService.deleteProduct(productId, token);
  //       notify.success("Xóa sản phẩm thành công");
  //       // Reload products
  //       await fetchProducts();
  //     } catch (err: any) {
  //       console.error("Delete product error", err);
  //       notify.error(err.message || "Lỗi khi xóa sản phẩm");
  //     }
  //   }
  // };

  // Hàm xử lý import sản phẩm từ JSON
  const handleImportProductsChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await handleImportProducts(file);
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  const handleImportProducts = async (file: File) => {
    setImportingProducts(true);
    try {
      const token = authService.getToken();
      if (!token) {
        notify.error("Vui lòng đăng nhập");
        return;
      }

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("file", file);

      // Gửi request đến API import
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.IMPORT}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi import sản phẩm");
      }

      const result = await response.json();

      notify.success(result.message || "Import sản phẩm thành công");
      await fetchProducts();
    } catch (err: any) {
      console.error("Import products error:", err);
      notify.error(err.message || "Lỗi khi import sản phẩm");
    } finally {
      setImportingProducts(false);
    }
  };

  // Hàm xử lý import thuộc tính (variants) từ JSON
  const handleImportVariantsChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await handleImportVariants(file);
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  const handleImportVariants = async (file: File) => {
    setImportingVariants(true);
    try {
      const token = authService.getToken();
      if (!token) {
        notify.error("Vui lòng đăng nhập");
        return;
      }

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append("file", file);

      // Gửi request đến API import variants
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.IMPORT_VARIANTS}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi import thuộc tính");
      }

      const result = await response.json();

      // Nếu API trả về danh sách variants, set vào form
      if (result.data && Array.isArray(result.data)) {
        const validVariants = result.data.map((v: any) => ({
          size: v.size,
          price: v.price,
          stock: v.stock || 0,
          colorId: v.colorId || v.color?.id,
          imageFile: null,
          imagePreview: null,
        }));
        setVariants(validVariants);
      }

      notify.success(result.message || "Import thuộc tính thành công");
    } catch (err: any) {
      console.error("Import variants error:", err);
      notify.error(err.message || "Lỗi khi import thuộc tính");
    } finally {
      setImportingVariants(false);
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
    {
      title: "ID sản phẩm",
      dataIndex: "productId",
      key: "productId",
      render: (v: string) => (
        <span className="text-sm font-mono text-gray-600">{v}</span>
      ),
    },
    {
      title: "ID variant",
      dataIndex: "id",
      key: "id",
      render: (v: string) => (
        <span className="text-sm font-mono text-gray-600">{v}</span>
      ),
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

  // Filter variant rows by search value (ưu tiên ID trước, sau đó tên)
  const filteredVariantRows = variantRows.filter((r) => {
    if (!searchValue) return true;

    const searchTerm = searchValue.toLowerCase();

    // Ưu tiên tìm theo ID (productId hoặc variantId)
    const idMatch =
      (r.productId || "").toLowerCase().includes(searchTerm) ||
      (r.id || "").toLowerCase().includes(searchTerm);

    // Nếu tìm thấy theo ID thì trả về true
    if (idMatch) return true;

    // Nếu không tìm thấy theo ID thì tìm theo tên sản phẩm
    return (r.productName || "").toLowerCase().includes(searchTerm);
  });
  // products is kept for context; table displays flattened variantRows instead

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3 items-center">
          {/* Thanh tìm kiếm thông minh */}
          <div className="p-3">
            <AutoComplete
              value={searchValue}
              options={searchOptions}
              onSearch={handleSearchProducts}
              onSelect={handleSelectProduct}
              onChange={(value) => setSearchValue(value)}
              allowClear
              onClear={handleClearSearch}
              style={{ width: 300 }}
            >
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm theo ID hoặc tên sản phẩm"
              />
            </AutoComplete>
          </div>

          <Button onClick={() => fetchProducts()}>Làm mới</Button>
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>
            Thêm sản phẩm
          </Button>
          <input
            ref={productImportRef}
            type="file"
            accept=".json"
            onChange={handleImportProductsChange}
            style={{ display: "none" }}
          />
          <Button
            type="default"
            onClick={() => productImportRef.current?.click()}
            icon={<UploadOutlined />}
            loading={importingProducts}
            disabled={importingProducts}
          >
            {importingProducts ? "Đang import..." : "Import sản phẩm"}
          </Button>
          <input
            ref={variantImportRef}
            type="file"
            accept=".json"
            onChange={handleImportVariantsChange}
            style={{ display: "none" }}
          />
          <Button
            type="default"
            onClick={() => variantImportRef.current?.click()}
            icon={<UploadOutlined />}
            loading={importingVariants}
            disabled={importingVariants}
          >
            {importingVariants ? "Đang import..." : "Import thuộc tính"}
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
              <label className="block mb-1 text-sm font-medium">Tags</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tags (comma separated)"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Danh sách thuộc tính</h4>

            {/* Hiển thị danh sách variants đã thêm */}
            {variants.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="space-y-2">
                  {variants.map((v, index) => {
                    const color = colors.find((c) => c.id === v.colorId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border"
                      >
                        <div className="flex items-center gap-3">
                          {/* Hiển thị ảnh preview nếu có */}
                          {v.imagePreview && (
                            <img
                              src={v.imagePreview}
                              alt={`Variant ${v.size}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )}
                          {color && (
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
                          <span className="font-medium">
                            Size {v.size} - {color?.name || "N/A"}
                          </span>
                          <span className="text-gray-600">
                            Giá: {v.price.toLocaleString()}₫
                          </span>
                        </div>
                        <Button
                          danger
                          size="small"
                          onClick={() => {
                            // Revoke object URL để tránh memory leak
                            if (v.imagePreview) {
                              URL.revokeObjectURL(v.imagePreview);
                            }
                            setVariants(variants.filter((_, i) => i !== index));
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <h4 className="font-semibold mb-3">Thêm thuộc tính mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Màu</label>
                <Select
                  style={{ width: "100%" }}
                  value={currentVariant.colorId || undefined}
                  onChange={(value) =>
                    setCurrentVariant({
                      ...currentVariant,
                      colorId: value || null,
                    })
                  }
                  placeholder="Chọn màu"
                  allowClear
                >
                  {colors.map((c) => (
                    <Select.Option key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name} ({c.code})
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Upload ảnh cho variant */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Ảnh thuộc tính (tùy chọn)
                </label>
                <Upload
                  listType="picture"
                  maxCount={1}
                  fileList={currentVariantImageFileList}
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
                    setCurrentVariantImageFile(file);
                    setCurrentVariantImageFileList([
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
                    setCurrentVariantImageFile(null);
                    setCurrentVariantImageFileList([]);
                  }}
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh thuộc tính</Button>
                </Upload>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Size</label>
                <Input
                  value={currentVariant.size}
                  onChange={(e) =>
                    setCurrentVariant({
                      ...currentVariant,
                      size: e.target.value,
                    })
                  }
                  placeholder="Size"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Giá</label>
                <Input
                  type="number"
                  value={currentVariant.price}
                  onChange={(e) =>
                    setCurrentVariant({
                      ...currentVariant,
                      price: Number(e.target.value),
                    })
                  }
                  placeholder="Giá"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="dashed"
                onClick={() => {
                  if (!currentVariant.colorId) {
                    notify.warning("Vui lòng chọn màu cho variant!");
                    return;
                  }
                  if (!currentVariant.size) {
                    notify.warning("Vui lòng nhập size!");
                    return;
                  }

                  // Thêm variant vào danh sách (kèm theo file ảnh)
                  setVariants([
                    ...variants,
                    {
                      ...currentVariant,
                      imageFile: currentVariantImageFile, // Lưu file ảnh
                      imagePreview: currentVariantImageFile
                        ? URL.createObjectURL(currentVariantImageFile)
                        : null,
                    },
                  ]);

                  // Reset current variant và ảnh
                  setCurrentVariant({
                    size: "M",
                    price: 0,
                    stock: 0,
                    colorId: null,
                  });
                  setCurrentVariantImageFile(null);
                  setCurrentVariantImageFileList([]);

                  notify.success("Đã thêm thuộc tính");
                }}
              >
                + Thêm Thuộc Tính
              </Button>
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
        width={900}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Thông tin sản phẩm - Card riêng */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold mb-3 text-gray-800">
              Thông tin sản phẩm
            </h4>
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
                {editingProduct?.selectedVariant?.imageUrl &&
                  !productImageFile && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Ảnh hiện tại:
                      </p>
                      <img
                        src={editingProduct.selectedVariant.imageUrl}
                        alt="Current Variant"
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
                <label className="block mb-1 text-sm font-medium">
                  Danh mục
                </label>
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
                <label className="block mb-1 text-sm font-medium">Tags</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tags"
                />
              </div>
            </div>
          </div>

          {/* Thông tin variant - Card riêng - Đặt ở dưới */}
          {editingProduct?.selectedVariant && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-3 text-blue-800">Thuộc tính</h4>
              <div className="grid grid-cols-4 gap-4 items-start">
                {/* Ảnh variant */}
                {editingProduct.selectedVariant.imageUrl && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2 font-medium">
                      Ảnh
                    </div>
                    <img
                      src={editingProduct.selectedVariant.imageUrl}
                      alt={`Variant ${editingProduct.selectedVariant.size}`}
                      className="w-20 h-20 object-cover rounded border mx-auto"
                    />
                  </div>
                )}

                {/* Size */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Size
                  </div>
                  <div className="font-semibold text-lg">
                    {editingProduct.selectedVariant.size}
                  </div>
                </div>

                {/* Màu */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Màu
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {editingProduct.selectedVariant.color?.hex && (
                      <div
                        className="w-5 h-5 rounded-full border"
                        style={{
                          backgroundColor:
                            editingProduct.selectedVariant.color.hex,
                        }}
                      />
                    )}
                    <span className="font-medium">
                      {editingProduct.selectedVariant.color?.name || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Giá bán - Có thể chỉnh sửa */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium text-center">
                    Giá bán
                  </label>
                  <Input
                    type="number"
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(Number(e.target.value))}
                    className="text-center font-semibold text-lg"
                    suffix="₫"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 italic text-center">
                * Bạn có thể cập nhật giá bán. Để sửa size/màu, vui lòng xóa sản
                phẩm và tạo lại
              </p>
            </div>
          )}

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
