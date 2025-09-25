import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Product } from "../types/product.types";

import { addToCart } from "../utils/cart";
export default function ProductDetail() {
  const fallbackProducts: Product[] = [
    {
      id: "1",
      slug: "ao-so-mi-casio",
      name: "Áo sơ mi Casio",
      shortDescription: "Thiết kế đơn giản, sang trọng",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Casio",
      ratingAverage: 4.5,
      ratingCount: 123,
      price: 1200000,
    },
    {
      id: "2",
      slug: "ao-so-mi-seiko",
      name: "Áo sơ mi Seiko",
      shortDescription: "Phong cách Nhật Bản tinh tế",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Seiko",
      ratingAverage: 4.8,
      ratingCount: 98,
      price: 2500000,
    },
    {
      id: "3",
      slug: "ao-so-mi-rolex",
      name: "Áo sơ mi Rolex",
      shortDescription: "Đẳng cấp doanh nhân",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Rolex",
      ratingAverage: 5.0,
      ratingCount: 55,
      price: 50000000,
    },
    {
      id: "4",
      slug: "ao-so-mi-louis-vuitton",
      name: "Áo sơ mi Louis Vuitton",
      shortDescription: "Sang trọng, thời thượng",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Louis Vuitton",
      ratingAverage: 4.9,
      ratingCount: 210,
      price: 7500000,
    },
    {
      id: "5",
      slug: "ao-so-mi-gucci",
      name: "Áo sơ mi Gucci",
      shortDescription: "Tinh tế và đẳng cấp",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Gucci",
      ratingAverage: 4.7,
      ratingCount: 180,
      price: 9500000,
    },
    {
      id: "6",
      slug: "ao-so-mi-dior",
      name: "Áo sơ mi Dior",
      shortDescription: "Thời trang đỉnh cao từ Pháp",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Dior",
      ratingAverage: 4.6,
      ratingCount: 95,
      price: 8800000,
    },
    {
      id: "7",
      slug: "ao-so-mi-uniqlo",
      name: "Áo sơ mi Uniqlo",
      shortDescription: "Đơn giản và tiện dụng",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Uniqlo",
      ratingAverage: 4.4,
      ratingCount: 140,
      price: 890000,
    },
    {
      id: "8",
      slug: "ao-so-mi-zara",
      name: "Áo sơ mi Zara",
      shortDescription: "Phong cách châu Âu trẻ trung",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "Zara",
      ratingAverage: 4.3,
      ratingCount: 160,
      price: 1200000,
    },
    {
      id: "9",
      slug: "ao-so-mi-hm",
      name: "Áo sơ mi H&M",
      shortDescription: "Thời trang nhanh, giá hợp lý",
      imageUrl:
        "https://product.hstatic.net/200000163591/product/ao-so-mi-nam-wls241__1__6166e6338acf4419a324c0f30edd7e04_master.png",
      brand: "H&M",
      ratingAverage: 4.2,
      ratingCount: 200,
      price: 650000,
    },
  ];

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    if (!id) return;
    const found = fallbackProducts.find((p) => p.id === id);
    setProduct(found || null);
    if (found) {
      setMainImage(found.imageUrl);
      setRelatedProducts(
        fallbackProducts.filter((p) => p.id !== found.id).slice(0, 4)
      );
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Không tìm thấy sản phẩm
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link to="/shop" className="hover:underline">
          Shop
        </Link>
        <span className="px-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-[520px] object-cover rounded-lg shadow"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="mt-2 text-sm text-gray-600">
            ⭐ {product.ratingAverage} · {product.ratingCount} đánh giá
          </div>
          <div className="mt-4 text-2xl font-bold text-red-600">
            {product.price?.toLocaleString("vi-VN")}₫
          </div>
          <p className="mt-6 text-gray-700">{product.shortDescription}</p>
          <p className="mt-2 text-gray-500 italic">
            Thương hiệu: {product.brand}
          </p>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => addToCart(product)}
              className="px-6 py-3 bg-black text-white rounded shadow"
            >
              Thêm vào giỏ
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-3 border rounded"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="bg-white p-3 rounded shadow hover:shadow-lg transition-shadow"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-28 object-cover rounded"
                />
                <div className="mt-2 text-sm font-medium truncate">
                  {p.name}
                </div>
                <div className="text-sm text-gray-600">{p.brand}</div>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-500 ml-1">
                    {p.ratingAverage} ({p.ratingCount})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
