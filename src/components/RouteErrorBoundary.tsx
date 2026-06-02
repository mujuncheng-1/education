import { Alert, Button, Result, Space } from "antd";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export function RouteErrorBoundary() {
  const navigate = useNavigate();
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "页面发生异常";
  const description =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? typeof error.data === "string"
          ? error.data
          : "路由请求处理失败"
        : "应用在渲染过程中发生错误，请稍后重试。";

  return (
    <div className="route-error-shell">
      <Result
        status="error"
        title={title}
        subTitle={description}
        extra={
          <Space>
            <Button type="primary" onClick={() => navigate("/dashboard")}>
              返回首页
            </Button>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </Space>
        }
      >
        <Alert
          type="warning"
          showIcon
          message="错误边界已接管"
          description="该异常不会导致整站白屏，开发时请查看控制台定位具体原因。"
        />
      </Result>
    </div>
  );
}
