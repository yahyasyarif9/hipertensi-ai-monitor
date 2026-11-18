import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { buildDaily, buildInsights } from '../lib/series';
import { Empty } from './ui';

const RANGES = [7, 14, 30];
const axis = { fontSize: 12, fill: '#587270' };

export default function MultiParamChart({ readings, conditions, logs }) {
  const [days, setDays] = useState(14);
  const daily = useMemo(() => buildDaily(readings, conditions, logs, days), [readings, conditions, logs, days]);
  const insights = useMemo(() => buildInsights(daily), [daily]);

  return (
    <section className="panel" aria-labelledby="chart-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="chart-title" className="text-xl font-bold">Tensi dan faktor yang memengaruhinya</h2>
          <p className="text-sm text-muted">Dua grafik memakai sumbu tanggal yang sama, jadi pola mudah dibandingkan.</p>
        </div>
        <div className="inline-flex rounded-lg border border-line p-0.5" role="group" aria-label="Rentang waktu">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`rounded-md px-3 py-1 text-sm font-medium ${days === r ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft'}`}>
              {r} hari
            </button>
          ))}
        </div>
      </div>

      {daily.length === 0 ? (
        <div className="mt-4"><Empty>Belum ada data. Jalankan Simulator IoT untuk membuat data pertama.</Empty></div>
      ) : (
        <>
          <h3 className="mt-5 text-sm font-semibold">Tekanan darah dan nadi</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <ComposedChart data={daily} syncId="hari" margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#E6ECEA" vertical={false} />
                <XAxis dataKey="label" tick={axis} interval="preserveStartEnd" />
                <YAxis tick={axis} domain={[50, 'dataMax + 10']} unit="" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={140} stroke="#E07B1F" strokeDasharray="4 4" label={{ value: '140', fill: '#E07B1F', fontSize: 11, position: 'insideTopRight' }} />
                <ReferenceLine y={90} stroke="#E07B1F" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="sistolik" name="Sistolik (mmHg)" stroke="#A3162A" strokeWidth={2.5} dot={false} connectNulls />
                <Line type="monotone" dataKey="diastolik" name="Diastolik (mmHg)" stroke="#1F7A6D" strokeWidth={2.5} dot={false} connectNulls />
                <Line type="monotone" dataKey="nadi" name="Nadi (bpm)" stroke="#8AA09D" strokeWidth={1.5} strokeDasharray="2 3" dot={false} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <h3 className="mt-4 text-sm font-semibold">Tidur, stres, dan kepatuhan obat</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <ComposedChart data={daily} syncId="hari" margin={{ top: 8, right: -4, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#E6ECEA" vertical={false} />
                <XAxis dataKey="label" tick={axis} interval="preserveStartEnd" />
                <YAxis yAxisId="kiri" tick={axis} domain={[0, 10]} />
                <YAxis yAxisId="kanan" orientation="right" tick={axis} domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="kiri" dataKey="tidur" name="Tidur (jam)" fill="#BFD9D4" radius={[3, 3, 0, 0]} />
                <Line yAxisId="kiri" type="monotone" dataKey="stres" name="Stres (1-10)" stroke="#E07B1F" strokeWidth={2.5} dot={false} connectNulls />
                <Line yAxisId="kanan" type="stepAfter" dataKey="kepatuhan" name="Kepatuhan obat (%)" stroke="#12302F" strokeWidth={2} dot={{ r: 2 }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {insights.length > 0 && (
            <div className="mt-4 rounded-lg bg-brand-soft p-4 text-sm">
              <p className="font-semibold">Pola yang terlihat dalam {days} hari terakhir</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">{insights.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
