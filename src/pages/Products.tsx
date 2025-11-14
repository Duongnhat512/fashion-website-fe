import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Rate, Pagination, Select, Slider } from "antd";
import { motion } from "framer-motion";

import { productService } from "../services/productService";
import type { Product } from "../types/product.types";

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<string>("default");

  // 🔍 Lấy search query và category từ URL
  useEffect(() => {
    const query = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    setSearchQuery(query);
    if (query) {
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
    } else if (category) {
      setSelectedCategoryId(category);
      // Có thể cần load category name từ API hoặc local
      setSelectedCategoryName(null);
    } else {
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
    }
  }, [searchParams]);

  // 📄 Phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 16, // Giới hạn số sản phẩm hiển thị mỗi trang (16)
    total: 0,
    totalPages: 1,
  });

  const isSearching = searchQuery.trim() !== "";

  const handleToDetail = (p: Product) => {
    navigate(`/products/${p.slug}`, { state: { product: p } });
  };

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 1000, // Lấy tối đa 1000 sản phẩm từ API
      };

      // Truyền search query từ URL vào API nếu có
      if (searchQuery) params.search = searchQuery;

      // Truyền categoryId vào API nếu có
      if (selectedCategoryId) params.categoryId = selectedCategoryId;

      // Gửi sort lên server nếu có
      if (sortBy !== "default") {
        if (sortBy === "price-asc") {
          params.sortBy = "price";
          params.sort = "asc";
        } else if (sortBy === "price-desc") {
          params.sortBy = "price";
          params.sort = "desc";
        } else if (sortBy === "name-asc") {
          params.sortBy = "name";
          params.sort = "asc";
        } else if (sortBy === "name-desc") {
          params.sortBy = "name";
          params.sort = "desc";
        }
      }

      const res = await productService.searchProducts(params);
      setProducts(res.products);
      setPagination({
        page: res.pagination.page,
        limit: pagination.limit,
        total: res.pagination.total,
        totalPages: Math.ceil(res.pagination.total / pagination.limit), // Tính lại số trang
      });
    } catch (error) {
      console.error("❌ Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💰 Lọc sản phẩm theo giá (client-side)
  const filteredProducts = products.filter((p) => {
    const price = p.variants?.[0]?.price || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });

  // 📄 Phân trang client-side: Hiển thị 16 sản phẩm mỗi trang
  const paginatedProducts = filteredProducts.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Cập nhật số lượng sản phẩm sau khi lọc
  const totalFiltered = filteredProducts.length;
  const itemsPerPage = pagination.limit;

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategoryId, searchQuery, sortBy]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-700" />
        <p className="ml-4 text-gray-700 font-semibold text-lg">
          Đang tải sản phẩm...
        </p>
      </div>
    );

  // Kiểm tra nếu không có kết quả lọc theo giá, thì không hiển thị phân trang
  const shouldShowPagination =
    totalFiltered > itemsPerPage && totalFiltered > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* ⬅️ SIDEBAR */}
          <div className="hidden lg:block w-72">
            <div className="bg-white rounded-2xl p-6 shadow-md space-y-8 border border-gray-100">
              {/* --- Sắp xếp --- */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  Sắp xếp
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Theo giá:
                    </label>
                    <Select
                      value={sortBy.startsWith("price") ? sortBy : "default"}
                      onChange={(value) => setSortBy(value)}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Select.Option value="default">Mặc định</Select.Option>
                      <Select.Option value="price-asc">
                        Giá tăng dần
                      </Select.Option>
                      <Select.Option value="price-desc">
                        Giá giảm dần
                      </Select.Option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Theo tên:
                    </label>
                    <Select
                      value={sortBy.startsWith("name") ? sortBy : "default"}
                      onChange={(value) => setSortBy(value)}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Select.Option value="default">Mặc định</Select.Option>
                      <Select.Option value="name-asc">Tên A-Z</Select.Option>
                      <Select.Option value="name-desc">Tên Z-A</Select.Option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* --- Lọc theo giá --- */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  Lọc theo giá
                </h3>
                <Slider
                  range
                  min={0}
                  max={10000000}
                  step={50000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                  tooltip={{
                    formatter: (val) => `${val?.toLocaleString("vi-VN")}₫`,
                  }}
                />
                <div className="flex justify-between text-sm text-gray-700 mt-2">
                  <span>{priceRange[0].toLocaleString("vi-VN")}₫</span>
                  <span>{priceRange[1].toLocaleString("vi-VN")}₫</span>
                </div>
              </div>

              {/* --- Danh mục --- */}
            </div>
          </div>

          {/* ➡️ NỘI DUNG */}
          <div className="flex-1">
            {/* Danh sách sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const v = p.variants?.[0];
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToDetail(p)}
                      className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:border-gray-400 transition-all duration-300 group"
                    >
                      <motion.div
                        className="relative overflow-hidden"
                        initial="hidden"
                        whileHover="visible"
                      >
                        <img
                          src={v?.imageUrl || p.imageUrl}
                          alt={p.name}
                          className="w-full aspect-[3/4] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />

                        {/* Hiệu ứng Xem chi tiết */}
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
                              bg-black/60 backdrop-blur-sm text-white font-semibold uppercase tracking-wide text-sm
rounded-md shadow-[0,4px,20px,rgba(0,0,0,0.35)]
border border-white/20 cursor-pointer hover:bg-black/80 transition-all duration-300
"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToDetail(p);
                            }}
                          >
                            XEM CHI TIẾT &nbsp; ➜
                          </div>
                        </motion.div>
                      </motion.div>

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
                  <h3 className="mt-8 text-2xl font-bold text-gray-700">
                    Không tìm thấy sản phẩm nào
                  </h3>
                  <p className="mt-3 text-gray-500 text-center max-w-md">
                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác để khám
                    phá thêm sản phẩm
                  </p>
                  <button
                    onClick={() => {
                      navigate("/products", { replace: true }); // Clear search từ URL
                      setPriceRange([0, 10000000]);
                      setSortBy("default");
                      setSelectedCategoryId(null);
                      setSelectedCategoryName(null);
                      setSearchQuery("");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                      fetchProducts(1);
                    }}
                    className="mt-6 px-8 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>

            {/* 📄 PHÂN TRANG - chỉ hiển thị khi có sản phẩm và khi có nhiều hơn một trang */}
            {shouldShowPagination && (
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
