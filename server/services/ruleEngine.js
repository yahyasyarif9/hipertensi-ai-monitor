function kategoriTensi(sistolik, diastolik) {
  if (sistolik >= 180 || diastolik >= 120) return 'Krisis Hipertensi';
  if (sistolik >= 140 || diastolik >= 90)  return 'Hipertensi Tk. 2';
  if (sistolik >= 130 || diastolik >= 80)  return 'Hipertensi Tk. 1';
  if (sistolik >= 120)                     return 'Pra-hipertensi';
  return 'Normal';
}

function perluAlert(sistolik, diastolik) {
  return sistolik >= 180 || diastolik >= 120;
}

module.exports = { kategoriTensi, perluAlert };