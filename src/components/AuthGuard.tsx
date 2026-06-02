import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import type { PropsWithChildren } from "react";

export function AuthGuard({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
