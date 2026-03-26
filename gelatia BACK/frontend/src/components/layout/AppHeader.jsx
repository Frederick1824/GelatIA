import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { getRoleLabel } from "../../utils/permissions";
import { BrandMark } from "./BrandMark";

export function AppHeader({ business, branch, user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-white/10 bg-base-900/55 px-6 py-5 backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <BrandMark brand="gelatia" variant="ui" className="h-12 w-12" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-blue/75">GelatIA Workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">{business?.name || "Tu negocio"}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-400">Sucursal activa</span>
              {branch ? <Badge tone="blue">{branch.name}</Badge> : <Badge>Sucursal no seleccionada</Badge>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-sm font-medium text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-400">{getRoleLabel(user?.role)}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/branches/select")}>
            Cambiar sucursal
          </Button>
          <Button variant="ghost" onClick={onLogout}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
