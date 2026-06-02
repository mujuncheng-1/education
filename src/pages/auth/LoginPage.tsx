import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
  message,
} from "antd";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_HOME_PATH, ROLE_LABEL } from "../../config/roles";
import { useAuthStore } from "../../store/auth";
import type { LoginRequest, Role } from "../../types/auth";

const REMEMBER_KEY = "kg-remember-username";

interface LocationState {
  from?: string;
}

interface LoginFormValues extends LoginRequest {
  remember: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [form] = Form.useForm<LoginFormValues>();

  const login = useAuthStore((store) => store.login);
  const loginLoading = useAuthStore((store) => store.loginLoading);

  const initialValues = useMemo<LoginFormValues>(() => {
    const remembered = localStorage.getItem(REMEMBER_KEY);
    return {
      username: remembered ?? "principal",
      password: "123456",
      role: "principal",
      remember: Boolean(remembered),
    };
  }, []);

  const onFinish = async (values: LoginFormValues) => {
    try {
      await login({
        username: values.username,
        password: values.password,
        role: values.role,
      });

      if (values.remember) {
        localStorage.setItem(REMEMBER_KEY, values.username);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      message.success("登录成功，欢迎回来");
      const fallback = ROLE_HOME_PATH[values.role];
      navigate(state?.from || fallback);
    } catch (error) {
      console.error("[LoginPage] 登录失败", error);
      message.error(
        error instanceof Error ? error.message : "登录失败，请稍后重试",
      );
    }
  };

  const onForgotPassword = () => {
    Modal.info({
      title: "忘记密码",
      content: (
        <div>
          <p>当前是纯前端演示版本，暂未接入真实找回流程。</p>
          <p>你可以直接使用演示密码：123456</p>
          <p>正式环境可接入短信验证码或邮箱重置接口。</p>
        </div>
      ),
      okText: "知道了",
    });
  };

  return (
    <div className="login-page">
      <div className="login-atmosphere" />
      <Row className="login-container" gutter={24}>
        <Col xs={24} lg={12}>
          <div className="login-brand-panel">
            <Typography.Title level={1}>幼教后台管理系统</Typography.Title>
            <Typography.Paragraph>
              面向园长、教师、保健医、财务与家长的统一管理平台，覆盖招生、考勤、食谱、成长、财务、通知等全流程。
            </Typography.Paragraph>
            <Alert
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              message="演示账号"
              description="用户名可填 principal / headteacher / assistant / nurse / finance / parent，密码统一 123456"
            />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <Card bordered={false} className="login-card">
            <Typography.Title level={3}>欢迎登录</Typography.Title>
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              onFinish={onFinish}
            >
              <Form.Item
                label="角色"
                name="role"
                rules={[{ required: true, message: "请选择角色" }]}
              >
                <Select
                  options={(Object.keys(ROLE_LABEL) as Role[]).map((role) => ({
                    label: ROLE_LABEL[role],
                    value: role,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="账号"
                name="username"
                rules={[{ required: true, message: "请输入账号" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入账号"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <div className="login-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住账号</Checkbox>
                </Form.Item>
                <Button type="link" onClick={onForgotPassword}>
                  忘记密码
                </Button>
              </div>

              <Button
                block
                type="primary"
                htmlType="submit"
                size="large"
                loading={loginLoading}
              >
                登录系统
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
