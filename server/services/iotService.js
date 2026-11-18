import { generateReading } from './simulator.js';
import { perluAlert } from './ruleEngine.js';
import { SKENARIO } from './scenarios.js';

// repo = objek penyimpanan (Prisma nanti, memori saat tes)
export async function simulateOnce(repo, userId, { skenario = 'acak', waktu = new Date() } = {}) {
  const preset = SKENARIO[skenario];
  if (!preset) throw new Error(`Skenario tidak dikenal: ${skenario}`);

  const reading = generateReading(preset);

  // Bacaan tensi disimpan dulu, karena alert butuh id-nya
  const saved = await repo.saveHealthReading({
    userId,
    waktu,
    sistolik: reading.sistolik,
    diastolik: reading.diastolik,
    nadi: reading.nadi,
    kategori: reading.kategori,
  });

  await repo.saveBodyCondition({
    userId,
    waktu,
    jamTidur: reading.jamTidur,
    stres: reading.stres,
    asupanGaram: reading.asupanGaram,
    beratKg: reading.beratKg,
    langkah: reading.langkah,
  });

  let alert = null;
  if (perluAlert(reading.sistolik, reading.diastolik)) {
    alert = await repo.saveAlert({
      userId,
      readingId: saved.id,
      waktu,
      level: 'krisis_hipertensi',
      sistolik: reading.sistolik,
      diastolik: reading.diastolik,
    });
  }

  return { reading, alert };
}