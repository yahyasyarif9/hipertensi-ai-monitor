import { kategoriTensi } from './ruleEngine.js';

const rand = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function generateReading(opts = {}) {
  const {
    baseSys = 135,
    baseDia = 85,
    patuhObat = true,
  } = opts;

  // Bisa dipaksa lewat opts (untuk skenario demo), kalau tidak diacak
  const jamTidur = opts.jamTidur ?? Number(rand(3.5, 8.5).toFixed(1));
  const stres = opts.stres ?? Math.round(rand(1, 10));              // skala 1-10
  const asupanGaram = opts.asupanGaram ?? Math.floor(rand(1, 6));   // skala 1-5
  const beratKg = opts.beratKg ?? Number(rand(74.5, 75.5).toFixed(1));
  const langkah = opts.langkah ?? Math.round(rand(2000, 10000));

  let sistolik = baseSys
    + (stres - 5) * 2.5
    + (7 - jamTidur) * 3
    + (asupanGaram - 3) * 2
    + (patuhObat ? -5 : 8)
    + rand(-4, 4);

  let diastolik = baseDia
    + (stres - 5) * 1.5
    + (7 - jamTidur) * 1.5
    + (asupanGaram - 3) * 1
    + (patuhObat ? -3 : 5)
    + rand(-3, 3);

  sistolik = clamp(Math.round(sistolik), 90, 220);
  diastolik = clamp(Math.round(diastolik), 55, 130);

  return {
    sistolik,
    diastolik,
    nadi: Math.round(rand(60, 100)),
    jamTidur,
    stres,
    asupanGaram,
    beratKg,
    langkah,
    patuhObat,
    kategori: kategoriTensi(sistolik, diastolik),
  };
}