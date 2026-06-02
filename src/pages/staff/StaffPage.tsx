import { PhoneOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Drawer, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { getStaffListApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

interface StaffRecord {
  id: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  certExpireDate: string;
  status: string;
}

export default function StaffPage() {
  const [list, setList] = useState<StaffRecord[]>([]);
  const [current, setCurrent] = useState<StaffRecord | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStaffListApi();
        setList(res.list);
      } catch (error) {
        console.error("[StaffPage] 获取教职工列表失败", error);
      }
    };

    void load();
  }, []);

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      message.success(`联系电话已复制：${phone}`);
    } catch (error) {
      console.error("[StaffPage] 复制联系电话失败", error);
      message.error("复制失败，请手动复制");
    }
  };

  const quickDial = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
    message.info(`已尝试呼叫 ${phone}`);
  };

  const columns: ColumnsType<StaffRecord> = [
    {
      title: "姓名",
      dataIndex: "name",
      render: (_, row) => (
        <Space>
          <Avatar>{row.name.slice(0, 1)}</Avatar>
          <span>{row.name}</span>
        </Space>
      ),
    },
    { title: "部门", dataIndex: "department" },
    { title: "岗位", dataIndex: "role" },
    { title: "电话", dataIndex: "phone" },
    { title: "证书到期", dataIndex: "certExpireDate" },
    {
      title: "状态",
      dataIndex: "status",
      render: (value) => (
        <Tag color={value === "在职" ? "green" : "orange"}>{value}</Tag>
      ),
    },
    {
      title: "操作",
      render: (_, row) => (
        <Button type="link" onClick={() => setCurrent(row)}>
          查看档案
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="教职工管理"
        description="覆盖档案、岗位资质、证书到期提醒和通讯录快速联系"
        extra={<Tag color="processing">证书临期自动预警</Tag>}
      />

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Drawer
        width={460}
        title={current ? `${current.name} 的教职工档案` : "教职工档案"}
        open={Boolean(current)}
        onClose={() => setCurrent(null)}
      >
        {current ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Card size="small" title="基础信息">
              <p>姓名：{current.name}</p>
              <p>部门：{current.department}</p>
              <p>岗位：{current.role}</p>
              <p>状态：{current.status}</p>
            </Card>
            <Card size="small" title="联系方式">
              <Space>
                <Button
                  icon={<PhoneOutlined />}
                  type="link"
                  onClick={() => quickDial(current.phone)}
                >
                  一键拨号
                </Button>
                <Button
                  type="link"
                  onClick={() => void copyPhone(current.phone)}
                >
                  复制电话
                </Button>
              </Space>
            </Card>
            <Card size="small" title="资质信息">
              <p>证书到期时间：{current.certExpireDate}</p>
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
}
