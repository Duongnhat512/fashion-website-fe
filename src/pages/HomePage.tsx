import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { useCart } from "../contexts/CartContext";
import { Carousel, Pagination, Rate } from "antd";
import variantData from "../data/product_variants.json";
import productData from "../data/products.json";

import type {
  Product,
  PaginatedProductsResponse,
} from "../types/product.types";

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const itemsPerPage = 16;

  // ✅ Gắn variant đầu tiên cho mỗi product
  const mergeWithVariant = (product: Product) => {
    const productVariants = variantData.filter(
      (v) => v.productId === product.id
    );
    if (productVariants.length > 0) {
      const firstVariant = productVariants[0];
      return {
        ...product,
        variants: productVariants,
        price: firstVariant.price,
        imageUrl: firstVariant.image || product.imageUrl,
        defaultVariant: firstVariant,
      };
    }
    return { ...product, variants: [], defaultVariant: null };
  };

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      const startIndex = (page - 1) * itemsPerPage;
      const response: PaginatedProductsResponse =
        await productService.getAllProducts(page, itemsPerPage);

      if (response?.products?.length) {
        setProducts(response.products.map(mergeWithVariant));
      } else {
        setProducts(
          productData
            .slice(startIndex, startIndex + itemsPerPage)
            .map(mergeWithVariant)
        );
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      const startIndex = (page - 1) * itemsPerPage;
      setProducts(
        productData
          .slice(startIndex, startIndex + itemsPerPage)
          .map(mergeWithVariant)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // 🌀 Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 blur-3xl rounded-full" />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600 mx-auto mb-6" />
          <p className="text-purple-600 font-semibold text-lg">
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 relative overflow-hidden">
      {/* 🌈 Background blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/30 blur-3xl rounded-full" />
        <div className="absolute top-40 left-1/3 w-96 h-96 bg-yellow-300/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 🖼 Banner */}
        <div className="mb-20">
          <div className="rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <Carousel autoplay autoplaySpeed={4000} effect="fade" dots>
              {/* Slide 1 */}
              <div className="relative">
                <img
                  src="https://cdn.hstatic.net/files/1000210298/file/cover_b0b8afead5ac4f77b46d6411f794eb46.jpg"
                  alt="banner 1"
                  className="w-full h-[500px] md:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-blue-900/40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
                  <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                    BOOBOO FASHION
                  </h1>
                  <p className="text-lg md:text-2xl mb-8 text-white/90">
                    Phong cách trẻ trung • Chất lượng cao • Giá cả hợp lý
                  </p>
                  <button className="px-8 py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:shadow-xl transition-all">
                    Khám phá ngay
                  </button>
                </div>
              </div>

              {/* Slide 2 */}
              <div className="relative">
                <img
                  src="https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png"
                  alt="banner 2"
                  className="w-full h-[500px] md:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-purple-900/30"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
                  <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    NEW COLLECTION
                  </h1>
                  <p className="text-lg md:text-2xl mb-8 text-white/90">
                    Xu hướng thời trang mới nhất • Thiết kế độc đáo
                  </p>
                  <button className="px-8 py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-xl transition-all">
                    Xem bộ sưu tập
                  </button>
                </div>
              </div>
            </Carousel>
          </div>
        </div>

        {/* 🛍 Tiêu đề sản phẩm */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Sản phẩm nổi bật
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập thời trang hiện đại với thiết kế độc đáo & chất
            lượng cao
          </p>
        </div>

        {/* 🧩 Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {products.map((product) => (
            <motion.div
              key={product.slug}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.3 }}
              className="group bg-white/90 rounded-2xl shadow-lg border border-white/50 overflow-hidden backdrop-blur-xl cursor-pointer hover:shadow-2xl flex flex-col"
              onClick={() => navigate(`/product/${product.slug}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  ✨ Hot
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors leading-relaxed mb-3">
                  {product.name}
                </h3>

                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    {(product as any).price?.toLocaleString("vi-VN")}₫
                  </span>
                  <div className="flex items-center space-x-1">
                    <Rate
                      disabled
                      allowHalf
                      defaultValue={product.ratingAverage || 5}
                      style={{ fontSize: 12 }}
                    />
                    <span className="text-xs text-gray-500 ml-1">
                      (
                      {product.ratingCount ||
                        Math.floor(Math.random() * 50) + 5}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 📄 Pagination */}
        <div className="flex justify-center">
          <div className="bg-white/90 rounded-2xl shadow-xl border border-white/50 px-6 py-4 backdrop-blur-xl">
            <Pagination
              current={currentPage}
              total={productData.length}
              pageSize={itemsPerPage}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total} sản phẩm`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
