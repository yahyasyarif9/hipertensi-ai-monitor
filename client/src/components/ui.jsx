import { AlertTriangle, Loader2 } from 'lucide-react';

export function Loading({ text = 'Memuat data…' }) {
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-muted" role="status">
      <Loader2 className="h-4 w-4 animate-spin" /> {text}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-alarm/30 bg-alarm-soft p-4 text-sm text-alarm" role="alert">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{error?.message || 'Data tidak bisa dimuat.'} Pastikan server berjalan, lalu coba lagi.</span>
      {onRetry && <button onClick={onRetry} className="btn-ghost ml-auto !py-1">Coba lagi</button>}
    </div>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ background: category.color }}>
      {category.label}
    </span>
  );
}

export function Empty({ children }) {
  return <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

export const fmtTime = (iso) =>
  new Date(iso).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
