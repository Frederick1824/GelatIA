import { NavLink } from "react-router-dom";
import { canViewUsers } from "../../utils/permissions";
import { cn } from "../../utils/cn";
import gelatiaLogo from "../../assets/logos/gelatia-logo.svg";

const baseItems = [
  { to: "/dashboard", label: "Dashboard", short: "DB", disabled: false },
  { to: "/flavors", label: "Sabores", short: "SB", disabled: false },
  { to: "/branches", label: "Sucursales", short: "SC", disabled: false },
  { to: "/cashier", label: "Caja", short: "CJ", disabled: false },
];

function SidebarItem({ item }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
          item.disabled && "opacity-80",
          isActive
            ? "bg-gradient-to-r from-accent-blue/18 via-accent-blue/10 to-transparent text-accent-ice"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "absolute left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full transition",
              isActive ? "bg-accent-blue" : "bg-transparent"
            )}
          />
          <span
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border text-[11px] font-semibold tracking-[0.18em]",
              item.disabled
                ? "border-white/10 bg-white/[0.03] text-slate-500"
                : isActive
                  ? "border-accent-blue/30 bg-accent-blue/12 text-accent-ice"
                  : "border-white/10 bg-white/[0.05] text-slate-300 group-hover:border-accent-blue/30"
            )}
          >
            {item.short}
          </span>
          <div className="flex-1">
            <p>{item.label}</p>
            {item.disabled ? <p className="mt-0.5 text-xs text-slate-500">Proximamente</p> : null}
          </div>
        </>
      )}
    </NavLink>
  );
}

export function AppSidebar({ userRole }) {
  const items = canViewUsers(userRole)
    ? [...baseItems.slice(0, 3), { to: "/users", label: "Usuarios", short: "US", disabled: false }, baseItems[3]]
    : baseItems;

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-base-900/90 px-5 py-6 backdrop-blur-xl">
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <img src={gelatiaLogo} alt="GelatIA" className="h-8 w-auto max-w-[126px]" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-accent-blue/80">Producto</p>
            <h1 className="text-lg font-semibold text-slate-50">GelatIA</h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Operacion clara para sabores, sucursales y equipo sin ruido visual.
        </p>
      </div>

      <nav className="space-y-1.5">
        {items.map((item) => (
          <SidebarItem key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-auto rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.04] to-accent-blue/10 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Core multi-tenant</p>
        <p className="mt-2 text-sm text-slate-300">
          Misma base para multiples negocios, con permisos y contexto por heladeria.
        </p>
      </div>
    </aside>
  );
}
