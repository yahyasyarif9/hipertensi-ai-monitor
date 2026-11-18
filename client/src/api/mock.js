// Data tiruan supaya frontend bisa jalan & didemokan sebelum backend siap (VITE_USE_MOCK=true).
// Bentuk data mengikuti kolom di ERD.
import { classify } from '../lib/bp';
import { dayKey } from '../lib/series';

const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 150));
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const DAYS = 30;
const db = { readings: [], conditions: [], alerts: [], meds: [], logs: [], sideEffects: [], nextId: 100 };

function seed() {
  const rand = rng(42);
  db.meds = [
    { med_id: 1, nama_obat: 'Amlodipine', dosis: '5 mg', schedules: [{ schedule_id: 1, jam_minum: '08:00' }] },
    { med_id: 2, nama_obat: 'Captopril', dosis: '25 mg', schedules: [{ schedule_id: 2, jam_minum: '13:00' }] },
  ];
  const now = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const key = dayKey(d);
    const tidur = Math.round((5 + rand() * 3) * 10) / 10;
    const stres = Math.ceil(rand() * 9);
    const garam = Math.ceil(rand() * 5);
    db.conditions.push({ condition_id: db.nextId++, tanggal: key, berat_kg: +(72 + rand()).toFixed(1), tidur_jam: tidur, langkah: Math.round(3000 + rand() * 6000), stres_level: stres, asupan_garam_level: garam, gejala: '' });

    // Dosis: hari ini tidak dibuatkan log (pasien yang menekannya sendiri di halaman Obat).
    let missed = false;
    if (i > 0) {
      db.meds.forEach((m) => m.schedules.forEach((s) => {
        const r = rand();
        const status = r < 0.72 ? 'tepat' : r < 0.86 ? 'terlambat' : 'terlewat';
        if (status === 'terlewat') missed = true;
        const [h, mi] = s.jam_minum.split(':').map(Number);
        const at = new Date(d); at.setHours(h + (status === 'terlambat' ? 3 : 0), mi, 0, 0);
        db.logs.push({ log_id: db.nextId++, schedule_id: s.schedule_id, tanggal: key, waktu_aktual: status === 'terlewat' ? null : at.toISOString(), status });
      }));
    }
    // Tensi dipengaruhi tidur, stres, garam, dan obat terlewat -> korelasi terlihat di grafik.
    const base = 126 + (6.5 - tidur) * 4 + (stres - 5) * 2.2 + (garam - 3) * 2 + (missed ? 8 : 0);
    [['07:30', 0], ['19:30', 3]].forEach(([jam, plus]) => {
      const [h, mi] = jam.split(':').map(Number);
      const w = new Date(d); w.setHours(h, mi, 0, 0);
      if (w > now) return;
      const sys = Math.round(base + plus + (rand() - 0.5) * 8);
      const dia = Math.round(sys * 0.62 + (rand() - 0.5) * 5);
      db.readings.push({ reading_id: db.nextId++, waktu: w.toISOString(), sistolik: sys, diastolik: dia, nadi: Math.round(68 + rand() * 18), kategori: '', sumber: 'simulasi_iot' });
    });
  }
  // Satu lonjakan kemarin malam supaya banner peringatan bisa dilihat saat demo.
  const y = new Date(now); y.setDate(now.getDate() - 1); y.setHours(19, 30, 0, 0);
  const crisis = db.readings.find((r) => dayKey(r.waktu) === dayKey(y) && new Date(r.waktu).getHours() === 19);
  if (crisis) {
    Object.assign(crisis, { sistolik: 184, diastolik: 112, nadi: 96 });
    db.alerts.push({ alert_id: 1, reading_id: crisis.reading_id, level: 'Krisis Hipertensi', waktu: crisis.waktu });
  }
  db.readings.forEach((r) => { r.kategori = classify(r.sistolik, r.diastolik); });
  db.sideEffects.push({ effect_id: db.nextId++, med_id: 1, nama_obat: 'Amlodipine', waktu: new Date(now - 3 * 864e5).toISOString(), jenis: 'Kaki bengkak', keparahan: 'ringan', catatan: 'Muncul sore hari' });
}
seed();

const sinceDays = (n) => Date.now() - n * 864e5;
const todayKey = () => dayKey(new Date());

export const readings = (days) => wait(db.readings.filter((r) => new Date(r.waktu) >= sinceDays(days)));
export const conditions = (days) => wait(db.conditions.filter((c) => new Date(`${c.tanggal}T23:59:59`) >= sinceDays(days)));
export const alerts = () => wait([...db.alerts].reverse());
export const medLogs = (days) => wait(db.logs.filter((l) => new Date(`${l.tanggal}T23:59:59`) >= sinceDays(days)));
export const meds = () => wait(db.meds);

export const adherence = () => {
  const calc = (days) => {
    const rows = db.logs.filter((l) => new Date(`${l.tanggal}T23:59:59`) >= sinceDays(days));
    return rows.length ? Math.round((rows.filter((l) => l.status === 'tepat').length / rows.length) * 100) : 0;
  };
  return wait({ mingguan: calc(7), bulanan: calc(30), total: calc(9999) });
};

export const medsToday = () => {
  const items = db.meds.flatMap((m) => m.schedules.map((s) => {
    const log = db.logs.find((l) => l.schedule_id === s.schedule_id && l.tanggal === todayKey());
    return { schedule_id: s.schedule_id, med_id: m.med_id, nama_obat: m.nama_obat, dosis: m.dosis, jam_minum: s.jam_minum, status: log?.status ?? null, waktu_aktual: log?.waktu_aktual ?? null };
  }));
  return wait(items.sort((a, b) => a.jam_minum.localeCompare(b.jam_minum)));
};

export const addMed = ({ nama_obat, dosis, jam_minum }) => {
  const med_id = db.nextId++;
  db.meds.push({ med_id, nama_obat, dosis, schedules: jam_minum.map((j) => ({ schedule_id: db.nextId++, jam_minum: j })) });
  return wait({ med_id });
};

export const deleteMed = (id) => {
  const m = db.meds.find((x) => x.med_id === id);
  db.meds = db.meds.filter((x) => x.med_id !== id);
  if (m) db.logs = db.logs.filter((l) => !m.schedules.some((s) => s.schedule_id === l.schedule_id));
  return wait(null);
};

// Aturan status sama dengan yang diminta untuk backend: +-2 jam = tepat, lewat itu = terlambat.
export const logDose = (schedule_id) => {
  const s = db.meds.flatMap((m) => m.schedules).find((x) => x.schedule_id === schedule_id);
  const now = new Date();
  const [h, mi] = s.jam_minum.split(':').map(Number);
  const due = new Date(now); due.setHours(h, mi, 0, 0);
  const status = Math.abs(now - due) <= 2 * 36e5 ? 'tepat' : 'terlambat';
  db.logs.push({ log_id: db.nextId++, schedule_id, tanggal: todayKey(), waktu_aktual: now.toISOString(), status });
  return wait({ status });
};

export const sideEffects = () => wait([...db.sideEffects].reverse());
export const addSideEffect = (b) => {
  const m = db.meds.find((x) => x.med_id === Number(b.med_id));
  db.sideEffects.push({ effect_id: db.nextId++, ...b, med_id: Number(b.med_id), nama_obat: m?.nama_obat, waktu: new Date().toISOString() });
  return wait(null);
};
