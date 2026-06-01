import { SearchX } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-accent)]">
          <SearchX aria-hidden="true" size={24} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
