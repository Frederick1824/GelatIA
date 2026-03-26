import egyenMark from "../../assets/branding/egyen/egyen-mark.svg";
import gelatiaMark from "../../assets/branding/gelatia/gelatia-mark.svg";
import { cn } from "../../utils/cn";

const brandConfig = {
  egyen: {
    label: "EGYEN",
    tagline: "Commerce core",
    mark: egyenMark,
  },
  gelatia: {
    label: "GelatIA",
    tagline: "Heladerias en tiempo real",
    mark: gelatiaMark,
  },
};

export function BrandMark({
  brand = "gelatia",
  variant = "ui",
  className,
  imageClassName,
}) {
  const config = brandConfig[brand];

  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <img
          src={config.mark}
          alt={config.label}
          className={cn("h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.03] p-2", imageClassName)}
        />
        <div>
          <p className="text-xs uppercase tracking-[0.42em] text-accent-blue/75">{config.label}</p>
          <p className="mt-1 text-sm text-slate-400">{config.tagline}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={config.mark}
      alt={config.label}
      className={cn("h-10 w-10 rounded-2xl", className)}
    />
  );
}
