import { useEffect, useMemo, useState } from "react";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingGrid } from "../components/ui/LoadingGrid";
import { PageHeader } from "../components/ui/PageHeader";
import { listBranchFlavorsService } from "../services/branchService";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";

const TABS = {
  HELADOS: "HELADOS",
  CAFETERIA: "CAFETERIA",
};

const HELADO_FORMATS = [
  { id: "quarter", label: "1/4 KG", price: 4200 },
  { id: "half", label: "1/2 KG", price: 7800 },
  { id: "one", label: "1 KG", price: 14500 },
  { id: "cone", label: "Cucurucho", price: 2600 },
  { id: "cup", label: "Vasito", price: 2300 },
];

const CAFE_PRODUCTS = [
  { id: "cafe-espresso", name: "Cafe espresso", price: 2200 },
  { id: "cafe-latte", name: "Cafe latte", price: 2800 },
  { id: "te-hebras", name: "Te en hebras", price: 1900 },
  { id: "medialuna", name: "Medialuna", price: 1200 },
  { id: "tostado", name: "Tostado", price: 4200 },
  { id: "cookie", name: "Cookie", price: 1600 },
];

function currency(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildHeladoSummary(format, selectedFlavors) {
  if (!format) {
    return "";
  }

  if (selectedFlavors.length === 0) {
    return format.label;
  }

  return `${format.label} · ${selectedFlavors.map((item) => item.flavor.name).join(" / ")}`;
}

function SectionHeader({ eyebrow, title, meta }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-50">{title}</h2>
      </div>
      {meta}
    </div>
  );
}

