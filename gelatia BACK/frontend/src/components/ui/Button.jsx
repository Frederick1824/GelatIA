import { cn } from "../../utils/cn";

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "bg-accent-red text-white hover:bg-red-500 active:scale-[0.985] active:bg-red-600",
    secondary: "bg-white/8 text-slate-100 hover:bg-white/12 active:scale-[0.985] active:bg-white/15",
    ghost: "bg-transparent text-slate-300 hover:bg-white/6 active:scale-[0.985] active:bg-white/10",
    outline:
      "border border-white/15 bg-transparent text-slate-100 hover:border-accent-blue/50 hover:bg-accent-blue/10 active:scale-[0.985] active:border-accent-blue/60",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-150 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
