import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useAuthStore } from "../../store/authStore";
import { useBranchStore } from "../../store/branchStore";

export function AppShell() {
  const navigate = useNavigate();
  const { business, user, logout } = useAuthStore();
  const { activeBranch, clearActiveBranch } = useBranchStore();

  function handleLogout() {
    logout();
    clearActiveBranch();
    navigate("/login", { replace: true });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-base-950 lg:grid-cols-[300px_1fr]">
      <AppSidebar userRole={user?.role} />
      <div className="flex min-h-screen flex-col">
        <AppHeader business={business} branch={activeBranch} user={user} onLogout={handleLogout} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
