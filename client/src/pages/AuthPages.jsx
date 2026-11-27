import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
  return data;
}

// ─── LOGIN PAGE ───────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/auth/login', form);
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="rounded-xl bg-brand p-3">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-brand">HealthsPharma</p>
              <p className="text-xs text-muted">Monitor Hipertensi</p>
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ink">Selamat Datang Kembali</h1>
          <p className="mt-1 text-sm text-muted">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {/* Form Card */}
        <div className="panel">
          {error && (
            <div className="mb-4 rounded-xl bg-alarm-soft px-4 py-3 text-sm text-alarm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="field"
                placeholder="nama@email.com"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="field pr-10"
                  placeholder="Password Anda"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" /> Masuk
                </span>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Daftar di sini
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-4 rounded-xl bg-brand-soft p-3 text-xs text-brand">
            <strong>Demo:</strong> Gunakan akun demo yang sudah ada di database, atau{' '}
            <Link to="/register" className="font-semibold underline">daftar baru</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────
export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    usia: '',
    tinggi_cm: '',
    riwayat_penyakit: '',
    gaya_hidup: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/auth/register', form);
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="rounded-xl bg-brand p-3">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-brand">HealthsPharma</p>
              <p className="text-xs text-muted">Monitor Hipertensi</p>
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ink">Buat Akun Baru</h1>
          <p className="mt-1 text-sm text-muted">Mulai perjalanan kesehatan Anda</p>
        </div>

        {/* Form Card */}
        <div className="panel">
          {error && (
            <div className="mb-4 rounded-xl bg-alarm-soft px-4 py-3 text-sm text-alarm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row: Nama */}
            <div>
              <label className="label" htmlFor="nama">Nama Lengkap</label>
              <input id="nama" className="field" placeholder="Budi Santoso" required value={form.nama} onChange={set('nama')} />
            </div>

            {/* Row: Email */}
            <div>
              <label className="label" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="field" placeholder="nama@email.com" required autoComplete="email" value={form.email} onChange={set('email')} />
            </div>

            {/* Row: Password */}
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className="field pr-10"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Row: Usia & Tinggi */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="usia">Usia (tahun)</label>
                <input id="usia" type="number" className="field" placeholder="45" required min={1} max={120} value={form.usia} onChange={set('usia')} />
              </div>
              <div>
                <label className="label" htmlFor="tinggi">Tinggi (cm)</label>
                <input id="tinggi" type="number" className="field" placeholder="165" required min={50} max={250} value={form.tinggi_cm} onChange={set('tinggi_cm')} />
              </div>
            </div>

            {/* Row: Riwayat */}
            <div>
              <label className="label" htmlFor="riwayat">Riwayat Penyakit <span className="font-normal text-muted">(opsional)</span></label>
              <input id="riwayat" className="field" placeholder="Contoh: Hipertensi, Diabetes" value={form.riwayat_penyakit} onChange={set('riwayat_penyakit')} />
            </div>

            {/* Row: Gaya Hidup */}
            <div>
              <label className="label" htmlFor="gaya">Gaya Hidup <span className="font-normal text-muted">(opsional)</span></label>
              <input id="gaya" className="field" placeholder="Contoh: Kurang olahraga, suka makanan asin" value={form.gaya_hidup} onChange={set('gaya_hidup')} />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mendaftar...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" /> Daftar Sekarang
                </span>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
