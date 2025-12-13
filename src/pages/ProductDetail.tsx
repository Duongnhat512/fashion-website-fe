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
import { useCart } from "../contexts/CartContext";
const { Option } = Select;
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import LoginDialog from "../components/LoginDialog";
import ProductReviews from "../components/ProductReviews";

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
  const notify = useNotification();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadProduct = async () => {
      if (!slug) return;

      setLoading(true);

      try {
        const stateProduct = location.state?.product as Product | undefined;

        if (stateProduct && stateProduct.slug === slug) {
          setProduct(stateProduct);
          if (stateProduct.variants?.length > 0) {
            setSelectedVariant(stateProduct.variants[0]);
            setMainImage(
              stateProduct.variants[0].imageUrl || stateProduct.imageUrl
            );
          } else {
            setMainImage(stateProduct.imageUrl);
          }

          if (stateProduct.variants && stateProduct.categoryId) {
            loadRelatedProducts(stateProduct.name, stateProduct.id);
            if (user) {
              const token = authService.getToken();
              if (token) {
                try {
                  await productService.getProductById(stateProduct.id, token);
                } catch (error) {
                  console.error("❌ Lỗi ghi nhận lượt xem:", error);
                }
              }
            }
            setLoading(false);
            return;
          }
        }

        if (!stateProduct) {
          throw new Error("No product data available");
        }
        const token = user ? authService.getToken() : undefined;
        const fullProduct = await productService.getProductById(
          stateProduct.id,
          token || ""
        );

        setProduct(fullProduct);
        if (fullProduct.variants?.length > 0) {
          setSelectedVariant(fullProduct.variants[0]);
          setMainImage(
            fullProduct.variants[0].imageUrl || fullProduct.imageUrl
          );
        } else {
          setMainImage(fullProduct.imageUrl);
        }
        loadRelatedProducts(fullProduct.name, fullProduct.id);
      } catch (error) {
        console.error("❌ Lỗi khi tải sản phẩm:", error);
        notify.error("Không tìm thấy sản phẩm!");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, navigate]);

  const loadRelatedProducts = async (
    productName: string,
    currentProductId: string
  ) => {
    try {
      const words = productName.trim().split(" ");

      let searchKeyword = words.slice(0, 2).join(" ");
      let response = await productService.searchProducts({
        search: searchKeyword,
        limit: 20,
      });

      let filtered = response.products
        .filter((p) => {
          if (p.id === currentProductId) return false;
          const productNameLower = p.name.toLowerCase();
          const keywordLower = searchKeyword.toLowerCase();
          return productNameLower.includes(keywordLower);
        })
        .slice(0, 4);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-700" />
        <p className="ml-4 text-gray-700 font-semibold text-lg">
          Đang tải sản phẩm...
        </p>
      </div>
    );
  }

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
    if (!user) {
      notify.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      setShowLoginDialog(true);
      return;
    }

    if (!selectedVariant) {
      notify.warning("Vui lòng chọn phiên bản sản phẩm!");
      return;
    }

    addToCart(
      {
        ...product,
        variants: [selectedVariant],
      },
      quantity
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        <Breadcrumb
          className="mb-6"
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/products">Sản phẩm</Link> },
            { title: product.name },
          ]}
        />

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <div className="bg-white rounded-2xl overflow-hidden">
            <Row gutter={[0, 0]}>
              <Col xs={24} lg={10}>
                <div className="bg-gray-50 p-8 min-h-full flex items-center justify-center">
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
                      {product.brand && (
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-gray-700 m-0">
                            Thương hiệu:
                          </h2>
                          <Tag color="blue" className="text-base px-4 py-1 m-0">
                            {product.brand}
                          </Tag>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Rate
                        disabled
                        defaultValue={product.ratingAverage}
                        allowHalf
                        className="text-xl"
                      />
                      <span className="text-gray-600 text-base">
                        {product.ratingCount > 0
                          ? `(${product.ratingCount} đánh giá)`
                          : "(Chưa có đánh giá)"}
                      </span>
                    </div>

                    {product.variants?.length > 0 && (
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg whitespace-nowrap">
                          Chọn phiên bản:
                        </span>
                        <Select
                          value={selectedVariant?.id}
                          onChange={async (value) => {
                            const variant =
                              product.variants.find((v) => v.id === value) ||
                              null;
                            setSelectedVariant(variant);
                            if (variant)
                              setMainImage(
                                variant.imageUrl || product.imageUrl
                              );

                            if (user && variant) {
                              const token = authService.getToken();
                              if (token) {
                                try {
                                  await productService.getProductById(
                                    product.id,
                                    token
                                  );
                                } catch (error) {
                                  console.error(
                                    "❌ Lỗi ghi nhận lượt xem variant:",
                                    error
                                  );
                                }
                              }
                            }
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

                    <div className="flex items-center gap-4">
                      {/* Nếu có giảm giá */}
                      {selectedVariant &&
                      selectedVariant.discountPrice > 0 &&
                      selectedVariant.discountPrice < selectedVariant.price ? (
                        <>
                          <div className="text-2xl text-gray-400 line-through font-medium">
                            {selectedVariant.price.toLocaleString("vi-VN")}₫
                          </div>

                          <div className="text-4xl font-bold text-red-600">
                            {selectedVariant.discountPrice.toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </div>
                        </>
                      ) : (
                        <div className="text-4xl font-bold text-gray-900">
                          {selectedVariant?.price.toLocaleString("vi-VN")}₫
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-gray-700 text-base leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>

                    <Space>
                      <Button
                        size="large"
                        icon={<MinusOutlined />}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      />
                      <InputNumber
                        min={1}
                        max={selectedVariant?.stock || 999}
                        value={quantity}
                        onChange={(v) => setQuantity(v || 1)}
                        style={{ width: 100 }}
                        controls={false}
                        size="large"
                        className="text-lg"
                      />
                      <Button
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={
                          selectedVariant?.stock
                            ? quantity >= selectedVariant.stock
                            : false
                        }
                      />
                    </Space>

                    <Space size="middle">
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        className="text-base font-medium px-8 bg-black hover:bg-gray-800 border-black"
                      >
                        Thêm vào giỏ hàng
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
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-left text-gray-800">
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
                    border border-gray-200
                    bg-white
                    transition-all duration-300 shadow-sm hover:shadow-xl group"
                  >
                    {/* 🖼 Ảnh sản phẩm */}
                    <motion.div
                      className="relative overflow-hidden"
                      initial="hidden"
                      whileHover="visible"
                      variants={{ hidden: {}, visible: {} }}
                    >
                      {/* Badge giảm giá */}
                      {v?.onSales &&
                        v.discountPercent &&
                        v.discountPercent > 0 && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                            -{v.discountPercent}%
                          </div>
                        )}

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
border border-white/20 cursor-pointer hover:bg-black/80 transition-all duration-300
"
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
                    <div className="p-4 text-gray-900">
                      <h3 className="font-semibold text-base line-clamp-2 min-h-[48px]">
                        {p.name}
                      </h3>

                      {/* --- GIÁ --- */}
                      <div className="mt-3 flex items-center gap-2">
                        {v &&
                        v.discountPrice > 0 &&
                        v.discountPrice < v.price ? (
                          <>
                            {/* Giá gốc bị gạch */}
                            <span className="text-sm text-gray-500 line-through">
                              {v.price.toLocaleString("vi-VN")}₫
                            </span>

                            {/* Giá giảm */}
                            <span className="text-lg font-bold text-red-600">
                              {v.discountPrice.toLocaleString("vi-VN")}₫
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
              })}
            </div>
          </div>
        )}

        {/* Phần Đánh giá - Đặt dưới sản phẩm liên quan */}
        {product && (
          <ProductReviews productId={product.id} productName={product.name} />
        )}
      </div>

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
}
