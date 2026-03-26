export function LoadingGrid({ items = 6 }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="h-4 w-24 rounded-full bg-white/[0.06]" />
          <div className="mt-4 h-7 w-40 rounded-full bg-white/[0.08]" />
          <div className="mt-8 h-16 rounded-2xl bg-white/[0.05]" />
          <div className="mt-4 h-4 w-28 rounded-full bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}
