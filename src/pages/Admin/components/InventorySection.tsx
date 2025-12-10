import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tabs,
  Pagination,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  InboxOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { warehouseService } from "../../../services/warehouseService";
import { inventoryService } from "../../../services/inventoryService";
import { productService } from "../../../services/productService";
import type { Warehouse, StockEntry } from "../../../services/warehouseService";
import { useNotification } from "../../../components/NotificationProvider";

const InventorySection: React.FC = () => {
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState("stock-entries");
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [stockEntryForm] = Form.useForm();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductForItem, setSelectedProductForItem] = useState<{
    [key: number]: string;
  }>({});
  const [selectedVariantForItem, setSelectedVariantForItem] = useState<{
    [key: number]: string;
  }>({});
  const [selectedStockEntry, setSelectedStockEntry] =
    useState<StockEntry | null>(null);
  const [stockEntryDetailVisible, setStockEntryDetailVisible] = useState(false);
  const [enrichedItems, setEnrichedItems] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Warehouse management states
  const [warehouseModalVisible, setWarehouseModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [warehouseForm] = Form.useForm();

  // Pagination states
  const [warehouseCurrentPage, setWarehouseCurrentPage] = useState(1);
  const [stockEntryCurrentPage, setStockEntryCurrentPage] = useState(1);
  const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Stock entry filter state
  const [stockEntryStatusFilter, setStockEntryStatusFilter] =
    useState<string>("all");

  // Inventory filter state
  const [inventoryStockFilter, setInventoryStockFilter] =
    useState<string>("all");

  // Sorting states for inventory
  const [inventorySortField, setInventorySortField] =
    useState<string>("onHand");
  const [inventorySortOrder, setInventorySortOrder] = useState<
    "ascend" | "descend"
  >("descend");

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      setWarehouseLoading(true);
      const [warehousesData, stockEntriesData, productsData] =
        await Promise.all([
          warehouseService.getAllWarehouses(),
          warehouseService.getAllStockEntries(),
          productService.getAllProducts(1, 1000),
        ]);
      setWarehouses(warehousesData);
      setProducts(productsData.products);
      const sortedEntries = stockEntriesData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setStockEntries(sortedEntries);
    } catch (error) {
      notify.error("Không thể tải dữ liệu kho");
      console.error(error);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setWarehouseLoading(true);
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (error) {
      notify.error("Không thể tải danh sách chi nhánh");
      console.error(error);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleCreateWarehouse = async (values: any) => {
    try {
      await warehouseService.createWarehouse(values);
      notify.success("Tạo chi nhánh thành công!");
      setWarehouseModalVisible(false);
      warehouseForm.resetFields();
      fetchWarehouses();
    } catch (error) {
      notify.error("Không thể tạo chi nhánh");
      console.error(error);
    }
  };

  const handleUpdateWarehouse = async (values: any) => {
    if (!editingWarehouse) return;
    try {
      await warehouseService.updateWarehouse({
        id: editingWarehouse.id,
        name: values.name,
        code: values.code,
        address: values.address,
        status: values.status,
      });
      notify.success("Cập nhật chi nhánh thành công!");
      setWarehouseModalVisible(false);
      warehouseForm.resetFields();
      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (error) {
      notify.error("Không thể cập nhật chi nhánh");
      console.error(error);
    }
  };

  const showEditWarehouseModal = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    warehouseForm.setFieldsValue({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
      status: warehouse.status || "active", // giữ nguyên status
    });
    setWarehouseModalVisible(true);
  };

  const fetchInventoryList = async () => {
    try {
      setWarehouseLoading(true);
      const [inventoriesData, productsData] = await Promise.all([
        inventoryService.getAllInventories(),
        productService.getAllProducts(1, 1000),
      ]);

      // Enrich inventory data with product info
      const enrichedInventories = inventoriesData.map((inv: any) => {
        const product = productsData.products.find((p: any) =>
          p.variants?.some((v: any) => v.id === inv.variant?.id)
        );

        // Lấy thông tin color từ product variant
        const fullVariant = product?.variants?.find(
          (v: any) => v.id === inv.variant?.id
        );

        return {
          ...inv,
          product,
          variant: {
            ...inv.variant,
            color: fullVariant?.color || null,
          },
        };
      });

      setInventoryList(enrichedInventories);
      setProducts(productsData.products);
    } catch (error) {
      notify.error("Không thể tải dữ liệu tồn kho");
      console.error(error);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleCreateStockEntry = async (values: any) => {
    try {
      await warehouseService.createStockEntry({
        type: values.type,
        supplierName: values.supplierName,
        warehouseId: values.warehouseId,
        stockEntryItems: values.items || [],
        note: values.note,
      });
      notify.success("Tạo phiếu kho thành công!");
      setCreateModalVisible(false);
      stockEntryForm.resetFields();
      setSelectedProductForItem({});
      setSelectedVariantForItem({});
      fetchWarehouseData();
    } catch (error) {
      notify.error("Không thể tạo phiếu kho");
      console.error(error);
    }
  };

  const handleSubmitStockEntry = async (stockEntryId: string) => {
    try {
      await warehouseService.submitStockEntry(stockEntryId);
      notify.success("Đã xác nhận phiếu kho!");
      fetchWarehouseData();
    } catch (error) {
      notify.error("Không thể xác nhận phiếu kho");
      console.error(error);
    }
  };

  const handleCancelStockEntry = async (stockEntryId: string) => {
    try {
      await warehouseService.cancelStockEntry(stockEntryId);
      notify.success("Đã hủy phiếu kho thành công!");
      await fetchWarehouseData();
    } catch (error: any) {
      console.error("Lỗi khi hủy phiếu kho:", error);
      notify.error(
        error?.message || "Không thể hủy phiếu kho. Vui lòng thử lại!"
      );
    }
  };

  const showStockEntryDetail = async (stockEntry: StockEntry) => {
    setSelectedStockEntry(stockEntry);
    setStockEntryDetailVisible(true);
    setLoadingDetail(true);

    try {
      const itemsWithDetails = await Promise.all(
        stockEntry.stockEntryItems.map(async (item, index) => {
          if (item.inventory?.id) {
            try {
              const inventoryDetail = await inventoryService.getInventoryById(
                item.inventory.id
              );

              const variantId = inventoryDetail.variant?.id;
              let foundProduct: any = null;

              if (variantId) {
                foundProduct = products.find((p) =>
                  p.variants?.some((v: any) => v.id === variantId)
                );

                if (foundProduct) {
                  setSelectedProductForItem((prev) => ({
                    ...prev,
                    [index]: foundProduct.id,
                  }));
                  setSelectedVariantForItem((prev) => ({
                    ...prev,
                    [index]: variantId,
                  }));

                  if (inventoryDetail.variant) {
                    inventoryDetail.variant.product = foundProduct;
                  }
                }
              }

              return {
                ...item,
                inventoryDetail,
              };
            } catch (error) {
              console.error("Lỗi khi lấy inventory:", error);
              return item;
            }
          }
          return item;
        })
      );

      setEnrichedItems(itemsWithDetails);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết phiếu kho:", error);
      notify.error("Không thể tải chi tiết phiếu kho");
    } finally {
      setLoadingDetail(false);
    }
  };

  const stockEntryColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <span className="font-mono text-xs">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "IMPORT" ? "green" : "orange"}>
          {type === "IMPORT" ? "Nhập kho" : "Xuất kho"}
        </Tag>
      ),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: "default", text: "Nháp" },
          submitted: { color: "blue", text: "Đã xác nhận" },
          cancelled: { color: "red", text: "Đã hủy" },
        };
        const { color, text } = statusMap[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (cost: number) => (
        <span className="font-bold text-purple-600">
          {cost?.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "stockEntryItems",
      key: "totalQuantity",
      render: (stockEntryItems: any[]) => {
        const totalQty =
          stockEntryItems?.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          ) || 0;
        return (
          <Tag color="blue" className="font-semibold">
            {totalQty} SP
          </Tag>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note: string) => note || "N/A",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: StockEntry) => (
        <Space direction="vertical" size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showStockEntryDetail(record)}
            block
          >
            Xem
          </Button>
          {record.status === "draft" && (
            <>
              {/* <Button
                type="default"
                size="small"
                icon={<EditOutlined />}
                onClick={() => showUpdateStockEntryModal(record)}
                block
              >
                Cập nhật
              </Button> */}
              <Button
                type="primary"
                size="small"
                onClick={() => handleSubmitStockEntry(record.id)}
                block
              >
                Xác nhận
              </Button>
            </>
          )}
          {record.status === "submitted" && (
            <Button
              danger
              size="small"
              onClick={() => handleCancelStockEntry(record.id)}
              block
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const inventoryColumns = [
    {
      title: "Hình ảnh",
      dataIndex: "variant",
      key: "image",
      width: 100,
      render: (variant: any) => (
        <img
          src={variant?.imageUrl || "/placeholder-image.png"}
          alt={variant?.sku || "Product"}
          className="w-16 h-16 object-cover rounded-lg shadow-sm"
        />
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 250,
      render: (_: any, record: any) => (
        <div>
          <div className="font-semibold text-gray-900">
            {record.product?.name || "N/A"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {record.variant?.color?.name || "N/A"} -{" "}
            {record.variant?.size || "N/A"}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-0.5">
            SKU: {record.variant?.sku || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "variant",
      key: "price",
      width: 130,
      render: (variant: any) => (
        <div>
          <div className="font-semibold text-purple-600">
            {variant?.price?.toLocaleString("vi-VN")}đ
          </div>
          {variant?.discountPercent > 0 && (
            <Tag color="red" className="text-xs mt-1">
              -{variant.discountPercent}%
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Kho",
      dataIndex: "warehouse",
      key: "warehouse",
      width: 150,
      render: (warehouse: any) => (
        <div>
          <div className="font-medium text-gray-800">
            {warehouse?.name || "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            Mã: {warehouse?.code || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "onHand",
      key: "onHand",
      width: 100,
      align: "center" as const,
      sorter: (a: any, b: any) => (a.onHand || 0) - (b.onHand || 0),
      defaultSortOrder: "descend" as const,
      render: (qty: number) => (
        <Tag
          color={qty > 10 ? "green" : qty > 0 ? "orange" : "red"}
          className="text-base font-bold px-3 py-1"
        >
          {qty || 0}
        </Tag>
      ),
    },
    {
      title: "Đã đặt",
      dataIndex: "reserved",
      key: "reserved",
      width: 100,
      align: "center" as const,
      render: (qty: number) => (
        <span className="text-orange-600 font-semibold">{qty || 0}</span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => {
        const qty = record.onHand || 0;
        if (qty === 0) return <Tag color="red">Hết hàng</Tag>;
        if (qty < 10) return <Tag color="orange">Sắp hết</Tag>;
        return <Tag color="green">Còn hàng</Tag>;
      },
    },
  ];

  const warehouseColumns = [
    {
      title: "Mã chi nhánh",
      dataIndex: "code",
      key: "code",
      width: 130,
      render: (code: string) => (
        <span className="font-mono font-bold text-purple-600">{code}</span>
      ),
    },
    {
      title: "Tên chi nhánh",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string) => (
        <span className="font-semibold text-gray-900">{name}</span>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 300,
      render: (address: string) => (
        <span className="text-gray-600">{address || "N/A"}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: string) => {
        const isActive = status?.toLowerCase() === "active";
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Hoạt động" : "Ngừng hoạt động"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Warehouse) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => showEditWarehouseModal(record)}
          block
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key === "inventory" && inventoryList.length === 0) {
            fetchInventoryList();
          }
          if (key === "warehouses" && warehouses.length === 0) {
            fetchWarehouses();
          }
        }}
        items={[
          {
            key: "warehouses",
            label: (
              <span className="flex items-center gap-2">
                <EnvironmentOutlined />
                Chi nhánh
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-end gap-2">
                  <Button
                    type="primary"
                    onClick={() => {
                      setEditingWarehouse(null);
                      warehouseForm.resetFields();
                      setWarehouseModalVisible(true);
                    }}
                  >
                    Thêm chi nhánh
                  </Button>
                  <Button onClick={fetchWarehouses} loading={warehouseLoading}>
                    Làm mới
                  </Button>
                </div>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Table
                    columns={warehouseColumns}
                    dataSource={warehouses.slice(
                      (warehouseCurrentPage - 1) * pageSize,
                      warehouseCurrentPage * pageSize
                    )}
                    loading={warehouseLoading}
                    rowKey="id"
                    pagination={false}
                  />
                </div>

                {warehouses.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      current={warehouseCurrentPage}
                      total={warehouses.length}
                      pageSize={pageSize}
                      onChange={(page) => setWarehouseCurrentPage(page)}
                      showSizeChanger={false}
                      showQuickJumper
                      locale={{ jump_to: "Đi đến trang", page: "" }}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} của ${total} chi nhánh`
                      }
                    />
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "stock-entries",
            label: (
              <span className="flex items-center gap-2">
                <FileTextOutlined />
                Phiếu nhập kho
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <Space>
                    <Button
                      type={
                        stockEntryStatusFilter === "all" ? "primary" : "default"
                      }
                      onClick={() => {
                        setStockEntryStatusFilter("all");
                        setStockEntryCurrentPage(1);
                      }}
                    >
                      Tất cả ({stockEntries.length})
                    </Button>
                    <Button
                      type={
                        stockEntryStatusFilter === "draft"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => {
                        setStockEntryStatusFilter("draft");
                        setStockEntryCurrentPage(1);
                      }}
                    >
                      Nháp (
                      {stockEntries.filter((e) => e.status === "draft").length})
                    </Button>
                    <Button
                      type={
                        stockEntryStatusFilter === "submitted"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => {
                        setStockEntryStatusFilter("submitted");
                        setStockEntryCurrentPage(1);
                      }}
                    >
                      Đã xác nhận (
                      {
                        stockEntries.filter((e) => e.status === "submitted")
                          .length
                      }
                      )
                    </Button>
                    <Button
                      type={
                        stockEntryStatusFilter === "cancelled"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => {
                        setStockEntryStatusFilter("cancelled");
                        setStockEntryCurrentPage(1);
                      }}
                    >
                      Đã hủy (
                      {
                        stockEntries.filter((e) => e.status === "cancelled")
                          .length
                      }
                      )
                    </Button>
                  </Space>
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => setCreateModalVisible(true)}
                    >
                      Tạo phiếu nhập kho
                    </Button>
                    <Button
                      onClick={fetchWarehouseData}
                      loading={warehouseLoading}
                    >
                      Làm mới
                    </Button>
                  </Space>
                </div>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Table
                    columns={stockEntryColumns}
                    dataSource={(stockEntryStatusFilter === "all"
                      ? stockEntries
                      : stockEntries.filter(
                          (entry) => entry.status === stockEntryStatusFilter
                        )
                    ).slice(
                      (stockEntryCurrentPage - 1) * pageSize,
                      stockEntryCurrentPage * pageSize
                    )}
                    loading={warehouseLoading}
                    rowKey="id"
                    pagination={false}
                  />
                </div>

                {stockEntries.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      current={stockEntryCurrentPage}
                      total={
                        stockEntryStatusFilter === "all"
                          ? stockEntries.length
                          : stockEntries.filter(
                              (entry) => entry.status === stockEntryStatusFilter
                            ).length
                      }
                      pageSize={pageSize}
                      onChange={(page) => setStockEntryCurrentPage(page)}
                      showSizeChanger={false}
                      showQuickJumper
                      locale={{ jump_to: "Đi đến trang", page: "" }}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} của ${total} phiếu kho`
                      }
                    />
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "inventory",
            label: (
              <span className="flex items-center gap-2">
                <InboxOutlined />
                Tồn kho hiện tại
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <Space>
                    <Button
                      type={
                        inventoryStockFilter === "all" ? "primary" : "default"
                      }
                      onClick={() => {
                        setInventoryStockFilter("all");
                        setInventoryCurrentPage(1);
                      }}
                    >
                      Tất cả ({inventoryList.length})
                    </Button>
                    <Button
                      type={
                        inventoryStockFilter === "in_stock"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => {
                        setInventoryStockFilter("in_stock");
                        setInventoryCurrentPage(1);
                      }}
                    >
                      Còn hàng (
                      {
                        inventoryList.filter(
                          (item: any) => (item.onHand || 0) > 0
                        ).length
                      }
                      )
                    </Button>
                    <Button
                      type={
                        inventoryStockFilter === "out_of_stock"
                          ? "primary"
                          : "default"
                      }
                      onClick={() => {
                        setInventoryStockFilter("out_of_stock");
                        setInventoryCurrentPage(1);
                      }}
                    >
                      Hết hàng (
                      {
                        inventoryList.filter(
                          (item: any) => (item.onHand || 0) === 0
                        ).length
                      }
                      )
                    </Button>
                  </Space>
                  <Button
                    onClick={fetchInventoryList}
                    loading={warehouseLoading}
                  >
                    Làm mới
                  </Button>
                </div>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Table
                    columns={inventoryColumns}
                    dataSource={inventoryList
                      .filter((item: any) => {
                        if (inventoryStockFilter === "all") return true;
                        if (inventoryStockFilter === "in_stock")
                          return (item.onHand || 0) > 0;
                        if (inventoryStockFilter === "out_of_stock")
                          return (item.onHand || 0) === 0;
                        return true;
                      })
                      .sort((a: any, b: any) => {
                        const aValue = a[inventorySortField] || 0;
                        const bValue = b[inventorySortField] || 0;
                        return inventorySortOrder === "ascend"
                          ? aValue - bValue
                          : bValue - aValue;
                      })
                      .slice(
                        (inventoryCurrentPage - 1) * pageSize,
                        inventoryCurrentPage * pageSize
                      )}
                    loading={warehouseLoading}
                    rowKey="id"
                    pagination={false}
                    onChange={(_pagination, _filters, sorter: any) => {
                      if (sorter.field) {
                        setInventorySortField(sorter.field);
                        setInventorySortOrder(sorter.order || "descend");
                      }
                    }}
                  />
                </div>

                {inventoryList.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      current={inventoryCurrentPage}
                      total={
                        inventoryList.filter((item: any) => {
                          if (inventoryStockFilter === "all") return true;
                          if (inventoryStockFilter === "in_stock")
                            return (item.onHand || 0) > 0;
                          if (inventoryStockFilter === "out_of_stock")
                            return (item.onHand || 0) === 0;
                          return true;
                        }).length
                      }
                      pageSize={pageSize}
                      onChange={(page) => setInventoryCurrentPage(page)}
                      showSizeChanger={false}
                      showQuickJumper
                      locale={{ jump_to: "Đi đến trang", page: "" }}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} của ${total} sản phẩm`
                      }
                    />
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal tạo phiếu kho */}
      <Modal
        title="Tạo phiếu nhập kho"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          stockEntryForm.resetFields();
          setSelectedProductForItem({});
          setSelectedVariantForItem({});
        }}
        footer={null}
        width={1200}
      >
        <Form
          form={stockEntryForm}
          layout="vertical"
          onFinish={handleCreateStockEntry}
          className="mt-4"
        >
          <Form.Item
            label="Loại phiếu"
            name="type"
            initialValue="IMPORT"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Select.Option value="IMPORT">Nhập kho</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Nhà cung cấp"
            name="supplierName"
            rules={[{ required: true, message: "Vui lòng nhập nhà cung cấp" }]}
          >
            <Input size="large" placeholder="Tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            label="Kho"
            name="warehouseId"
            rules={[{ required: true, message: "Vui lòng chọn kho" }]}
          >
            <Select size="large" placeholder="Chọn kho">
              {warehouses.map((warehouse) => (
                <Select.Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <Form.List name="items">
            {(fields, { add }) => (
              <>
                <div className="mb-2 flex justify-between items-center">
                  <h4 className="font-semibold">Thông tin sản phẩm</h4>
                  {fields.length === 0 && (
                    <Button type="dashed" onClick={() => add()}>
                      + Thêm sản phẩm
                    </Button>
                  )}
                </div>
                {fields.map((field) => {
                  const selectedProduct = products.find(
                    (p) => p.id === selectedProductForItem[field.name]
                  );
                  const selectedVariantId = selectedVariantForItem[field.name];
                  const selectedVariant = selectedProduct?.variants?.find(
                    (v: any) => v.id === selectedVariantId
                  );

                  return (
                    <div
                      key={field.key}
                      className="border p-4 rounded-lg mb-3 bg-gray-50"
                    >
                      {selectedVariant && (
                        <div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border-2 border-purple-200">
                          <img
                            src={selectedVariant.imageUrl}
                            alt={selectedProduct?.name}
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                          />
                          <div className="flex-1">
                            <h5 className="font-bold text-lg text-purple-700">
                              {selectedProduct?.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Màu:</span>{" "}
                              {selectedVariant.color?.name} |
                              <span className="font-semibold ml-2">Size:</span>{" "}
                              {selectedVariant.size}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">SKU:</span>{" "}
                              {selectedVariant.sku}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-12 gap-3 items-start">
                        <Form.Item
                          {...field}
                          name={[field.name, "productId"]}
                          label="Sản phẩm"
                          rules={[{ required: true, message: "Chọn sản phẩm" }]}
                          className="col-span-3 mb-0"
                        >
                          <Select
                            placeholder="Chọn sản phẩm"
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            onChange={(value) => {
                              setSelectedProductForItem((prev) => ({
                                ...prev,
                                [field.name]: value,
                              }));
                              setSelectedVariantForItem((prev) => {
                                const newState = { ...prev };
                                delete newState[field.name];
                                return newState;
                              });
                              const items =
                                stockEntryForm.getFieldValue("items");
                              items[field.name].variantId = undefined;
                              stockEntryForm.setFieldsValue({ items });
                            }}
                            options={products.map((product) => ({
                              label: product.name,
                              value: product.id,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "variantId"]}
                          label="Biến thể (Màu - Size)"
                          rules={[{ required: true, message: "Chọn biến thể" }]}
                          className="col-span-3 mb-0"
                        >
                          <Select
                            placeholder="Chọn màu và size"
                            disabled={!selectedProduct}
                            onChange={(value) => {
                              setSelectedVariantForItem((prev) => ({
                                ...prev,
                                [field.name]: value,
                              }));
                            }}
                            options={
                              selectedProduct?.variants.map((variant: any) => ({
                                label: `${variant.color.name} - ${variant.size}`,
                                value: variant.id,
                              })) || []
                            }
                          />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "quantity"]}
                          label="Số lượng"
                          rules={[{ required: true }]}
                          className="col-span-2 mb-0"
                        >
                          <InputNumber
                            min={1}
                            placeholder="SL"
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "rate"]}
                          label="Đơn giá nhập"
                          rules={[{ required: true }]}
                          className="col-span-3 mb-0"
                        >
                          <InputNumber
                            min={0}
                            placeholder="Giá"
                            className="w-full"
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Form.Item>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </Form.List>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Tạo phiếu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal xem chi tiết phiếu kho */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <FileTextOutlined className="text-purple-600" />
            <span>Chi tiết phiếu kho</span>
          </div>
        }
        open={stockEntryDetailVisible}
        onCancel={() => {
          setStockEntryDetailVisible(false);
          setSelectedStockEntry(null);
          setEnrichedItems([]);
        }}
        footer={null}
        width={1000}
      >
        {selectedStockEntry && (
          <div className="space-y-4">
            {/* Thông tin phiếu */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã phiếu</p>
                  <p className="font-mono font-bold text-purple-600">
                    {selectedStockEntry.id}...
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loại phiếu</p>
                  <Tag
                    color={
                      selectedStockEntry.type === "IMPORT" ? "green" : "orange"
                    }
                  >
                    {selectedStockEntry.type === "IMPORT"
                      ? "Nhập kho"
                      : "Xuất kho"}
                  </Tag>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nhà cung cấp</p>
                  <p className="font-semibold">
                    {selectedStockEntry.supplierName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <Tag
                    color={
                      selectedStockEntry.status === "draft"
                        ? "default"
                        : selectedStockEntry.status === "submitted"
                        ? "blue"
                        : "red"
                    }
                  >
                    {selectedStockEntry.status === "draft"
                      ? "Nháp"
                      : selectedStockEntry.status === "submitted"
                      ? "Đã xác nhận"
                      : "Đã hủy"}
                  </Tag>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-semibold">
                    {new Date(selectedStockEntry.createdAt).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng giá trị</p>
                  <p className="font-bold text-xl text-purple-600">
                    {selectedStockEntry.totalCost?.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
              {selectedStockEntry.note && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-sm text-gray-600">Ghi chú</p>
                  <p className="text-gray-800">{selectedStockEntry.note}</p>
                </div>
              )}
            </div>

            {/* Danh sách sản phẩm */}
            <div>
              <h4 className="font-semibold text-lg mb-3">Danh sách sản phẩm</h4>
              {loadingDetail ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrichedItems.map((item, index) => {
                    const inv = item.inventoryDetail;
                    const variant = inv?.variant;
                    const product = variant?.product;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                      >
                        {/* Hình ảnh */}
                        <img
                          src={variant?.imageUrl || "/placeholder-image.png"}
                          alt={product?.name || "Product"}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                        />

                        {/* Thông tin sản phẩm */}
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900">
                            {product?.name || "N/A"}
                          </h5>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Màu:</span>{" "}
                            {variant?.color?.name || "N/A"} |{" "}
                            <span className="font-semibold">Size:</span>{" "}
                            {variant?.size || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            SKU: {variant?.sku || "N/A"}
                          </p>
                        </div>

                        {/* Số lượng và giá */}
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Số lượng</p>
                          <p className="font-bold text-lg text-blue-600">
                            {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Đơn giá</p>
                          <p className="font-bold text-purple-600">
                            {item.rate?.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Thành tiền</p>
                          <p className="font-bold text-xl text-green-600">
                            {(item.quantity * item.rate)?.toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tổng cộng */}
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  Tổng cộng
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {selectedStockEntry.totalCost?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal thêm/sửa chi nhánh */}
      <Modal
        title={editingWarehouse ? "Cập nhật chi nhánh" : "Thêm chi nhánh mới"}
        open={warehouseModalVisible}
        onCancel={() => {
          setWarehouseModalVisible(false);
          warehouseForm.resetFields();
          setEditingWarehouse(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={warehouseForm}
          layout="vertical"
          onFinish={
            editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse
          }
          className="mt-4"
        >
          <Form.Item
            label="Tên chi nhánh"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
          >
            <Input size="large" placeholder="Ví dụ: Chi nhánh Quận 1" />
          </Form.Item>

          <Form.Item
            label="Mã chi nhánh"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã chi nhánh" }]}
          >
            <Input
              size="large"
              placeholder="Ví dụ: CN001"
              disabled={!!editingWarehouse}
            />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập địa chỉ chi tiết của chi nhánh"
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setWarehouseModalVisible(false);
                warehouseForm.resetFields();
                setEditingWarehouse(null);
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingWarehouse ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InventorySection;
