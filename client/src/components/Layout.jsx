import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, Bot, LayoutDashboard, Pill, Home, User, LogOut, Heart, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/obat', label: 'Obat', icon: Pill },
  { to: '/simulator', label: 'Simulator IoT', icon: Activity },
  { to: '/asisten', label: 'Asisten AI', icon: Bot },
];

export default function Layout() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
      isActive ? 'bg-brand text-white shadow-soft' : 'text-ink hover:bg-brand-soft hover:text-brand'
    }`;
  
  return (
    <div className="min-h-screen bg-paper">
      {/* Top Header */}
      <header className="border-b border-line bg-white shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-brand p-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-brand">HealthsPharma</p>
              <p className="text-xs text-muted">Monitor Hipertensi</p>
            </div>
          </Link>
          
          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-brand-soft px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-sm font-bold">
                    {user.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-ink">{user.nama}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm text-alarm hover:bg-alarm-soft hover:text-alarm">
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  <User className="h-4 w-4" />
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation Bar */}
        <nav className="border-t border-line bg-white" aria-label="Menu utama">
          <div className="mx-auto hidden max-w-7xl items-center gap-1 px-4 py-2 md:flex md:px-6">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink hover:text-brand">
              <Home className="h-4 w-4" />
              Home
            </Link>
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={link}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-white shadow-hover md:hidden" aria-label="Menu utama mobile">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-muted'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label.replace('Simulator IoT', 'IoT')}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
