export type FieldProps = {
  label: string;
  value: React.ReactNode;
  title?: string;
  onClick?: () => void;
};

export function Field({ label, value, title, onClick }: FieldProps) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5" title={title}>
      <span className="text-muted-foreground text-sm">{label}</span>
      {onClick ? (
        <button
          type="button"
          className="text-primary hover:text-primary/80 cursor-pointer text-right text-sm font-medium underline underline-offset-2"
          onClick={onClick}
        >
          {value ?? "—"}
        </button>
      ) : (
        <span className="text-right text-sm font-medium">{value ?? "—"}</span>
      )}
    </div>
  );
}
