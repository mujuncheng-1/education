import { Badge, Card, Col, Row, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { getHealthMorningCheckApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

interface HealthRecord {
  id: string;
  childName: string;
  className: string;
  temperature: number;
  oralCheck: string;
  handCheck: string;
  spirit: string;
  abnormal: boolean;
}

export default function HealthPage() {
  const [list, setList] = useState<HealthRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getHealthMorningCheckApi();
        setList(res.list);
      } catch (error) {
        console.error("[HealthPage] 获取晨检记录失败", error);
      }
    };

    void load();
  }, []);

  const tempOption = useMemo(() => {
    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: list.map((item) => item.childName),
      },
      yAxis: {
        type: "value",
        min: 35,
        max: 39,
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: list.map((item) => item.temperature),
          markLine: {
            data: [{ yAxis: 37.3, name: "预警阈值" }],
          },
        },
      ],
    };
  }, [list]);

  return (
    <div>
      <PageHeader
        title="保健与卫生管理"
        description="晨检、体温、口腔手部检查、异常标记与生长发育分析"
        extra={<Tag color="warning">发现异常将自动提醒班主任</Tag>}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="晨检异常一览">
            <Table
              rowKey="id"
              dataSource={list}
              pagination={{ pageSize: 8 }}
              columns={[
                { title: "姓名", dataIndex: "childName" },
                { title: "班级", dataIndex: "className" },
                {
                  title: "体温",
                  dataIndex: "temperature",
                  render: (value: number) => (
                    <span
                      style={{ color: value > 37.3 ? "#ff4d4f" : "inherit" }}
                    >
                      {value}°C
                    </span>
                  ),
                },
                { title: "口腔", dataIndex: "oralCheck" },
                { title: "手部", dataIndex: "handCheck" },
                { title: "精神状态", dataIndex: "spirit" },
                {
                  title: "状态",
                  dataIndex: "abnormal",
                  render: (value: boolean) =>
                    value ? (
                      <Badge status="error" text="异常" />
                    ) : (
                      <Badge status="success" text="正常" />
                    ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title="体温趋势曲线">
            <ReactECharts option={tempOption} style={{ height: 360 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
