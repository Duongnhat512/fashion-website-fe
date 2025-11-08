import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Rate,
  Tag,
  Card,
  Row,
  Col,
  Breadcrumb,
  Space,
  InputNumber,
  Select,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import type { Product, ProductVariant } from "../types/product.types";
import { productService } from "../services/productService";
import { inventoryService } from "../services/inventoryService";
import { useCart } from "../contexts/CartContext";
const { Option } = Select;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [mainImage, setMainImage] = useState("");
  const { addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [totalStock, setTotalStock] = useState<number>(0);

  useEffect(() => {
    // Scroll to top khi vào trang
    window.scrollTo(0, 0);

    const loadProduct = async () => {
      if (!slug) return;

      // Kiểm tra xem có product được truyền qua state không
      const stateProduct = location.state?.product as Product | undefined;

      if (stateProduct && stateProduct.slug === slug) {
        // Sử dụng product từ state
        console.log("✅ Sử dụng product từ state:", stateProduct);
        setProduct(stateProduct);
        if (stateProduct.variants?.length > 0) {
          setSelectedVariant(stateProduct.variants[0]);
          setMainImage(
            stateProduct.variants[0].imageUrl || stateProduct.imageUrl
          );
        } else {
          setMainImage(stateProduct.imageUrl);
        }
        loadRelatedProducts(stateProduct.name, stateProduct.id);
        setLoading(false);
      } else {
        // Không có product trong state
        console.error("❌ Không tìm thấy sản phẩm!");
        message.error("Không tìm thấy sản phẩm!");
        navigate("/");
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, navigate, location.state]);

  // Load inventory khi chọn variant
  useEffect(() => {
    const loadInventory = async () => {
      if (!selectedVariant?.id) return;

      try {
        const inventories = await inventoryService.getInventoryByVariant(
          selectedVariant.id
        );
        setInventoryData(inventories);

        // Tính tổng số lượng tồn kho
        const total = inventories.reduce(
          (sum, inv) => sum + (inv.onHand || 0),
          0
        );
        setTotalStock(total);
      } catch (error) {
        console.error("Lỗi khi tải thông tin tồn kho:", error);
        setInventoryData([]);
        setTotalStock(0);
      }
    };

    loadInventory();
  }, [selectedVariant]);

  // Hàm tải sản phẩm liên quan
  const loadRelatedProducts = async (
    productName: string,
    currentProductId: string
  ) => {
    try {
      const words = productName.trim().split(" ");

      // Thử tìm với 2 từ đầu tiên
      let searchKeyword = words.slice(0, 2).join(" ");
      let response = await productService.searchProducts({
        search: searchKeyword,
        limit: 20,
      });

      // Lọc sản phẩm có chứa chính xác từ khóa tìm kiếm
      let filtered = response.products
        .filter((p) => {
          if (p.id === currentProductId) return false;
          const productNameLower = p.name.toLowerCase();
          const keywordLower = searchKeyword.toLowerCase();
          // Kiểm tra từ khóa có xuất hiện chính xác trong tên sản phẩm
          return productNameLower.includes(keywordLower);
        })
        .slice(0, 4);

      // Nếu không đủ 4 sản phẩm, thử tìm lại với 1 từ đầu tiên
      if (filtered.length < 4 && words.length > 0) {
        searchKeyword = words[0];
        response = await productService.searchProducts({
          search: searchKeyword,
          limit: 20,
        });

        filtered = response.products
          .filter((p) => {
            if (p.id === currentProductId) return false;
            const productNameLower = p.name.toLowerCase();
            const keywordLower = searchKeyword.toLowerCase();
            return productNameLower.includes(keywordLower);
          })
          .slice(0, 4);
      }

      setRelatedProducts(filtered);
    } catch (error) {
      console.error("Lỗi tải sản phẩm liên quan:", error);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-purple-600" />
        <p className="ml-4 text-purple-600 font-semibold text-lg">
          Đang tải sản phẩm...
        </p>
      </div>
    );
  }

  // Hiển thị lỗi nếu không có sản phẩm sau khi load xong
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">
            Không tìm thấy sản phẩm
          </h2>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      message.warning("Vui lòng chọn phiên bản sản phẩm!");
      return;
    }

    // Kiểm tra tồn kho
    if (totalStock === 0) {
      message.error("Sản phẩm này hiện đã hết hàng!");
      return;
    }

    // Kiểm tra số lượng đặt có vượt quá tồn kho không
    if (quantity > totalStock) {
      message.warning(`Số lượng tồn kho chỉ còn ${totalStock} sản phẩm!`);
      return;
    }

    addToCart(
      {
        ...product,
        variants: [selectedVariant],
      },
      quantity
    );

    message.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        <Breadcrumb
          className="mb-6"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/products">Sản phẩm</Link> },
            { title: product.name },
          ]}
        />

        <div className="relative p-[3px] rounded-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 shadow-2xl">
          <div className="bg-white rounded-2xl overflow-hidden">
            <Row gutter={[0, 0]}>
              <Col xs={24} lg={10}>
                <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-8 min-h-full flex items-center justify-center">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full max-h-[500px] object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </Col>

              <Col xs={24} lg={14}>
                <div className="bg-white p-8">
                  <Space direction="vertical" size="middle" className="w-full">
                    <div>
                      <h1 className="text-4xl font-bold mb-3">
                        {product.name}
                      </h1>
                      <Tag color="blue" className="mb-4 text-base px-4 py-1">
                        {product.brand}
                      </Tag>
                    </div>

                    <div className="flex items-center gap-3">
                      <Rate
                        disabled
                        defaultValue={product.ratingAverage}
                        allowHalf
                        className="text-xl"
                      />
                      <span className="text-gray-600 text-base">
                        ({product.ratingCount} đánh giá)
                      </span>
                    </div>

                    {product.variants?.length > 0 && (
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg whitespace-nowrap">
                          Chọn phiên bản:
                        </span>
                        <Select
                          value={selectedVariant?.id}
                          onChange={(value) => {
                            const variant =
                              product.variants.find((v) => v.id === value) ||
                              null;
                            setSelectedVariant(variant);
                            if (variant)
                              setMainImage(
                                variant.imageUrl || product.imageUrl
                              );
                          }}
                          style={{ minWidth: 220 }}
                          size="large"
                        >
                          {product.variants.map((variant) => (
                            <Option key={variant.id} value={variant.id}>
                              <div className="flex items-center gap-2">
                                {variant.color?.hex && (
                                  <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                                    style={{
                                      backgroundColor: variant.color.hex,
                                    }}
                                  />
                                )}
                                <span className="text-base font-medium">
                                  {variant.color?.name || "Màu"} - Size{" "}
                                  {variant.size}
                                </span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {/* Hiển thị tồn kho */}
                    {selectedVariant && totalStock !== null && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-gray-700">
                            Tồn kho:
                          </span>
                          <span
                            className={`text-xl font-bold ${
                              totalStock > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {totalStock > 0
                              ? `${totalStock} sản phẩm`
                              : "Hết hàng"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {selectedVariant?.price && (
                        <div className="text-2xl text-gray-400 line-through font-medium">
                          {selectedVariant.price.toLocaleString("vi-VN")}₫
                        </div>
                      )}
                      {selectedVariant?.discountPrice && (
                        <div className="text-4xl font-bold text-red-600">
                          {selectedVariant.discountPrice.toLocaleString(
                            "vi-VN"
                          )}
                          ₫
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-gray-700 text-base leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>

                    <Space>
                      <Button
                        size="large"
                        icon={<MinusOutlined />}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={totalStock === 0}
                      />
                      <InputNumber
                        min={1}
                        max={totalStock > 0 ? totalStock : 0}
                        value={quantity}
                        onChange={(v) => setQuantity(v || 1)}
                        style={{ width: 100 }}
                        controls={false}
                        size="large"
                        className="text-lg"
                        disabled={totalStock === 0}
                      />
                      <Button
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={totalStock === 0 || quantity >= totalStock}
                      />
                    </Space>

                    <Space size="middle">
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        disabled={totalStock === 0}
                        className={`text-base font-medium px-8 ${
                          totalStock === 0
                            ? "bg-gray-400 border-gray-400 cursor-not-allowed"
                            : "bg-black hover:bg-gray-800 border-black"
                        }`}
                      >
                        {totalStock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                      </Button>
                      <Button
                        size="large"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        className="text-base font-medium px-6"
                      >
                        Quay lại
                      </Button>
                    </Space>
                  </Space>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-6 text-left bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {relatedProducts.map((p) => {
                const v = p.variants?.[0];

                return (
                  <div
                    key={p.id}
                    onClick={() =>
                      navigate(`/products/${p.slug}`, { state: { product: p } })
                    }
                    className="relative rounded-2xl overflow-hidden cursor-pointer
                    border border-transparent
                    bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300
                    transition-all duration-300 shadow-md hover:shadow-2xl group"
                  >
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
                        className="w-full aspect-[3/4] object-cover transition-transform duration-500 ease-out group-hover:scale-110"
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
                            navigate(`/products/${p.slug}`, {
                              state: { product: p },
                            });
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
                        <span className="text-lg font-bold text-gray-900">
                          {(v?.price || 0).toLocaleString("vi-VN")}₫
                        </span>
                        <div className="flex items-center gap-1">
                          <Rate
                            disabled
                            value={p.ratingAverage}
                            style={{
                              fontSize: 14,
                              color:
                                p.ratingAverage > 0 ? "#faad14" : "#d9d9d9",
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
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
