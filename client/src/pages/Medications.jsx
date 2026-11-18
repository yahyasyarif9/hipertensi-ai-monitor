import { useState } from 'react';
import { CheckCircle2, Plus, Trash2, X, Clock, AlertCircle, Package } from 'lucide-react';
import { api } from '../api/client';
import { Empty, ErrorBox, Loading, fmtTime } from '../components/ui';
import { STATUS_LABEL, normalizeStatus } from '../lib/bp';
import { useFetch } from '../lib/useFetch';

const STATUS_STYLE = { 
  tepat: 'badge-success', 
  terlambat: 'badge-warning', 
  terlewat: 'badge-danger' 
};

const load = () => Promise.all([api.meds(), api.medsToday(), api.sideEffects()]).then(([meds, today, effects]) => ({ meds, today, effects }));

export default function Medications() {
  const { data, loading, error, reload } = useFetch(load, []);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  const run = async (key, fn, okMsg) => {
    setBusy(key); setNotice(null);
    try { await fn(); setNotice({ ok: true, text: okMsg }); await reload(); }
    catch (e) { setNotice({ ok: false, text: e.message }); }
    finally { setBusy(null); }
  };

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const { meds, today, effects } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink md:text-4xl">Kelola Obat & Efek Samping</h1>
        <p className="mt-1 text-muted">Monitor jadwal minum obat dan catat efek samping</p>
      </div>

      {notice && (
        <div role="status" className={`rounded-xl px-5 py-3 text-sm font-medium shadow-soft ${notice.ok ? 'bg-success-soft text-success' : 'bg-alarm-soft text-alarm'}`}>
          {notice.text}
        </div>
      )}

      {/* Today's Schedule */}
      <section className="panel" aria-labelledby="today-title">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-brand-soft p-3">
            <Clock className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h2 id="today-title" className="text-xl font-bold text-ink">Jadwal Hari Ini</h2>
            <p className="text-sm text-muted">Jangan lupa minum obat tepat waktu</p>
          </div>
        </div>
        
        {today.length === 0 ? (
          <div className="rounded-xl bg-paper p-8 text-center">
            <Empty>Belum ada jadwal. Tambahkan obat pertama di bawah.</Empty>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {today.map((t) => {
              const st = normalizeStatus(t.status);
              return (
                <div key={t.schedule_id} className="card group relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-full w-1 bg-brand" />
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="rounded-xl bg-brand-soft p-3">
                        <Package className="h-6 w-6 text-brand" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-ink">{t.nama_obat}</p>
                          <p className="text-sm text-muted">{t.dosis}</p>
                        </div>
                        <span className="flex-shrink-0 rounded-lg bg-brand-soft px-3 py-1 font-display text-lg font-bold tabular-nums text-brand">
                          {t.jam_minum}
                        </span>
                      </div>
                      
                      {st ? (
                        <span className={`${STATUS_STYLE[st]}`}>
                          <CheckCircle2 className="h-4 w-4" /> {STATUS_LABEL[st]}
                        </span>
                      ) : (
                        <button 
                          className="btn-primary mt-3 w-full" 
                          disabled={busy === `dose-${t.schedule_id}`}
                          onClick={() => run(`dose-${t.schedule_id}`, () => api.logDose(t.schedule_id), `${t.nama_obat} tercatat sudah diminum.`)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Tandai Sudah Minum
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Medication & My Medications */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AddMedForm busy={busy === 'add-med'} onSubmit={(b) => run('add-med', () => api.addMed(b), `${b.nama_obat} ditambahkan ke jadwal.`)} />
        
        <section className="panel" aria-labelledby="meds-title">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-success-soft p-3">
              <Package className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 id="meds-title" className="text-xl font-bold text-ink">Obat Saya</h2>
              <p className="text-sm text-muted">Daftar obat yang sedang dikonsumsi</p>
            </div>
          </div>
          
          {meds.length === 0 ? (
            <div className="rounded-xl bg-paper p-8 text-center">
              <Empty>Belum ada obat.</Empty>
            </div>
          ) : (
            <div className="space-y-3">
              {meds.map((m) => (
                <div key={m.med_id} className="card group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="rounded-xl bg-brand-soft p-3">
                        <Package className="h-5 w-5 text-brand" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink">{m.nama_obat}</p>
                      <p className="text-sm text-muted">{m.dosis}</p>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        Pukul {m.schedules.map((s) => s.jam_minum).join(', ')}
                      </p>
                    </div>
                    <button 
                      className="btn-icon flex-shrink-0 text-alarm hover:bg-alarm-soft" 
                      aria-label={`Hapus ${m.nama_obat}`}
                      onClick={() => window.confirm(`Hapus ${m.nama_obat} beserta jadwal dan lognya?`) && run(`del-${m.med_id}`, () => api.deleteMed(m.med_id), `${m.nama_obat} dihapus.`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Side Effects */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SideEffectForm meds={meds} busy={busy === 'add-se'} onSubmit={(b) => run('add-se', () => api.addSideEffect(b), 'Efek samping tercatat.')} />
        
        <section className="panel" aria-labelledby="se-title">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-warning-soft p-3">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h2 id="se-title" className="text-xl font-bold text-ink">Riwayat Efek Samping</h2>
              <p className="text-sm text-muted">Catat reaksi tubuh terhadap obat</p>
            </div>
          </div>
          
          {effects.length === 0 ? (
            <div className="rounded-xl bg-paper p-8 text-center">
              <Empty>Belum ada efek samping yang dilaporkan.</Empty>
            </div>
          ) : (
            <div className="space-y-3">
              {effects.map((e) => (
                <div key={e.effect_id} className="rounded-xl border border-line bg-paper p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="font-bold text-ink">{e.jenis}</p>
                    <span className={`badge ${e.keparahan === 'berat' ? 'badge-danger' : e.keparahan === 'sedang' ? 'badge-warning' : 'badge-brand'}`}>
                      {e.keparahan}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {e.nama_obat} · {fmtTime(e.waktu)}
                  </p>
                  {e.catatan && <p className="mt-2 text-sm italic text-muted">"{e.catatan}"</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AddMedForm({ onSubmit, busy }) {
  const [f, setF] = useState({ nama_obat: '', dosis: '', jam: ['08:00'] });
  const setJam = (i, v) => setF({ ...f, jam: f.jam.map((j, k) => (k === i ? v : j)) });
  const submit = (e) => {
    e.preventDefault();
    onSubmit({ nama_obat: f.nama_obat.trim(), dosis: f.dosis.trim(), jam_minum: f.jam });
    setF({ nama_obat: '', dosis: '', jam: ['08:00'] });
  };
  
  return (
    <section className="panel" aria-labelledby="add-title">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-brand-soft p-3">
          <Plus className="h-6 w-6 text-brand" />
        </div>
        <div>
          <h2 id="add-title" className="text-xl font-bold text-ink">Tambah Jadwal Obat</h2>
          <p className="text-sm text-muted">Buat reminder otomatis</p>
        </div>
      </div>
      
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="nama">Nama obat</label>
          <input 
            id="nama" 
            className="field" 
            required 
            placeholder="Contoh: Amlodipine" 
            value={f.nama_obat} 
            onChange={(e) => setF({ ...f, nama_obat: e.target.value })} 
          />
        </div>
        
        <div>
          <label className="label" htmlFor="dosis">Dosis</label>
          <input 
            id="dosis" 
            className="field" 
            required 
            placeholder="Contoh: 5 mg" 
            value={f.dosis} 
            onChange={(e) => setF({ ...f, dosis: e.target.value })} 
          />
        </div>
        
        <fieldset>
          <legend className="label">Jam minum</legend>
          <div className="space-y-2">
            {f.jam.map((j, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  type="time" 
                  required 
                  aria-label={`Jam minum ${i + 1}`} 
                  className="field flex-1" 
                  value={j} 
                  onChange={(e) => setJam(i, e.target.value)} 
                />
                {f.jam.length > 1 && (
                  <button 
                    type="button" 
                    className="btn-icon text-alarm hover:bg-alarm-soft" 
                    aria-label="Hapus jam" 
                    onClick={() => setF({ ...f, jam: f.jam.filter((_, k) => k !== i) })}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button 
            type="button" 
            className="mt-3 text-sm font-semibold text-brand hover:underline" 
            onClick={() => setF({ ...f, jam: [...f.jam, '20:00'] })}
          >
            + Tambah jam lain
          </button>
        </fieldset>
        
        <button className="btn-primary w-full" disabled={busy}>
          <Plus className="h-4 w-4" /> Simpan Jadwal
        </button>
      </form>
    </section>
  );
}

function SideEffectForm({ meds, onSubmit, busy }) {
  const empty = { med_id: '', jenis: '', keparahan: 'ringan', catatan: '' };
  const [f, setF] = useState(empty);
  const submit = (e) => { 
    e.preventDefault(); 
    onSubmit({ ...f, med_id: Number(f.med_id || meds[0]?.med_id) }); 
    setF(empty); 
  };
  
  return (
    <section className="panel" aria-labelledby="sef-title">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-alarm-soft p-3">
          <AlertCircle className="h-6 w-6 text-alarm" />
        </div>
        <div>
          <h2 id="sef-title" className="text-xl font-bold text-ink">Laporkan Efek Samping</h2>
          <p className="text-sm text-muted">Bantu pantau reaksi obat</p>
        </div>
      </div>
      
      {meds.length === 0 ? (
        <div className="rounded-xl bg-paper p-8 text-center">
          <Empty>Tambahkan obat dulu agar efek samping bisa dikaitkan.</Empty>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="se-med">Obat yang dicurigai</label>
            <select 
              id="se-med" 
              className="field" 
              value={f.med_id || meds[0].med_id} 
              onChange={(e) => setF({ ...f, med_id: e.target.value })}
            >
              {meds.map((m) => (
                <option key={m.med_id} value={m.med_id}>
                  {m.nama_obat} ({m.dosis})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label" htmlFor="se-jenis">Gejala</label>
            <input 
              id="se-jenis" 
              className="field" 
              required 
              placeholder="Contoh: Pusing, batuk kering" 
              value={f.jenis} 
              onChange={(e) => setF({ ...f, jenis: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="label" htmlFor="se-parah">Tingkat keparahan</label>
            <select 
              id="se-parah" 
              className="field" 
              value={f.keparahan} 
              onChange={(e) => setF({ ...f, keparahan: e.target.value })}
            >
              <option value="ringan">Ringan</option>
              <option value="sedang">Sedang</option>
              <option value="berat">Berat</option>
            </select>
          </div>
          
          <div>
            <label className="label" htmlFor="se-cat">Catatan (opsional)</label>
            <textarea 
              id="se-cat" 
              rows={3} 
              className="field" 
              placeholder="Deskripsikan gejala lebih detail..."
              value={f.catatan} 
              onChange={(e) => setF({ ...f, catatan: e.target.value })} 
            />
          </div>
          
          <button className="btn-primary w-full" disabled={busy}>
            <AlertCircle className="h-4 w-4" />
            Kirim Laporan
          </button>
        </form>
      )}
    </section>
  );
}
