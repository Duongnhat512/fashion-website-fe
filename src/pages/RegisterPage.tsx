import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { productService } from "../services/productService";
// import { useCart } from "../contexts/CartContext";
import { Carousel, Pagination, Rate } from "antd";

interface Color {
  id: string;
  name: string;
  code: string;
  hex: string;
  imageUrl?: string;
}

interface Variant {
  id: string;
  sku: string;
  size: string;
  price: number;
  discountPrice: number;
  imageUrl: string;
  color: Color;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  imageUrl: string;
  ratingAverage?: number;
  ratingCount?: number;
  variants: Variant[];
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  page: number;
  limit: number;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  // const { addToCart } = useCart();
  const itemsPerPage = 16;

  // Lấy query search từ URL (?search=polo)
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts({
        search: searchQuery,
        page,
        limit: itemsPerPage,
      });

      if (response?.products?.length) {
        setProducts(response.products);
        setPagination(response.pagination);
      } else {
        setProducts([]);
        setPagination(null);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải sản phẩm:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 relative overflow-hidden">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600" />
        <p className="ml-4 text-purple-600 font-semibold text-lg">
          Đang tải sản phẩm...
        </p>
      </div>
    );
  }

  const isSearching = searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/30 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 🎠 Ẩn carousel khi đang tìm kiếm */}
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

        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isSearching
              ? `Kết quả tìm kiếm: “${searchQuery}”`
              : "Sản phẩm nổi bật"}
          </h2>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.length > 0 ? (
            products.map((product) => {
              const variant = product.variants?.[0];
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white/90 rounded-2xl shadow-lg border border-white/50 overflow-hidden backdrop-blur-xl cursor-pointer hover:shadow-2xl flex flex-col"
                  onClick={() => navigate(`/product/${product.slug}`)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={variant?.imageUrl || product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors leading-relaxed mb-3">
                      {product.name}
                    </h3>

                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        {(variant?.price || 0).toLocaleString("vi-VN")}₫
                      </span>
                      <div className="flex items-center space-x-1">
                        <Rate
                          disabled
                          allowHalf
                          defaultValue={product.ratingAverage || 5}
                          style={{ fontSize: 12 }}
                        />
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.ratingCount || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 col-span-4">
              Không tìm thấy sản phẩm nào
            </p>
          )}
        </div>

        {/* 📄 Pagination */}
        {pagination && (
          <div className="flex justify-center">
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={(page) => setCurrentPage(page)}
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
  );
};

export default HomePage;
