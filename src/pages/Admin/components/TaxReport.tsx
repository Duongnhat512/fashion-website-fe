import { useState, useEffect } from "react";
import {
  Card,
  Select,
  Button,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Tabs,
} from "antd";
import {
  FileText,
  Download,
  Calculator,
  Building,
  TrendingUp,
} from "lucide-react";
import dayjs from "dayjs";
import { taxService } from "../../../services/taxService";

const { Option } = Select;
const { TabPane } = Tabs;

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

export default function TaxReport() {
  const [vatReportData, setVatReportData] = useState<any>(null);
  const [citReportData, setCitReportData] = useState<any>(null);
  const [financialReportData, setFinancialReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("vat");
  const [reportType, setReportType] = useState<"year" | "month" | "quarter">(
    "month"
  );
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(
    Math.ceil((dayjs().month() + 1) / 3)
  );

  const fetchVATReport = async () => {
    setLoading(true);
    try {
      let data;
      if (reportType === "year") {
        data = await taxService.getVATReport(selectedYear);
      } else if (reportType === "month") {
        data = await taxService.getVATReport(selectedYear, selectedMonth);
      } else if (reportType === "quarter") {
        data = await taxService.getVATReport(
          selectedYear,
          undefined,
          selectedQuarter
        );
      }
      setVatReportData(data);
    } catch (error) {
      console.error("Error fetching VAT report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCITReport = async () => {
    setLoading(true);
    try {
      const data = await taxService.getCITReport(selectedYear);
      setCitReportData(data);
    } catch (error) {
      console.error("Error fetching CIT report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialReport = async () => {
    setLoading(true);
    try {
      const data = await taxService.getFinancialReport(selectedYear);
      setFinancialReportData(data);
    } catch (error) {
      console.error("Error fetching financial report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportVATReport = async () => {
    try {
      let blob: Blob;
      if (reportType === "year") {
        blob = await taxService.exportVATReport(selectedYear);
      } else if (reportType === "month") {
        blob = await taxService.exportVATReport(selectedYear, selectedMonth);
      } else if (reportType === "quarter") {
        blob = await taxService.exportVATReport(
          selectedYear,
          undefined,
          selectedQuarter
        );
      } else {
        throw new Error("Invalid report type");
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VAT_Report_${selectedYear}_${
        reportType === "month"
          ? `Month_${selectedMonth}`
          : reportType === "quarter"
          ? `Quarter_${selectedQuarter}`
          : "Year"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting VAT report:", error);
    }
  };

  const exportCITReport = async () => {
    try {
      const blob = await taxService.exportCITReport(selectedYear);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CIT_Report_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CIT report:", error);
    }
  };

  const exportFinancialReport = async () => {
    try {
      const blob = await taxService.exportFinancialReport(selectedYear);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Financial_Report_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Financial report:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "cit") {
      fetchCITReport();
    } else if (activeTab === "financial") {
      fetchFinancialReport();
    }
  }, [activeTab, selectedYear]);

  const outputColumns = [
    {
      title: "Số hóa đơn",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 150,
    },
    {
      title: "Ngày hóa đơn",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      width: 120,
    },
    {
      title: "Khách hàng",
      dataIndex: "partnerName",
      key: "partnerName",
      width: 150,
    },
    {
      title: "Tên hàng",
      dataIndex: "itemName",
      key: "itemName",
      ellipsis: true,
    },
    {
      title: "Doanh thu",
      dataIndex: "netValue",
      key: "netValue",
      render: (value: number) => formatCurrency(value),
      align: "right" as const,
      width: 120,
    },
    {
      title: "VAT (%)",
      dataIndex: "vatRate",
      key: "vatRate",
      render: (rate: number) => `${rate}%`,
      align: "center" as const,
      width: 80,
    },
    {
      title: "Tiền VAT",
      dataIndex: "vatAmount",
      key: "vatAmount",
      render: (value: number) => formatCurrency(value),
      align: "right" as const,
      width: 120,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (value: number) => formatCurrency(value),
      align: "right" as const,
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status === "completed" ? "Hoàn thành" : "Đang xử lý"}
        </Tag>
      ),
      width: 100,
    },
  ];

  const inputColumns = [
    {
      title: "Số hóa đơn",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 150,
    },
    {
      title: "Ngày hóa đơn",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      width: 120,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "partnerName",
      key: "partnerName",
      width: 150,
    },
    {
      title: "Tên hàng",
      dataIndex: "itemName",
      key: "itemName",
      ellipsis: true,
    },
    {
      title: "Chi phí",
      dataIndex: "netValue",
      key: "netValue",
      render: (value: number) => formatCurrency(value),
      align: "right" as const,
      width: 120,
    },
    {
      title: "VAT (%)",
      dataIndex: "vatRate",
      key: "vatRate",
      render: (rate: number) => `${rate}%`,
      align: "center" as const,
      width: 80,
    },
    {
      title: "VAT khấu trừ",
      dataIndex: "vatAmount",
      key: "vatAmount",
      render: (value: number) => formatCurrency(value),
      align: "right" as const,
      width: 120,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (value: number) => formatCurrency(value),
      align: "right" as const,
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "submitted" ? "blue" : "orange"}>
          {status === "submitted" ? "Đã nộp" : "Đang xử lý"}
        </Tag>
      ),
      width: 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          type="primary"
          icon={<Download size={16} />}
          size="large"
          className="bg-gradient-to-r from-purple-600 to-blue-600 border-none"
          onClick={
            activeTab === "vat"
              ? vatReportData
                ? exportVATReport
                : undefined
              : activeTab === "cit"
              ? citReportData
                ? exportCITReport
                : undefined
              : activeTab === "financial"
              ? financialReportData
                ? exportFinancialReport
                : undefined
              : undefined
          }
          disabled={
            (activeTab === "vat" && !vatReportData) ||
            (activeTab === "cit" && !citReportData) ||
            (activeTab === "financial" && !financialReportData)
          }
        >
          Xuất báo cáo PDF
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="Thuế Giá Trị Gia Tăng (VAT)" key="vat">
          {/* VAT Report Content */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="shadow-lg">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại báo cáo
                  </label>
                  <Select
                    value={reportType}
                    onChange={setReportType}
                    style={{ width: 150 }}
                  >
                    <Option value="year">Theo năm</Option>
                    <Option value="quarter">Theo quý</Option>
                    <Option value="month">Theo tháng</Option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm
                  </label>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    style={{ width: 100 }}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Option
                        key={dayjs().year() - i}
                        value={dayjs().year() - i}
                      >
                        {dayjs().year() - i}
                      </Option>
                    ))}
                  </Select>
                </div>

                {reportType === "month" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tháng
                    </label>
                    <Select
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                      style={{ width: 100 }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <Option key={i + 1} value={i + 1}>
                          Tháng {i + 1}
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}

                {reportType === "quarter" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quý
                    </label>
                    <Select
                      value={selectedQuarter}
                      onChange={setSelectedQuarter}
                      style={{ width: 100 }}
                    >
                      <Option value={1}>Quý 1</Option>
                      <Option value={2}>Quý 2</Option>
                      <Option value={3}>Quý 3</Option>
                      <Option value={4}>Quý 4</Option>
                    </Select>
                  </div>
                )}

                <Button
                  type="primary"
                  onClick={fetchVATReport}
                  loading={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-none"
                >
                  Xem báo cáo
                </Button>
              </div>
            </Card>

            {vatReportData && (
              <>
                {/* Company Info */}
                <Card className="shadow-lg">
                  <div className="flex items-start gap-4">
                    <Building className="text-purple-600 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vatReportData.companyInfo.name}
                      </h3>
                      <p className="text-gray-600">
                        Mã số thuế: {vatReportData.companyInfo.taxCode}
                      </p>
                      <p className="text-gray-600">
                        {vatReportData.companyInfo.address}
                      </p>
                      <p className="text-gray-600">
                        {vatReportData.companyInfo.phone} |{" "}
                        {vatReportData.companyInfo.email}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Tax Summary */}
                <Row gutter={16}>
                  <Col span={8}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="VAT phải nộp"
                        value={vatReportData.taxSummary.vatPayable}
                        formatter={(value) => formatCurrency(Number(value))}
                        valueStyle={{
                          color: vatReportData.taxSummary.isNegative
                            ? "#3f8600"
                            : "#cf1322",
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="VAT đầu vào"
                        value={vatReportData.inputVat.totalVatDeductible}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="VAT đầu ra"
                        value={vatReportData.outputVat.totalVatAmount}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Output VAT */}
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <Calculator className="text-green-600" size={20} />
                      <span>VAT đầu ra (Doanh thu)</span>
                    </div>
                  }
                  className="shadow-lg"
                >
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Tổng doanh thu:{" "}
                      <strong>
                        {formatCurrency(
                          vatReportData.outputVat.totalNetRevenue
                        )}
                      </strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng VAT:{" "}
                      <strong>
                        {formatCurrency(vatReportData.outputVat.totalVatAmount)}
                      </strong>
                    </p>
                  </div>
                  <Table
                    columns={outputColumns}
                    dataSource={vatReportData.outputVat.details}
                    rowKey="invoiceNumber"
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 10,
                      position: ["bottomCenter"],
                      showQuickJumper: true,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} mục`,
                    }}
                  />
                </Card>

                {/* Input VAT */}
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <Calculator className="text-blue-600" size={20} />
                      <span>VAT đầu vào (Chi phí)</span>
                    </div>
                  }
                  className="shadow-lg"
                >
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Tổng chi phí:{" "}
                      <strong>
                        {formatCurrency(vatReportData.inputVat.totalNetCost)}
                      </strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      VAT khấu trừ:{" "}
                      <strong>
                        {formatCurrency(
                          vatReportData.inputVat.totalVatDeductible
                        )}
                      </strong>
                    </p>
                  </div>
                  <Table
                    columns={inputColumns}
                    dataSource={vatReportData.inputVat.details}
                    rowKey="invoiceNumber"
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 10,
                      position: ["bottomCenter"],
                      showQuickJumper: true,
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} mục`,
                    }}
                  />
                </Card>
              </>
            )}
          </div>
        </TabPane>

        <TabPane tab="Thuế Thu Nhập Doanh Nghiệp (CIT)" key="cit">
          {/* CIT Report Content */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="shadow-lg">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm báo cáo
                  </label>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    style={{ width: 100 }}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Option
                        key={dayjs().year() - i}
                        value={dayjs().year() - i}
                      >
                        {dayjs().year() - i}
                      </Option>
                    ))}
                  </Select>
                </div>

                <Button
                  type="primary"
                  onClick={fetchCITReport}
                  loading={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-none"
                >
                  Xem báo cáo
                </Button>
              </div>
            </Card>

            {citReportData && (
              <>
                {/* Company Info */}
                <Card className="shadow-lg">
                  <div className="flex items-start gap-4">
                    <Building className="text-purple-600 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {citReportData.companyInfo.name}
                      </h3>
                      <p className="text-gray-600">
                        Mã số thuế: {citReportData.companyInfo.taxCode}
                      </p>
                      <p className="text-gray-600">
                        Lĩnh vực: {citReportData.companyInfo.businessSector} (
                        {citReportData.companyInfo.sectorPercentage}%)
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Period Info */}
                <Card className="shadow-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-purple-600" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Kỳ tính thuế: {citReportData.period.year}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Từ{" "}
                        {dayjs(citReportData.period.fromDate).format(
                          "DD/MM/YYYY"
                        )}
                        đến{" "}
                        {dayjs(citReportData.period.toDate).format(
                          "DD/MM/YYYY"
                        )}
                        {citReportData.period.isAnnual ? " (Báo cáo năm)" : ""}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Revenue Statistics */}
                <Row gutter={16}>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Doanh thu bán hàng"
                        value={citReportData.revenue.salesRevenue}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Doanh thu tài chính"
                        value={citReportData.revenue.financialRevenue}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Thu nhập khác"
                        value={citReportData.revenue.otherIncome}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Tổng doanh thu"
                        value={citReportData.revenue.totalRevenue}
                        formatter={(value) => formatCurrency(Number(value))}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Expenses Statistics */}
                <Row gutter={16}>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Giá vốn hàng bán"
                        value={citReportData.expenses.costOfGoodsSold}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Chi phí bán hàng"
                        value={citReportData.expenses.sellingExpenses}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Chi phí quản lý"
                        value={citReportData.expenses.adminExpenses}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card className="shadow-lg">
                      <Statistic
                        title="Tổng chi phí khấu trừ"
                        value={citReportData.expenses.totalDeductibleExpenses}
                        formatter={(value) => formatCurrency(Number(value))}
                        valueStyle={{ color: "#cf1322" }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Tax Calculation */}
                <Card className="shadow-lg">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calculator className="text-purple-600" size={20} />
                      Tính thuế thu nhập doanh nghiệp
                    </h3>

                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Lợi nhuận trước thuế
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(
                              citReportData.taxCalculation.profitBeforeTax
                            )}
                          </p>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Thu nhập tính thuế
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(
                              citReportData.taxCalculation.taxableIncome
                            )}
                          </p>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                          <p className="text-sm text-green-600">
                            Thuế Thu Nhập Doanh Nghiệp (
                            {citReportData.taxCalculation.taxRate}%)
                          </p>
                          <p className="text-xl font-bold text-green-700">
                            {formatCurrency(
                              citReportData.taxCalculation.citAmount
                            )}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </>
            )}
          </div>
        </TabPane>

        <TabPane tab="Báo cáo tài chính" key="financial">
          {/* Financial Report Content */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="shadow-lg">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm báo cáo
                  </label>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    style={{ width: 100 }}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Option
                        key={dayjs().year() - i}
                        value={dayjs().year() - i}
                      >
                        {dayjs().year() - i}
                      </Option>
                    ))}
                  </Select>
                </div>

                <Button
                  type="primary"
                  onClick={fetchFinancialReport}
                  loading={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 border-none"
                >
                  Xem báo cáo
                </Button>
              </div>
            </Card>

            {financialReportData && (
              <>
                {/* Company Info */}
                <Card className="shadow-lg">
                  <div className="flex items-start gap-4">
                    <Building className="text-purple-600 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {financialReportData.companyInfo.name}
                      </h3>
                      <p className="text-gray-600">
                        Mã số thuế: {financialReportData.companyInfo.taxCode}
                      </p>
                      <p className="text-gray-600">
                        {financialReportData.companyInfo.address}
                      </p>
                      <p className="text-gray-600">
                        Người đại diện:{" "}
                        {financialReportData.companyInfo.legalRepresentative}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Năm tài chính: {financialReportData.fiscalYear} | Ngày
                        báo cáo:{" "}
                        {dayjs(financialReportData.reportDate).format(
                          "DD/MM/YYYY"
                        )}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Balance Sheet */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assets */}
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-green-600" size={20} />
                        <span>TÀI SẢN</span>
                      </div>
                    }
                    className="shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="border-b pb-3">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Tài sản lưu động
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Tiền mặt:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                financialReportData.balanceSheet.assets
                                  .currentAssets.cash
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hàng tồn kho:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                financialReportData.balanceSheet.assets
                                  .currentAssets.inventory
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phải thu:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                financialReportData.balanceSheet.assets
                                  .currentAssets.receivables
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-blue-600 border-t pt-1">
                            <span>Tổng tài sản lưu động:</span>
                            <span>
                              {formatCurrency(
                                financialReportData.balanceSheet.assets
                                  .currentAssets.totalCurrentAssets
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Tài sản cố định
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between font-semibold text-green-600 border-t pt-1">
                            <span>Tổng tài sản:</span>
                            <span>
                              {formatCurrency(
                                financialReportData.balanceSheet.assets
                                  .totalAssets
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Liabilities & Equity */}
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <Calculator className="text-red-600" size={20} />
                        <span>NGUỒN VỐN</span>
                      </div>
                    }
                    className="shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="border-b pb-3">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Nợ phải trả
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Nợ ngắn hạn:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                financialReportData.balanceSheet.resources
                                  .liabilities.shortTermDebt.totalShortTermDebt
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Nợ dài hạn:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                financialReportData.balanceSheet.resources
                                  .liabilities.longTermDebt.totalLongTermDebt
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-red-600 border-t pt-1">
                            <span>Tổng nợ:</span>
                            <span>
                              {formatCurrency(
                                financialReportData.balanceSheet.resources
                                  .liabilities.totalLiabilities
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Vốn chủ sở hữu
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between font-semibold text-green-600 border-t pt-1">
                            <span>Tổng vốn:</span>
                            <span>
                              {formatCurrency(
                                financialReportData.balanceSheet.resources
                                  .equity.totalEquity
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-purple-600 border-t pt-1 mt-2">
                            <span>Tổng nguồn vốn:</span>
                            <span>
                              {formatCurrency(
                                financialReportData.balanceSheet.resources
                                  .totalResources
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Income Statement */}
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-600" size={20} />
                      <span>BÁO CÁO KẾT QUẢ KINH DOANH</span>
                    </div>
                  }
                  className="shadow-lg"
                >
                  <div className="space-y-4">
                    {/* Revenue */}
                    <div className="border-b pb-3">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Doanh thu
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600">
                            Doanh thu bán hàng
                          </p>
                          <p className="text-lg font-bold text-blue-700">
                            {formatCurrency(
                              financialReportData.incomeStatement.revenue
                                .salesRevenue
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600">
                            Doanh thu tài chính
                          </p>
                          <p className="text-lg font-bold text-blue-700">
                            {formatCurrency(
                              financialReportData.incomeStatement.revenue
                                .financialRevenue
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <p className="text-sm text-blue-600">
                            Tổng doanh thu
                          </p>
                          <p className="text-xl font-bold text-blue-800">
                            {formatCurrency(
                              financialReportData.incomeStatement.revenue
                                .totalRevenue
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expenses */}
                    <div className="border-b pb-3">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Chi phí
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">
                            Giá vốn hàng bán
                          </p>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(
                              financialReportData.incomeStatement
                                .costOfGoodsSold
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">
                            Chi phí bán hàng
                          </p>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(
                              financialReportData.incomeStatement
                                .operatingExpenses.sellingExpenses
                            )}
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">
                            Chi phí quản lý
                          </p>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(
                              financialReportData.incomeStatement
                                .operatingExpenses.adminExpenses
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profit Summary */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Kết quả kinh doanh
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Lợi nhuận gộp</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(
                              financialReportData.incomeStatement.grossProfit
                            )}
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                          <p className="text-sm text-yellow-600">
                            Lợi nhuận trước thuế
                          </p>
                          <p className="text-xl font-bold text-yellow-700">
                            {formatCurrency(
                              financialReportData.incomeStatement
                                .profitBeforeTax
                            )}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                          <p className="text-sm text-green-600">
                            Lợi nhuận sau thuế
                          </p>
                          <p className="text-xl font-bold text-green-700">
                            {formatCurrency(
                              financialReportData.incomeStatement.profitAfterTax
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}
