import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { useCart } from "../contexts/CartContext";
import { Carousel, Pagination, Rate } from "antd";

import type {
  Product,
  PaginatedProductsResponse,
} from "../types/product.types";
import productData from "../data/products.json"; // ✅ fallback offline data

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const itemsPerPage = 16;

  // Fetch products
  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);

      // Gọi API
      const response: PaginatedProductsResponse =
        await productService.getAllProducts(page, itemsPerPage);

      if (response?.products?.length) {
        setProducts(response.products);
      } else {
        // fallback sang products.json
        const startIndex = (page - 1) * itemsPerPage;
        setProducts(productData.slice(startIndex, startIndex + itemsPerPage));
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      const startIndex = (page - 1) * itemsPerPage;
      setProducts(productData.slice(startIndex, startIndex + itemsPerPage));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Banner Carousel */}
      <div className="mb-10">
        <Carousel autoplay autoplaySpeed={3000} effect="fade" dots>
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

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <motion.div
            key={product.slug} // ✅ dùng slug
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden relative group cursor-pointer"
            onClick={() => navigate(`/product/${product.slug}`)} // ✅ điều hướng theo slug
          >
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Overlay nút MUA NGAY */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button
                className="px-6 py-2 bg-black text-white font-semibold rounded transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
              >
                MUA NGAY →
              </button>
            </div>

            <div className="p-5">
              <h2 className="text-lg font-semibold mb-2 line-clamp-1">
                {product.name}
              </h2>
              {/* <p className="text-gray-600 text-sm line-clamp-2">
                {product.shortDescription}
              </p> */}
              <div className="flex items-center justify-between mt-3 text-sm">
                <Rate
                  disabled
                  allowHalf
                  defaultValue={product.ratingAverage || 0}
                />
                <span className="ml-2 text-gray-600">
                  ({product.ratingCount || 0} đánh giá)
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10">
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
  );
};

export default HomePage;
