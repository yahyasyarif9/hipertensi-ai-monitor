import aiRoutes from './src/routes/ai.routes.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createIotRepository } from './repositories/iotRepository.js';
import iotRoutes from './routes/iot.js';
import medRoutes from './routes/medRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoutes);

// 1. Cek status server
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Sistem Pemantauan Hipertensi Berbasis AI siap digunakan!',
  });
});

// 2. Endpoint inisialisasi Pasien Demo (agar semua anggota tim langsung punya data uji)
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

// regist route dari masing-masing fitur
app.use('/api/meds', medRoutes);
app.use('/api/iot', iotRoutes(createIotRepository(prisma)));

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});