import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingGrid } from "../components/ui/LoadingGrid";
import { PageHeader } from "../components/ui/PageHeader";
import { BrandMark } from "../components/layout/BrandMark";
import { listBranchFlavorsService, listBranchesService } from "../services/branchService";
import { listFlavorsService } from "../services/flavorService";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";
import { canViewUsers } from "../utils/permissions";

const quickLinks = [
  {
    title: "Sabores",
    description: "Gestion de sabores en tiempo real.",
    path: "/flavors",
    tone: "blue",
  },
  {
    title: "Sucursales",
    description: "Red operativa y contexto activo.",
    path: "/branches",
    tone: "default",
  },
  {
    title: "Usuarios",
    description: "Equipo y roles del negocio.",
    path: "/users",
    tone: "red",
  },
  {
    title: "Caja",
    description: "Pantalla POS de operacion rapida.",
    path: "/cashier",
    tone: "green",
  },
];

export function DashboardPage() {
  const { token, business, user } = useAuthStore();
  const { activeBranch } = useBranchStore();
  const [metrics, setMetrics] = useState({
    totalFlavors: 0,
    activeFlavors: 0,
    emptyFlavors: 0,
    branches: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardMetrics() {
      setLoading(true);
      setError("");

      try {
        const [flavorsResponse, branchesResponse, branchFlavorsResponse] = await Promise.all([
          listFlavorsService({ token, page: 1, limit: 50 }),
          listBranchesService({ token, page: 1, limit: 50 }),
          activeBranch ? listBranchFlavorsService({ token, branchId: activeBranch.id }) : Promise.resolve([]),
        ]);

        const scopedBranchFlavors = Array.isArray(branchFlavorsResponse) ? branchFlavorsResponse : [];

        setMetrics({
          totalFlavors: flavorsResponse.total,
          activeFlavors: scopedBranchFlavors.filter((item) => item.isActive && item.stockGrams > 0).length,
          emptyFlavors: scopedBranchFlavors.filter((item) => !item.isActive || item.stockGrams <= 0).length,
          branches: branchesResponse.total,
        });
      } catch (apiError) {
        setError(apiError.message || "No se pudieron cargar los indicadores");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardMetrics();
  }, [token, activeBranch]);

  const visibleLinks = useMemo(
    () => quickLinks.filter((item) => (item.title === "Usuarios" ? canViewUsers(user?.role) : true)),
    [user?.role]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Hola, ${user?.name?.split(" ")[0] || "equipo"}`}
        description="Gestion de sabores en tiempo real con foco en velocidad operativa y lectura inmediata."
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-accent-blue/10 p-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="blue">{business?.name || "Business activo"}</Badge>
                {activeBranch ? <Badge tone="red">{activeBranch.name}</Badge> : <Badge>Sucursal por definir</Badge>}
              </div>
              <h2 className="mt-5 text-3xl font-semibold text-slate-50">Gestion de sabores en tiempo real</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Una vista simple y util para entender el estado del negocio y entrar rapido al modulo correcto.
              </p>
            </div>
            <BrandMark brand="gelatia" variant="ui" className="h-16 w-16" />
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lectura rapida</p>
          <p className="text-sm text-slate-300">
            {activeBranch
              ? `Estas operando sobre ${activeBranch.name}. Los indicadores de activos y sin stock se calculan contra esa sucursal.`
              : "Selecciona una sucursal para contextualizar estado y stock."}
          </p>
          {!activeBranch ? <Alert tone="info">Elegi una sucursal para completar la lectura operativa.</Alert> : null}
        </Card>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <LoadingGrid items={4} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sabores totales</p>
            <p className="mt-4 text-4xl font-semibold text-slate-50">{metrics.totalFlavors}</p>
            <p className="mt-2 text-sm text-slate-400">catalogados en el negocio</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Activos</p>
            <p className="mt-4 text-4xl font-semibold text-emerald-300">{metrics.activeFlavors}</p>
            <p className="mt-2 text-sm text-slate-400">con stock en sucursal</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sin stock</p>
            <p className="mt-4 text-4xl font-semibold text-red-300">{metrics.emptyFlavors}</p>
            <p className="mt-2 text-sm text-slate-400">requieren accion</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sucursales</p>
            <p className="mt-4 text-4xl font-semibold text-slate-50">{metrics.branches}</p>
            <p className="mt-2 text-sm text-slate-400">operando dentro del negocio</p>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {visibleLinks.map((item) => (
          <Card key={item.title} className="flex h-full flex-col justify-between">
            <div>
              <Badge tone={item.tone}>Acceso rapido</Badge>
              <h3 className="mt-4 text-xl font-semibold text-slate-50">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-400">{item.description}</p>
            </div>
            <div className="mt-6">
              <Link to={item.path}>
                <Button variant="outline">Abrir modulo</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
