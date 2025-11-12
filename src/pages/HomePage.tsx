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
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const handleToDetail = (p: Product) => {
    navigate(`/products/${p.slug}`, { state: { product: p } });
  };

  // ⏰ Countdown timer - đếm ngược về 0h
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách danh mục cha
        const categoryRes = await categoryService.getTree();
        const parentCategories = categoryRes.data || [];
        setCategories(parentCategories);

        // Load 4 sản phẩm mới nhất từ TẤT CẢ sản phẩm
        try {
          const newProductsRes = await productService.searchProducts({
            limit: 100, // Lấy nhiều để có thể sắp xếp
            page: 1,
          });
          const allProducts = newProductsRes.products || [];

          // Sắp xếp theo createdAt giảm dần và lấy 4 sản phẩm mới nhất
          const sortedByDate = [...allProducts].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // Mới nhất trước
          });
          const newProds = sortedByDate.slice(0, 4);
          setNewProducts(newProds);
        } catch (error) {
          console.error("❌ Lỗi tải sản phẩm mới:", error);
        }

        // Load sản phẩm cho Flash Sales
        if (parentCategories.length > 0) {
          try {
            const firstCategory = parentCategories[0];
            const flashRes = await productService.searchProducts({
              categoryId: firstCategory.id,
              limit: 20,
              page: 1,
            });
            const allFlashProducts = flashRes.products || [];

            // Lấy 8 sản phẩm từ vị trí thứ 5 đến 12 từ cuối (bỏ 4 cái cuối)
            const flashProducts = allFlashProducts.slice(-12, -4);
            setFlashSaleProducts(flashProducts);
          } catch (error) {
            console.error("❌ Lỗi tải Flash Sales:", error);
          }
        }

        // Load 4 sản phẩm cuối cho mỗi danh mục cha
        const productPromises = parentCategories.map(async (cat: Category) => {
          try {
            const res = await productService.searchProducts({
              categoryId: cat.id,
              limit: 20,
              page: 1,
            });

            const allProducts = res.products || [];
            const lastFourProducts = allProducts.slice(-4);

            return { categoryId: cat.id, products: lastFourProducts };
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

  // 🎨 Render Product Card (HOT)
  const renderProductCard = (p: Product) => {
    const v = p.variants?.[0];
    const hasDiscount = v?.discountPrice && v?.discountPrice < v?.price;

    return (
      <div
        key={p.id}
        onClick={() => handleToDetail(p)}
        className="relative rounded-2xl overflow-hidden cursor-pointer
    bg-white border border-gray-200
    transition-all duration-300 shadow-sm hover:shadow-xl group"
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
                bg-black/60 backdrop-blur-sm text-white font-semibold uppercase tracking-wide text-sm
rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.35)]
border border-white/20 cursor-pointer hover:bg-black/80 transition-all duration-300"
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

  // ⚡ Render Flash Sale Card (SIÊU HOT)
  const renderFlashSaleCard = (p: Product) => {
    const v = p.variants?.[0];
    const hasDiscount = v?.discountPrice && v?.discountPrice < v?.price;

    return (
      <div
        key={p.id}
        onClick={() => handleToDetail(p)}
        className="relative rounded-2xl overflow-hidden cursor-pointer
    bg-white border border-gray-200
    transition-all duration-300 shadow-sm hover:shadow-xl group"
      >
        {/* ⚡ Badge SIÊU HOT */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg lightning-badge">
              <span className="lightning-emoji">⚡</span> SIÊU HOT
            </div>
            <style>{`
              @keyframes lightningGlow {
                0%, 100% { 
                  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.9));
                  transform: scale(1) rotate(0deg);
                }
                50% { 
                  filter: drop-shadow(0 0 25px rgba(255, 165, 0, 1));
                  transform: scale(1.08) rotate(2deg);
                }
              }
              @keyframes lightningStrike {
                0%, 90%, 100% { 
                  transform: translateY(0px) scale(1) rotate(0deg);
                  filter: brightness(1);
                }
                95% { 
                  transform: translateY(-3px) scale(1.2) rotate(-10deg);
                  filter: brightness(1.5);
                }
              }
              .lightning-badge {
                animation: lightningGlow 1.2s ease-in-out infinite;
              }
              .lightning-emoji {
                display: inline-block;
                animation: lightningStrike 1.5s ease-in-out infinite;
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
rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.35)]
border cursor-pointer hover:bg-black/80 transition-all duration-300
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

  // ✨ Render New Product Card (NEW)
  const renderNewProductCard = (p: Product) => {
    const v = p.variants?.[0];
    const hasDiscount = v?.discountPrice && v?.discountPrice < v?.price;

    return (
      <div
        key={p.id}
        onClick={() => handleToDetail(p)}
        className="relative rounded-2xl overflow-hidden cursor-pointer
    bg-white border border-gray-200
    transition-all duration-300 shadow-sm hover:shadow-xl group"
      >
        {/* ✨ Badge NEW */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg new-badge">
              <span className="new-emoji">✨</span> NEW
            </div>
            <style>{`
              @keyframes newGlow {
                0%, 100% { 
                  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8));
                  transform: scale(1);
                }
                50% { 
                  filter: drop-shadow(0 0 20px rgba(20, 184, 166, 1));
                  transform: scale(1.05);
                }
              }
              @keyframes sparkle {
                0%, 100% { 
                  transform: rotate(0deg) scale(1);
                  opacity: 1;
                }
                25% { 
                  transform: rotate(90deg) scale(1.2);
                  opacity: 0.8;
                }
                50% { 
                  transform: rotate(180deg) scale(1.1);
                  opacity: 1;
                }
                75% { 
                  transform: rotate(270deg) scale(1.15);
                  opacity: 0.9;
                }
              }
              .new-badge {
                animation: newGlow 1.5s ease-in-out infinite;
              }
              .new-emoji {
                display: inline-block;
                animation: sparkle 2s ease-in-out infinite;
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
rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.35)]
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
        {/* 🖼 Carousel Banner */}
        <div className="mb-12 relative p-[4px] rounded-[28px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">
          <div
            className="relative rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => navigate("/products")}
          >
            <Carousel autoplay autoplaySpeed={3000} effect="fade" dots>
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

        {/* ⚡ FLASH SALES Section */}
        {flashSaleProducts.length > 0 && (
          <div className="mb-16">
            <div className="relative mb-8 p-8 rounded-3xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
              </div>

              <style>{`
                @keyframes blob {
                  0%, 100% { transform: translate(0px, 0px) scale(1); }
                  33% { transform: translate(30px, -50px) scale(1.1); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                  animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                  animation-delay: 2s;
                }
                .animation-delay-4000 {
                  animation-delay: 4s;
                }
              `}</style>

              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-6xl animate-bounce">⚡</div>
                  <div>
                    <h2 className="text-4xl font-black text-white drop-shadow-lg">
                      FLASH SALES
                    </h2>
                    <p className="text-white/90 font-semibold mt-1">
                      Giảm giá SỐC - Số lượng có hạn!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">
                    KẾT THÚC TRONG:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { label: "GIỜ", value: timeLeft.hours },
                      { label: "PHÚT", value: timeLeft.minutes },
                      { label: "GIÂY", value: timeLeft.seconds },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="bg-white text-red-600 font-black text-2xl px-4 py-3 rounded-lg min-w-[70px] text-center shadow-lg">
                          {String(item.value).padStart(2, "0")}
                        </div>
                        <span className="text-white text-xs font-semibold mt-1">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Carousel
                autoplay
                autoplaySpeed={2000}
                slidesToShow={4}
                slidesToScroll={1}
                infinite
                dots={false}
                responsive={[
                  {
                    breakpoint: 1024,
                    settings: { slidesToShow: 3 },
                  },
                  {
                    breakpoint: 768,
                    settings: { slidesToShow: 2 },
                  },
                  {
                    breakpoint: 480,
                    settings: { slidesToShow: 1 },
                  },
                ]}
              >
                {flashSaleProducts.map((p) => (
                  <div key={p.id} className="px-2">
                    {renderFlashSaleCard(p)}
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        )}

        {/* ✨ NEW PRODUCTS Section */}
        {newProducts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-3">
                <span className="text-5xl">✨</span>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  SẢN PHẨM MỚI
                </h2>
                <span className="text-5xl">✨</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newProducts.map((p) => renderNewProductCard(p))}
            </div>
          </div>
        )}

        {/* 📦 Các section theo danh mục */}
        {categories.map((category) => {
          const products = categoryProducts[category.id] || [];
          if (products.length === 0) return null;

          return (
            <div key={category.id} className="mb-16">
              <div className="flex items-center justify-center mb-8">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 bg-clip-text text-transparent text-center py-4">
                  Thời Trang {category.name}
                </h2>
              </div>

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
