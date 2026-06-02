/* eslint-disable react-refresh/only-export-components */

import { Spin } from "antd";
import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AuthGuard } from "../components/AuthGuard";
import { RouteErrorBoundary } from "../components/RouteErrorBoundary";
import { RoleGuard } from "../components/RoleGuard";
import { AdminLayout } from "../layouts/AdminLayout";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ChildrenPage = lazy(() => import("../pages/children/ChildrenPage"));
const AttendancePage = lazy(() => import("../pages/attendance/AttendancePage"));
const RecipePage = lazy(() => import("../pages/recipe/RecipePage"));
const GrowthPage = lazy(() => import("../pages/growth/GrowthPage"));
const HomePage = lazy(() => import("../pages/home/HomePage"));
const HealthPage = lazy(() => import("../pages/health/HealthPage"));
const StaffPage = lazy(() => import("../pages/staff/StaffPage"));
const FinancePage = lazy(() => import("../pages/finance/FinancePage"));
const RbacPage = lazy(() => import("../pages/rbac/RbacPage"));

const withSuspense = (element: ReactNode) => (
  <Suspense
    fallback={
      <div className="route-loading">
        <Spin size="large" />
      </div>
    }
  >
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(<LoginPage />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: withSuspense(
          <RoleGuard
            roles={[
              "principal",
              "headTeacher",
              "assistantTeacher",
              "nurse",
              "finance",
            ]}
          >
            <DashboardPage />
          </RoleGuard>,
        ),
      },
      {
        path: "children",
        element: withSuspense(
          <RoleGuard roles={["principal", "headTeacher", "assistantTeacher"]}>
            <ChildrenPage />
          </RoleGuard>,
        ),
      },
      {
        path: "attendance",
        element: withSuspense(
          <RoleGuard roles={["principal", "headTeacher", "assistantTeacher"]}>
            <AttendancePage />
          </RoleGuard>,
        ),
      },
      {
        path: "recipe",
        element: withSuspense(
          <RoleGuard roles={["principal", "headTeacher", "nurse"]}>
            <RecipePage />
          </RoleGuard>,
        ),
      },
      {
        path: "growth",
        element: withSuspense(
          <RoleGuard
            roles={["principal", "headTeacher", "assistantTeacher", "parent"]}
          >
            <GrowthPage />
          </RoleGuard>,
        ),
      },
      {
        path: "home",
        element: withSuspense(
          <RoleGuard
            roles={["principal", "headTeacher", "assistantTeacher", "parent"]}
          >
            <HomePage />
          </RoleGuard>,
        ),
      },
      {
        path: "health",
        element: withSuspense(
          <RoleGuard roles={["principal", "nurse", "headTeacher"]}>
            <HealthPage />
          </RoleGuard>,
        ),
      },
      {
        path: "staff",
        element: withSuspense(
          <RoleGuard roles={["principal", "finance"]}>
            <StaffPage />
          </RoleGuard>,
        ),
      },
      {
        path: "finance",
        element: withSuspense(
          <RoleGuard roles={["principal", "finance"]}>
            <FinancePage />
          </RoleGuard>,
        ),
      },
      {
        path: "rbac",
        element: withSuspense(
          <RoleGuard roles={["principal"]}>
            <RbacPage />
          </RoleGuard>,
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
