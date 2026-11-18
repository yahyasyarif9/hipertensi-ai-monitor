import { ArrowRight, Shield, Smartphone, Heart, Bell, Activity, Pill, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-12 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft">
                <Heart className="h-4 w-4 text-alarm" />
                <span className="text-sm font-semibold text-ink">Monitoring Hipertensi 24/7</span>
              </div>
              
              <h1 className="text-4xl font-bold leading-tight text-ink md:text-5xl lg:text-6xl">
                Healthcare, Delivered To Your Doorstep
              </h1>
              
              <p className="text-lg text-muted md:text-xl">
                Monitor tekanan darah dan kelola obat hipertensi Anda dengan mudah. 
                Pantau kesehatan jantung Anda secara real-time dengan AI yang cerdas.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/dashboard" className="btn-primary group">
                  Mulai Monitoring
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/obat" className="btn-secondary">
                  Kelola Obat
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-5 w-5 text-brand" />
                  <span className="font-semibold text-ink">100% Data Aman</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-5 w-5 text-brand" />
                  <span className="font-semibold text-ink">Monitoring Real-time</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="h-5 w-5 text-brand" />
                  <span className="font-semibold text-ink">Reminder Otomatis</span>
                </div>
              </div>
            </div>
            
            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 shadow-hover">
                <div className="aspect-square rounded-2xl bg-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-32 h-32 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Heart className="h-16 w-16 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">Jantung Sehat</p>
                    <p className="text-white/90">Hidup Bahagia</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-hover">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success-soft p-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Kepatuhan Obat</p>
                    <p className="text-lg font-bold text-ink">95%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-ink md:text-4xl">Healthcare Services</h2>
            <p className="text-lg text-muted">Semua yang Anda butuhkan untuk hidup lebih sehat</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-ink md:text-4xl">Fitur Unggulan</h2>
            <p className="text-lg text-muted">Teknologi modern untuk kesehatan Anda</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-section py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-ink md:text-4xl">
            Siap Untuk Hidup Lebih Sehat?
          </h2>
          <p className="mb-8 text-lg text-muted">
            Mulai perjalanan kesehatan Anda bersama kami hari ini
          </p>
          <Link to="/dashboard" className="btn-primary group">
            Mulai Sekarang
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, description, link }) {
  return (
    <Link to={link} className="card group">
      <div className="mb-4 inline-flex rounded-xl bg-brand-soft p-3 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="panel">
      <div className="mb-4 inline-flex rounded-xl bg-brand-soft p-3 text-brand">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

const SERVICES = [
  {
    icon: Activity,
    title: 'Monitor Tekanan Darah',
    description: 'Pantau tekanan darah real-time dengan visualisasi yang jelas',
    link: '/dashboard',
  },
  {
    icon: Pill,
    title: 'Kelola Obat',
    description: 'Jadwal minum obat dan reminder otomatis setiap hari',
    link: '/obat',
  },
  {
    icon: Smartphone,
    title: 'Simulator IoT',
    description: 'Integrasi dengan perangkat IoT untuk data akurat',
    link: '/simulator',
  },
  {
    icon: Heart,
    title: 'Asisten AI',
    description: 'Rekomendasi cerdas dan konsultasi kesehatan',
    link: '/asisten',
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Data Terenkripsi',
    description: 'Keamanan data kesehatan Anda adalah prioritas kami',
  },
  {
    icon: Bell,
    title: 'Notifikasi Pintar',
    description: 'Dapatkan pengingat obat dan alert tekanan darah tinggi',
  },
  {
    icon: TrendingUp,
    title: 'Analisis Trend',
    description: 'Lihat pola tekanan darah Anda dalam grafik interaktif',
  },
  {
    icon: Heart,
    title: 'Laporan Kesehatan',
    description: 'Riwayat lengkap untuk dibawa konsultasi dokter',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Pantau kondisi Anda setiap saat, dimana saja',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Akses dari HP, tablet, atau komputer dengan mudah',
  },
];
