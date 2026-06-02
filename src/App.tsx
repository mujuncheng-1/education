import { App as AntdApp, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useUiStore } from "./store/ui";
import "./App.css";

function App() {
  const themeMode = useUiStore((state) => state.themeMode);

  useEffect(() => {
    document.body.dataset.theme = themeMode;
  }, [themeMode]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#2E71FF",
          borderRadius: 12,
          fontFamily:
            "HarmonyOS Sans SC, PingFang SC, Microsoft YaHei, Segoe UI, sans-serif",
        },
      }}
    >
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
