import { Result } from "antd";
import type { PropsWithChildren } from "react";
import type { Role } from "../types/auth";
import { useAuthStore } from "../store/auth";

interface RoleGuardProps extends PropsWithChildren {
  roles: Role[];
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!hasRole(roles)) {
    return (
      <Result
        status="403"
        title="无权限访问"
        subTitle="当前角色没有该模块权限。"
      />
    );
  }

  return children;
}
