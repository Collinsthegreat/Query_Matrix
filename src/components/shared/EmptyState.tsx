import { Button } from "@/components/ui/Button";

export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] bg-[linear-gradient(180deg,var(--bg-card),var(--bg-panel))] p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] border border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary)] shadow-[var(--shadow-glow)]">
          <i className="ti ti-adjustments-horizontal" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--text-muted)]">{description}</p>
        {actionLabel && onAction && (
          <Button type="button" variant="primary" size="sm" className="mx-auto mt-4" onClick={onAction}>
            <i className="ti ti-plus" aria-hidden="true" />
            {actionLabel}
          </Button>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["A — add rule", "G — add group", "⌘K — commands"].map((chip) => (
            <span key={chip} className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 font-mono text-[var(--text-xs)] text-[var(--text-muted)]">{chip}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
