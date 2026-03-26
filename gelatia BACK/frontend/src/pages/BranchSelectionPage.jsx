import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import gelatiaLogo from "../assets/logos/gelatia-logo.svg";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { listBranchesService } from "../services/branchService";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";

export function BranchSelectionPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { activeBranch, setActiveBranch } = useBranchStore();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBranches() {
      setLoading(true);
      setError("");

      try {
        const result = await listBranchesService({ token, page: 1, limit: 50 });
        setBranches(result.items);

        if (result.items.length === 1) {
          setActiveBranch(result.items[0]);
          navigate("/dashboard", { replace: true });
        }
      } catch (apiError) {
        setError(apiError.message || "No se pudieron cargar las sucursales");
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, [token, navigate, setActiveBranch]);

  const selectedId = useMemo(() => activeBranch?.id, [activeBranch]);

  function handleContinue() {
    if (!activeBranch) {
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-6 py-10">
      <Card className="w-full max-w-4xl p-8">
        <div className="mb-6 text-center">
          <img src={gelatiaLogo} alt="GelatIA" className="mx-auto h-12 w-auto max-w-[220px]" />
          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-accent-blue/80">Contexto activo</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-50">Elegi la sucursal con la que vas a operar</h1>
          <p className="mt-3 text-sm text-slate-400">
            Guardamos el contexto localmente para que la navegacion diaria sea mas rapida.
          </p>
        </div>

        {loading ? <p className="text-sm text-slate-400">Cargando sucursales...</p> : null}
        {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        {!loading && !error && branches.length === 0 ? (
          <EmptyState
            title="Todavia no hay sucursales"
            description="Entraste bien al sistema, pero necesitas crear una sucursal desde un usuario owner."
          />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => setActiveBranch(branch)}
              className={`rounded-3xl border p-5 text-left transition ${
                selectedId === branch.id
                  ? "border-accent-blue/60 bg-accent-blue/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <p className="text-lg font-medium text-slate-50">{branch.name}</p>
              <p className="mt-2 text-sm text-slate-400">Sucursal activa para dashboard, stock y operaciones.</p>
            </button>
          ))}
        </div>

        {!loading && branches.length > 1 ? (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleContinue} disabled={!activeBranch}>
              Continuar
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
