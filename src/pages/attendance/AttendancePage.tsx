import {
  Badge,
  Calendar,
  Card,
  Col,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
} from "antd";
import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { getAttendanceSummaryApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

interface AttendanceState {
  stats: Array<{ label: string; value: number; trend?: number }>;
  records: Array<{
    id: string;
    name: string;
    className: string;
    status: string;
    date: string;
  }>;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  正常: "success",
  请假: "warning",
  缺勤: "error",
  毕业: "default",
  退学: "default",
};

export default function AttendancePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceState>({ stats: [], records: [] });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAttendanceSummaryApi();
        setData(res);
      } catch (error) {
        console.error("[AttendancePage] 获取考勤失败", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const statusByDate = (value: Dayjs) => {
    const seed = value.date() % 6;
    if (seed === 0) {
      return { status: "error" as const, text: "缺勤" };
    }
    if (seed === 2) {
      return { status: "warning" as const, text: "请假" };
    }
    return { status: "success" as const, text: "正常" };
  };

  return (
    <div>
      <PageHeader
        title="日常考勤管理"
        description="支持幼儿考勤、缺勤跟踪、请假审批与考勤统计导出"
        extra={<Tag color="processing">可扩展人脸识别结果展示</Tag>}
      />

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {data.stats.map((item) => (
            <Col xs={24} sm={12} xl={6} key={item.label}>
              <Card>
                <Statistic
                  title={item.label}
                  value={item.value}
                  suffix={
                    item.label === "应到" || item.label === "实到" ? "人" : ""
                  }
                />
                <div className="metric-trend">较昨日 {item.trend ?? 0}%</div>
              </Card>
            </Col>
          ))}

          <Col xs={24} xl={10}>
            <Card title="月度考勤日历视图">
              <Calendar
                fullscreen={false}
                cellRender={(current) => {
                  const item = statusByDate(current);
                  return <Badge status={item.status} text={item.text} />;
                }}
              />
            </Card>
          </Col>

          <Col xs={24} xl={14}>
            <Card title="今日考勤明细">
              <Table
                rowKey="id"
                size="small"
                pagination={{ pageSize: 8 }}
                columns={[
                  { title: "姓名", dataIndex: "name" },
                  { title: "班级", dataIndex: "className" },
                  {
                    title: "状态",
                    dataIndex: "status",
                    render: (value: string) => (
                      <Tag color={STATUS_COLOR_MAP[value] || "default"}>
                        {value}
                      </Tag>
                    ),
                  },
                  { title: "日期", dataIndex: "date" },
                ]}
                dataSource={data.records}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
