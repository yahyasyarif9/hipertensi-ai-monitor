import { LATE_WEIGHT, normalizeStatus } from './bp';

export const dayKey = (d) => {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${m}-${day}`;
};
// 'YYYY-MM-DD' dipakai apa adanya; timestamp diubah ke tanggal lokal.
const keyOf = (v) => (typeof v === 'string' && v.length === 10 ? v : dayKey(v));
const avg = (a) => (a.length ? a.reduce((s, n) => s + n, 0) / a.length : null);
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

export const fmtDay = (key) =>
  new Date(`${key}T12:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

// Menggabungkan 3 sumber data (pembacaan, kondisi tubuh, log obat) menjadi satu baris per hari
// supaya bisa dibandingkan di grafik yang sama.
export function buildDaily(readings = [], conditions = [], logs = [], days = 14) {
  const rows = new Map();
  const row = (k) => {
    if (!rows.has(k)) rows.set(k, { key: k, sys: [], dia: [], nadi: [], tidur: null, stres: null, dosis: [] });
    return rows.get(k);
  };
  readings.forEach((r) => {
    const x = row(keyOf(r.waktu));
    x.sys.push(r.sistolik); x.dia.push(r.diastolik); x.nadi.push(r.nadi);
  });
  conditions.forEach((c) => {
    const x = row(keyOf(c.tanggal));
    x.tidur = c.tidur_jam; x.stres = c.stres_level;
  });
  logs.forEach((l) => {
    const s = normalizeStatus(l.status);
    if (!s) return;
    row(keyOf(l.tanggal)).dosis.push(s === 'tepat' ? 1 : s === 'terlambat' ? LATE_WEIGHT : 0);
  });
  return [...rows.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-days)
    .map((x) => ({
      key: x.key,
      label: fmtDay(x.key),
      sistolik: x.sys.length ? Math.round(avg(x.sys)) : null,
      diastolik: x.dia.length ? Math.round(avg(x.dia)) : null,
      nadi: x.nadi.length ? Math.round(avg(x.nadi)) : null,
      tidur: x.tidur,
      stres: x.stres,
      kepatuhan: x.dosis.length ? Math.round(avg(x.dosis) * 100) : null,
    }));
}

// Temuan sederhana "tidur kurang -> tensi naik" dari data yang sedang ditampilkan.
export function buildInsights(daily) {
  const out = [];
  const compare = (pred, field, text) => {
    const ok = daily.filter((d) => d.sistolik != null && d[field] != null);
    const a = ok.filter(pred);
    const b = ok.filter((d) => !pred(d));
    if (a.length < 2 || b.length < 2) return;
    const diff = round1(avg(a.map((d) => d.sistolik)) - avg(b.map((d) => d.sistolik)));
    if (Math.abs(diff) >= 3) out.push(text(Math.abs(diff), diff > 0 ? 'lebih tinggi' : 'lebih rendah'));
  };
  compare((d) => d.tidur < 6, 'tidur', (n, w) => `Pada hari tidur kurang dari 6 jam, sistolik rata-rata ${n} mmHg ${w} dibanding hari tidur cukup.`);
  compare((d) => d.stres >= 7, 'stres', (n, w) => `Pada hari stres tinggi (7 ke atas), sistolik rata-rata ${n} mmHg ${w}.`);
  compare((d) => d.kepatuhan < 100, 'kepatuhan', (n, w) => `Pada hari ada obat yang terlambat atau terlewat, sistolik rata-rata ${n} mmHg ${w}.`);
  return out;
}
