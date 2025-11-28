import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Rate,
  Tag,
  Space,
  Pagination,
  Avatar,
  Input,
  Popconfirm,
  Upload,
  Empty,
  Modal,
  Carousel,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { reviewService, type Review } from "../services/reviewService";
import { authService } from "../services/authService";
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "../contexts/AuthContext";

const { TextArea } = Input;

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({
  productId,
  productName,
}: ProductReviewsProps) {
  const { user } = useAuth();
  const notify = useNotification();

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Edit review states
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewComment, setEditReviewComment] = useState("");
  const [editReviewImages, setEditReviewImages] = useState<any[]>([]);

  // Image viewer states
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  // Load reviews
  const loadReviews = async (page: number = 1) => {
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

  // Load reviews khi component mount
  useEffect(() => {
    loadReviews();
  }, [productId]);

  // Start editing review
  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditReviewRating(review.rating);
    setEditReviewComment(review.comment);
    setEditReviewImages(
      review.images?.map((img, index) => ({
        uid: `-${index}`,
        name: `image-${index}`,
        status: "done",
        url: img,
      })) || []
    );
  };

  // Cancel editing
  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditReviewRating(5);
    setEditReviewComment("");
    setEditReviewImages([]);
  };

  // Update review
  const handleUpdateReview = async (reviewId: string) => {
    const token = authService.getToken();
    if (!token) {
      notify.warning("Vui lòng đăng nhập!");
      return;
    }

    if (!editReviewComment.trim()) {
      notify.warning("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      const imageFiles = editReviewImages
        .filter((file) => file.originFileObj)
        .map((file) => file.originFileObj);

      await reviewService.updateReview(
        reviewId,
        {
          rating: editReviewRating,
          comment: editReviewComment.trim(),
          images: imageFiles.length > 0 ? imageFiles : undefined,
        },
        token
      );

      notify.success("Cập nhật đánh giá thành công!");
      cancelEditReview();

      // Reload reviews
      loadReviews(reviewPage);
    } catch (error: any) {
      notify.error(error.message || "Không thể cập nhật đánh giá!");
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    const token = authService.getToken();
    if (!token) {
      notify.warning("Vui lòng đăng nhập!");
      return;
    }

    try {
      await reviewService.deleteReview(reviewId, token);
      notify.success("Xóa đánh giá thành công!");

      // Reload reviews
      loadReviews(reviewPage);
    } catch (error: any) {
      notify.error(error.message || "Không thể xóa đánh giá!");
    }
  };

  // Open image viewer
  const openImageViewer = (images: string[], startIndex: number = 0) => {
    setViewerImages(images);
    setCurrentImageIndex(startIndex);
    setImageViewerOpen(true);
  };

  // Close image viewer
  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setViewerImages([]);
    setCurrentImageIndex(0);
  };

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Đánh giá sản phẩm
      </h2>

      {/* Thông báo giới hạn đánh giá */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Lưu ý:</strong> Bạn chỉ có thể đánh giá sản phẩm sau khi
          đơn hàng đã hoàn thành. Hãy truy cập{" "}
          <Link to="/orders" className="text-blue-600 underline font-semibold">
            Quản lý đơn hàng
          </Link>{" "}
          để đánh giá sản phẩm đã mua.
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {reviewTotal > 0 ? `Các đánh giá (${reviewTotal})` : "Các đánh giá"}
      </h3>

      {reviewsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-700 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : reviews.length === 0 ? (
        <Empty description="Chưa có đánh giá nào" className="py-8" />
      ) : (
        <div className="space-y-6">
          {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => (
            <div
              key={review.id}
              className="p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
            >
              {/* === REVIEW ITEM === */}
              <div className="flex items-start gap-4">
                <Avatar
                  size={48}
                  src={review.userAvatar || undefined}
                  icon={<UserOutlined />}
                  className="flex-shrink-0"
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.userName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Rating */}
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

                      {/* Update/Delete nếu là review của chính user */}
                      {user && user.id === review.userId && (
                        <Space size="small">
                          {editingReviewId === review.id ? (
                            <>
                              <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => handleUpdateReview(review.id)}
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
                                description="Bạn có chắc muốn xóa đánh giá này?"
                                onConfirm={() => handleDeleteReview(review.id)}
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

                  {/* Nội dung đánh giá */}
                  {editingReviewId === review.id ? (
                    <div className="mt-2 space-y-3">
                      <TextArea
                        value={editReviewComment}
                        onChange={(e) => setEditReviewComment(e.target.value)}
                        placeholder="Nhập nội dung đánh giá..."
                        rows={3}
                      />

                      {/* Upload ảnh khi edit */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Ảnh (tùy chọn, tối đa 5 ảnh)
                        </label>
                        <Upload
                          listType="picture-card"
                          fileList={editReviewImages}
                          onChange={({ fileList }: any) =>
                            setEditReviewImages(fileList)
                          }
                          beforeUpload={() => false}
                          multiple
                          maxCount={5}
                        >
                          {editReviewImages.length < 5 && "+ Upload"}
                        </Upload>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  )}

                  {/* Hình ảnh */}
                  {(review.images ?? []).length > 0 && (
                    <div className="mt-4">
                      {/* Nếu chỉ có 1 hình */}
                      {(review.images ?? []).length === 1 ? (
                        <div className="relative group cursor-pointer overflow-hidden rounded-lg w-32 h-32">
                          {(review.images ?? [])[0] ? (
                            <img
                              src={(review.images ?? [])[0]}
                              alt={`Ảnh đánh giá ${review.userName}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onClick={() =>
                                openImageViewer(review.images ?? [], 0)
                              }
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                              Không có ảnh
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2">
                              <span className="text-gray-800 font-medium text-xs">
                                👁 Xem
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Nếu có nhiều hình */
                        <div className="grid grid-cols-3 gap-1 max-w-sm">
                          {(review.images ?? [])
                            .map((image, i) => (
                              <div
                                key={i}
                                className="relative cursor-pointer rounded-md overflow-hidden aspect-square"
                                onClick={() =>
                                  openImageViewer(review.images ?? [], i)
                                }
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt={`Ảnh đánh giá ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                    Không có ảnh
                                  </div>
                                )}

                                {/* Overlay hover */}
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center">
                                  <span className="text-white opacity-0 hover:opacity-100 text-xs">
                                    👁
                                  </span>
                                </div>

                                {/* Badge +X nếu >4 ảnh */}
                                {i === 3 &&
                                  (review.images ?? []).length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                      <span className="text-white font-bold text-lg">
                                        +{(review.images ?? []).length - 4}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            ))
                            .slice(0, 4)}
                        </div>
                      )}
                    </div>
                  )}

                  {review.isVerified && (
                    <Tag color="green" className="mt-2">
                      ✔ Đã mua hàng
                    </Tag>
                  )}
                </div>
              </div>

              {/* === REPLIES === */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 ml-8 space-y-3">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <Avatar
                          size={40}
                          src={reply.userAvatar || undefined}
                          icon={<UserOutlined />}
                        />

                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {reply.userName}
                          </h5>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(reply.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>

                          <p className="text-gray-700 text-sm whitespace-pre-wrap">
                            {reply.comment}
                          </p>

                          {reply.images && reply.images.length > 0 && (
                            <div className="mt-3">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 max-w-sm">
                                {reply.images.map((img, i) => (
                                  <div
                                    key={i}
                                    className="relative group cursor-pointer overflow-hidden rounded-md aspect-square max-h-20"
                                    onClick={() =>
                                      openImageViewer(reply.images || [], i)
                                    }
                                  >
                                    <img
                                      src={img}
                                      alt={`Ảnh reply ${i + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-1">
                                        <span className="text-gray-800 font-medium text-xs">
                                          👁
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Xem thêm / Thu gọn */}
          {reviews.length > 5 && (
            <div className="flex justify-center mt-6">
              <Button
                size="large"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews
                  ? "Thu gọn ▲"
                  : `Xem thêm ${reviews.length - 5} đánh giá ▼`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {reviewTotal > 10 && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={reviewPage}
            total={reviewTotal}
            pageSize={10}
            showSizeChanger={false}
            onChange={(page) => {
              loadReviews(page);
              setShowAllReviews(false);
            }}
          />
        </div>
      )}

      {/* Image Viewer Modal */}
      <Modal
        open={imageViewerOpen}
        onCancel={closeImageViewer}
        footer={null}
        width="90%"
        style={{ maxWidth: "none", height: "90vh" }}
        styles={{ body: { padding: 0 } }}
        centered
      >
        <div className="relative bg-black">
          {/* Close button */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          >
            <CloseOutlined style={{ fontSize: "20px" }} />
          </button>

          {/* Main image */}
          <div className="flex items-center justify-center h-full">
            {viewerImages[currentImageIndex] ? (
              <img
                src={viewerImages[currentImageIndex]}
                alt={`Ảnh ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white text-center">
                <p>Không thể tải ảnh</p>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          {viewerImages.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev > 0 ? prev - 1 : viewerImages.length - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
              >
                <LeftOutlined style={{ fontSize: "24px" }} />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev < viewerImages.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
              >
                <RightOutlined style={{ fontSize: "24px" }} />
              </button>
            </>
          )}

          {/* Thumbnail navigation */}
          {viewerImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-lg p-2">
              {viewerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
            {currentImageIndex + 1} / {viewerImages.length}
          </div>
        </div>
      </Modal>
    </div>
  );
}
