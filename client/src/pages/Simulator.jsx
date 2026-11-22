import { useState } from 'react';
import { Activity, History } from 'lucide-react';
import { api, USER_ID } from '../api/client';
import { ErrorBox, Loading } from '../components/ui';

const SKENARIO = [
  { id: 'acak', label: 'Data acak', cls: 'btn-primary' },
  { id: 'terkontrol', label: 'Terkontrol', cls: 'btn-ghost' },
  { id: 'waspada', label: 'Simulasi waspada', cls: 'btn-secondary' },
  { id: 'krisis', label: 'Simulasi krisis', cls: 'btn bg-alarm text-white hover:opacity-90' },
];

const POLA = [
  { id: 'fluktuatif', label: 'Fluktuatif' },
  { id: 'naik', label: 'Tren naik' },
  { id: 'turun', label: 'Tren membaik' },
];

const HARI = [7, 14, 30];

export default function Simulator() {
  const [pola, setPola] = useState('fluktuatif');
  const [busy, setBusy] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState(null);

  async function jalankan(kunci, fn, tipe) {
    setBusy(kunci);
    setError(null);
    try {
      const res = await fn();
      setHasil({ tipe, data: res.data });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(null);
    }
  }

  function seed(hari) {
    const ok = window.confirm(
      `Riwayat simulasi lama milik user ${USER_ID} akan dihapus dan diganti data ${hari} hari. Lanjutkan?`
    );
    if (ok) jalankan(`seed-${hari}`, () => api.seed(hari, pola), 'seed');
  }

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Simulator IoT</h1>
      <p className="mt-1 text-sm text-muted">
        Membuat data tekanan darah simulasi untuk user #{USER_ID}. Data masuk ke database bersama.
      </p>

      <section className="panel mt-6">
        <h2 className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" /> Satu pengukuran
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {SKENARIO.map((s) => (
            <button
              key={s.id}
              className={s.cls}
              disabled={busy !== null}
              onClick={() => jalankan(s.id, () => api.simulate(s.id), 'simulate')}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel mt-6">
        <h2 className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" /> Riwayat (Time-Travel Seeder)
        </h2>
        <div className="mt-4 max-w-xs">
          <label className="label" htmlFor="pola">Pola data</label>
          <select id="pola" className="field" value={pola} onChange={(e) => setPola(e.target.value)} disabled={busy !== null}>
            {POLA.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {HARI.map((h) => (
            <button key={h} className="btn-primary" disabled={busy !== null} onClick={() => seed(h)}>
              Riwayat {h} hari
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Menghapus riwayat simulasi lama lebih dulu. Untuk 30 hari, prosesnya bisa memakan waktu puluhan detik.
        </p>
      </section>

      <div className="mt-6">
        {busy && <Loading text={busy.startsWith('seed') ? 'Membuat riwayat, mohon tunggu...' : 'Membuat data...'} />}
        {error && <ErrorBox error={error} />}
        {hasil && !busy && !error && <Hasil hasil={hasil} />}
      </div>
    </>
  );
}

function Hasil({ hasil }) {
  const { tipe, data } = hasil;

  if (tipe === 'simulate') {
    const { reading, alert } = data;
    return (
      <div className="panel">
        <h2 className="text-lg">Hasil terakhir</h2>
        <p className="mt-2 text-3xl font-bold">
          {reading.sistolik}/{reading.diastolik} <span className="text-base font-medium text-muted">mmHg</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="badge-brand">{reading.kategori}</span>
          {alert?.level === 'krisis_hipertensi' && <span className="badge-danger">Alert: krisis hipertensi</span>}
          {alert?.level === 'waspada' && <span className="badge-warning">Alert: waspada</span>}
          {!alert && <span className="badge-success">Tidak ada alert</span>}
        </div>
        <p className="mt-3 text-sm text-muted">
          Nadi {reading.nadi} · tidur {reading.jamTidur} jam · stres {reading.stres}/10 · garam {reading.asupanGaram}/5 · {reading.langkah} langkah
        </p>
      </div>
    );
  }

  const d = data.dibuat;
  return (
    <div className="panel">
      <h2 className="text-lg">Riwayat dibuat</h2>
      <p className="mt-2 text-sm">
        Pola <b>{data.pola}</b>, {data.hari} hari: <b>{d.readings}</b> pengukuran, rata-rata sistolik <b>{data.rataRataSistolik}</b>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="badge-warning">{d.waspada} waspada</span>
        <span className="badge-danger">{d.krisis} krisis</span>
      </div>
      <p className="mt-3 text-xs text-muted">
        Data lama dihapus: {data.dihapus.readings} pengukuran, {data.dihapus.alerts} alert.
      </p>
    </div>
  );
}