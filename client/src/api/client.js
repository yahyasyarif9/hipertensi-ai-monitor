// Semua pemanggilan API ada di sini. Kontrak endpoint ada di README-frontend.md.
import * as mock from './mock';

// USER_ID: pakai dari localStorage (set saat login), fallback ke env atau 1
export const getUserId = () => Number(localStorage.getItem('hp_user_id') || import.meta.env.VITE_DEMO_USER_ID || 1);
export const USER_ID = getUserId(); // backward compat
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE = import.meta.env.VITE_API_URL || '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    let msg = `Permintaan gagal (${res.status})`;
    try { const j = await res.json(); msg = j.message || j.error || msg; } catch { /* abaikan */ }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

const pick = (m, r) => (USE_MOCK ? m() : r());
const q = (extra = {}) => new URLSearchParams({ user_id: getUserId(), ...extra }).toString();

export const api = {
  readings: (days = 30) => pick(() => mock.readings(days), () => req(`/readings?${q({ days })}`)),
  conditions: (days = 30) => pick(() => mock.conditions(days), () => req(`/conditions?${q({ days })}`)),
  alerts: () => pick(() => mock.alerts(), () => req(`/alerts?${q()}`)),
  adherence: () => pick(() => mock.adherence(), () => req(`/meds/adherence?${q()}`)),
  medLogs: (days = 30) => pick(() => mock.medLogs(days), () => req(`/meds/logs?${q({ days })}`)),
  meds: () => pick(() => mock.meds(), () => req(`/meds?${q()}`)),
  addMed: (body) => pick(() => mock.addMed(body), () => req('/meds', { method: 'POST', body: { user_id: getUserId(), ...body } })),
  deleteMed: (id) => pick(() => mock.deleteMed(id), () => req(`/meds/${id}`, { method: 'DELETE' })),
  medsToday: () => pick(() => mock.medsToday(), () => req(`/meds/today?${q()}`)),
  logDose: (schedule_id) => pick(() => mock.logDose(schedule_id), () => req('/meds/log', { method: 'POST', body: { user_id: getUserId(), schedule_id, waktu_aktual: new Date().toISOString() } })),
  sideEffects: () => pick(() => mock.sideEffects(), () => req(`/side-effects?${q()}`)),
  addSideEffect: (body) => pick(() => mock.addSideEffect(body), () => req('/side-effects', { method: 'POST', body: { user_id: getUserId(), ...body } })),
  simulate: (skenario = 'acak') => req('/iot/simulate', { method: 'POST', body: { userId: getUserId(), skenario } }),
  seed: (days = 7, pattern = 'fluktuatif') => req('/iot/seed', { method: 'POST', body: { userId: getUserId(), days, pattern } }),
};
