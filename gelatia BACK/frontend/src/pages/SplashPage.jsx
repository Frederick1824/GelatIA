import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrandMark } from "../components/layout/BrandMark";
import { useAuthStore } from "../store/authStore";

export function SplashPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate(token ? "/branches/select" : "/login", { replace: true });
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-6">
      <div className="text-center">
        <div className="mx-auto rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-7 shadow-panel">
          <BrandMark brand="egyen" variant="full" className="justify-center" imageClassName="h-16 w-16" />
        </div>
        <h1 className="mt-8 text-4xl font-semibold text-slate-50">Entrando a GelatIA</h1>
        <p className="mt-4 text-sm text-slate-400">
          Preparando sesion, contexto y acceso al producto.
        </p>
      </div>
    </div>
  );
}
