import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { useCart } from "../contexts/CartContext";
import { Carousel, Pagination } from "antd";
import { fallbackProducts } from "../data/fallbackProducts";

import type {
  Product,
  PaginatedProductsResponse,
} from "../types/product.types";

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const itemsPerPage = 16;

  // Lấy sản phẩm
  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedProductsResponse =
        await productService.getAllProducts(page, itemsPerPage);

      if (!response.products || response.products.length === 0) {
        // Sử dụng fallback data với phân trang
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = fallbackProducts.slice(startIndex, endIndex);

        setProducts(paginatedProducts);
      } else {
        setProducts(response.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");

      // Fallback khi có lỗi
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = fallbackProducts.slice(startIndex, endIndex);
      setProducts(paginatedProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => fetchProducts(currentPage)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10">
        <Carousel autoplay autoplaySpeed={3000} effect="fade" dots={true}>
          <div>
            <img
              src="https://cdn.hstatic.net/files/1000210298/file/cover_b0b8afead5ac4f77b46d6411f794eb46.jpg"
              alt="banner 1"
              className="w-full h-[800px] object-cover rounded-xl"
            />
          </div>
          <div>
            <img
              src="https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png"
              alt="banner 2"
              className="w-full h-[800px] object-cover rounded-xl"
            />
          </div>
        </Carousel>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product: Product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden relative group cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)} // click card => sang detail
          >
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              -20%
            </span>

            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Overlay nút MUA NGAY */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button
                className="px-6 py-2 bg-black text-white font-semibold rounded transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn click lan ra card
                  addToCart(product);
                }}
              >
                MUA NGAY →
              </button>
            </div>

            <div className="p-5">
              <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 text-sm line-clamp-2">
                {product.shortDescription}
              </p>

              <div className="flex items-center justify-between mt-3">
                <p className="text-yellow-500 text-sm">
                  ⭐ {product.ratingAverage} ({product.ratingCount})
                </p>
                <p className="text-sm text-gray-500">Brand: {product.brand}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xl font-bold text-blue-600">
                  {product.variants && product.variants.length > 0
                    ? product.variants[0].price.toLocaleString("vi-VN")
                    : (product as any).price?.toLocaleString("vi-VN") ||
                      "Liên hệ"}
                  ₫
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10">
        <Pagination
          current={currentPage}
          total={fallbackProducts.length}
          pageSize={itemsPerPage}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`
          }
        />
      </div>
    </div>
  );
};

export default HomePage;
