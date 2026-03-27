export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}
