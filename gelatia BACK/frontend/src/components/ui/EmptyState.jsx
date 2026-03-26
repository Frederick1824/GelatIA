import { Card } from "./Card";

export function EmptyState({ title, description }) {
  return (
    <Card className="border-dashed text-center">
      <h3 className="text-lg font-medium text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </Card>
  );
}
