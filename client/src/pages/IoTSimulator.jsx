import { useState } from 'react';
import { Activity, Zap, Calendar, Database } from 'lucide-react';
import { api } from '../api/client';

export default function IoTSimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Fungsi untuk simulasi single reading
  const handleSimulate = async (skenario = 'acak') => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.simulate(skenario);
      setResult({ type: 'simulate', data: res.data });
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
    setResult(null);

    try {
      const res = await api.seed(days, pattern);
      setResult({ type: 'seed', data: res.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink md:text-4xl">Simulator IoT</h1>
        <p className="mt-1 text-muted">Generate data tekanan darah untuk testing dan demo</p>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-brand-soft bg-brand-soft/30 p-4">
        <p className="text-sm text-ink">
          <strong>💡 Tip:</strong> Gunakan "Data Acak" untuk testing cepat, atau "Seeder" untuk membuat riwayat data lengkap 7-30 hari.
        </p>
      </div>

      {/* Panel Simulasi Single */}
      <section className="panel">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-brand-soft p-3">
            <Zap className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Simulasi Data Acak</h2>
            <p className="text-sm text-muted">Generate 1 pembacaan tekanan darah sesuai skenario</p>
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
            <p className="text-sm text-muted">Buat data riwayat 7/14/30 hari dengan pola tertentu</p>
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
              <button
                onClick={() => handleSeed(7, 'fluktuatif')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📊</span>
                <span>7 Hari</span>
              </button>
              <button
                onClick={() => handleSeed(14, 'fluktuatif')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📊</span>
                <span>14 Hari</span>
              </button>
              <button
                onClick={() => handleSeed(30, 'fluktuatif')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📊</span>
                <span>30 Hari</span>
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
              <button
                onClick={() => handleSeed(7, 'naik')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📈</span>
                <span>7 Hari</span>
              </button>
              <button
                onClick={() => handleSeed(14, 'naik')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📈</span>
                <span>14 Hari</span>
              </button>
              <button
                onClick={() => handleSeed(30, 'naik')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📈</span>
                <span>30 Hari</span>
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
              <button
                onClick={() => handleSeed(7, 'turun')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📉</span>
                <span>7 Hari</span>
              </button>
              <button
                onClick={() => handleSeed(14, 'turun')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📉</span>
                <span>14 Hari</span>
              </button>
              <button
                onClick={() => handleSeed(30, 'turun')}
                disabled={loading}
                className="btn-ghost"
              >
                <span>📉</span>
                <span>30 Hari</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-paper p-3 text-xs text-muted">
          <p><strong>⚠️ Perhatian:</strong> Seeder akan menghapus data lama dan generate data baru!</p>
          <p><strong>📅 Format:</strong> 2 pembacaan per hari (pagi & malam) = {7*2} / {14*2} / {30*2} data points</p>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="panel text-center">
          <div className="inline-flex items-center gap-3 text-brand">
            <Activity className="h-6 w-6 animate-spin" />
            <span className="font-semibold">Generating data...</span>
          </div>
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
                {result.data.alert && (
                  <div className="mt-3 rounded-lg bg-alarm-soft p-3">
                    <p className="text-sm font-semibold text-alarm">⚠️ Alert: {result.data.alert.level}</p>
                    <p className="text-xs text-alarm">{result.data.alert.pesan}</p>
                  </div>
                )}
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
