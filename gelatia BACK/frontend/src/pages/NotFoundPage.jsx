import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-6">
      <Card className="w-full max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-accent-blue/80">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-50">La ruta no existe</h1>
        <p className="mt-4 text-sm text-slate-400">
          La base del producto ya está lista para crecer, pero esta pantalla todavía no forma parte del mapa principal.
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>Ir al dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
