import { generateReading } from './simulator.js';
import { tingkatAlert } from './ruleEngine.js';
import { SKENARIO } from './scenarios.js';

function hitungPresetPasien(ctx, overrides = {}) {
  const user = ctx?.user || {};
  const latest = ctx?.latestCondition || {};
  const adherence = ctx?.adherence || {};

  let baseSys = 126;
  let baseDia = 80;
  const risikoProfil = [];

  if (Number(user.usia) >= 60) {
    baseSys += 8;
    baseDia += 4;
    risikoProfil.push(`Usia ${user.usia} thn (+risiko)`);
  } else if (Number(user.usia) >= 45) {
    baseSys += 4;
    baseDia += 2;
    risikoProfil.push(`Usia ${user.usia} thn`);
  }

  if (/hipertensi|darah tinggi|jantung|diabetes|ginjal/i.test(user.riwayat_penyakit || '')) {
    baseSys += 6;
    baseDia += 3;
    risikoProfil.push('Riwayat medis');
  }

  if (/begadang|asin|garam|merokok|stres|kurang olahraga/i.test(user.gaya_hidup || '')) {
    baseSys += 5;
    baseDia += 3;
    risikoProfil.push('Gaya hidup');
  }

  const beratKg = Number(overrides.beratKg ?? overrides.berat_kg ?? latest.berat_kg ?? 70);
  if (Number(user.tinggi_cm) > 0 && beratKg > 0) {
    const tinggiM = Number(user.tinggi_cm) / 100;
    const bmi = beratKg / (tinggiM * tinggiM);
    if (bmi >= 25) {
      baseSys += 4;
      baseDia += 2;
      risikoProfil.push(`IMT ${bmi.toFixed(1)}`);
    }
  }

  const gejala = overrides.gejala ?? latest.gejala ?? null;
  if (/pusing|nyeri dada|sesak|sakit kepala|penglihatan/i.test(gejala || '')) {
    baseSys += 6;
    baseDia += 3;
    risikoProfil.push('Gejala aktif');
  }

  const jamTidur = Number(overrides.jamTidur ?? overrides.tidur_jam ?? latest.tidur_jam ?? 7);
  const stres = Number(overrides.stres ?? overrides.stres_level ?? latest.stres_level ?? 4);
  const asupanGaram = Number(overrides.asupanGaram ?? overrides.asupan_garam_level ?? latest.asupan_garam_level ?? 2);
  const langkah = Number(overrides.langkah ?? latest.langkah ?? 5000);
  const patuhObat = overrides.patuhObat ?? adherence.patuhObatHariIni ?? true;

  return {
    preset: {
      baseSys,
      baseDia,
      jamTidur,
      stres,
      asupanGaram,
      beratKg,
      langkah,
      patuhObat,
    },
    factors: {
      nama: user.nama || 'Pasien',
      usia: user.usia ?? null,
      jamTidur,
      stres,
      asupanGaram,
      beratKg,
      langkah,
      gejala,
      patuhObat,
      totalJadwalObat: adherence.totalJadwal ?? 0,
      sudahMinumObat: adherence.sudahDiminum ?? 0,
      risikoProfil,
    },
  };
}

// repo = objek penyimpanan (Prisma nanti, memori saat tes)
export async function simulateOnce(repo, userId, { skenario = 'acak', waktu = new Date(), condition } = {}) {
  const basePreset = SKENARIO[skenario];
  if (!basePreset) throw new Error(`Skenario tidak dikenal: ${skenario}`);

  let preset = basePreset;
  let patientFactors = null;
  let gejala = condition?.gejala ?? null;

  if (basePreset.fromPatientContext) {
    const ctx = repo.getPatientContext ? await repo.getPatientContext(userId) : null;
    const built = hitungPresetPasien(ctx, condition);
    preset = built.preset;
    patientFactors = built.factors;
    gejala = built.factors.gejala;
  }

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
    gejala,
  });

  const level = tingkatAlert(reading.sistolik, reading.diastolik);
  let alert = null;
  if (level) {
    alert = await repo.saveAlert({
      userId,
      readingId: saved.id,
      waktu,
      level,
      sistolik: reading.sistolik,
      diastolik: reading.diastolik,
    });
  }

  return { reading, alert, patientFactors };
}
