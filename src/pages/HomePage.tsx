import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, Rate } from "antd";
import { motion } from "framer-motion";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import type { Product } from "../types/product.types";

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

const HomePage = () => {
  const navigate = useNavigate();

  // � STATE
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{
    [key: string]: Product[];
  }>({});

  const handleToDetail = (p: Product) => {
    navigate(`/products/${p.slug}`, { state: { product: p } });
  };

  // 🧩 Load danh mục và sản phẩm theo từng danh mục
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách danh mục cha
        const categoryRes = await categoryService.getTree();
        const parentCategories = categoryRes.data || [];
        setCategories(parentCategories);

        // Load 4 sản phẩm cho mỗi danh mục cha
        const productPromises = parentCategories.map(async (cat: Category) => {
          try {
            const res = await productService.searchProducts({
              categoryId: cat.id,
              limit: 4,
              page: 1,
            });
            return { categoryId: cat.id, products: res.products };
          } catch (error) {
            console.error(`❌ Lỗi tải sản phẩm cho ${cat.name}:`, error);
            return { categoryId: cat.id, products: [] };
          }
        });

        const results = await Promise.all(productPromises);
        const productsMap: { [key: string]: Product[] } = {};
        results.forEach((result) => {
          productsMap[result.categoryId] = result.products;
        });

        setCategoryProducts(productsMap);
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🎨 Render Product Card
  const renderProductCard = (p: Product) => {
    const v = p.variants?.[0];
    const hasDiscount = v?.discountPrice && v?.discountPrice < v?.price;

    return (
      <div
        key={p.id}
        onClick={() => handleToDetail(p)}
        className="relative rounded-2xl overflow-hidden cursor-pointer
          border border-transparent
          bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300
          transition-all duration-300 shadow-md hover:shadow-2xl group"
      >
        {/* 🔥 Badge HOT */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg fire-badge">
              <span className="fire-emoji">🔥</span> HOT
            </div>
            <style>{`
              @keyframes fireGlow {
                0%, 100% { 
                  filter: drop-shadow(0 0 8px rgba(255, 69, 0, 0.8));
                  transform: scale(1);
                }
                50% { 
                  filter: drop-shadow(0 0 20px rgba(255, 140, 0, 1));
                  transform: scale(1.05);
                }
              }
              @keyframes fireFlicker {
                0%, 100% { 
                  transform: translateY(0px) scale(1);
                  filter: hue-rotate(0deg);
                }
                25% { 
                  transform: translateY(-2px) scale(1.1);
                  filter: hue-rotate(10deg);
                }
                50% { 
                  transform: translateY(-1px) scale(1.15);
                  filter: hue-rotate(-10deg);
                }
                75% { 
                  transform: translateY(-3px) scale(1.05);
                  filter: hue-rotate(5deg);
                }
              }
              .fire-badge {
                animation: fireGlow 1.5s ease-in-out infinite;
              }
              .fire-emoji {
                display: inline-block;
                animation: fireFlicker 0.8s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>

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
            className="w-full aspect-[3/4] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
                handleToDetail(p);
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
            <div className="flex flex-col gap-1">
              {hasDiscount ? (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    {(v?.price || 0).toLocaleString("vi-VN")}₫
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {(v?.discountPrice || 0).toLocaleString("vi-VN")}₫
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {(v?.price || 0).toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Rate
                disabled
                value={p.ratingAverage}
                style={{
                  fontSize: 14,
                  color: p.ratingAverage > 0 ? "#faad14" : "#d9d9d9",
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
        {/* 🖼 Carousel */}
        <div className="mb-12 relative p-[4px] rounded-[28px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">
          <div
            className="relative rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => navigate("/products")}
          >
            <Carousel autoplay autoplaySpeed={1000} effect="fade" dots>
              <div className="relative">
                <img
                  src="https://novelty.com.vn/public/uploads/images/5_1banner%20web%201425x528-op2.png"
                  className="w-full h-[600px] object-cover"
                  alt="Banner 1"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-5xl font-black text-white relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-lg opacity-75"></span>
                    <span
                      className="relative drop-shadow-[0_0_40px_rgba(168,85,247,1)] [text-shadow:_0_0_20px_rgb(168_85_247_/_80%),_0_0_40px_rgb(236_72_153_/_60%)]"
                      style={
                        {
                          WebkitTextStroke: "3px transparent",
                          backgroundImage:
                            "linear-gradient(90deg, rgb(147, 51, 234), rgb(236, 72, 153), rgb(8, 145, 178))",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                        } as React.CSSProperties
                      }
                    >
                      THỜI TRANG BOOBOO
                    </span>
                  </h1>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://pdcorel.com/wp-content/uploads/2023/06/29-Hoat-hinh-vector-pdcorel.com_-1.jpg"
                  className="w-full h-[600px] object-cover"
                  alt="Banner 2"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-5xl font-black text-white relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-lg opacity-75"></span>
                    <span
                      className="relative drop-shadow-[0_0_40px_rgba(168,85,247,1)] [text-shadow:_0_0_20px_rgb(168_85_247_/_80%),_0_0_40px_rgb(236_72_153_/_60%)]"
                      style={
                        {
                          WebkitTextStroke: "3px transparent",
                          backgroundImage:
                            "linear-gradient(90deg, rgb(147, 51, 234), rgb(236, 72, 153), rgb(8, 145, 178))",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                        } as React.CSSProperties
                      }
                    >
                      THỜI TRANG BOOBOO
                    </span>
                  </h1>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://lambanner.com/wp-content/uploads/2017/09/lambanner-thiet-ke-banner-thoi-trang1.jpg"
                  className="w-full h-[600px] object-cover"
                  alt="Banner 3"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-5xl font-black text-white relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-lg opacity-75"></span>
                    <span
                      className="relative drop-shadow-[0_0_40px_rgba(168,85,247,1)] [text-shadow:_0_0_20px_rgb(168_85_247_/_80%),_0_0_40px_rgb(236_72_153_/_60%)]"
                      style={
                        {
                          WebkitTextStroke: "3px transparent",
                          backgroundImage:
                            "linear-gradient(90deg, rgb(147, 51, 234), rgb(236, 72, 153), rgb(8, 145, 178))",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                        } as React.CSSProperties
                      }
                    >
                      THỜI TRANG BOOBOO
                    </span>
                  </h1>
                </div>
              </div>
            </Carousel>
          </div>
        </div>

        {/* 📦 Các section theo danh mục */}
        {categories.map((category) => {
          const products = categoryProducts[category.id] || [];
          if (products.length === 0) return null;

          return (
            <div key={category.id} className="mb-16">
              {/* Tiêu đề danh mục */}
              <div className="flex items-center justify-center mb-8">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 bg-clip-text text-transparent text-center py-4">
                  Thời Trang {category.name}
                </h2>
              </div>

              {/* Grid sản phẩm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((p) => renderProductCard(p))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;
