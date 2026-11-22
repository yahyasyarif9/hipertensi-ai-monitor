import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';
import AIAssistant from './pages/AIAssistant';
import Simulator from './pages/Simulator';
import Placeholder from './pages/Placeholder';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="obat" element={<Medications />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="asisten" element={<AIAssistant />} />
        <Route path="*" element={<Placeholder title="Halaman tidak ditemukan" owner="tidak ada" note="Periksa alamat atau pilih menu di samping." />} />
      </Route>
    </Routes>
  );
}
