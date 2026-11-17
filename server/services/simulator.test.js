const { generateReading } = require('./simulator');

console.log('--- 5 contoh data ---');
for (let i = 0; i < 5; i++) console.log(generateReading());

console.log('--- Sebaran kategori (1000 data) ---');
const hitung = {};
for (let i = 0; i < 1000; i++) {
  const { kategori } = generateReading();
  hitung[kategori] = (hitung[kategori] || 0) + 1;
}
console.log(hitung);

console.log('--- Cek korelasi ---');
const rata = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const buruk = [];
const baik = [];
for (let i = 0; i < 500; i++) {
  buruk.push(generateReading({ jamTidur: 4, stres: 9 }).sistolik);
  baik.push(generateReading({ jamTidur: 8, stres: 2 }).sistolik);
}
console.log('Rata-rata sistolik (tidur 4 jam, stres 9):', rata(buruk).toFixed(1));
console.log('Rata-rata sistolik (tidur 8 jam, stres 2):', rata(baik).toFixed(1));