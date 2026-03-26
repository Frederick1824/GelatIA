import { cn } from "../../utils/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-blue/60 focus:outline-none focus:ring-2 focus:ring-accent-blue/30",
        className
      )}
      {...props}
    />
  );
}
