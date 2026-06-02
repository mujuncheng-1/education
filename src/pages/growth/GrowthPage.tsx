import { Card, Col, Image, Row, Timeline, Typography } from "antd";
import { useEffect, useState } from "react";
import type { GrowthItem } from "../../api/modules/common";
import { getGrowthTimelineApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

export default function GrowthPage() {
  const [list, setList] = useState<GrowthItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getGrowthTimelineApi();
        setList(res.list);
      } catch (error) {
        console.error("[GrowthPage] 获取成长记录失败", error);
      }
    };

    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="成长档案管理"
        description="记录幼儿学习、活动、作品与学期评语，形成可追溯成长画像"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card title="成长时间线">
            <Timeline
              items={list.map((item) => ({
                color: "blue",
                children: (
                  <div>
                    <Typography.Text strong>{item.childName}</Typography.Text>
                    <p>{item.content}</p>
                    <Typography.Text type="secondary">
                      {item.createdAt}
                    </Typography.Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card title="成长相册">
            <div className="album-waterfall">
              {list.flatMap((item) =>
                item.media.map((src) => (
                  <div key={`${item.id}-${src}`} className="album-item">
                    <Image src={src} alt={item.childName} />
                    <Typography.Paragraph ellipsis={{ rows: 2 }}>
                      {item.childName} · {item.content}
                    </Typography.Paragraph>
                  </div>
                )),
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
