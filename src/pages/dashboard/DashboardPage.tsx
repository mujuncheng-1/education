import {
  Button,
  Card,
  Col,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
} from "antd";
import ReactECharts from "echarts-for-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardOverviewApi } from "../../api/modules/dashboard";
import { PageHeader } from "../../components/PageHeader";
import type { DashboardOverview } from "../../types/dashboard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardOverviewApi();
      setOverview(data);
    } catch (error) {
      console.error("[DashboardPage] 加载概览失败", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const quickActionList = [
    { key: "children", label: "新增幼儿档案", path: "/children" },
    { key: "attendance", label: "补录考勤", path: "/attendance" },
    { key: "recipe", label: "调整本周食谱", path: "/recipe" },
    { key: "finance", label: "查看欠费名单", path: "/finance" },
  ];

  const alerts = [
    "中二班今日缺勤率高于 8%，建议班主任确认家长通知是否到位。",
    "2 名幼儿晨检体温接近阈值，建议保健室复测。",
    "本月收费率仍有 4% 缺口，可发起二次催缴提醒。",
  ];

  const recipeOption = useMemo(() => {
    if (!overview) {
      return {};
    }

    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: overview.weekRecipeSummary.map((item) => item.day),
      },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: overview.weekRecipeSummary.map((item) => item.calories),
          itemStyle: { borderRadius: [8, 8, 0, 0], color: "#FF8A30" },
        },
      ],
    };
  }, [overview]);

  const financeOption = useMemo(() => {
    if (!overview) {
      return {};
    }

    return {
      tooltip: { trigger: "axis" },
      legend: { data: ["收入", "支出"] },
      xAxis: {
        type: "category",
        data: overview.monthlyIncomeTrend.map((item) => item.month),
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "收入",
          type: "line",
          smooth: true,
          data: overview.monthlyIncomeTrend.map((item) => item.income),
          areaStyle: { color: "rgba(46, 113, 255, 0.18)" },
          itemStyle: { color: "#2E71FF" },
        },
        {
          name: "支出",
          type: "line",
          smooth: true,
          data: overview.monthlyIncomeTrend.map((item) => item.expense),
          areaStyle: { color: "rgba(255, 122, 69, 0.18)" },
          itemStyle: { color: "#FF7A45" },
        },
      ],
    };
  }, [overview]);

  return (
    <div>
      <PageHeader
        title="园长仪表盘"
        description="实时掌握在园人数、考勤、食谱和财务核心数据"
        extra={
          <Space>
            <Tag color="processing">数据实时刷新</Tag>
            <Button size="small" onClick={() => void fetchData()}>
              立即刷新
            </Button>
          </Space>
        }
      />

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Card className="metric-card metric-blue">
              <Statistic
                title="在园幼儿"
                value={overview?.childrenTotal ?? 0}
                suffix="人"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card className="metric-card metric-orange">
              <Statistic
                title="班级数量"
                value={overview?.classTotal ?? 0}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card className="metric-card metric-green">
              <Statistic
                title="教职工"
                value={overview?.staffTotal ?? 0}
                suffix="人"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card className="metric-card metric-rose">
              <Statistic
                title="今日出勤率"
                value={
                  overview
                    ? Number(
                        (
                          (overview.todayAttendance.arrived /
                            overview.todayAttendance.shouldArrive) *
                          100
                        ).toFixed(1),
                      )
                    : 0
                }
                suffix="%"
              />
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card
              title="本周食谱热量分布"
              extra={<Tag color="orange">营养分析</Tag>}
            >
              <ReactECharts option={recipeOption} style={{ height: 320 }} />
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card title="收支趋势" extra={<Tag color="blue">财务统计</Tag>}>
              <ReactECharts option={financeOption} style={{ height: 320 }} />
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card title="快捷操作" extra={<Tag color="cyan">亮点功能</Tag>}>
              <Space wrap>
                {quickActionList.map((item) => (
                  <Button
                    key={item.key}
                    className="quick-action-btn"
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Space>
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card title="关键预警" extra={<Tag color="red">需关注</Tag>}>
              <List
                dataSource={alerts}
                renderItem={(item) => (
                  <List.Item>
                    <div className="alert-item">{item}</div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
