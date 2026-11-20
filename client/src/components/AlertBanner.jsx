import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { fmtTime } from './ui';

// Muncul bila ada alert dalam 48 jam terakhir.
export default function AlertBanner({ alerts = [] }) {
  const [hidden, setHidden] = useState(false);
  const recent = alerts.find((a) => Date.now() - new Date(a.waktu) < 48 * 36e5);
  if (!recent || hidden) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-alarm bg-alarm-soft p-4 text-alarm" role="alert">
      <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0" />
      <div className="flex-1">
        <p className="font-display text-lg font-bold">{recent.level || 'Krisis Hipertensi'} terdeteksi</p>
        <p className="text-sm">
          Tekanan darah melonjak pada {fmtTime(recent.waktu)}. Istirahat, ukur ulang setelah 5 menit, dan hubungi dokter atau
          layanan darurat bila muncul nyeri dada, sesak napas, atau sakit kepala hebat.
        </p>
      </div>
      <button onClick={() => setHidden(true)} aria-label="Tutup peringatan" className="rounded p-1 hover:bg-alarm/10">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