export function CashierPage() {
  const { token } = useAuthStore();
  const { activeBranch } = useBranchStore();
  const [activeTab, setActiveTab] = useState(TABS.HELADOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [branchFlavors, setBranchFlavors] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [lastAddedItemId, setLastAddedItemId] = useState(null);

  useEffect(() => {
    async function loadBranchFlavors() {
      if (!activeBranch) {
        setBranchFlavors([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await listBranchFlavorsService({
          token,
          branchId: activeBranch.id,
        });

        setBranchFlavors(Array.isArray(response) ? response : []);
      } catch (apiError) {
        setError(apiError.message || "No se pudieron cargar los sabores de la sucursal");
      } finally {
        setLoading(false);
      }
    }

    loadBranchFlavors();
  }, [token, activeBranch]);

  useEffect(() => {
    if (!lastAddedItemId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setLastAddedItemId(null);
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [lastAddedItemId]);

  const activeFlavors = useMemo(
    () => branchFlavors.filter((item) => item.isActive && item.stockGrams > 0),
    [branchFlavors]
  );

  const subtotal = useMemo(
    () => orderItems.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0),
    [orderItems]
  );

  function resetHeladoBuilder() {
    setSelectedFormat(null);
    setSelectedFlavors([]);
  }

  function addFlavorToSelection(branchFlavor) {
    setSelectedFlavors((current) => [...current, branchFlavor]);
  }

  function removeSelectedFlavor(indexToRemove) {
    setSelectedFlavors((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function pushOrderItem(item) {
    const nextItem = {
      id: crypto.randomUUID(),
      quantity: 1,
      ...item,
    };

    setOrderItems((current) => [...current, nextItem]);
    setLastAddedItemId(nextItem.id);
  }

  function addHeladoToOrder() {
    if (!selectedFormat) {
      setError("Selecciona un formato antes de agregar helado al pedido.");
      return;
    }

    if (selectedFlavors.length === 0) {
      setError("Selecciona al menos un sabor para agregar el helado.");
      return;
    }

    setError("");
    pushOrderItem({
      kind: TABS.HELADOS,
      name: buildHeladoSummary(selectedFormat, selectedFlavors),
      price: selectedFormat.price,
      meta: {
        format: selectedFormat.label,
        flavors: selectedFlavors.map((item) => item.flavor.name),
      },
    });
    resetHeladoBuilder();
  }

  function addCafeItem(product) {
    setError("");
    pushOrderItem({
      kind: TABS.CAFETERIA,
      name: product.name,
      price: product.price,
    });
  }

  function updateQuantity(itemId, nextQuantity) {
    if (nextQuantity <= 0) {
      setOrderItems((current) => current.filter((item) => item.id !== itemId));
      return;
    }

    setOrderItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item))
    );
  }

  function removeItem(itemId) {
    setOrderItems((current) => current.filter((item) => item.id !== itemId));
  }

  function clearOrder() {
    setOrderItems([]);
    resetHeladoBuilder();
    setSuccessMessage("");
    setError("");
  }

  function handlePayment(method) {
    if (orderItems.length === 0) {
      setError("Agrega productos al pedido antes de cobrar.");
      return;
    }

    setSuccessMessage(`Pedido cobrado por ${method}. Listo para un nuevo pedido.`);
    setOrderItems([]);
    resetHeladoBuilder();
    setError("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Caja"
        title="POS operativo"
        description="Una sola pantalla para agregar producto, revisar pedido y cobrar rapido."
      />

      {!activeBranch ? <Alert tone="info">Selecciona una sucursal para operar la caja.</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}
      {successMessage ? <Alert tone="success">{successMessage}</Alert> : null}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr_0.92fr]">
        <Card className="space-y-5 border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
          <SectionHeader
            eyebrow="Productos"
            title={activeTab === TABS.HELADOS ? "Venta de helados" : "Venta de cafeteria"}
            meta={<Badge tone="blue">{activeTab}</Badge>}
          />

          <div className="grid grid-cols-2 gap-3">
            {Object.values(TABS).map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`min-h-[72px] rounded-3xl border px-5 py-4 text-left transition duration-150 ${
                    isSelected
                      ? "border-accent-red/40 bg-accent-red/14 shadow-[0_0_0_1px_rgba(239,68,68,0.16)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] active:scale-[0.985]"
                  }`}
                >
                  <p className={`text-base font-semibold ${isSelected ? "text-white" : "text-slate-100"}`}>{tab}</p>
                  <p className={`mt-1 text-sm ${isSelected ? "text-red-100" : "text-slate-500"}`}>
                    {tab === TABS.HELADOS ? "Sabores y formatos" : "Cafe y pasteleria"}
                  </p>
                </button>
              );
            })}
          </div>

          {activeTab === TABS.HELADOS ? (
            <div className="space-y-5">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">Formato</p>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {HELADO_FORMATS.map((format) => {
                    const isSelected = selectedFormat?.id === format.id;
                    return (
                      <button
                        key={format.id}
                        type="button"
                        onClick={() => setSelectedFormat(format)}
                        className={`min-h-[96px] rounded-3xl border px-4 py-4 text-left transition duration-150 ${
                          isSelected
                            ? "border-accent-red/45 bg-accent-red/14 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] active:scale-[0.985]"
                        }`}
                      >
                        <p className="text-base font-semibold text-slate-50">{format.label}</p>
                        <p className={`mt-2 text-sm ${isSelected ? "text-red-100" : "text-slate-400"}`}>
                          {currency(format.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sabores disponibles</p>
                  {selectedFormat ? <Badge tone="blue">{selectedFormat.label}</Badge> : <Badge>Elegi formato</Badge>}
                </div>

                {loading ? (
                  <LoadingGrid items={6} />
                ) : activeFlavors.length === 0 ? (
                  <EmptyState
                    title="No hay sabores operativos"
                    description="Necesitas sabores activos con stock en la sucursal para vender helados."
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {activeFlavors.map((branchFlavor) => {
                      const selectedCount = selectedFlavors.filter((item) => item.id === branchFlavor.id).length;
                      const isSelected = selectedCount > 0;

                      return (
                        <button
                          key={branchFlavor.id}
                          type="button"
                          onClick={() => addFlavorToSelection(branchFlavor)}
                          disabled={!selectedFormat}
                          className={`min-h-[104px] rounded-3xl border px-4 py-4 text-left transition duration-150 ${
                            isSelected
                              ? "border-accent-blue/35 bg-accent-blue/12 shadow-[0_0_0_1px_rgba(56,189,248,0.16)]"
                              : "border-white/10 bg-white/[0.03] hover:border-accent-blue/30 hover:bg-white/[0.05]"
                          } disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.985]`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-slate-50">{branchFlavor.flavor.name}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Stock</p>
                              <p className="mt-1 text-sm text-slate-300">{branchFlavor.stockGrams} g</p>
                            </div>
                            {isSelected ? <Badge tone="blue">x{selectedCount}</Badge> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Helado en armado</p>
                  <Button variant="ghost" onClick={resetHeladoBuilder}>
                    Limpiar
                  </Button>
                </div>

                <div className="mt-4 flex min-h-[106px] flex-wrap gap-2">
                  {selectedFlavors.length === 0 ? (
                    <p className="text-sm text-slate-500">Toca los sabores para armar el pedido.</p>
                  ) : (
                    selectedFlavors.map((item, index) => (
                      <button
                        key={`${item.id}-${index}`}
                        type="button"
                        className="rounded-full border border-accent-blue/20 bg-accent-blue/10 px-3 py-2 text-sm text-accent-ice transition hover:bg-accent-blue/14 active:scale-[0.985]"
                        onClick={() => removeSelectedFlavor(index)}
                      >
                        {item.flavor.name}
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-4">
                  <Button className="min-h-[62px] w-full rounded-3xl text-base" onClick={addHeladoToOrder}>
                    Agregar helado al pedido
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Cafeteria</p>
              <div className="grid grid-cols-2 gap-3">
                {CAFE_PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addCafeItem(product)}
                    className="min-h-[96px] rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition duration-150 hover:border-accent-blue/30 hover:bg-white/[0.05] active:scale-[0.985]"
                  >
                    <p className="text-base font-semibold text-slate-50">{product.name}</p>
                    <p className="mt-2 text-sm text-slate-400">{currency(product.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="flex flex-col border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-6">
          <SectionHeader
            eyebrow="Pedido actual"
            title="Items"
            meta={<Badge tone="blue">{orderItems.length} items</Badge>}
          />

          <div className="flex-1 space-y-3">
            {orderItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-6">
                <EmptyState
                  title="Todavia no hay pedido"
                  description="Agrega helados o cafeteria desde la columna izquierda."
                />
              </div>
            ) : (
              orderItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-3xl border p-4 transition duration-150 ${
                    lastAddedItemId === item.id
                      ? "cashier-pop border-accent-blue/30 bg-accent-blue/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-50">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{currency(item.price)} c/u</p>
                    </div>
                    <Button variant="ghost" onClick={() => removeItem(item.id)}>
                      Eliminar
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="min-h-[46px] min-w-[46px] rounded-2xl px-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <div className="min-w-[68px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-base font-semibold text-slate-100">
                        {item.quantity}
                      </div>
                      <Button
                        variant="secondary"
                        className="min-h-[46px] min-w-[46px] rounded-2xl px-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xl font-semibold text-slate-50">{currency(item.quantity * item.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Subtotal</p>
            <p className="mt-2 text-4xl font-semibold text-slate-50">{currency(subtotal)}</p>
            <p className="mt-2 text-sm text-slate-400">Resumen previo al cobro.</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border-white/15 bg-gradient-to-b from-accent-blue/10 via-white/[0.04] to-accent-red/8 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Cobro</p>
            <p className="mt-3 text-6xl font-semibold leading-none text-slate-50">{currency(subtotal)}</p>
            <p className="mt-3 text-sm text-slate-300">
              Total protagonista para una lectura rapida de mostrador.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => handlePayment("efectivo")}
              className="min-h-[76px] w-full rounded-3xl bg-accent-red px-5 py-4 text-left text-white transition duration-150 hover:bg-red-500 active:scale-[0.985] active:bg-red-600 disabled:opacity-60"
            >
              <p className="text-xl font-semibold">Efectivo</p>
              <p className="mt-1 text-sm text-red-100">Cobro rapido en caja</p>
            </button>
            <button
              type="button"
              onClick={() => handlePayment("tarjeta")}
              className="min-h-[76px] w-full rounded-3xl border border-accent-blue/30 bg-accent-blue/12 px-5 py-4 text-left text-accent-ice transition duration-150 hover:bg-accent-blue/18 active:scale-[0.985]"
            >
              <p className="text-xl font-semibold">Tarjeta</p>
              <p className="mt-1 text-sm text-sky-100">Credito o debito</p>
            </button>
            <button
              type="button"
              onClick={() => handlePayment("transferencia")}
              className="min-h-[76px] w-full rounded-3xl border border-white/15 bg-white/[0.03] px-5 py-4 text-left text-slate-100 transition duration-150 hover:bg-white/[0.05] active:scale-[0.985]"
            >
              <p className="text-xl font-semibold">Transferencia</p>
              <p className="mt-1 text-sm text-slate-400">Alias o QR</p>
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            <Button variant="ghost" className="min-h-[56px] rounded-3xl" onClick={clearOrder}>
              Cancelar / nuevo pedido
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
