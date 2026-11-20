import { Construction } from 'lucide-react';

// Halaman milik anggota lain. Ganti isi file ini (atau route di App.jsx) setelah PR mereka di-merge ke dev.
export default function Placeholder({ title, owner, note }) {
  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      <div className="panel flex items-start gap-3">
        <Construction className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
        <p className="text-sm text-muted">Halaman ini dikerjakan {owner}. {note}</p>
      </div>
    </>
  );
}
