// Kategori tekanan darah. Backend (rule-engine Farida) mengirim string `kategori`;
// kalau formatnya beda / kosong, frontend mengklasifikasi sendiri dari angka.
export const CATEGORIES = [
  { key: 'normal', label: 'Normal', color: '#2E8B57', from: 90, to: 120 },
  { key: 'pra', label: 'Pra-hipertensi', color: '#C9A227', from: 120, to: 140 },
  { key: 'tk1', label: 'Hipertensi Tk. 1', color: '#E07B1F', from: 140, to: 160 },
  { key: 'tk2', label: 'Hipertensi Tk. 2', color: '#CF4A2B', from: 160, to: 180 },
  { key: 'krisis', label: 'Krisis Hipertensi', color: '#A3162A', from: 180, to: 200 },
];

export const classify = (sys, dia) => {
  if (sys >= 180 || dia >= 120) return 'krisis';
  if (sys >= 160 || dia >= 100) return 'tk2';
  if (sys >= 140 || dia >= 90) return 'tk1';
  if (sys >= 120 || dia >= 80) return 'pra';
  return 'normal';
};

export const getCategory = (reading) => {
  const raw = String(reading?.kategori || '').toLowerCase();
  let key = null;
  if (raw.includes('krisis') || raw.includes('crisis')) key = 'krisis';
  else if (/(tk\.?|tingkat|stage)\s*2/.test(raw)) key = 'tk2';
  else if (/(tk\.?|tingkat|stage)\s*1/.test(raw)) key = 'tk1';
  else if (raw.includes('pra') || raw.includes('pre')) key = 'pra';
  else if (raw.includes('normal')) key = 'normal';
  if (!key) key = classify(reading.sistolik, reading.diastolik);
  return CATEGORIES.find((c) => c.key === key);
};

export const normalizeStatus = (s) => {
  const v = String(s || '').toLowerCase();
  if (v.includes('tepat')) return 'tepat';
  if (v.includes('lambat')) return 'terlambat';
  if (v.includes('lewat')) return 'terlewat';
  return null;
};

export const STATUS_LABEL = { tepat: 'Tepat waktu', terlambat: 'Terlambat', terlewat: 'Terlewat' };

// Bobot dosis "terlambat" untuk grafik kepatuhan harian. Samakan dengan keputusan kelompok
// (1 = dihitung penuh seperti tepat waktu, 0.5 = setengah, 0 = tidak dihitung).
export const LATE_WEIGHT = 0.5;
