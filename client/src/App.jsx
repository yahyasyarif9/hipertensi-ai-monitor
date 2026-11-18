import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="obat" element={<Medications />} />
        <Route path="simulator" element={<Placeholder title="Simulator IoT" owner="Farida (feat/iot-simulator)" note="Panel tombol data acak dan skenario 7/14/30 hari dipasang di sini." />} />
        <Route path="asisten" element={<Placeholder title="Asisten AI" owner="Oryza (feat/ai-assistant)" note="Chatbot dan kartu rekomendasi cerdas dipasang di sini." />} />
        <Route path="*" element={<Placeholder title="Halaman tidak ditemukan" owner="tidak ada" note="Periksa alamat atau pilih menu di samping." />} />
      </Route>
    </Routes>
  );
}
