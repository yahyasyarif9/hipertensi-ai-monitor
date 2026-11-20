import { generateReading } from './simulator.js';
import { tingkatAlert } from './ruleEngine.js';

export const HARI_VALID = [7, 14, 30];
export const POLA_VALID = ['naik', 'turun', 'fluktuatif'];
const JAM_UKUR = [8, 20];
const PELUANG_TIDAK_PATUH = { naik: 0.3, turun: 0.05, fluktuatif: 0.25 };

// hariKe: 0 = hari terlama, totalHari - 1 = hari terbaru
function offsetPola(pola, hariKe, totalHari) {
  const progres = hariKe / Math.max(1, totalHari - 1);
  if (pola === 'naik') return { sys: -10 + progres * 30, dia: -6 + progres * 18 };
  if (pola === 'turun') return { sys: 20 - progres * 30, dia: 12 - progres * 18 };
  const gelombang = Math.sin(hariKe * 1.3);
  return { sys: gelombang * 15, dia: gelombang * 9 };
}

export async function seedHistory(repo, userId, { days = 7, pattern = 'fluktuatif', reset = true } = {}) {
  if (!HARI_VALID.includes(days)) throw new Error('days harus 7, 14, atau 30');
  if (!POLA_VALID.includes(pattern)) throw new Error(`Pola tidak dikenal: ${pattern}`);

  const dihapus = reset ? await repo.resetSimulasi(userId) : { readings: 0, bodies: 0, alerts: 0 };

  const hasil = { readings: 0, bodies: 0, alerts: 0, waspada: 0, krisis: 0 };
  let totalSistolik = 0;

  for (let hariKe = 0; hariKe < days; hariKe++) {
    const { sys, dia } = offsetPola(pattern, hariKe, days);

    for (const jam of JAM_UKUR) {
      const waktu = new Date();
      waktu.setDate(waktu.getDate() - (days - hariKe)); // days hari lalu sampai kemarin
      waktu.setHours(jam, 0, 0, 0);

      const patuhObat = Math.random() > PELUANG_TIDAK_PATUH[pattern];
      const reading = generateReading({ baseSys: 135 + sys, baseDia: 85 + dia, patuhObat });

      const saved = await repo.saveHealthReading({
        userId, waktu,
        sistolik: reading.sistolik, diastolik: reading.diastolik,
        nadi: reading.nadi, kategori: reading.kategori,
      });
      await repo.saveBodyCondition({
        userId, waktu,
        jamTidur: reading.jamTidur, stres: reading.stres,
        asupanGaram: reading.asupanGaram, beratKg: reading.beratKg, langkah: reading.langkah,
      });

      hasil.readings++;
      hasil.bodies++;
      totalSistolik += reading.sistolik;

      const level = tingkatAlert(reading.sistolik, reading.diastolik);
      if (level) {
        await repo.saveAlert({
          userId, readingId: saved.id, waktu, level,
          sistolik: reading.sistolik, diastolik: reading.diastolik,
        });
        hasil.alerts++;
        if (level === 'waspada') hasil.waspada++;
        else hasil.krisis++;
      }
    }
  }

  return {
    pola: pattern,
    hari: days,
    dihapus,
    dibuat: hasil,
    rataRataSistolik: Number((totalSistolik / hasil.readings).toFixed(1)),
  };
}