import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import medRoutes from './routes/medRoutes.js'; // <-- 1. TARUH IMPORT DI SINI (PALING ATAS)

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Cek status server
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Sistem Pemantauan Hipertensi Berbasis AI siap digunakan!',
  });
});

// 2. Endpoint inisialisasi Pasien Demo
app.get('/api/demo-patient', async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { email: 'budi.demo@hipertensi.id' },
      include: {
        medications: { include: { schedules: true } },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          nama: 'Budi Santoso',
          email: 'budi.demo@hipertensi.id',
          usia: 54,
          tinggi_cm: 168,
          riwayat_penyakit: 'Hipertensi Esensial sejak 2023',
          gaya_hidup: 'Kurang olahraga, sering begadang, suka makanan asin',
          medications: {
            create: {
              nama_obat: 'Amlodipine',
              dosis: '5 mg',
              schedules: {
                create: [{ jam_minum: '08:00' }, { jam_minum: '20:00' }],
              },
            },
          },
        },
        include: {
          medications: { include: { schedules: true } },
        },
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. TARUH ROUTE DI SINI (SETELAH express.json & SEBELUM app.listen)
app.use('/api/meds', medRoutes);
// app.use('/api/iot', iotRoutes);        -> Tugas Farida
// app.use('/api/ai', aiRoutes);          -> Tugas Oryza

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});