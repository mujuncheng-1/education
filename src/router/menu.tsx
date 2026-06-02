import {
  CalendarOutlined,
  DashboardOutlined,
  DollarOutlined,
  HeartOutlined,
  IdcardOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { Role } from "../types/auth";

export interface MenuConfigItem {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
  roles: Role[];
}

export const MENU_ITEMS: MenuConfigItem[] = [
  {
    key: "dashboard",
    label: "园所仪表盘",
    path: "/dashboard",
    icon: <DashboardOutlined />,
    roles: ["principal", "headTeacher", "assistantTeacher", "nurse", "finance"],
  },
  {
    key: "children",
    label: "幼儿信息管理",
    path: "/children",
    icon: <UserOutlined />,
    roles: ["principal", "headTeacher", "assistantTeacher"],
  },
  {
    key: "attendance",
    label: "日常考勤管理",
    path: "/attendance",
    icon: <CalendarOutlined />,
    roles: ["principal", "headTeacher", "assistantTeacher"],
  },
  {
    key: "recipe",
    label: "食谱营养管理",
    path: "/recipe",
    icon: <HeartOutlined />,
    roles: ["principal", "headTeacher", "nurse"],
  },
  {
    key: "growth",
    label: "成长档案管理",
    path: "/growth",
    icon: <NotificationOutlined />,
    roles: ["principal", "headTeacher", "assistantTeacher", "parent"],
  },
  {
    key: "home",
    label: "家园共育",
    path: "/home",
    icon: <TeamOutlined />,
    roles: ["principal", "headTeacher", "assistantTeacher", "parent"],
  },
  {
    key: "health",
    label: "保健卫生管理",
    path: "/health",
    icon: <SafetyCertificateOutlined />,
    roles: ["principal", "nurse", "headTeacher"],
  },
  {
    key: "staff",
    label: "教职工管理",
    path: "/staff",
    icon: <IdcardOutlined />,
    roles: ["principal", "finance"],
  },
  {
    key: "finance",
    label: "财务管理",
    path: "/finance",
    icon: <DollarOutlined />,
    roles: ["principal", "finance"],
  },
  {
    key: "rbac",
    label: "权限管理",
    path: "/rbac",
    icon: <SafetyCertificateOutlined />,
    roles: ["principal"],
  },
];

export const getMenuByRole = (role?: Role): MenuConfigItem[] => {
  if (!role) {
    return [];
  }
  return MENU_ITEMS.filter((item) => item.roles.includes(role));
};

export const findMenuByPath = (path: string): MenuConfigItem | undefined =>
  MENU_ITEMS.find((item) => path.startsWith(item.path));
