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
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import type { Product, ProductVariant } from "../types/product.types";
import { useCart } from "../contexts/CartContext";
import products from "../data/products.json";
import productVariants from "../data/product_variants.json";

const { Option } = Select;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  useEffect(() => {
    if (!slug) return;

    // Tìm sản phẩm theo slug
    const found = products.find((p) => p.slug === slug);

    if (found) {
      // Ghép variants từ product_variants.json theo productId
      const variants = productVariants.filter(
        (v: ProductVariant) => v.productId === found.id
      );

      const mergedProduct: Product = {
        ...found,
        variants,
      };

      setProduct(mergedProduct);

      if (variants.length > 0) {
        setSelectedVariant(variants[0]);
        setMainImage(
          variants[0].images?.[0] || variants[0].imageUrl || found.imageUrl
        );
      } else {
        setMainImage(found.imageUrl);
      }

      setRelatedProducts(
        products.filter((p) => p.slug !== found.slug).slice(0, 4)
      );

      console.log("Found product:", mergedProduct);
    } else {
      setProduct(null);
    }
  }, [slug]);

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
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/products">Sản phẩm</Link> },
          { title: product.name },
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

            {/* ✅ Variant selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <span className="font-semibold mr-2">Chọn phiên bản:</span>
                <Select
                  value={selectedVariant?.id}
                  onChange={(value) => {
                    const variant =
                      product.variants?.find((v) => v.id === value) || null;
                    setSelectedVariant(variant);
                    if (variant) {
                      setMainImage(
                        variant.images?.[0] ||
                          variant.imageUrl ||
                          product.imageUrl
                      );
                    }
                  }}
                  style={{ minWidth: 200 }}
                >
                  {product.variants.map((variant) => (
                    <Option key={variant.id} value={variant.id}>
                      {variant.color || "Màu"} - Size {variant.size}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            <div className="text-3xl font-bold text-red-600">
              {selectedVariant
                ? (
                    selectedVariant.salePrice || selectedVariant.price
                  ).toLocaleString("vi-VN")
                : "Liên hệ"}
              ₫
            </div>

            <p className="text-gray-700 text-base leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quantity + Add to Cart */}
            <Space>
              <Button
                icon={<MinusOutlined />}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              />
              <InputNumber
                min={1}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                style={{ width: 80 }}
                controls={false} // tắt nút mặc định của Antd
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Sản phẩm liên quan</h2>
          <Row gutter={[16, 16]}>
            {relatedProducts.map((p) => (
              <Col key={p.slug} xs={12} sm={6} md={6} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-96 object-cover"
                    />
                  }
                  onClick={() => navigate(`/product/${p.slug}`)}
                  className="h-full"
                >
                  <Card.Meta
                    title={<div className="truncate text-sm">{p.name}</div>}
                    description={
                      <Space direction="vertical" size="small">
                        <Tag color="blue">{p.brand}</Tag>
                        <div className="flex items-center justify-between">
                          <Rate disabled defaultValue={p.ratingAverage} />
                          <span className="text-xs text-gray-500">
                            ({p.ratingCount || 0} đánh giá)
                          </span>
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
