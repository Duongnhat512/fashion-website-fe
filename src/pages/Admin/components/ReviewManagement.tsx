import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Tag,
  Space,
  message,
  Pagination,
  Drawer,
  Card,
  Image,
  Popconfirm,
  AutoComplete,
  Input,
  Upload,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { reviewService, type Review } from "../../../services/reviewService";
import { productService } from "../../../services/productService";
import dayjs from "dayjs";
import { useNotification } from "../../../components/NotificationProvider";

export default function ReviewManagement() {
  const notify = useNotification();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [viewingReview, setViewingReview] = useState<Review | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<any>(null);

  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const [searchValue, setSearchValue] = useState("");
  const [searchOptions, setSearchOptions] = useState<any[]>([]);

  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingToReview, setReplyingToReview] = useState<Review | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [replyImages, setReplyImages] = useState<any[]>([]);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [page]);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await reviewService.getAllReviews(page, limit);
      const reviewsData = response.reviews;

      const productIds = [...new Set(reviewsData.map((r) => r.productId))];

      const productPromises = productIds.map((id) =>
        productService
          .getProductById(id, localStorage.getItem("authToken") || "")
          .catch(() => undefined)
      );

      const products = await Promise.all(productPromises);

      const productMap = new Map(
        productIds.map((id, index) => [id, products[index]])
      );

      const reviewsWithProducts = reviewsData.map((review) => ({
        ...review,
        product: productMap.get(review.productId),
      }));

      setReviews(reviewsWithProducts);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const loadProductReviews = async (productId: string) => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(
        productId,
        page,
        limit
      );
      const reviewsData = response.reviews;

      const product = await productService.getProductById(
        productId,
        localStorage.getItem("authToken") || ""
      );

      const reviewsWithProducts = reviewsData.map((review) => ({
        ...review,
        product: product,
      }));

      setReviews(reviewsWithProducts);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tải đánh giá sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProducts = async (value: string) => {
    if (!value.trim()) {
      setSearchOptions([]);
      return;
    }

    try {
      const trimmed = value.trim();

      const isProductId = /^PRO-\d{6,20}-[A-Z0-9]{4,10}$/i.test(trimmed);

      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          trimmed
        );

      const isObjectId = /^[0-9a-f]{24}$/i.test(trimmed);

      let isIdSearch =
        (isProductId || isUUID || isObjectId) && trimmed.length >= 12;

      let products: any[] = [];

      if (isIdSearch) {
        try {
          const product = await productService.getProductById(
            value.trim(),
            localStorage.getItem("authToken") || ""
          );
          products = [product];
        } catch (error) {
          products = [];
        }
      } else {
        const response = await productService.searchProducts({
          search: value,
          limit: 10,
        });
        products = response.products;
      }

      const options = products.map((product: any) => ({
        value: product.id,
        label: (
          <div className="flex items-center gap-3">
            <img
              src={product.imageUrl || "https://via.placeholder.com/40"}
              alt={product.name}
              className="w-8 h-8 object-cover rounded"
            />
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-gray-500">
                ID: {product.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        ),
        product: product,
      }));

      setSearchOptions(options);
    } catch (error) {
      console.error("Search products error:", error);
      setSearchOptions([]);
    } finally {
    }
  };

  const handleSelectProduct = (_value: string, option: any) => {
    setSearchValue(`${option.product.name} (${option.product.id})`);
    loadProductReviews(option.product.id);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSearchOptions([]);
    loadReviews();
  };

  const handleViewReview = async (review: Review) => {
    setViewingReview(review);
    setIsDrawerVisible(true);

    try {
      const productData = await productService.getProductById(
        review.productId,
        localStorage.getItem("authToken") || ""
      );
      setViewingProduct(productData);
    } catch {
      setViewingProduct(review.product);
    } finally {
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reviewService.deleteReview(
        id,
        localStorage.getItem("authToken") || ""
      );
      notify.success("Xóa đánh giá thành công");
      loadReviews();
    } catch (error: any) {
      notify.error(error.message || "Lỗi khi xóa đánh giá");
    }
  };

  const handleReplyReview = async () => {
    if (!replyingToReview || !replyComment.trim()) {
      notify.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    setSubmittingReply(true);
    try {
      const formData = new FormData();
      formData.append("rating", "5");
      formData.append("comment", replyComment);
      formData.append("productId", replyingToReview.productId);
      formData.append("replyToId", replyingToReview.id);

      replyImages.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });

      await reviewService.createReview(
        formData,
        localStorage.getItem("authToken") || ""
      );

      notify.success("Trả lời đánh giá thành công");
      setReplyModalVisible(false);
      setReplyingToReview(null);
      setReplyComment("");
      setReplyImages([]);
      loadReviews();
    } catch (error: any) {
      notify.error(error.message || "Lỗi khi trả lời đánh giá");
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredReviews =
    ratingFilter === "all"
      ? reviews
      : reviews.filter((review) => review.rating === parseInt(ratingFilter));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  const columns: ColumnsType<Review> = [
    {
      title: "Người đánh giá",
      dataIndex: "userName",
    },
    {
      title: "Sản phẩm",
      render: (_, record) => (
        <div className="flex items-center gap-2 max-w-[260px]">
          <img
            src={record.product?.imageUrl || "https://via.placeholder.com/40"}
            alt={record.product?.name}
            className="w-10 h-10 object-cover rounded"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {record.product?.name || "Không có dữ liệu"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      render: (rating) => <span className="font-semibold">{rating} ⭐</span>,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      render: (text) => (
        <span className="block truncate max-w-[280px]" title={text}>
          {text}
        </span>
      ),
    },
    {
      title: "Ảnh",
      render: (_, record) => (
        <Tag color={record.images?.length ? "blue" : "default"}>
          {record.images?.length || 0} ảnh
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a: Review, b: Review) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewReview(record)}
          >
            Xem
          </Button>
          <Popconfirm
            title="Bạn chắc muốn xóa đánh giá này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 🔍 THANH TÌM KIẾM SẢN PHẨM */}
      <div className="mb-6 flex items-center gap-4">
        <AutoComplete
          value={searchValue}
          options={searchOptions}
          onSearch={handleSearchProducts}
          onSelect={handleSelectProduct}
          onChange={(value) => setSearchValue(value)}
          allowClear
          onClear={handleClearSearch}
          style={{ width: 300 }}
        >
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </AutoComplete>

        <Button type="primary" onClick={handleClearSearch}>
          Xem tất cả
        </Button>
      </div>

      {/* Bộ lọc theo số sao */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <Button
          type={ratingFilter === "all" ? "primary" : "default"}
          onClick={() => setRatingFilter("all")}
        >
          Tất cả ({reviews.length})
        </Button>
        <Button
          type={ratingFilter === "5" ? "primary" : "default"}
          onClick={() => setRatingFilter("5")}
        >
          5 sao ({reviews.filter((r) => r.rating === 5).length})
        </Button>
        <Button
          type={ratingFilter === "4" ? "primary" : "default"}
          onClick={() => setRatingFilter("4")}
        >
          4 sao ({reviews.filter((r) => r.rating === 4).length})
        </Button>
        <Button
          type={ratingFilter === "3" ? "primary" : "default"}
          onClick={() => setRatingFilter("3")}
        >
          3 sao ({reviews.filter((r) => r.rating === 3).length})
        </Button>
        <Button
          type={ratingFilter === "2" ? "primary" : "default"}
          onClick={() => setRatingFilter("2")}
        >
          2 sao ({reviews.filter((r) => r.rating === 2).length})
        </Button>
        <Button
          type={ratingFilter === "1" ? "primary" : "default"}
          onClick={() => setRatingFilter("1")}
        >
          1 sao ({reviews.filter((r) => r.rating === 1).length})
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        <Table
          columns={columns}
          dataSource={paginatedReviews}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </div>

      <div className="flex justify-center mt-8">
        <Pagination
          current={page}
          total={filteredReviews.length}
          pageSize={limit}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      </div>

      <Drawer
        title="Chi tiết đánh giá"
        width={600}
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
          setViewingReview(null);
          setViewingProduct(null);
        }}
      >
        {viewingReview && (
          <div className="space-y-4">
            <Card title="Thông tin đánh giá" size="small">
              <p className="font-semibold">{viewingReview.userName}</p>
              <p className="text-sm text-gray-500">
                {dayjs(viewingReview.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
              <p className="text-lg font-bold mt-2">
                {viewingReview.rating} ⭐
              </p>

              <p className="mt-2">{viewingReview.comment}</p>

              <div className="mt-4">
                <Button
                  type="primary"
                  onClick={() => {
                    setReplyingToReview(viewingReview);
                    setReplyModalVisible(true);
                  }}
                >
                  Trả lời đánh giá
                </Button>
              </div>
            </Card>

            <Card title="Sản phẩm được đánh giá" size="small">
              {viewingProduct ? (
                <div className="flex items-center gap-4">
                  <img
                    src={
                      viewingProduct.imageUrl ||
                      viewingProduct.variants?.[0]?.imageUrl ||
                      "https://via.placeholder.com/60"
                    }
                    className="w-20 h-20 rounded object-cover"
                  />
                  <div>
                    <p
                      className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() =>
                        navigate(`/products/${viewingProduct.slug}`, {
                          state: { product: viewingProduct },
                        })
                      }
                    >
                      {viewingProduct.name}
                    </p>
                  </div>
                </div>
              ) : (
                <p>Không thể tải thông tin sản phẩm</p>
              )}
            </Card>

            {viewingReview.images?.length ? (
              <Card
                size="small"
                title={`Ảnh đính kèm (${viewingReview.images.length})`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {viewingReview.images.map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      className="w-full h-20 object-cover"
                    />
                  ))}
                </div>
              </Card>
            ) : null}

            {viewingReview.replies?.length ? (
              <Card
                size="small"
                title={`Trả lời (${viewingReview.replies.length})`}
              >
                <div className="space-y-3">
                  {viewingReview.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-blue-700">
                          {reply.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dayjs(reply.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                        {reply.rating && (
                          <span className="text-sm font-bold text-yellow-500">
                            {reply.rating} ⭐
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{reply.comment}</p>
                      {reply.images?.length ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {reply.images.map((img, i) => (
                            <Image
                              key={i}
                              src={img}
                              className="w-full h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </Drawer>

      <Modal
        title="Trả lời đánh giá"
        open={replyModalVisible}
        onCancel={() => {
          setReplyModalVisible(false);
          setReplyingToReview(null);
          setReplyComment("");
          setReplyImages([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setReplyModalVisible(false);
              setReplyingToReview(null);
              setReplyComment("");
              setReplyImages([]);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submittingReply}
            onClick={handleReplyReview}
          >
            Gửi trả lời
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Nội dung trả lời</label>
            <Input.TextArea
              value={replyComment}
              onChange={(e) => setReplyComment(e.target.value)}
              placeholder="Nhập nội dung trả lời..."
              rows={4}
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Ảnh đính kèm (tùy chọn)
            </label>
            <Upload
              multiple
              listType="picture-card"
              fileList={replyImages}
              onChange={({ fileList }) => setReplyImages(fileList)}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </div>
        </div>
      </Modal>
    </div>
  );
}
