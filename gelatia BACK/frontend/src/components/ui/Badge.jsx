import { cn } from "../../utils/cn";

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "border-white/10 bg-white/6 text-slate-200",
    blue: "border-accent-blue/20 bg-accent-blue/10 text-accent-ice",
    red: "border-accent-red/20 bg-accent-red/10 text-red-200",
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  };

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}
