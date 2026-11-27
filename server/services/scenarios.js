// Preset untuk tombol skenario demo, dipakai langsung oleh generateReading()
export const SKENARIO = {
  acak: {},
  kondisi_pasien: { fromPatientContext: true },
  krisis: { baseSys: 175, baseDia: 112, patuhObat: false, jamTidur: 4, stres: 9, asupanGaram: 5 },
  terkontrol: { baseSys: 128, baseDia: 82, patuhObat: true, jamTidur: 8, stres: 2, asupanGaram: 1 },
  waspada: { baseSys: 150, baseDia: 95, patuhObat: false, jamTidur: 6, stres: 6, asupanGaram: 4 },
};