import { simulateOnce } from './iotService.js';

// Penyimpanan palsu di memori
const data = { readings: [], bodies: [], alerts: [] };
const repoPalsu = {
  async saveHealthReading(r) { const s = { id: data.readings.length + 1, ...r }; data.readings.push(s); return s; },
  async saveBodyCondition(b) { data.bodies.push(b); return b; },
  async saveAlert(a) { data.alerts.push(a); return a; },
};

console.log('--- Skenario terkontrol (jangan ada alert) ---');
const a = await simulateOnce(repoPalsu, 1, { skenario: 'terkontrol' });
console.log(a.reading.sistolik + '/' + a.reading.diastolik, a.reading.kategori, '| alert:', a.alert);

console.log('--- Skenario krisis (harus ada alert) ---');
const b = await simulateOnce(repoPalsu, 1, { skenario: 'krisis' });
console.log(b.reading.sistolik + '/' + b.reading.diastolik, b.reading.kategori, '| alert:', b.alert);

console.log('--- Skenario waspada (alert level waspada) ---');
const w = await simulateOnce(repoPalsu, 1, { skenario: 'waspada' });
console.log(w.reading.sistolik + '/' + w.reading.diastolik, '| level:', w.alert?.level);

console.log('--- Skenario tidak dikenal (harus error) ---');
try {
  await simulateOnce(repoPalsu, 1, { skenario: 'ngawur' });
} catch (e) {
  console.log('Error:', e.message);
}

console.log('--- Total tersimpan ---');
console.log('readings:', data.readings.length, '| bodies:', data.bodies.length, '| alerts:', data.alerts.length);