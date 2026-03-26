import { useEffect, useMemo, useState } from "react";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { LoadingGrid } from "../components/ui/LoadingGrid";
import { PageHeader } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { SearchField } from "../components/ui/SearchField";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { createBranchService, listBranchesService } from "../services/branchService";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";
import { canCreateBranches } from "../utils/permissions";

export function BranchesPage() {
  const { token, user } = useAuthStore();
  const { activeBranch, setActiveBranch } = useBranchStore();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, limit: 10, total: 0 });
  const [newBranch, setNewBranch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    async function loadBranches() {
      setLoading(true);
      setError("");
      try {
        const response = await listBranchesService({ token, q: debouncedQuery, page, limit: 10 });
        setResult(response);
      } catch (apiError) {
        setError(apiError.message || "No se pudieron cargar las sucursales");
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, [token, debouncedQuery, page]);

  async function handleCreateBranch(event) {
    event.preventDefault();
    if (!newBranch.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await createBranchService({ token, name: newBranch });
      setNewBranch("");
      const response = await listBranchesService({ token, page: 1, limit: 10 });
      setPage(1);
      setResult(response);
    } catch (apiError) {
      setError(apiError.message || "No se pudo crear la sucursal");
    } finally {
      setSubmitting(false);
    }
  }

  const canCreate = useMemo(() => canCreateBranches(user?.role), [user?.role]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sucursales"
        title="Red operativa"
        description="Vista clara de sucursales, busqueda simple y cambio de contexto activo."
      />

      <Card className="space-y-4">
        <SearchField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar sucursal por nombre"
        />

        {canCreate ? (
          <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleCreateBranch}>
            <Input
              value={newBranch}
              onChange={(event) => setNewBranch(event.target.value)}
              placeholder="Nueva sucursal"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Crear sucursal"}
            </Button>
          </form>
        ) : null}
      </Card>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? <LoadingGrid items={4} /> : null}

      {!loading && result.items.length === 0 ? (
        <EmptyState title="No hay sucursales visibles" description="Cuando se creen sucursales, apareceran aca con busqueda y seleccion." />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {result.items.map((branch) => {
          const isActive = activeBranch?.id === branch.id;
          return (
            <Card key={branch.id} className="flex min-h-[170px] flex-col justify-between gap-4 transition hover:border-white/20 hover:bg-white/[0.05]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-50">{branch.name}</p>
                  <p className="mt-2 text-sm text-slate-400">ID #{branch.id}</p>
                </div>
                {isActive ? <Badge tone="blue">Activa</Badge> : null}
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">Usa esta sucursal para contextualizar sabores y operacion.</p>
                <Button variant={isActive ? "secondary" : "outline"} onClick={() => setActiveBranch(branch)}>
                  {isActive ? "Seleccionada" : "Usar esta"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {!loading ? (
        <Pagination page={result.page} limit={result.limit} total={result.total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
