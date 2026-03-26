import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AuthGuard, PublicOnlyGuard, RoleGuard } from "./guards";
import { SplashPage } from "../pages/SplashPage";
import { LoginPage } from "../pages/LoginPage";
import { BusinessSetupPage } from "../pages/BusinessSetupPage";
import { BranchSelectionPage } from "../pages/BranchSelectionPage";
import { DashboardPage } from "../pages/DashboardPage";
import { FlavorsPage } from "../pages/FlavorsPage";
import { BranchesPage } from "../pages/BranchesPage";
import { UsersPage } from "../pages/UsersPage";
import { CashierPage } from "../pages/CashierPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/splash" replace /> },
  { path: "/splash", element: <SplashPage /> },
  {
    element: <PublicOnlyGuard />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/setup-business", element: <BusinessSetupPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      { path: "/branches/select", element: <BranchSelectionPage /> },
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/flavors", element: <FlavorsPage /> },
          { path: "/branches", element: <BranchesPage /> },
          {
            element: <RoleGuard allowedRoles={["OWNER", "MANAGER"]} />,
            children: [{ path: "/users", element: <UsersPage /> }],
          },
          { path: "/cashier", element: <CashierPage /> },
        ],
      },
    ],
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
