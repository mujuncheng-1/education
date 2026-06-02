import { LockOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Switch,
  Table,
  Tree,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { getRbacRolesApi, getRbacUsersApi } from "../../api/modules/common";
import { PageHeader } from "../../components/PageHeader";

interface UserRow {
  id: string;
  username: string;
  role: string;
  status: boolean;
}

interface RoleRow {
  id: string;
  roleName: string;
  userCount: number;
}

const TREE_DATA = [
  {
    title: "系统管理",
    key: "system",
    children: [
      { title: "用户管理", key: "rbac-users" },
      { title: "角色管理", key: "rbac-roles" },
    ],
  },
  {
    title: "业务管理",
    key: "biz",
    children: [
      { title: "幼儿管理", key: "children" },
      { title: "考勤管理", key: "attendance" },
      { title: "财务管理", key: "finance" },
    ],
  },
];

export default function RbacPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [open, setOpen] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([
    "children",
    "attendance",
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          getRbacUsersApi(),
          getRbacRolesApi(),
        ]);
        setUsers(usersRes.list);
        setRoles(rolesRes.list);
      } catch (error) {
        console.error("[RbacPage] 获取权限数据失败", error);
      }
    };

    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="权限管理（RBAC）"
        description="用户、角色、菜单、按钮级权限统一配置，支持树形分配"
        extra={
          <Button
            type="primary"
            icon={<LockOutlined />}
            onClick={() => setOpen(true)}
          >
            分配角色权限
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="用户管理">
            <Table
              rowKey="id"
              dataSource={users}
              columns={[
                { title: "账号", dataIndex: "username" },
                { title: "角色", dataIndex: "role" },
                {
                  title: "状态",
                  dataIndex: "status",
                  render: (_: boolean, row: UserRow) => (
                    <Switch
                      checked={row.status}
                      onChange={(checked) => {
                        setUsers((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, status: checked }
                              : item,
                          ),
                        );
                      }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title="角色管理">
            <Table
              rowKey="id"
              pagination={false}
              dataSource={roles}
              columns={[
                { title: "角色名称", dataIndex: "roleName" },
                { title: "成员数", dataIndex: "userCount" },
                {
                  title: "操作",
                  render: () => (
                    <Button type="link" onClick={() => setOpen(true)}>
                      权限配置
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        width={560}
        title="角色权限分配"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => {
          setOpen(false);
          message.success("角色权限已更新");
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Tree
            checkable
            defaultExpandAll
            treeData={TREE_DATA}
            checkedKeys={checkedKeys}
            onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
          />
        </Space>
      </Modal>
    </div>
  );
}
