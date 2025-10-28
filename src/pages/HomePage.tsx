import { useNavigate } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import { Carousel, Rate } from "antd";
import { motion } from "framer-motion";

const HomePage = () => {
  const { products, searchQuery, loading } = useSearch();
  const navigate = useNavigate();
  const isSearching = searchQuery.trim() !== "";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600" />
        <p className="ml-4 text-purple-600 font-semibold text-lg">
          Đang tải sản phẩm...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
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

        <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {isSearching ? `Kết quả: "${searchQuery}"` : "Sản phẩm nổi bật"}
        </h2>

        {/* 🛍 Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.length > 0 ? (
            products.map((p) => {
              const v = p.variants?.[0];
              return (
                <motion.div
                  key={p.id}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/product/${p.slug}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
                >
                  <img
                    src={v?.imageUrl || p.imageUrl}
                    alt={p.name}
                    className="w-full aspect-[3/4] object-cover"
                  />

                  <div className="p-4 flex flex-col justify-between h-[140px]">
                    <h3 className="font-semibold text-gray-900 text-base line-clamp-2 min-h-[48px] flex items-start">
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
                            color: p.ratingAverage > 0 ? "#faad14" : "#d9d9d9",
                          }}
                        />
                        <span className="text-xs text-gray-500">
                          ({p.ratingCount || 0})
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
      </div>
    </div>
  );
};

export default HomePage;
