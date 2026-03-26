import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { BrandMark } from "../components/layout/BrandMark";
import { registerBusinessService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";

export function BusinessSetupPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const { clearActiveBranch } = useBranchStore();
  const [form, setForm] = useState({
    businessName: "",
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await registerBusinessService(form);
      clearActiveBranch();
      setSession({
        token: result.token,
        user: result.user,
        business: result.business,
      });
      navigate("/branches/select", { replace: true });
    } catch (apiError) {
      setError(apiError.message || "No se pudo crear el negocio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-6 py-10">
      <Card className="w-full max-w-2xl p-8 lg:p-10">
        <BrandMark brand="egyen" variant="full" imageClassName="h-14 w-14" />
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent-blue/80">Onboarding</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-50">Alta inicial de heladeria</h1>
          <p className="mt-3 text-sm text-slate-400">
            Este flujo usa el backend actual para crear negocio y usuario owner en un solo paso.
          </p>
        </div>

        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Nombre de la heladeria</label>
            <Input
              value={form.businessName}
              onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
              placeholder="GelatIA Centro"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Tu nombre</label>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Lucia Perez"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="owner@gelatia.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">Contrasena</label>
            <Input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Minimo 6 caracteres"
            />
          </div>

          {error ? <div className="md:col-span-2"><Alert>{error}</Alert></div> : null}

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link to="/login" className="inline-flex items-center text-sm text-slate-400 transition hover:text-slate-100">
              Volver al login
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear negocio y entrar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
