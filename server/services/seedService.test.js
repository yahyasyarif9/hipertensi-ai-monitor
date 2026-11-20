import { seedHistory } from './seedService.js';

const data = { readings: [], bodies: [], alerts: [] };
const repoPalsu = {
  async resetSimulasi() { return { readings: 0, bodies: 0, alerts: 0 }; },
  async saveHealthReading(r) { const s = { id: data.readings.length + 1, ...r }; data.readings.push(s); return s; },
  async saveBodyCondition(b) { data.bodies.push(b); return b; },
  async saveAlert(a) { data.alerts.push(a); return a; },
};

for (const pola of ['fluktuatif', 'naik', 'turun']) {
  data.readings.length = 0; data.bodies.length = 0; data.alerts.length = 0;
  const r = await seedHistory(repoPalsu, 1, { days: 30, pattern: pola });
  console.log(pola, '|', r.dibuat, '| rata-rata sistolik:', r.rataRataSistolik);
}

try { await seedHistory(repoPalsu, 1, { days: 10 }); } catch (e) { console.log('Error:', e.message); }