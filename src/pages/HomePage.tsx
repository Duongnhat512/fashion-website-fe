import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { useCart } from "../contexts/CartContext";
import { Carousel } from "antd";

import type {
  Product,
  PaginatedProductsResponse,
} from "../types/product.types";

// Mock data nếu API rỗng
const fallbackProducts: Product[] = [
  {
    id: "1",
    slug: "ao-so-mi-casio",
    name: "Áo sơ mi Casio",
    shortDescription: "Thiết kế đơn giản, sang trọng",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Casio",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.5,
    ratingCount: 123,
    variants: [
      {
        id: "1-1",
        size: "M",
        price: 1200000,
        stock: 10,
        color: { id: "1", name: "Trắng", code: "#FFFFFF" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    slug: "ao-so-mi-seiko",
    name: "Áo sơ mi Seiko",
    shortDescription: "Phong cách Nhật Bản tinh tế",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Seiko",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.8,
    ratingCount: 98,
    variants: [
      {
        id: "2-1",
        size: "M",
        price: 2500000,
        stock: 5,
        color: { id: "2", name: "Xanh", code: "#0000FF" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    slug: "ao-so-mi-rolex",
    name: "Áo sơ mi Rolex",
    shortDescription: "Đẳng cấp doanh nhân",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Rolex",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 5.0,
    ratingCount: 55,
    variants: [
      {
        id: "3-1",
        size: "L",
        price: 50000000,
        stock: 2,
        color: { id: "3", name: "Đen", code: "#000000" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    slug: "ao-so-mi-louis-vuitton",
    name: "Áo sơ mi Louis Vuitton",
    shortDescription: "Sang trọng, thời thượng",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Louis Vuitton",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.9,
    ratingCount: 210,
    variants: [
      {
        id: "4-1",
        size: "M",
        price: 7500000,
        stock: 8,
        color: { id: "4", name: "Trắng", code: "#FFFFFF" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    slug: "ao-so-mi-gucci",
    name: "Áo sơ mi Gucci",
    shortDescription: "Tinh tế và đẳng cấp",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Gucci",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.7,
    ratingCount: 180,
    variants: [
      {
        id: "5-1",
        size: "L",
        price: 9500000,
        stock: 6,
        color: { id: "5", name: "Đỏ", code: "#FF0000" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    slug: "ao-so-mi-dior",
    name: "Áo sơ mi Dior",
    shortDescription: "Thời trang đỉnh cao từ Pháp",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Dior",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.6,
    ratingCount: 95,
    variants: [
      {
        id: "6-1",
        size: "M",
        price: 8800000,
        stock: 4,
        color: { id: "6", name: "Vàng", code: "#FFFF00" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    slug: "ao-so-mi-uniqlo",
    name: "Áo sơ mi Uniqlo",
    shortDescription: "Đơn giản và tiện dụng",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Uniqlo",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.4,
    ratingCount: 140,
    variants: [
      {
        id: "7-1",
        size: "S",
        price: 890000,
        stock: 15,
        color: { id: "7", name: "Xám", code: "#808080" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    slug: "ao-so-mi-zara",
    name: "Áo sơ mi Zara",
    shortDescription: "Phong cách châu Âu trẻ trung",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "Zara",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.3,
    ratingCount: 160,
    variants: [
      {
        id: "8-1",
        size: "M",
        price: 1200000,
        stock: 12,
        color: { id: "8", name: "Xanh Navy", code: "#000080" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    slug: "ao-so-mi-hm",
    name: "Áo sơ mi H&M",
    shortDescription: "Thời trang nhanh, giá hợp lý",
    imageUrl:
      "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
    brand: "H&M",
    categoryId: "1",
    status: "active",
    tags: "ao-so-mi",
    ratingAverage: 4.2,
    ratingCount: 200,
    variants: [
      {
        id: "9-1",
        size: "L",
        price: 650000,
        stock: 20,
        color: { id: "9", name: "Hồng", code: "#FFC0CB" },
        images: [],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
    page: 1,
    limit: 9,
  });

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const itemsPerPage = 9;

  // Lấy sản phẩm
  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedProductsResponse =
        await productService.getAllProducts(page, itemsPerPage);

      if (!response.products || response.products.length === 0) {
        setProducts(fallbackProducts);
        setPagination({
          total: fallbackProducts.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          page: 1,
          limit: itemsPerPage,
        });
      } else {
        setProducts(response.products);
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
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
    </div>
  );
};

export default HomePage;
