import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import ExportJsonExcel from "js-export-excel";
import { useEffect, useMemo, useState } from "react";
import type { NoticeItem } from "../../api/modules/common";
import { getHomeNoticesApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

const ACTIVITY_DATA = [
  {
    id: "act-1",
    name: "亲子手工课",
    date: "2026-06-08",
    registered: 32,
    limit: 40,
  },
  {
    id: "act-2",
    name: "家长读书会",
    date: "2026-06-11",
    registered: 19,
    limit: 30,
  },
  {
    id: "act-3",
    name: "六月家长会",
    date: "2026-06-20",
    registered: 55,
    limit: 60,
  },
];

export default function HomePage() {
  const [noticeForm] = Form.useForm<{ title: string; content: string }>();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [activities] = useState(ACTIVITY_DATA);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getHomeNoticesApi();
        setNotices(res.list);
      } catch (error) {
        console.error("[HomePage] 加载通知失败", error);
      }
    };

    void load();
  }, []);

  const unreadCount = useMemo(
    () => notices.filter((item) => !item.read).length,
    [notices],
  );

  const markNoticeRead = (id: string) => {
    setNotices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const publishNotice = async () => {
    try {
      const values = await noticeForm.validateFields();
      setNotices((prev) => [
        {
          id: `notice-${Date.now()}`,
          title: values.title,
          content: values.content,
          read: false,
          createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
        },
        ...prev,
      ]);
      message.success("通知已发布");
      setNoticeModalOpen(false);
      noticeForm.resetFields();
    } catch (error) {
      console.error("[HomePage] 发布通知失败", error);
    }
  };

  const exportSignUpList = (activity: (typeof ACTIVITY_DATA)[number]) => {
    const mockRows = Array.from(
      { length: Math.min(activity.registered, 80) },
      (_, index) => ({
        序号: index + 1,
        家长姓名: `家长${index + 1}`,
        联系电话: `1390000${(1000 + index).toString().slice(-4)}`,
        幼儿姓名: `幼儿${index + 1}`,
      }),
    );

    const exporter = new ExportJsonExcel({
      fileName: `${activity.name}_报名名单_${dayjs().format("YYYYMMDD_HHmm")}`,
      datas: [
        {
          sheetName: "报名名单",
          sheetData: mockRows,
          sheetFilter: ["序号", "家长姓名", "联系电话", "幼儿姓名"],
          sheetHeader: ["序号", "家长姓名", "联系电话", "幼儿姓名"],
        },
      ],
    });
    exporter.saveExcel();
    message.success("报名名单已导出");
  };

  const notifyActivity = (activity: (typeof ACTIVITY_DATA)[number]) => {
    message.success(`已向 ${activity.name} 目标家长发送报名提醒`);
  };

  return (
    <div>
      <PageHeader
        title="家园共育"
        description="通知公告、亲子作业、活动报名、家长留言一体化管理"
        extra={<Badge count={unreadCount} showZero color="#ff4d4f" />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            title="通知公告"
            extra={
              <Space>
                <Tag color="red">未读 {unreadCount}</Tag>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setNoticeModalOpen(true)}
                >
                  发布通知
                </Button>
              </Space>
            }
          >
            <List
              itemLayout="vertical"
              dataSource={notices}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={
                    item.read
                      ? undefined
                      : [
                          <Button
                            key="read"
                            type="link"
                            size="small"
                            onClick={() => markNoticeRead(item.id)}
                          >
                            标记已读
                          </Button>,
                        ]
                  }
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {!item.read ? (
                          <Badge status="error" />
                        ) : (
                          <Badge status="default" />
                        )}
                        <span>{item.title}</span>
                      </Space>
                    }
                    description={item.createdAt}
                  />
                  {item.content}
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="活动报名实时统计">
            <Table
              rowKey="id"
              pagination={false}
              columns={[
                { title: "活动名称", dataIndex: "name" },
                { title: "日期", dataIndex: "date" },
                {
                  title: "报名进度",
                  render: (_, row: (typeof ACTIVITY_DATA)[number]) => (
                    <Tag
                      color={
                        row.registered / row.limit > 0.8 ? "orange" : "green"
                      }
                    >
                      {row.registered}/{row.limit}
                    </Tag>
                  ),
                },
                {
                  title: "操作",
                  render: (_, row: (typeof ACTIVITY_DATA)[number]) => (
                    <Space>
                      <Button
                        size="small"
                        type="link"
                        onClick={() => exportSignUpList(row)}
                      >
                        导出名单
                      </Button>
                      <Button
                        size="small"
                        type="link"
                        onClick={() => notifyActivity(row)}
                      >
                        发送提醒
                      </Button>
                    </Space>
                  ),
                },
              ]}
              dataSource={activities}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="发布通知"
        open={noticeModalOpen}
        onCancel={() => setNoticeModalOpen(false)}
        onOk={() => {
          void publishNotice();
        }}
        okText="发布"
        cancelText="取消"
      >
        <Form form={noticeForm} layout="vertical">
          <Form.Item
            label="通知标题"
            name="title"
            rules={[{ required: true, message: "请输入通知标题" }]}
          >
            <Input maxLength={40} showCount />
          </Form.Item>
          <Form.Item
            label="通知内容"
            name="content"
            rules={[{ required: true, message: "请输入通知内容" }]}
          >
            <Input.TextArea rows={4} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
