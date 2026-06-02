import {
  BellOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  ReloadOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  message,
  Menu,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { NoticeItem } from "../api/modules/common";
import { getHomeNoticesApi } from "../api/modules/common";
import { ROLE_HOME_PATH, ROLE_LABEL } from "../config/roles";
import { findMenuByPath, getMenuByRole } from "../router/menu";
import { useAuthStore } from "../store/auth";
import { useUiStore } from "../store/ui";

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const collapsed = useUiStore((state) => state.collapsed);
  const setCollapsed = useUiStore((state) => state.setCollapsed);
  const tabs = useUiStore((state) => state.tabs);
  const openTab = useUiStore((state) => state.openTab);
  const closeTab = useUiStore((state) => state.closeTab);
  const closeAllTabs = useUiStore((state) => state.closeAllTabs);
  const closeOtherTabs = useUiStore((state) => state.closeOtherTabs);
  const themeMode = useUiStore((state) => state.themeMode);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  const currentMenu = findMenuByPath(location.pathname);
  const roleMenus = useMemo(() => getMenuByRole(user?.role), [user?.role]);
  const unreadNoticeCount = useMemo(
    () => notices.filter((item) => !item.read).length,
    [notices],
  );

  const noticeMenuItems = useMemo(
    () => [
      ...notices.slice(0, 6).map((item) => ({
        key: item.id,
        label: (
          <div className="notice-item">
            <div className="notice-item-title">
              {!item.read ? <span className="notice-dot" /> : null}
              <span>{item.title}</span>
            </div>
            <small>{item.createdAt}</small>
          </div>
        ),
      })),
      { type: "divider" as const },
      {
        key: "markAll",
        label: "全部标记已读",
        disabled: unreadNoticeCount === 0,
      },
    ],
    [notices, unreadNoticeCount],
  );

  useEffect(() => {
    const menu = findMenuByPath(location.pathname);
    if (!menu) {
      return;
    }

    if (tabs.some((item) => item.path === menu.path)) {
      return;
    }

    openTab({
      key: menu.path,
      path: menu.path,
      label: menu.label,
      closable: menu.path !== "/dashboard",
    });
  }, [location.pathname, openTab, tabs]);

  useEffect(() => {
    const onFullScreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await getHomeNoticesApi();
        setNotices(res.list);
      } catch (error) {
        console.error("[AdminLayout] 获取消息通知失败", error);
      }
    };

    void loadNotices();
  }, []);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const onMenuClick = (path: string) => {
    navigate(path);
  };

  const onNoticeClick = (key: string) => {
    if (key === "markAll") {
      setNotices((prev) => prev.map((item) => ({ ...item, read: true })));
      message.success("消息已全部标记为已读");
      return;
    }

    setNotices((prev) =>
      prev.map((item) => (item.id === key ? { ...item, read: true } : item)),
    );
    navigate("/home");
  };

  const onCloseTab = (targetPath: string) => {
    const aliveTabs = tabs.filter(
      (item) => item.path !== targetPath || !item.closable,
    );
    closeTab(targetPath);

    if (location.pathname === targetPath) {
      const target = aliveTabs[aliveTabs.length - 1];
      navigate(target?.path ?? ROLE_HOME_PATH[user?.role ?? "principal"]);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("[AdminLayout] 全屏切换失败", error);
    }
  };

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={74}
        breakpoint="lg"
        width={236}
        className="admin-sider"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div className="sider-brand">
          <div className="brand-logo">KG</div>
          {!collapsed ? (
            <div>
              <strong>幼教管理云台</strong>
              <p>Kindergarten Admin</p>
            </div>
          ) : null}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentMenu?.key ?? ""]}
          items={roleMenus.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => onMenuClick(item.path),
          }))}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
            <Breadcrumb
              items={[
                { title: "后台管理" },
                { title: currentMenu?.label ?? "首页" },
              ]}
            />
          </div>

          <div className="header-right">
            <Tooltip title={themeMode === "light" ? "切换暗色" : "切换亮色"}>
              <Button
                type="text"
                icon={
                  themeMode === "light" ? <MoonOutlined /> : <SunOutlined />
                }
                onClick={toggleTheme}
              />
            </Tooltip>
            <Tooltip title={isFullscreen ? "退出全屏" : "进入全屏"}>
              <Button
                type="text"
                icon={
                  isFullscreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
                onClick={toggleFullscreen}
              />
            </Tooltip>
            <Dropdown
              trigger={["click"]}
              menu={{
                items: noticeMenuItems,
                onClick: ({ key }) => onNoticeClick(String(key)),
              }}
            >
              <Badge count={unreadNoticeCount} size="small">
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
            </Dropdown>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    icon: <UserOutlined />,
                    label: `${user?.name ?? ""} (${ROLE_LABEL[user?.role ?? "principal"]})`,
                  },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "退出登录",
                    onClick: onLogout,
                  },
                ],
              }}
            >
              <Button type="text" className="profile-btn">
                <Avatar size={28} src={user?.avatar} icon={<UserOutlined />} />
                <Typography.Text>{user?.name ?? "未登录"}</Typography.Text>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <div className="admin-tabs">
          <Tabs
            type="editable-card"
            hideAdd
            activeKey={currentMenu?.path ?? tabs[0]?.path}
            onChange={(path) => navigate(path)}
            onEdit={(targetKey, action) => {
              if (action !== "remove" || typeof targetKey !== "string") {
                return;
              }
              onCloseTab(targetKey);
            }}
            items={tabs.map((item) => ({
              key: item.path,
              closable: item.closable,
              label: item.label,
            }))}
            tabBarExtraContent={{
              right: (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "refresh",
                        icon: <ReloadOutlined />,
                        label: "刷新当前页",
                        onClick: () => navigate(0),
                      },
                      {
                        key: "closeOthers",
                        label: "关闭其他标签",
                        onClick: () =>
                          closeOtherTabs(currentMenu?.path ?? "/dashboard"),
                      },
                      {
                        key: "closeAll",
                        label: "关闭全部标签",
                        onClick: () => {
                          closeAllTabs();
                          navigate("/dashboard");
                        },
                      },
                    ],
                  }}
                >
                  <Button type="text">标签操作</Button>
                </Dropdown>
              ),
            }}
          />
        </div>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
