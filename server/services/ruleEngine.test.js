import { kategoriTensi, perluAlert, tingkatAlert } from './ruleEngine.js';

console.log(tingkatAlert(135, 85));   // null
console.log(tingkatAlert(145, 85));   // waspada
console.log(tingkatAlert(130, 95));   // waspada
console.log(tingkatAlert(185, 100));  // krisis_hipertensi
console.log(tingkatAlert(125, 125));  // krisis_hipertensi
console.log(kategoriTensi(110, 70));   // Normal
console.log(kategoriTensi(125, 75));   // Pra-hipertensi
console.log(kategoriTensi(135, 85));   // Hipertensi Tk. 1
console.log(kategoriTensi(150, 95));   // Hipertensi Tk. 2
console.log(kategoriTensi(185, 100));  // Krisis Hipertensi
console.log(perluAlert(185, 100));     // true
console.log(perluAlert(130, 85));      // false