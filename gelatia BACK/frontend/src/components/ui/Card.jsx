import { cn } from "../../utils/cn";

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-panel backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
