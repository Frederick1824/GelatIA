import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { BrandMark } from "../components/layout/BrandMark";
import { loginService } from "../services/authService";
import { listBranchesService } from "../services/branchService";
import { useAuthStore } from "../store/authStore";
import { useBranchStore } from "../store/branchStore";
import gelatiaLogo from "../assets/logos/gelatia-logo.svg";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuthStore();
  const { setActiveBranch, clearActiveBranch } = useBranchStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginService(form);
      const branches = await listBranchesService({ token: result.token, page: 1, limit: 50 });
      clearActiveBranch();

      setSession({
        token: result.token,
        user: result.user,
        business: {
          id: result.user.businessId,
          name: `Business #${result.user.businessId}`,
        },
      });

      if (branches.items.length === 1) {
        setActiveBranch(branches.items[0]);
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate(location.state?.from?.pathname || "/branches/select", { replace: true });
    } catch (apiError) {
      setError(apiError.message || "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-6 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden min-h-[640px] rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-accent-blue/10 p-10 shadow-panel lg:flex lg:flex-col lg:justify-between">
          <BrandMark brand="egyen" variant="full" imageClassName="h-16 w-16" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent-blue/80">MVP profesional</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-slate-50">
              Una cabina oscura, clara y lista para mostrar GelatIA como producto.
            </h1>
            <p className="mt-6 max-w-xl text-base text-slate-400">
              Entrá para gestionar sabores, sucursales y equipo con una interfaz rápida y sin ruido innecesario.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Auth con JWT y roles conectados al backend real.</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Busqueda reusable con paginacion en sabores, usuarios y sucursales.</div>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-xl p-8 lg:p-10">
          <div className="mb-8">
            <img src={gelatiaLogo} alt="GelatIA" className="h-16 w-auto max-w-[260px]" />
            <p className="mt-3 text-xs uppercase tracking-[0.32em] text-slate-500">by EGYEN</p>
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-blue/80">GelatIA</p>
              <h2 className="text-2xl font-semibold text-slate-50">Iniciar sesion</h2>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="owner@gelatia.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Contrasena</label>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Minimo 6 caracteres"
              />
            </div>

            {error ? <Alert>{error}</Alert> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Entrar a GelatIA"}
            </Button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6 text-sm text-slate-400">
            <span>No configuraste tu heladeria todavia? </span>
            <Link to="/setup-business" className="text-accent-blue transition hover:text-accent-ice">
              Crear negocio
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
