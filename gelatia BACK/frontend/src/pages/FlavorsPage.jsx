import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  assignFlavorToBranchService,
  listBranchFlavorsService,
  updateBranchFlavorService,
} from "../services/branchService";
import { createFlavorService, listFlavorsService } from "../services/flavorService";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";
import { canCreateFlavors, canUpdateStock } from "../utils/permissions";

function getFlavorState(flavorId, branchFlavors) {
  const branchFlavor = branchFlavors.find((item) => item.flavorId === flavorId);

  if (!branchFlavor) {
    return {
      label: "Sin asignar",
      tone: "default",
      stockText: "No cargado en la sucursal activa",
      actionLabel: "Asignar a sucursal",
      actionTone: "secondary",
      isAssignable: true,
      isRestockable: false,
      branchFlavor: null,
    };
  }

  if (!branchFlavor.isActive || branchFlavor.stockGrams <= 0) {
    return {
      label: "Sin stock",
      tone: "red",
      stockText: "0 g disponibles",
      actionLabel: "Reponer stock",
      actionTone: "primary",
      isAssignable: false,
      isRestockable: true,
      branchFlavor,
    };
  }

  return {
    label: "Activo",
    tone: "green",
    stockText: `${branchFlavor.stockGrams} g disponibles`,
    actionLabel: "Operativo",
    actionTone: "outline",
    isAssignable: false,
    isRestockable: false,
    branchFlavor,
  };
}

