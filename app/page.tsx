"use client";

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Carousel, Rate } from "antd";
import { motion } from "framer-motion";
import { productService } from "@/services/product/product.service";
import { categoryService } from "@/services/category/category.service";
import type { Product } from "@/types/product.types";

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

const HomePage = () => {
  const router = useRouter();

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
    router.push(`/products/${p.slug}`);
  };

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

        const categoryRes = await categoryService.getTree();
        const parentCategories = categoryRes.data || [];
        setCategories(parentCategories);

        try {
          const newProductsRes = await productService.searchProducts({
            limit: 100,
            page: 1,
          });
          const allProducts = newProductsRes.products || [];

          const sortedByDate = [...allProducts].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          const newProds = sortedByDate.slice(0, 4);
          setNewProducts(newProds);
        } catch (error) {
          console.error("❌ Lỗi tải sản phẩm mới:", error);
        }

        try {
          const allProductsPromises = parentCategories.map(
            async (cat: Category) => {
              try {
                const res = await productService.searchProducts({
                  categoryId: cat.id,
                  limit: 1000,
                  page: 1,
                });
                return res.products || [];
              } catch (error) {
                console.error(`❌ Lỗi tải sản phẩm cho ${cat.name}:`, error);
                return [];
              }
            }
          );

          const allProductsArrays = await Promise.all(allProductsPromises);
          const allProducts = allProductsArrays.flat();

          const highDiscountProducts = allProducts.filter((product) => {
            const variant = product.variants?.[0];
            if (!variant) return false;

            const hasHighDiscount =
              variant.discountPercent && variant.discountPercent > 40;

            return hasHighDiscount;
          });

          let flashProducts: Product[] = [];

          if (highDiscountProducts.length >= 5) {
            flashProducts = highDiscountProducts.slice(0, 5);
          } else {
            flashProducts = [...highDiscountProducts];

            const remainingCount = 5 - flashProducts.length;

            const otherProducts = allProducts.filter(
              (product) =>
                !highDiscountProducts.some(
                  (highDiscountProduct) => highDiscountProduct.id === product.id
                )
            );

            const shuffledOtherProducts = otherProducts.sort(
              () => 0.5 - Math.random()
            );
            const additionalProducts = shuffledOtherProducts.slice(
              0,
              remainingCount
            );

            flashProducts = [...flashProducts, ...additionalProducts];
          }

          setFlashSaleProducts(flashProducts);
        } catch (error) {
          console.error("❌ Lỗi tải Flash Sales:", error);
        }

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

        {/* Badge giảm giá */}
        {v?.onSales && v.discountPercent && v.discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
            -{v.discountPercent}%
          </div>
        )}

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
        <div className="p-4 text-gray-900">
          <h3 className="font-semibold text-base line-clamp-2 min-h-[48px]">
            {p.name}
          </h3>

          {/* --- GIÁ --- */}
          <div className="mt-3 flex items-center gap-2">
            {hasDiscount ? (
              <>
                {/* Giá gốc bị gạch */}
                <span className="text-sm text-gray-500 line-through">
                  {(v?.price || 0).toLocaleString("vi-VN")}₫
                </span>

                {/* Giá giảm */}
                <span className="text-lg font-bold text-red-600">
                  {(v?.discountPrice || 0).toLocaleString("vi-VN")}₫
                </span>
              </>
            ) : (
              /* Giá thường */
              <span className="text-lg font-bold text-gray-900">
                {(v?.price || 0).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          {/* --- RATING --- */}
          <div className="flex items-center gap-1 mt-1">
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
    );
  };

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

        {/* Badge giảm giá */}
        {v?.onSales && v.discountPercent && v.discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
            -{v.discountPercent}%
          </div>
        )}

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
 cursor-pointer hover:bg-black/80 transition-all duration-300
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

          {/* --- GIÁ --- */}
          <div className="mt-3 flex items-center gap-2">
            {hasDiscount ? (
              <>
                {/* Giá gốc bị gạch */}
                <span className="text-sm text-gray-500 line-through">
                  {(v?.price || 0).toLocaleString("vi-VN")}₫
                </span>

                {/* Giá giảm */}
                <span className="text-lg font-bold text-red-600">
                  {(v?.discountPrice || 0).toLocaleString("vi-VN")}₫
                </span>
              </>
            ) : (
              /* Giá thường */
              <span className="text-lg font-bold text-gray-900">
                {(v?.price || 0).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          {/* --- RATING --- */}
          <div className="flex items-center gap-1 mt-1">
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
    );
  };

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

        {/* Badge giảm giá */}
        {v?.onSales && v.discountPercent && v.discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
            -{v.discountPercent}%
          </div>
        )}

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

          {/* --- GIÁ --- */}
          <div className="mt-3 flex items-center gap-2">
            {hasDiscount ? (
              <>
                {/* Giá gốc bị gạch */}
                <span className="text-sm text-gray-500 line-through">
                  {(v?.price || 0).toLocaleString("vi-VN")}₫
                </span>

                {/* Giá giảm */}
                <span className="text-lg font-bold text-red-600">
                  {(v?.discountPrice || 0).toLocaleString("vi-VN")}₫
                </span>
              </>
            ) : (
              /* Giá thường */
              <span className="text-lg font-bold text-gray-900">
                {(v?.price || 0).toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          {/* --- RATING --- */}
          <div className="flex items-center gap-1 mt-1">
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
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-600" />
        <p className="ml-4 text-gray-600 font-semibold text-lg">
          Đang tải sản phẩm...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-3 md:px-6 py-6 md:py-12">
        {/* 🖼 Carousel Banner */}
        <div className="mb-8 md:mb-12 relative p-[2px] md:p-[4px] rounded-[16px] md:rounded-[28px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">
          <div
            className="relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => router.push("/products")}
          >
            <Carousel autoplay autoplaySpeed={3000} effect="fade" dots>
              <div className="relative">
                <img
                  src="https://novelty.com.vn/public/uploads/images/5_1banner%20web%201425x528-op2.png"
                  className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[600px] object-cover"
                  alt="Banner 1"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white relative inline-block px-4">
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
                  className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[600px] object-cover"
                  alt="Banner 2"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white relative inline-block px-4">
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
                  className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[600px] object-cover"
                  alt="Banner 3"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white relative inline-block px-4">
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
          <div className="mb-8 md:mb-16">
            <div className="relative mb-6 md:mb-8 p-4 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 overflow-hidden">
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

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-4xl md:text-6xl animate-bounce">⚡</div>
                  <div>
                    <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">
                      FLASH SALES
                    </h2>
                    <p className="text-sm md:text-base text-white/90 font-semibold mt-1">
                      Giảm giá SỐC - Số lượng có hạn!
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
                  <span className="text-white font-bold text-sm md:text-lg">
                    KẾT THÚC TRONG:
                  </span>
                  <div className="flex gap-1 md:gap-2">
                    {[
                      { label: "GIỜ", value: timeLeft.hours },
                      { label: "PHÚT", value: timeLeft.minutes },
                      { label: "GIÂY", value: timeLeft.seconds },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="bg-white text-red-600 font-black text-lg md:text-2xl px-2 md:px-4 py-2 md:py-3 rounded-lg min-w-[50px] md:min-w-[70px] text-center shadow-lg">
                          {String(item.value).padStart(2, "0")}
                        </div>
                        <span className="text-white text-[10px] md:text-xs font-semibold mt-1">
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
          <div className="mb-8 md:mb-16">
            <div className="relative mb-6 md:mb-8 p-4 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
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

              <div className="relative flex items-center justify-center">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-4xl md:text-6xl animate-bounce">✨</div>
                  <div className="text-center">
                    <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">
                      SẢN PHẨM MỚI
                    </h2>
                    <p className="text-sm md:text-base text-white/90 font-semibold mt-1">
                      Thời trang mới nhất - Cập nhật hàng ngày!
                    </p>
                  </div>
                  <div className="text-4xl md:text-6xl animate-bounce">✨</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {newProducts.map((p) => renderNewProductCard(p))}
            </div>
          </div>
        )}

        {/* 📦 Các section theo danh mục */}
        {categories.map((category) => {
          const products = categoryProducts[category.id] || [];
          if (products.length === 0) return null;

          return (
            <div key={category.id} className="mb-8 md:mb-16">
              <div className="relative mb-6 md:mb-8 p-4 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                  <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="text-center">
                      <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">
                        Thời Trang {category.name}
                      </h2>
                      <p className="text-sm md:text-base text-white/90 font-semibold mt-1">
                        Khám phá phong cách độc đáo!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
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
