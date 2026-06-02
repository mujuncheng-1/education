import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { BasicMetric } from "../../api/modules/common";
import { getFinanceSummaryApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

interface FinanceState {
  stats: BasicMetric[];
  trend: Array<{ month: string; income: number; expense: number }>;
}

const BILL_LIST = [
  {
    id: "bill-1",
    childName: "刘思语",
    feeType: "学费",
    amount: 3200,
    status: "已缴费",
  },
  {
    id: "bill-2",
    childName: "王梓涵",
    feeType: "伙食费",
    amount: 680,
    status: "待缴费",
  },
  {
    id: "bill-3",
    childName: "陈予安",
    feeType: "杂费",
    amount: 360,
    status: "已缴费",
  },
  {
    id: "bill-4",
    childName: "赵欣然",
    feeType: "学费",
    amount: 3200,
    status: "待缴费",
  },
];

export default function FinancePage() {
  const [data, setData] = useState<FinanceState>({ stats: [], trend: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFinanceSummaryApi();
        setData(res);
      } catch (error) {
        console.error("[FinancePage] 获取财务数据失败", error);
      }
    };

    void load();
  }, []);

  const trendOption = useMemo(() => {
    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: data.trend.map((item) => item.month),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "收入",
          type: "bar",
          data: data.trend.map((item) => item.income),
          itemStyle: { color: "#2e71ff" },
        },
        {
          name: "支出",
          type: "bar",
          data: data.trend.map((item) => item.expense),
          itemStyle: { color: "#ff8a30" },
        },
      ],
    };
  }, [data.trend]);

  return (
    <div>
      <PageHeader
        title="财务管理"
        description="收费、欠费提醒、支出登记与财务报表可视化"
        extra={<Tag color="red">欠费可一键催缴</Tag>}
      />

      <Row gutter={[16, 16]}>
        {data.stats.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.label}>
            <Card>
              <Statistic
                title={item.label}
                value={item.value}
                suffix={item.label.includes("率") ? "%" : ""}
              />
              <div className="metric-trend">趋势 {item.trend ?? 0}%</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 4 }}>
        <Col xs={24} xl={13}>
          <Card title="收支月度趋势">
            <ReactECharts option={trendOption} style={{ height: 320 }} />
          </Card>
        </Col>

        <Col xs={24} xl={11}>
          <Card title="缴费记录">
            <Table
              rowKey="id"
              pagination={false}
              columns={[
                { title: "幼儿", dataIndex: "childName" },
                { title: "项目", dataIndex: "feeType" },
                { title: "金额", dataIndex: "amount" },
                {
                  title: "状态",
                  dataIndex: "status",
                  render: (value: string) => (
                    <Tag color={value === "已缴费" ? "green" : "red"}>
                      {value}
                    </Tag>
                  ),
                },
              ]}
              dataSource={BILL_LIST}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
