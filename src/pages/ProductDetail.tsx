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
  Select,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import type { Product, ProductVariant } from "../types/product.types";
import { useCart } from "../contexts/CartContext";
import { useSearch } from "../contexts/SearchContext";

const { Option } = Select;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useSearch();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    if (!slug || !products.length) return;
    const found = products.find((p) => p.slug === slug);
    if (!found) {
      message.error("Không tìm thấy sản phẩm!");
      return;
    }

    setProduct(found);
    if (found.variants?.length > 0) {
      setSelectedVariant(found.variants[0]);
      setMainImage(found.variants[0].imageUrl || found.imageUrl);
    } else {
      setMainImage(found.imageUrl);
    }
  }, [slug, products]);

  if (!product)
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

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-10">
      <Breadcrumb
        className="mb-6"
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/products">Sản phẩm</Link> },
          { title: product.name },
        ]}
      />

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={12}>
          <Card className="overflow-hidden flex items-center justify-center bg-gray-50 rounded-2xl">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full max-h-[600px] aspect-[3/4] object-contain rounded-2xl transition-transform duration-300 hover:scale-105"
            />
          </Card>
        </Col>

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

            {product.variants?.length > 0 && (
              <div>
                <span className="font-semibold mr-2">Chọn phiên bản:</span>
                <Select
                  value={selectedVariant?.id}
                  onChange={(value) => {
                    const variant =
                      product.variants.find((v) => v.id === value) || null;
                    setSelectedVariant(variant);
                    if (variant)
                      setMainImage(variant.imageUrl || product.imageUrl);
                  }}
                  style={{ minWidth: 200 }}
                >
                  {product.variants.map((variant) => (
                    <Option key={variant.id} value={variant.id}>
                      {variant.color?.name || "Màu"} - Size {variant.size}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            <div className="text-3xl font-bold text-red-600">
              {(
                selectedVariant?.discountPrice ||
                selectedVariant?.price ||
                0
              ).toLocaleString("vi-VN")}
              ₫
            </div>

            <p className="text-gray-700 text-base leading-relaxed">
              {product.shortDescription}
            </p>

            <Space>
              <Button
                icon={<MinusOutlined />}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              />
              <InputNumber
                min={1}
                value={quantity}
                onChange={(v) => setQuantity(v || 1)}
                style={{ width: 80 }}
                controls={false}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={() => setQuantity(quantity + 1)}
              />
            </Space>

            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  if (selectedVariant) {
                    addToCart(
                      { ...product, variants: [selectedVariant] },
                      quantity
                    );
                    message.success("Đã thêm vào giỏ hàng!");
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
          </Space>
        </Col>
      </Row>
    </div>
  );
}
