import { HeartPulse, TrendingUp, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AlertBanner from '../components/AlertBanner';
import MultiParamChart from '../components/MultiParamChart';
import ZoneGauge from '../components/ZoneGauge';
import { CategoryBadge, Empty, ErrorBox, Loading, fmtTime } from '../components/ui';
import { getCategory } from '../lib/bp';
import { useFetch } from '../lib/useFetch';

const load = () =>
  Promise.all([api.readings(30), api.conditions(30), api.medLogs(30), api.alerts(), api.adherence()])
    .then(([readings, conditions, logs, alerts, adherence]) => ({ readings, conditions, logs, alerts, adherence }));

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(load, []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const { readings, conditions, logs, alerts, adherence } = data;
  const latest = [...readings].sort((a, b) => new Date(b.waktu) - new Date(a.waktu))[0];
  const cat = latest && getCategory(latest);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink md:text-4xl">Dashboard Kesehatan</h1>
        <p className="mt-1 text-muted">Ringkasan monitoring hipertensi hari ini</p>
      </div>

      <AlertBanner alerts={alerts} />

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Blood Pressure Card */}
        <div className="panel lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-alarm-soft p-3">
                <HeartPulse className="h-6 w-6 text-alarm" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-muted">Tekanan Darah Terakhir</h2>
                <p className="text-xs text-muted/70">{latest ? fmtTime(latest.waktu) : 'Belum ada data'}</p>
              </div>
            </div>
            {cat && <CategoryBadge category={cat} />}
          </div>
          
          {latest ? (
            <>
              <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                <div>
                  <p className="mb-1 text-sm text-muted">Sistolik / Diastolik</p>
                  <p className="font-display text-5xl font-bold leading-none tabular-nums text-ink md:text-6xl">
                    {latest.sistolik}<span className="text-3xl text-muted">/</span>{latest.diastolik}
                    <span className="ml-2 text-lg font-medium text-muted">mmHg</span>
                  </p>
                </div>
                <div className="rounded-xl bg-brand-soft px-4 py-3">
                  <p className="text-sm text-muted">Nadi</p>
                  <p className="text-2xl font-bold text-brand">{latest.nadi} <span className="text-sm font-normal">bpm</span></p>
                </div>
              </div>
              <div className="mt-6">
                <ZoneGauge systolic={latest.sistolik} />
              </div>
            </>
          ) : (
            <div className="py-8">
              <Empty>Belum ada pengukuran. Buat data lewat halaman <Link to="/simulator" className="font-semibold text-brand underline">Simulator IoT</Link>.</Empty>
            </div>
          )}
        </div>

        {/* Adherence Card */}
        <div className="panel">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-success-soft p-3">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-muted">Kepatuhan Minum Obat</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Minggu ini', value: adherence.mingguan },
              { label: 'Bulan ini', value: adherence.bulanan },
              { label: 'Keseluruhan', value: adherence.total }
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-ink">{label}</span>
                  <span className="font-bold tabular-nums text-brand">{value}%</span>
                </div>
                <div 
                  className="h-2.5 overflow-hidden rounded-full bg-paper" 
                  role="progressbar" 
                  aria-valuenow={value} 
                  aria-valuemin={0} 
                  aria-valuemax={100} 
                  aria-label={`Kepatuhan ${label}`}
                >
                  <div 
                    className="h-2.5 rounded-full transition-all" 
                    style={{ 
                      width: `${value}%`, 
                      background: value >= 80 ? '#16A34A' : value >= 60 ? '#F59E0B' : '#DC2626' 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <Link to="/obat" className="btn-primary mt-6 w-full group">
            Kelola Obat
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HeartPulse}
          label="Total Pengukuran"
          value={readings.length}
          color="alarm"
        />
        <StatCard
          icon={Clock}
          label="Hari Monitoring"
          value="30"
          color="brand"
        />
        <StatCard
          icon={CheckCircle2}
          label="Dosis Tercatat"
          value={logs.length}
          color="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Rata-rata BP"
          value={latest ? `${latest.sistolik}/${latest.diastolik}` : '-'}
          color="warning"
        />
      </div>

      {/* Chart */}
      <MultiParamChart readings={readings} conditions={conditions} logs={logs} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    brand: 'bg-brand-soft text-brand',
    alarm: 'bg-alarm-soft text-alarm',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
  };

  return (
    <div className="panel">
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-2xl font-bold text-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}
