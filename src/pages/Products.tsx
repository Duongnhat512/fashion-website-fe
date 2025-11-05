import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Rate, Pagination } from "antd";
import { motion } from "framer-motion";
import CategorySidebar from "../components/CategorySidebar";
import { productService } from "../services/productService";
import type {
  Product,
  PaginatedProductsResponse,
} from "../types/product.types";

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 🧠 STATE
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);

  // 🔍 Lấy search query từ URL
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
    // Nếu có search query thì clear category đã chọn
    if (query) {
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
    }
  }, [searchParams]);

  // 📄 Phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 16,
    total: 0,
    totalPages: 1,
  });

  const isSearching = searchQuery.trim() !== "";

  // 💰 Các khoảng giá
  const priceRanges = [
    { label: "Tất cả", value: null, min: 0, max: Infinity },
    { label: "Dưới 100,000₫", value: "0-100000", min: 0, max: 100000 },
    {
      label: "100,000₫ - 500,000₫",
      value: "100000-500000",
      min: 100000,
      max: 500000,
    },
    {
      label: "500,000₫ - 2,000,000₫",
      value: "500000-2000000",
      min: 500000,
      max: 2000000,
    },
    {
      label: "Trên 2,000,000₫",
      value: "2000000-999999999",
      min: 2000000,
      max: Infinity,
    },
  ];

  // 🧩 Hàm tải danh sách sản phẩm
  const fetchProducts = async (categoryId?: string, search?: string) => {
    try {
      setLoading(true);

      let res: PaginatedProductsResponse;
      if (search || categoryId) {
        res = await productService.searchProducts({
          page: 1,
          limit: 1000, // Tải tất cả sản phẩm để lọc ở client
          categoryId,
          search,
        });
      } else {
        res = await productService.getAllProducts(1, 1000);
      }

      setProducts(res.products);
      setPagination((prev) => ({
        ...prev,
        total: res.pagination.total,
        totalPages: res.pagination.totalPages,
      }));
    } catch (error) {
      console.error("❌ Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💰 Lọc sản phẩm theo giá và tìm kiếm
  const filteredProducts = products.filter((p) => {
    // Lọc theo giá
    if (priceRange) {
      const price = p.variants?.[0]?.price || 0;
      const range = priceRanges.find((r) => r.value === priceRange);
      if (range && (price < range.min || price > range.max)) {
        return false;
      }
    }

    // Lọc theo search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = p.name?.toLowerCase() || "";
      const shortDesc = p.shortDescription?.toLowerCase() || "";
      const brand = p.brand?.toLowerCase() || "";
      return (
        name.includes(query) ||
        shortDesc.includes(query) ||
        brand.includes(query)
      );
    }

    return true;
  });

  // 📄 Phân trang client-side cho filteredProducts
  const itemsPerPage = 16;
  const startIndex = (pagination.page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalFiltered = filteredProducts.length;

  // 🧠 Khi đổi category hoặc search → reset về trang 1 và tải dữ liệu
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProducts(selectedCategoryId || undefined, searchQuery || undefined);
  }, [selectedCategoryId, searchQuery]);

  // 🧠 Khi đổi bộ lọc giá → reset về trang 1
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [priceRange]);

  // 🟣 Khi chọn danh mục
  const handleSelectCategory = async (categoryId: string, name: string) => {
    // Xóa search params khỏi URL
    navigate("/products", { replace: true });

    if (selectedCategoryId === categoryId) {
      // 🔁 Bỏ chọn → load lại tất cả
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
      setSearchQuery("");
      fetchProducts();
    } else {
      setSelectedCategoryId(categoryId);
      setSelectedCategoryName(name);
      setSearchQuery(""); // Clear search query
    }
  };

  // 🟢 Khi đổi trang
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // ⏳ Loading
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600" />
        <p className="ml-4 text-purple-600 font-semibold text-lg">
          Đang tải sản phẩm...
        </p>
      </div>
    );

  // 🖼 Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        {/* 🖼 Carousel - ẩn khi đang search */}

        {/* 🧱 Bố cục chính */}
        <div className="flex gap-8">
          {/* ⬅️ SIDEBAR */}
          <div className="hidden lg:block">
            <CategorySidebar
              onSelectCategory={handleSelectCategory}
              selectedCategoryId={selectedCategoryId}
            />
          </div>

          {/* ➡️ NỘI DUNG */}
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-12 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent text-center">
              {isSearching
                ? `Kết quả: "${searchQuery}"`
                : selectedCategoryName
                ? selectedCategoryName
                : "Sản phẩm nổi bật"}
            </h2>

            {/* 💰 Bộ lọc theo giá */}
            <div className="mb-10 flex flex-wrap gap-3 justify-center">
              {priceRanges.map((range) => (
                <button
                  key={range.value || "all"}
                  onClick={() => setPriceRange(range.value)}
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    priceRange === range.value
                      ? "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/*  Danh sách sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const v = p.variants?.[0];

                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/products/${p.slug}`)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer
    border border-transparent
    bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300
    transition-all duration-300 shadow-md hover:shadow-2xl group"
                    >
                      {/* 🖼 Ảnh sản phẩm */}
                      <motion.div
                        className="relative overflow-hidden"
                        initial="hidden"
                        whileHover="visible"
                        variants={{ hidden: {}, visible: {} }}
                      >
                        <img
                          src={v?.imageUrl || p.imageUrl}
                          alt={p.name}
                          className="w-full aspect-[3/4] object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />

                        {/* Thanh overlay chi tiết */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-500
        flex items-center justify-center"
                          variants={{
                            hidden: { y: "150%", opacity: 0 },
                            visible: { y: "0%", opacity: 1 },
                          }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <div
                            className="w-[90%] text-center py-3
          bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500
          text-white font-bold uppercase tracking-wider text-base
          shadow-[0_4px_20px_rgba(0,0,0,0.35)] rounded-md
          border border-white/10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${p.slug}`);
                            }}
                          >
                            XEM CHI TIẾT &nbsp; ➜
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Thông tin sản phẩm */}
                      <div className="p-4 flex flex-col justify-between h-[140px] text-gray-900">
                        <h3 className="font-semibold text-base line-clamp-2 min-h-[48px]">
                          {p.name}
                        </h3>

                        <div className="flex justify-between items-center mt-3">
                          <span className="text-lg font-bold text-gray-900">
                            {(v?.price || 0).toLocaleString("vi-VN")}₫
                          </span>
                          <div className="flex items-center gap-1">
                            <Rate
                              disabled
                              value={p.ratingAverage}
                              style={{
                                fontSize: 14,
                                color:
                                  p.ratingAverage > 0 ? "#faad14" : "#d9d9d9",
                              }}
                            />
                            <span className="text-xs text-gray-700">
                              ({p.ratingCount || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <svg
                      className="w-32 h-32 text-gray-300 relative z-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-2xl font-bold text-gray-700">
                    Không tìm thấy sản phẩm nào
                  </h3>
                  <p className="mt-3 text-gray-500 text-center max-w-md">
                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác để khám
                    phá thêm sản phẩm
                  </p>
                  <button
                    onClick={() => {
                      setPriceRange(null);
                      setSelectedCategoryId(null);
                      setSelectedCategoryName(null);
                    }}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>

            {/* 📄 PHÂN TRANG */}
            {totalFiltered > itemsPerPage && (
              <div className="flex justify-center">
                <Pagination
                  current={pagination.page}
                  total={totalFiltered}
                  pageSize={itemsPerPage}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  locale={{ jump_to: "Đi đến trang", page: "" }}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} sản phẩm`
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
