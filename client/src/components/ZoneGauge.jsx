import { CATEGORIES } from '../lib/bp';

const MIN = 90, MAX = 200;
const pct = (v) => ((Math.min(Math.max(v, MIN), MAX) - MIN) / (MAX - MIN)) * 100;

// Skala sistolik berwarna; penanda menunjukkan posisi pembacaan terakhir di antara kategori.
export default function ZoneGauge({ systolic }) {
  return (
    <div className="mt-5" aria-hidden="true">
      <div className="relative">
        <div className="flex h-3 overflow-hidden rounded-full">
          {CATEGORIES.map((c) => (
            <div key={c.key} style={{ width: `${((c.to - c.from) / (MAX - MIN)) * 100}%`, background: c.color }} />
          ))}
        </div>
        <div className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded bg-ink ring-2 ring-white" style={{ left: `${pct(systolic)}%` }} />
      </div>
      <div className="relative mt-1.5 h-4 text-xs text-muted">
        {[120, 140, 160, 180].map((v) => (
          <span key={v} className="absolute -translate-x-1/2" style={{ left: `${pct(v)}%` }}>{v}</span>
        ))}
      </div>
    </div>
  );
}
