import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { hasRole } from "../utils/roles";

export function PublicOnlyGuard() {
  const { token } = useAuthStore();
  return token ? <Navigate to="/splash" replace /> : <Outlet />;
}

export function AuthGuard() {
  const location = useLocation();
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RoleGuard({ allowedRoles }) {
  const { user } = useAuthStore();

  if (!hasRole(user?.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
