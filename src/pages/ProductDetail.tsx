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
  Input,
  Avatar,
  Divider,
  Empty,
  Pagination,
  Popconfirm,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  MinusOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import type { Product, ProductVariant } from "../types/product.types";
import { productService } from "../services/productService";
import { useCart } from "../contexts/CartContext";
const { Option } = Select;
import { useNotification } from "../components/NotificationProvider";
import { reviewService, type Review } from "../services/reviewService";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import LoginDialog from "../components/LoginDialog";
const { TextArea } = Input;

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

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Edit review states
  const { user } = useAuth();
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewComment, setEditReviewComment] = useState("");

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
        notify.error("Không tìm thấy sản phẩm!");
        navigate("/");
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, navigate, location.state]);

  // Load inventory khi chọn variant - REMOVED: lấy stock trực tiếp từ variant

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

  // Load reviews
  const loadReviews = async (productId: string, page: number = 1) => {
    try {
      setReviewsLoading(true);
      const data = await reviewService.getProductReviews(productId, page, 10);
      setReviews(data.reviews);
      setReviewTotal(data.pagination.total);
      setReviewPage(page);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Load reviews khi product thay đổi
  useEffect(() => {
    if (product?.id) {
      loadReviews(product.id);
    }
  }, [product?.id]);

  // Start editing review
  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditReviewRating(review.rating);
    setEditReviewComment(review.comment);
  };

  // Cancel editing
  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditReviewRating(5);
    setEditReviewComment("");
  };

  // Update review
  const handleUpdateReview = async (reviewId: string) => {
    const token = authService.getToken();
    if (!token) {
      notify.warning("Vui lòng đăng nhập!");
      setShowLoginDialog(true);
      return;
    }

    if (!editReviewComment.trim()) {
      notify.warning("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      await reviewService.updateReview(
        reviewId,
        {
          rating: editReviewRating,
          comment: editReviewComment.trim(),
        },
        token
      );

      notify.success("Cập nhật đánh giá thành công!");
      cancelEditReview();

      // Reload reviews
      if (product?.id) {
        loadReviews(product.id, reviewPage);
      }
    } catch (error: any) {
      notify.error(error.message || "Không thể cập nhật đánh giá!");
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    const token = authService.getToken();
    if (!token) {
      notify.warning("Vui lòng đăng nhập!");
      setShowLoginDialog(true);
      return;
    }

    try {
      await reviewService.deleteReview(reviewId, token);
      notify.success("Xóa đánh giá thành công!");

      // Reload reviews
      if (product?.id) {
        loadReviews(product.id, reviewPage);
      }
    } catch (error: any) {
      notify.error(error.message || "Không thể xóa đánh giá!");
    }
  };

  // Hiển thị loading
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
    // Kiểm tra đăng nhập trước
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
                        // Nếu không giảm giá → chỉ hiển thị price
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
                        disabled={(selectedVariant?.stock || 0) === 0}
                      />
                      <InputNumber
                        min={1}
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
                          (selectedVariant?.stock || 0) === 0 ||
                          quantity >= (selectedVariant?.stock || 0)
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

        {/* Phần Đánh giá - Đặt dưới sản phẩm liên quan */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Đánh giá sản phẩm
          </h2>

          {/* Thông báo: Chỉ đánh giá qua đơn hàng đã hoàn thành */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Bạn chỉ có thể đánh giá sản phẩm sau
              khi đơn hàng được hoàn thành. Vui lòng truy cập{" "}
              <Link
                to="/orders"
                className="text-blue-600 font-semibold underline"
              >
                Quản lý đơn hàng
              </Link>{" "}
              để đánh giá sản phẩm đã mua.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Các đánh giá ({reviewTotal})
            </h3>

            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-700 mx-auto mb-4" />
                <p className="text-gray-600">Đang tải đánh giá...</p>
              </div>
            ) : reviews.length === 0 ? (
              <Empty description="Chưa có đánh giá nào" className="py-8" />
            ) : (
              <div className="space-y-4">
                {/* Hiển thị 5 đánh giá đầu hoặc tất cả nếu showAllReviews = true */}
                {(showAllReviews ? reviews : reviews.slice(0, 5)).map(
                  (review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          size={48}
                          src={review.userAvatar}
                          icon={<UserOutlined />}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {review.userName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {editingReviewId === review.id ? (
                                <Rate
                                  value={editReviewRating}
                                  onChange={setEditReviewRating}
                                  style={{ fontSize: 16 }}
                                />
                              ) : (
                                <Rate
                                  disabled
                                  value={review.rating}
                                  style={{ fontSize: 16 }}
                                />
                              )}
                              {/* Show edit/delete buttons if user owns this review */}
                              {user && user.id === review.userId && (
                                <Space size="small">
                                  {editingReviewId === review.id ? (
                                    <>
                                      <Button
                                        type="primary"
                                        size="small"
                                        icon={<CheckOutlined />}
                                        onClick={() =>
                                          handleUpdateReview(review.id)
                                        }
                                      >
                                        Lưu
                                      </Button>
                                      <Button
                                        size="small"
                                        icon={<CloseOutlined />}
                                        onClick={cancelEditReview}
                                      >
                                        Hủy
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => startEditReview(review)}
                                      />
                                      <Popconfirm
                                        title="Xóa đánh giá"
                                        description="Bạn có chắc chắn muốn xóa đánh giá này?"
                                        onConfirm={() =>
                                          handleDeleteReview(review.id)
                                        }
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                      >
                                        <Button
                                          type="text"
                                          danger
                                          size="small"
                                          icon={<DeleteOutlined />}
                                        />
                                      </Popconfirm>
                                    </>
                                  )}
                                </Space>
                              )}
                            </div>
                          </div>
                          {editingReviewId === review.id ? (
                            <TextArea
                              value={editReviewComment}
                              onChange={(e) =>
                                setEditReviewComment(e.target.value)
                              }
                              placeholder="Nhập nội dung đánh giá..."
                              rows={3}
                              className="mb-2"
                            />
                          ) : (
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {review.comment}
                            </p>
                          )}
                          {review.images && review.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Ảnh đánh giá ${index + 1}`}
                                  className="w-full aspect-square object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(image, "_blank")}
                                />
                              ))}
                            </div>
                          )}
                          {review.isVerified && (
                            <Tag color="green" className="mt-2">
                              Đã mua hàng
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Nút Xem thêm / Thu gọn */}
                {reviews.length > 5 && (
                  <div className="flex justify-center mt-6">
                    <Button
                      size="large"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="px-8"
                    >
                      {showAllReviews ? (
                        <>Thu gọn ▲</>
                      ) : (
                        <>Xem thêm {reviews.length - 5} đánh giá ▼</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Pagination - chỉ hiển thị khi có nhiều hơn 10 reviews */}
                {reviewTotal > 10 && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      current={reviewPage}
                      total={reviewTotal}
                      pageSize={10}
                      onChange={(page) => {
                        loadReviews(product!.id, page);
                        setShowAllReviews(false); // Reset về 5 đánh giá khi chuyển trang
                      }}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
}
