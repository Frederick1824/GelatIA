import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-6">
      <Card className="w-full max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-red/80">Acceso denegado</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-50">No tenés permisos para entrar acá</h1>
        <p className="mt-4 text-sm text-slate-400">
          El backend sigue siendo la autoridad real. El frontend solamente refleja ese alcance visual.
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>Volver al dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