export function FlavorsPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const { activeBranch } = useBranchStore();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, limit: 10, total: 0 });
  const [branchFlavors, setBranchFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [newFlavor, setNewFlavor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assigningFlavorId, setAssigningFlavorId] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockDrafts, setStockDrafts] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);
  const debouncedQuery = useDebouncedValue(query, 280);

  async function loadFlavorData({ preserveLoading = false } = {}) {
    if (!preserveLoading) {
      setLoading(true);
    }

    try {
      const [flavorsResponse, branchFlavorResponse] = await Promise.all([
        listFlavorsService({
          token,
          q: debouncedQuery,
          page,
          limit: 10,
        }),
        activeBranch
          ? listBranchFlavorsService({
              token,
              branchId: activeBranch.id,
            })
          : Promise.resolve([]),
      ]);

      setResult(flavorsResponse);
      setBranchFlavors(Array.isArray(branchFlavorResponse) ? branchFlavorResponse : []);
    } catch (apiError) {
      setError(apiError.message || "No se pudieron cargar los sabores");
    } finally {
      if (!preserveLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    setError("");
    loadFlavorData();
  }, [token, debouncedQuery, page, activeBranch]);

  async function handleCreateFlavor(event) {
    event.preventDefault();
    if (!newFlavor.trim()) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      await createFlavorService({ token, name: newFlavor });
      setNewFlavor("");
      setPage(1);
      setSuccessMessage("Sabor creado correctamente.");
      await loadFlavorData({ preserveLoading: true });
    } catch (apiError) {
      setError(apiError.message || "No se pudo crear el sabor");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignFlavor(flavorId) {
    if (!activeBranch) {
      navigate("/branches/select");
      return;
    }

    setAssigningFlavorId(flavorId);
    setError("");
    setSuccessMessage("");

    try {
      await assignFlavorToBranchService({
        token,
        branchId: activeBranch.id,
        flavorId,
        stockGrams: 0,
      });

      setSuccessMessage("Sabor asignado a la sucursal activa.");
      await loadFlavorData({ preserveLoading: true });
    } catch (apiError) {
      setError(apiError.message || "No se pudo asignar el sabor a la sucursal");
    } finally {
      setAssigningFlavorId(null);
    }
  }

  function openRestockEditor(branchFlavor) {
    setEditingStockId(branchFlavor.id);
    setStockDrafts((current) => ({
      ...current,
      [branchFlavor.id]: branchFlavor.stockGrams > 0 ? String(branchFlavor.stockGrams) : "1000",
    }));
    setError("");
    setSuccessMessage("");
  }

  function closeRestockEditor() {
    setEditingStockId(null);
  }

  async function handleRestock(branchFlavorId) {
    const rawValue = stockDrafts[branchFlavorId];
    const stockGrams = Number(rawValue);

    if (!Number.isInteger(stockGrams) || stockGrams <= 0) {
      setError("Ingresa una cantidad valida de gramos mayor a cero.");
      return;
    }

    setSavingStockId(branchFlavorId);
    setError("");
    setSuccessMessage("");

    try {
      await updateBranchFlavorService({
        token,
        id: branchFlavorId,
        stockGrams,
      });

      setSuccessMessage("Stock repuesto correctamente.");
      setEditingStockId(null);
      await loadFlavorData({ preserveLoading: true });
    } catch (apiError) {
      setError(apiError.message || "No se pudo actualizar el stock");
    } finally {
      setSavingStockId(null);
    }
  }

  const canCreate = useMemo(() => canCreateFlavors(user?.role), [user?.role]);
  const canRestock = useMemo(() => canUpdateStock(user?.role), [user?.role]);
  const activeCount = branchFlavors.filter((item) => item.isActive && item.stockGrams > 0).length;
  const emptyCount = branchFlavors.filter((item) => !item.isActive || item.stockGrams <= 0).length;
  const assignedCount = branchFlavors.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sabores"
        title="Gestion de sabores"
        description="Busqueda dominante, lectura instantanea y accion sugerida para cada sabor de la sucursal activa."
      />

      <Card className="overflow-hidden bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-accent-blue/10 p-6">
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent-blue/80">Accion principal</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-50">Encontrar un sabor y decidir en un segundo</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Verde para operativo, rojo para falta de stock y neutro para lo que todavia no esta asignado.
              </p>
            </div>
            <SearchField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar sabor por nombre"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Card className="bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Catalogo</p>
              <p className="mt-3 text-3xl font-semibold text-slate-50">{result.total}</p>
              <p className="mt-1 text-sm text-slate-400">sabores encontrados</p>
            </Card>
            <Card className="bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Activos</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-300">{activeCount}</p>
              <p className="mt-1 text-sm text-slate-400">operativos ahora</p>
            </Card>
            <Card className="bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sin stock</p>
              <p className="mt-3 text-3xl font-semibold text-red-300">{emptyCount}</p>
              <p className="mt-1 text-sm text-slate-400">requieren accion</p>
            </Card>
          </div>
        </div>
      </Card>

      {canCreate ? (
        <Card>
          <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleCreateFlavor}>
            <Input
              value={newFlavor}
              onChange={(event) => setNewFlavor(event.target.value)}
              placeholder="Nuevo sabor"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Crear sabor"}
            </Button>
          </form>
        </Card>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}
      {successMessage ? <Alert tone="success">{successMessage}</Alert> : null}
      {!activeBranch ? <Alert tone="info">Selecciona una sucursal para ver el estado real de stock y asignacion.</Alert> : null}

      {loading ? <LoadingGrid /> : null}

      {!loading && result.items.length === 0 ? (
        <EmptyState title="No encontramos sabores" description="Proba otra busqueda o carga el primer sabor del negocio." />
      ) : null}

      {!loading && result.items.length > 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr] gap-4 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            <span>Sabor</span>
            <span>Estado</span>
            <span>Stock</span>
            <span>Accion</span>
          </div>
          <div className="divide-y divide-white/10">
            {result.items.map((flavor) => {
              const state = getFlavorState(flavor.id, branchFlavors);
              const isNeedsAction = state.label !== "Activo";
              const isAssigningThisFlavor = assigningFlavorId === flavor.id;
              const isEditingThisFlavor = editingStockId === state.branchFlavor?.id;
              const isSavingThisFlavor = savingStockId === state.branchFlavor?.id;

              return (
                <div
                  key={flavor.id}
                  className="grid grid-cols-1 gap-4 px-5 py-4 transition hover:bg-white/[0.035] md:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr] md:items-center"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-50">{flavor.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Sucursal {activeBranch?.name || "sin seleccionar"} · ID #{flavor.id}
                    </p>
                  </div>
                  <div>
                    <Badge tone={state.tone}>{state.label}</Badge>
                  </div>
                  <div className={isNeedsAction ? "text-red-200" : "text-slate-300"}>
                    <p className="text-sm font-medium">{state.stockText}</p>
                  </div>
                  <div className="space-y-3">
                    {state.isAssignable ? (
                      <Button
                        variant={state.actionTone}
                        className="w-full md:w-auto"
                        disabled={!activeBranch || isAssigningThisFlavor}
                        onClick={() => handleAssignFlavor(flavor.id)}
                      >
                        {isAssigningThisFlavor ? "Asignando..." : state.actionLabel}
                      </Button>
                    ) : state.isRestockable && canRestock ? (
                      <>
                        {!isEditingThisFlavor ? (
                          <Button
                            variant={state.actionTone}
                            className="w-full md:w-auto"
                            onClick={() => openRestockEditor(state.branchFlavor)}
                          >
                            {state.actionLabel}
                          </Button>
                        ) : (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Gramos a cargar</p>
                            <div className="flex flex-col gap-2">
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={stockDrafts[state.branchFlavor.id] || ""}
                                onChange={(event) =>
                                  setStockDrafts((current) => ({
                                    ...current,
                                    [state.branchFlavor.id]: event.target.value,
                                  }))
                                }
                                placeholder="1000"
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="primary"
                                  className="flex-1"
                                  disabled={isSavingThisFlavor}
                                  onClick={() => handleRestock(state.branchFlavor.id)}
                                >
                                  {isSavingThisFlavor ? "Guardando..." : "Confirmar"}
                                </Button>
                                <Button variant="ghost" className="flex-1" onClick={closeRestockEditor}>
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <Button
                        variant={state.actionTone}
                        className="w-full md:w-auto"
                        onClick={() => navigate(activeBranch ? "/branches" : "/branches/select")}
                      >
                        {state.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {!loading ? (
        <Pagination page={result.page} limit={result.limit} total={result.total} onPageChange={setPage} />
      ) : null}

      {!loading && activeBranch ? (
        <div className="text-sm text-slate-500">
          {assignedCount} sabores ya estan asignados a la sucursal activa.
        </div>
      ) : null}
    </div>
  );
}
