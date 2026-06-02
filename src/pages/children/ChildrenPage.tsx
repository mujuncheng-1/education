import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Upload,
  message,
} from "antd";
import type { UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import ExportJsonExcel from "js-export-excel";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createChildApi,
  deleteChildApi,
  getChildrenApi,
  updateChildApi,
} from "../../api/modules/children";
import { PageHeader } from "../../components/PageHeader";
import type { ChildPayload, ChildQuery, ChildRecord } from "../../types/child";

const STATUS_COLOR_MAP: Record<string, string> = {
  在园: "green",
  请假: "orange",
  毕业: "blue",
  退学: "default",
};

export default function ChildrenPage() {
  const [form] = Form.useForm<ChildPayload>();
  const [searchForm] = Form.useForm<ChildQuery>();

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ChildRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState<ChildRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ChildRecord | null>(null);
  const [step, setStep] = useState(0);
  const [selectedRows, setSelectedRows] = useState<ChildRecord[]>([]);
  const [searchState, setSearchState] = useState<ChildQuery>({});

  const stepItems = useMemo(
    () => [{ title: "基础信息" }, { title: "家长信息" }, { title: "健康档案" }],
    [],
  );

  const load = useCallback(async (params: ChildQuery) => {
    setLoading(true);
    try {
      const res = await getChildrenApi(params);
      setList(res.list);
      setTotal(res.total);
    } catch (error) {
      console.error("[ChildrenPage] 加载幼儿列表失败", error);
      message.error("加载幼儿列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load({});
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const onSearch = async (values: ChildQuery) => {
    setSearchState(values);
    await load(values);
  };

  const onReset = async () => {
    searchForm.resetFields();
    setSearchState({});
    await load({});
  };

  const openCreate = () => {
    setEditing(null);
    setStep(0);
    form.resetFields();
    form.setFieldsValue({
      gender: "男",
      status: "在园",
      relation: "父亲",
      pickupPermission: true,
      allergyHistory: "无",
      medicalHistory: "无",
      vaccineRecord: "国家免疫规划疫苗接种完整",
      height: 105,
      weight: 18,
    });
    setModalOpen(true);
  };

  const openEdit = (record: ChildRecord) => {
    setEditing(record);
    setStep(0);
    form.setFieldsValue({
      ...record,
      birthDate: dayjs(record.birthDate),
    } as unknown as ChildPayload);
    setModalOpen(true);
  };

  const openDetail = (record: ChildRecord) => {
    setCurrent(record);
    setDrawerOpen(true);
  };

  const onDelete = (record: ChildRecord) => {
    Modal.confirm({
      title: `确认删除 ${record.name} 的档案吗？`,
      icon: <ExclamationCircleFilled />,
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteChildApi(record.id);
          message.success("删除成功");
          await load(searchState);
        } catch (error) {
          console.error("[ChildrenPage] 删除失败", error);
          message.error("删除失败");
        }
      },
    });
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    maxCount: 1,
    beforeUpload: (file) => {
      const imageUrl = URL.createObjectURL(file);
      form.setFieldValue("avatar", imageUrl);
      return false;
    },
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      const payload: ChildPayload = {
        ...values,
        birthDate: values.birthDate
          ? dayjs(values.birthDate).format("YYYY-MM-DD")
          : "",
      };
      if (editing) {
        await updateChildApi(editing.id, payload);
        message.success("修改成功");
      } else {
        await createChildApi(payload);
        message.success("新增成功");
      }
      setModalOpen(false);
      setStep(0);
      await load(searchState);
    } catch (error) {
      console.error("[ChildrenPage] 保存失败", error);
    }
  };

  const exportSelected = () => {
    if (!selectedRows.length) {
      message.warning("请先勾选要导出的幼儿");
      return;
    }

    const option = {
      fileName: `幼儿档案_${dayjs().format("YYYYMMDD_HHmmss")}`,
      datas: [
        {
          sheetData: selectedRows.map((item) => ({
            姓名: item.name,
            学号: item.studentNo,
            班级: item.className,
            状态: item.status,
            家长: item.parentName,
            手机号: item.parentMobile,
          })),
          sheetName: "幼儿档案",
          sheetFilter: ["姓名", "学号", "班级", "状态", "家长", "手机号"],
          sheetHeader: ["姓名", "学号", "班级", "状态", "家长", "手机号"],
        },
      ],
    };

    const exporter = new ExportJsonExcel(option);
    exporter.saveExcel();
  };

  const columns: ColumnsType<ChildRecord> = [
    {
      title: "幼儿",
      dataIndex: "name",
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar}>{record.name.slice(-1)}</Avatar>
          <div>
            <div>{record.name}</div>
            <small>{record.studentNo}</small>
          </div>
        </Space>
      ),
    },
    { title: "班级", dataIndex: "className" },
    { title: "性别", dataIndex: "gender" },
    {
      title: "状态",
      dataIndex: "status",
      render: (value: ChildRecord["status"]) => (
        <Tag color={STATUS_COLOR_MAP[value]}>{value}</Tag>
      ),
    },
    { title: "家长", dataIndex: "parentName" },
    { title: "手机号", dataIndex: "parentMobile" },
    {
      title: "操作",
      fixed: "right",
      width: 190,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            编辑
          </Button>
          <Button
            danger
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="幼儿信息管理"
        description="支持档案、家长信息、健康记录、分班调班和批量导入导出"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={exportSelected}>
              批量导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增幼儿
            </Button>
          </Space>
        }
      />

      <Card>
        <Form form={searchForm} layout="inline" onFinish={onSearch}>
          <Form.Item name="name" label="姓名/学号">
            <Input allowClear placeholder="请输入姓名或学号" />
          </Form.Item>
          <Form.Item name="className" label="班级">
            <Input allowClear placeholder="请输入班级" />
          </Form.Item>
          <Form.Item name="parentMobile" label="家长手机">
            <Input allowClear placeholder="请输入手机号" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button onClick={onReset}>重置</Button>
          </Space>
        </Form>

        <Divider />

        <Table<ChildRecord>
          rowKey="id"
          loading={loading}
          scroll={{ x: 1080 }}
          columns={columns}
          dataSource={list}
          pagination={{ showSizeChanger: false, total, pageSize: 10 }}
          rowSelection={{
            onChange: (_, rows) => setSelectedRows(rows),
          }}
        />
      </Card>

      <Drawer
        width={700}
        open={drawerOpen}
        title={current?.name ? `${current.name} 的详细档案` : "幼儿详细档案"}
        onClose={() => setDrawerOpen(false)}
      >
        {current ? (
          <Tabs
            items={[
              {
                key: "base",
                label: "基本信息",
                children: (
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="姓名">
                      {current.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="学号">
                      {current.studentNo}
                    </Descriptions.Item>
                    <Descriptions.Item label="性别">
                      {current.gender}
                    </Descriptions.Item>
                    <Descriptions.Item label="出生日期">
                      {current.birthDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="身份证">
                      {current.idCard}
                    </Descriptions.Item>
                    <Descriptions.Item label="班级">
                      {current.className}
                    </Descriptions.Item>
                    <Descriptions.Item label="住址" span={2}>
                      {current.address}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "parent",
                label: "家长信息",
                children: (
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="家长姓名">
                      {current.parentName}
                    </Descriptions.Item>
                    <Descriptions.Item label="关系">
                      {current.relation}
                    </Descriptions.Item>
                    <Descriptions.Item label="联系电话">
                      {current.parentMobile}
                    </Descriptions.Item>
                    <Descriptions.Item label="接送权限">
                      {current.pickupPermission ? "可接送" : "不可接送"}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "health",
                label: "健康档案",
                children: (
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="过敏史">
                      {current.allergyHistory}
                    </Descriptions.Item>
                    <Descriptions.Item label="既往病史">
                      {current.medicalHistory}
                    </Descriptions.Item>
                    <Descriptions.Item label="疫苗记录" span={2}>
                      {current.vaccineRecord}
                    </Descriptions.Item>
                    <Descriptions.Item label="身高">
                      {current.height} cm
                    </Descriptions.Item>
                    <Descriptions.Item label="体重">
                      {current.weight} kg
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
            ]}
          />
        ) : null}
      </Drawer>

      <Modal
        width={760}
        open={modalOpen}
        title={editing ? "编辑幼儿档案" : "新增幼儿档案"}
        onCancel={() => {
          setModalOpen(false);
          setStep(0);
        }}
        footer={
          <Space>
            {step > 0 ? (
              <Button onClick={() => setStep(step - 1)}>上一步</Button>
            ) : null}
            {step < stepItems.length - 1 ? (
              <Button type="primary" onClick={() => setStep(step + 1)}>
                下一步
              </Button>
            ) : (
              <Button type="primary" onClick={save}>
                保存
              </Button>
            )}
          </Space>
        }
      >
        <Steps current={step} items={stepItems} style={{ marginBottom: 20 }} />

        <Form form={form} layout="vertical">
          {step === 0 ? (
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: "请输入姓名" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="性别"
                  rules={[{ required: true, message: "请选择性别" }]}
                >
                  <Select
                    options={[
                      { label: "男", value: "男" },
                      { label: "女", value: "女" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="birthDate"
                  label="出生日期"
                  rules={[{ required: true, message: "请选择出生日期" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="className"
                  label="班级"
                  rules={[{ required: true, message: "请输入班级" }]}
                >
                  <Input placeholder="如：中二班" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="idCard"
                  label="身份证号"
                  rules={[{ required: true, message: "请输入身份证号" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="address" label="家庭住址">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="status"
                  label="在园状态"
                  rules={[{ required: true, message: "请选择状态" }]}
                >
                  <Select
                    options={[
                      { label: "在园", value: "在园" },
                      { label: "请假", value: "请假" },
                      { label: "毕业", value: "毕业" },
                      { label: "退学", value: "退学" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="avatar" label="头像上传">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>
                      上传头像（支持预览）
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          ) : null}

          {step === 1 ? (
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="parentName"
                  label="家长姓名"
                  rules={[{ required: true, message: "请输入家长姓名" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="relation"
                  label="关系"
                  rules={[{ required: true, message: "请输入关系" }]}
                >
                  <Select
                    options={[
                      { label: "父亲", value: "父亲" },
                      { label: "母亲", value: "母亲" },
                      { label: "祖父", value: "祖父" },
                      { label: "祖母", value: "祖母" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="parentMobile"
                  label="联系电话"
                  rules={[{ required: true, message: "请输入联系电话" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          ) : null}

          {step === 2 ? (
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="allergyHistory" label="过敏史">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="medicalHistory" label="既往病史">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="vaccineRecord" label="疫苗接种记录">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="height" label="身高（cm）">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="weight" label="体重（kg）">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
