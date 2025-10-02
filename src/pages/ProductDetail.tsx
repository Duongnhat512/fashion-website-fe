import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
} from "antd";
import { ShoppingCartOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import type { Product } from "../types/product.types";
import { fallbackProducts } from "../data/fallbackProducts";
import { useCart } from "../contexts/CartContext";
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    console.log("Product ID from params:", id);
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-6"
        items={[
          {
            title: <Link to="/">Trang chủ</Link>,
          },
          {
            title: <Link to="/">Sản phẩm</Link>,
          },
          {
            title: product.name,
          },
        ]}
      />

      <Row gutter={[32, 32]}>
        {/* Image */}
        <Col xs={24} lg={12}>
          <Card className="overflow-hidden">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-[520px] object-cover rounded-lg"
            />
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <Tag color="blue" className="mb-4">
                {product.brand}
              </Tag>
            </div>

            <div className="flex items-center gap-4">
              <Rate disabled defaultValue={product.ratingAverage} allowHalf />
              <span className="text-gray-600">
                ({product.ratingCount} đánh giá)
              </span>
            </div>

            <div className="text-3xl font-bold text-red-600">
              {product.variants && product.variants.length > 0
                ? product.variants[0].price.toLocaleString("vi-VN")
                : (product as any).price?.toLocaleString("vi-VN") || "Liên hệ"}
              ₫
            </div>

            <p className="text-gray-700 text-base leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quantity và Add to Cart */}
            <Space size="middle">
              <span>Số lượng:</span>
              <InputNumber
                min={1}
                defaultValue={1}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                style={{ width: 80 }}
              />
            </Space>

            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  // Thêm nhiều lần theo số lượng đã chọn
                  for (let i = 0; i < quantity; i++) {
                    addToCart(product);
                  }
                }}
                className="bg-black hover:bg-gray-800 border-black"
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              >
                Quay lại
              </Button>
            </Space>

            {/* Product Info */}
            <Card title="Thông tin sản phẩm" size="small">
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <strong>Thương hiệu:</strong>
                </Col>
                <Col span={16}>{product.brand}</Col>
                <Col span={8}>
                  <strong>Đánh giá:</strong>
                </Col>
                <Col span={16}>{product.ratingAverage}/5 ⭐</Col>
                <Col span={8}>
                  <strong>Trạng thái:</strong>
                </Col>
                <Col span={16}>
                  <Tag color="green">Còn hàng</Tag>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Sản phẩm liên quan</h2>
          <Row gutter={[16, 16]}>
            {relatedProducts.map((p) => (
              <Col key={p.id} xs={12} sm={6} md={6} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-48 object-cover"
                    />
                  }
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="h-full"
                >
                  <Card.Meta
                    title={
                      <div className="truncate text-sm" title={p.name}>
                        {p.name}
                      </div>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size="small"
                        className="w-full"
                      >
                        <Tag color="blue" size="small">
                          {p.brand}
                        </Tag>
                        <div className="flex items-center justify-between">
                          <Rate
                            disabled
                            defaultValue={p.ratingAverage}
                            size="small"
                          />
                          <span className="text-xs text-gray-500">
                            ({p.ratingCount})
                          </span>
                        </div>
                        <div className="text-red-600 font-semibold">
                          {p.variants && p.variants.length > 0
                            ? p.variants[0].price.toLocaleString("vi-VN")
                            : (p as any).price?.toLocaleString("vi-VN") ||
                              "Liên hệ"}
                          ₫
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}
