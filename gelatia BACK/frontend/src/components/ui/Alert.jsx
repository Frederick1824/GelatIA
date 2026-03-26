import { cn } from "../../utils/cn";

export function Alert({ children, tone = "error" }) {
  const tones = {
    error: "border-red-500/20 bg-red-500/10 text-red-200",
    info: "border-accent-blue/20 bg-accent-blue/10 text-accent-ice",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  };

  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm", tones[tone])}>
      {children}
    </div>
  );
}
