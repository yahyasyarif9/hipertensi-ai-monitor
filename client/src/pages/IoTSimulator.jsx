import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Zap, Calendar, Database, HeartPulse, Pill, UserCheck, Save } from 'lucide-react';
import { api } from '../api/client';

const DEFAULT_CONDITION = {
  tidur_jam: 7,
  stres_level: 4,
  asupan_garam_level: 2,
  berat_kg: 70,
  langkah: 5000,
  gejala: '',
};

export default function IoTSimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [patientCtx, setPatientCtx] = useState(null);
  const [cond, setCond] = useState(DEFAULT_CONDITION);

  const loadPatientStatus = async () => {
    try {
      const res = await api.patientStatus();
      const ctx = res.data;
      setPatientCtx(ctx);
      if (ctx?.latestCondition) {
        setCond({
          tidur_jam: ctx.latestCondition.tidur_jam ?? 7,
          stres_level: ctx.latestCondition.stres_level ?? 4,
          asupan_garam_level: ctx.latestCondition.asupan_garam_level ?? 2,
          berat_kg: ctx.latestCondition.berat_kg ?? 70,
          langkah: ctx.latestCondition.langkah ?? 5000,
          gejala: ctx.latestCondition.gejala ?? '',
        });
      }
    } catch {
      // Abaikan jika status awal gagal dimuat; pesan error muncul saat aksi dijalankan
    }
  };

  useEffect(() => {
    loadPatientStatus();
  }, []);

  const buildConditionPayload = () => ({
    tidur_jam: Number(cond.tidur_jam),
    stres_level: Number(cond.stres_level),
    asupan_garam_level: Number(cond.asupan_garam_level),
    berat_kg: Number(cond.berat_kg),
    langkah: Number(cond.langkah),
    gejala: cond.gejala.trim() || null,
  });

  // Fungsi untuk simulasi single reading
  const handleSimulate = async (skenario = 'acak', withCondition = false) => {
    setLoading(true);
    setError(null);
    setNotice(null);
    setResult(null);

    try {
      const res = await api.simulate(
        skenario,
        withCondition ? buildConditionPayload() : undefined
      );
      setResult({ type: 'simulate', data: res.data });
      await loadPatientStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simpan kondisi tubuh harian tanpa generate pembacaan tensi
  const handleSaveConditionOnly = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      await api.saveCondition(buildConditionPayload());
      setNotice('Kondisi harian pasien tersimpan ke database.');
      await loadPatientStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk generate history seeder
  const handleSeed = async (days, pattern = 'fluktuatif') => {
    setLoading(true);
    setError(null);
    setNotice(null);
    setResult(null);

    try {
      const res = await api.seed(days, pattern);
      setResult({ type: 'seed', data: res.data });
      await loadPatientStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const user = patientCtx?.user;
  const adherence = patientCtx?.adherence;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink md:text-4xl">Simulator IoT</h1>
        <p className="mt-1 text-muted">Simulasi tekanan darah yang terhubung langsung dengan kondisi, profil, dan kepatuhan obat pasien</p>
      </div>

      {/* Connected Patient Status & Daily Condition Form */}
      <section className="panel space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-soft p-3">
              <HeartPulse className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">Kondisi Pasien Terhubung</h2>
              <p className="text-sm text-muted">
                {user
                  ? `${user.nama} · ${user.usia} tahun · ${user.tinggi_cm} cm`
                  : 'Memuat profil pasien...'}
              </p>
            </div>
          </div>

          {adherence && (
            <Link
              to="/obat"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${
                adherence.patuhObatHariIni
                  ? 'bg-success-soft text-success'
                  : 'bg-warning-soft text-warning'
              }`}
            >
              <Pill className="h-4 w-4" />
              {adherence.totalJadwal === 0
                ? 'Belum ada jadwal obat'
                : `Obat hari ini: ${adherence.sudahDiminum}/${adherence.totalJadwal} diminum`}
            </Link>
          )}
        </div>

        {user && (user.riwayat_penyakit || user.gaya_hidup) && (
          <div className="grid gap-3 rounded-xl bg-paper p-4 text-xs text-muted sm:grid-cols-2">
            <p>
              <strong className="text-ink">Riwayat Penyakit:</strong>{' '}
              {user.riwayat_penyakit || 'Tidak ada catatan'}
            </p>
            <p>
              <strong className="text-ink">Gaya Hidup:</strong>{' '}
              {user.gaya_hidup || 'Tidak ada catatan'}
            </p>
          </div>
        )}

        <form onSubmit={handleSaveConditionOnly} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="cond-tidur">Tidur semalam (jam)</label>
              <input
                id="cond-tidur"
                type="number"
                step="0.5"
                min="0"
                max="24"
                className="field"
                value={cond.tidur_jam}
                onChange={(e) => setCond({ ...cond, tidur_jam: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="cond-stres">Level stres (1–10)</label>
              <input
                id="cond-stres"
                type="number"
                min="1"
                max="10"
                className="field"
                value={cond.stres_level}
                onChange={(e) => setCond({ ...cond, stres_level: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="cond-garam">Asupan garam (1–5)</label>
              <input
                id="cond-garam"
                type="number"
                min="1"
                max="5"
                className="field"
                value={cond.asupan_garam_level}
                onChange={(e) => setCond({ ...cond, asupan_garam_level: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="cond-berat">Berat badan (kg)</label>
              <input
                id="cond-berat"
                type="number"
                step="0.1"
                min="20"
                max="300"
                className="field"
                value={cond.berat_kg}
                onChange={(e) => setCond({ ...cond, berat_kg: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="cond-langkah">Langkah hari ini</label>
              <input
                id="cond-langkah"
                type="number"
                min="0"
                max="100000"
                className="field"
                value={cond.langkah}
                onChange={(e) => setCond({ ...cond, langkah: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="cond-gejala">Gejala yang dirasakan</label>
              <input
                id="cond-gejala"
                type="text"
                className="field"
                placeholder="Contoh: Pusing, tengkuk tegang"
                value={cond.gejala}
                onChange={(e) => setCond({ ...cond, gejala: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSimulate('kondisi_pasien', true)}
              className="btn-primary"
            >
              <UserCheck className="h-4 w-4" />
              Simulasikan Sesuai Kondisi Pasien
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-ghost"
            >
              <Save className="h-4 w-4" />
              Simpan Kondisi Saja
            </button>
          </div>
        </form>
      </section>

      {/* Panel Simulasi Single */}
      <section className="panel">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-brand-soft p-3">
            <Zap className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Simulasi Skenario Cepat</h2>
            <p className="text-sm text-muted">Generate 1 pembacaan tekanan darah sesuai skenario demo</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => handleSimulate('acak')}
            disabled={loading}
            className="btn-primary group"
          >
            <span className="text-xl">🎲</span>
            <span>Data Acak</span>
          </button>
          <button
            onClick={() => handleSimulate('terkontrol')}
            disabled={loading}
            className="btn-ghost group"
          >
            <span className="text-xl">✅</span>
            <span>Terkontrol</span>
          </button>
          <button
            onClick={() => handleSimulate('waspada')}
            disabled={loading}
            className="btn-ghost group"
          >
            <span className="text-xl">⚠️</span>
            <span>Waspada</span>
          </button>
          <button
            onClick={() => handleSimulate('krisis')}
            disabled={loading}
            className="btn-ghost group"
          >
            <span className="text-xl">🚨</span>
            <span>Krisis</span>
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-paper p-3 text-xs text-muted">
          <p><strong>Acak:</strong> Random BP normal-tinggi</p>
          <p><strong>Terkontrol:</strong> BP normal (128/82)</p>
          <p><strong>Waspada:</strong> BP tinggi (150/95)</p>
          <p><strong>Krisis:</strong> BP sangat tinggi (175/112)</p>
        </div>
      </section>

      {/* Panel Seeder History */}
      <section className="panel">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-success-soft p-3">
            <Database className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Generate History Data (Seeder)</h2>
            <p className="text-sm text-muted">Buat data riwayat 7/14/30 hari mengikuti kepatuhan obat & profil pasien</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Pola Fluktuatif */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand" />
              <p className="font-semibold text-ink">Pola Fluktuatif (Naik-Turun)</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => handleSeed(7, 'fluktuatif')} disabled={loading} className="btn-ghost">
                <span>📊</span><span>7 Hari</span>
              </button>
              <button onClick={() => handleSeed(14, 'fluktuatif')} disabled={loading} className="btn-ghost">
                <span>📊</span><span>14 Hari</span>
              </button>
              <button onClick={() => handleSeed(30, 'fluktuatif')} disabled={loading} className="btn-ghost">
                <span>📊</span><span>30 Hari</span>
              </button>
            </div>
          </div>

          {/* Pola Naik */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-alarm" />
              <p className="font-semibold text-ink">Pola Naik (Memburuk)</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => handleSeed(7, 'naik')} disabled={loading} className="btn-ghost">
                <span>📈</span><span>7 Hari</span>
              </button>
              <button onClick={() => handleSeed(14, 'naik')} disabled={loading} className="btn-ghost">
                <span>📈</span><span>14 Hari</span>
              </button>
              <button onClick={() => handleSeed(30, 'naik')} disabled={loading} className="btn-ghost">
                <span>📈</span><span>30 Hari</span>
              </button>
            </div>
          </div>

          {/* Pola Turun */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-success" />
              <p className="font-semibold text-ink">Pola Turun (Membaik)</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => handleSeed(7, 'turun')} disabled={loading} className="btn-ghost">
                <span>📉</span><span>7 Hari</span>
              </button>
              <button onClick={() => handleSeed(14, 'turun')} disabled={loading} className="btn-ghost">
                <span>📉</span><span>14 Hari</span>
              </button>
              <button onClick={() => handleSeed(30, 'turun')} disabled={loading} className="btn-ghost">
                <span>📉</span><span>30 Hari</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-paper p-3 text-xs text-muted">
          <p><strong>⚠️ Perhatian:</strong> Seeder akan menghapus data lama dan generate data baru!</p>
          <p><strong>📅 Format:</strong> 2 pembacaan per hari (pagi & malam) = {7 * 2} / {14 * 2} / {30 * 2} data points</p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="panel text-center">
          <div className="inline-flex items-center gap-3 text-brand">
            <Activity className="h-6 w-6 animate-spin" />
            <span className="font-semibold">Memproses data pasien...</span>
          </div>
        </div>
      )}

      {/* Notice State */}
      {notice && !loading && (
        <div className="panel border-success bg-success-soft text-sm font-medium text-success">
          ✅ {notice}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="panel border-alarm bg-alarm-soft">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-bold text-alarm">Error!</p>
              <p className="text-sm text-alarm">{error}</p>
              <p className="mt-2 text-xs text-muted">Pastikan backend server sudah running di http://localhost:5000</p>
            </div>
          </div>
        </div>
      )}

      {/* Result State */}
      {result && !loading && (
        <div className="panel border-success bg-success-soft">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-success">
            <span className="text-2xl">✅</span>
            <span>Berhasil Generate Data!</span>
          </h3>

          {result.type === 'simulate' && (
            <div className="space-y-3">
              <div className="rounded-lg bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-muted">Hasil Pembacaan:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Sistolik:</strong> {result.data.reading.sistolik} mmHg</p>
                  <p><strong>Diastolik:</strong> {result.data.reading.diastolik} mmHg</p>
                  <p><strong>Nadi:</strong> {result.data.reading.nadi} bpm</p>
                  <p><strong>Kategori:</strong> {result.data.reading.kategori}</p>
                </div>

                {result.data.patientFactors && (
                  <div className="mt-3 rounded-lg bg-paper p-3 text-xs text-muted">
                    <p className="mb-1 font-semibold text-ink">Faktor kondisi pasien yang dipakai:</p>
                    <p>
                      Tidur {result.data.patientFactors.jamTidur} jam · Stres {result.data.patientFactors.stres}/10 ·
                      Garam {result.data.patientFactors.asupanGaram}/5 · Berat {result.data.patientFactors.beratKg} kg ·
                      Obat hari ini: <strong>{result.data.patientFactors.patuhObat ? 'Patuh' : 'Belum diminum / terlewat'}</strong>
                    </p>
                    {result.data.patientFactors.risikoProfil.length > 0 && (
                      <p className="mt-1">
                        Risiko profil: {result.data.patientFactors.risikoProfil.join(', ')}
                      </p>
                    )}
                    {result.data.patientFactors.gejala && (
                      <p className="mt-1">Gejala: {result.data.patientFactors.gejala}</p>
                    )}
                  </div>
                )}

                {result.data.alert && (
                  <div className="mt-3 rounded-lg bg-alarm-soft p-3">
                    <p className="text-sm font-semibold text-alarm">⚠️ Alert: {result.data.alert.level}</p>
                    <p className="text-xs text-alarm">{result.data.alert.pesan}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard" className="btn-primary text-sm">Lihat di Dashboard</Link>
                <Link to="/asisten" className="btn-ghost text-sm bg-white">Konsultasi Asisten AI</Link>
              </div>
            </div>
          )}

          {result.type === 'seed' && (
            <div className="space-y-3">
              <div className="rounded-lg bg-white p-4">
                <p className="mb-3 text-sm font-semibold text-muted">Statistik Data:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted">Total Readings</p>
                    <p className="text-2xl font-bold text-brand">{result.data.dibuat.readings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total Alerts</p>
                    <p className="text-2xl font-bold text-alarm">{result.data.dibuat.alerts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Alert Waspada</p>
                    <p className="text-2xl font-bold text-warning">{result.data.dibuat.waspada}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Alert Krisis</p>
                    <p className="text-2xl font-bold text-alarm">{result.data.dibuat.krisis}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-line">
                  <p className="text-xs text-muted">Rata-rata Sistolik</p>
                  <p className="text-xl font-bold text-ink">{result.data.rataRataSistolik} mmHg</p>
                </div>
              </div>
            </div>
          )}

          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-muted hover:text-ink">
              Lihat JSON Response (Developer)
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-white p-4 text-xs">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
