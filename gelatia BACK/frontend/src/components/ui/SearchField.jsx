import { Input } from "./Input";

export function SearchField({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        Q
      </span>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-14 rounded-3xl pl-11 text-base"
      />
    </div>
  );
}
