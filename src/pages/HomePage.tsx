import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, Rate, Pagination } from "antd";
import { motion } from "framer-motion";
import CategorySidebar from "../components/CategorySidebar";
import { productService } from "../services/productService";
import type {
  Product,
  PaginatedProductsResponse,
} from "../types/product.types";

const HomePage = () => {
  const navigate = useNavigate();

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

  // 📄 Phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 16,
    total: 0,
    totalPages: 1,
  });

  const isSearching = searchQuery.trim() !== "";

  // 🧩 Hàm tải danh sách sản phẩm
  const fetchProducts = async (
    page = 1,
    categoryId?: string,
    search?: string
  ) => {
    try {
      setLoading(true);

      let res: PaginatedProductsResponse;
      if (search || categoryId) {
        res = await productService.searchProducts({
          page,
          limit: pagination.limit,
          categoryId,
          search,
        });
      } else {
        res = await productService.getAllProducts(page, pagination.limit);
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

  // 🧠 Khi đổi category hoặc search → reset về trang 1
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProducts(1, selectedCategoryId || undefined, searchQuery || undefined);
  }, [selectedCategoryId, searchQuery]);

  // 🧠 Khi đổi trang → load dữ liệu mới
  useEffect(() => {
    fetchProducts(
      pagination.page,
      selectedCategoryId || undefined,
      searchQuery || undefined
    );
  }, [pagination.page]);

  // 🟣 Khi chọn danh mục
  const handleSelectCategory = async (categoryId: string, name: string) => {
    if (selectedCategoryId === categoryId) {
      // 🔁 Bỏ chọn → load lại tất cả
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
      setSearchQuery("");
      fetchProducts(1);
    } else {
      setSelectedCategoryId(categoryId);
      setSelectedCategoryName(name);
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
        {!isSearching && (
          <div className="mb-12">
            <Carousel autoplay autoplaySpeed={4000} effect="fade" dots>
              <img
                src="https://cdn.hstatic.net/files/1000210298/file/cover_b0b8afead5ac4f77b46d6411f794eb46.jpg"
                className="w-full h-[500px] object-cover rounded-3xl"
              />
              <img
                src="https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png"
                className="w-full h-[500px] object-cover rounded-3xl"
              />
            </Carousel>
          </div>
        )}

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
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {isSearching
                ? `Kết quả: "${searchQuery}"`
                : selectedCategoryName
                ? selectedCategoryName
                : "Sản phẩm nổi bật"}
            </h2>

            {/* 🛍 Danh sách sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {products.length > 0 ? (
                products.map((p) => {
                  const v = p.variants?.[0];

                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/product/${p.slug}`)}
                      className="relative bg-white rounded-2xl shadow-md hover:shadow-2xl
             transition-all duration-300 overflow-hidden cursor-pointer group
             border border-transparent hover:border-purple-200"
                    >
                      {/* 🖼 Ảnh sản phẩm (motion cha) */}
                      <motion.div
                        className="relative overflow-hidden"
                        initial="hidden"
                        whileHover="visible"
                        variants={{ hidden: {}, visible: {} }}
                      >
                        <img
                          src={v?.imageUrl || p.imageUrl}
                          alt={p.name}
                          className="w-full aspect-[3/4] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />

                        {/* Thanh đen ngang giữa ảnh */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent
             opacity-0 group-hover:opacity-100 transition-opacity duration-500
             flex items-center justify-center"
                          variants={{
                            hidden: { y: "150%", opacity: 0 },
                            visible: { y: "0%", opacity: 1 },
                          }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <div
                            className="w-[90%] text-center py-3
                                  bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500
                                  text-white font-bold uppercase tracking-wider text-base
                                  shadow-[0_4px_20px_rgba(0,0,0,0.35)] rounded-md
                                  border border-white/10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${p.slug}`);
                            }}
                          >
                            XEM CHI TIẾT &nbsp; ➜
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* 🧾 Thông tin sản phẩm */}
                      <div className="p-4 flex flex-col justify-between h-[140px]">
                        <h3 className="font-semibold text-gray-900 text-base line-clamp-2 min-h-[48px]">
                          {p.name}
                        </h3>

                        <div className="flex justify-between items-center mt-3">
                          <span className="text-lg font-bold text-pink-600">
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
                            <span className="text-xs text-gray-500">
                              ({p.ratingCount || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 col-span-4">
                  Không tìm thấy sản phẩm nào
                </p>
              )}
            </div>

            {/* 📄 PHÂN TRANG */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-center">
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
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

export default HomePage;
