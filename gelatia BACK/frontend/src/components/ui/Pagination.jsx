import { Button } from "./Button";

export function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-slate-200">
          Pagina {page} de {totalPages}
        </span>
        <span>
          Mostrando <span className="font-medium text-slate-200">{start}</span> a{" "}
          <span className="font-medium text-slate-200">{end}</span> de{" "}
          <span className="font-medium text-slate-200">{total}</span>
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
