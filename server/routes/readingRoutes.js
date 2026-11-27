import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/readings
 * Mengambil data pembacaan tekanan darah (BP readings)
 * Query params:
 *   - user_id: ID user (required)
 *   - days: Jumlah hari ke belakang (optional, default: 30)
 */
router.get('/readings', async (req, res) => {
  try {
    const { user_id, days = 30 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter user_id diperlukan',
      });
    }

    // Hitung tanggal mulai (days hari yang lalu)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Ambil data readings dari database
    const readings = await prisma.healthReading.findMany({
      where: {
        user_id: parseInt(user_id),
        waktu: {
          gte: startDate, // greater than or equal
        },
      },
      orderBy: {
        waktu: 'asc', // urutkan dari yang paling lama
      },
      select: {
        reading_id: true,
        user_id: true,
        sistolik: true,
        diastolik: true,
        nadi: true,
        waktu: true,
        kategori: true,
        sumber: true,
      },
    });

    res.json(readings);
  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pembacaan',
      error: error.message,
    });
  }
});

/**
 * GET /api/conditions
 * Mengambil data kondisi kesehatan (body conditions)
 * Query params:
 *   - user_id: ID user (required)
 *   - days: Jumlah hari ke belakang (optional, default: 30)
 */
router.get('/conditions', async (req, res) => {
  try {
    const { user_id, days = 30 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter user_id diperlukan',
      });
    }

    // Hitung tanggal mulai
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Ambil data conditions dari database
    const conditions = await prisma.bodyCondition.findMany({
      where: {
        user_id: parseInt(user_id),
        tanggal: {
          gte: startDate,
        },
      },
      orderBy: {
        tanggal: 'asc',
      },
      select: {
        condition_id: true,
        user_id: true,
        tanggal: true,
        berat_kg: true,
        tidur_jam: true,
        langkah: true,
        stres_level: true,
        asupan_garam_level: true,
        gejala: true,
      },
    });

    res.json(conditions);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kondisi kesehatan',
      error: error.message,
    });
  }
});

/**
 * POST /api/conditions
 * Simpan kondisi tubuh harian pasien (tidur, stres, asupan garam, berat badan, langkah, gejala)
 */
router.post('/conditions', async (req, res) => {
  try {
    const {
      user_id,
      userId,
      berat_kg,
      tidur_jam,
      langkah,
      stres_level,
      asupan_garam_level,
      gejala,
    } = req.body;

    const uid = Number(user_id || userId);
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'Parameter user_id diperlukan',
      });
    }

    const condition = await prisma.bodyCondition.create({
      data: {
        user_id: uid,
        berat_kg: Number(berat_kg ?? 70),
        tidur_jam: Number(tidur_jam ?? 7),
        langkah: parseInt(langkah ?? 5000),
        stres_level: Math.min(10, Math.max(1, parseInt(stres_level ?? 4))),
        asupan_garam_level: Math.min(5, Math.max(1, parseInt(asupan_garam_level ?? 2))),
        gejala: gejala?.trim() || null,
      },
    });

    res.status(201).json({ success: true, data: condition });
  } catch (error) {
    console.error('Error saving condition:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan kondisi kesehatan',
      error: error.message,
    });
  }
});

/**
 * GET /api/alerts
 * Mengambil alert/peringatan berdasarkan tekanan darah
 * Query params:
 *   - user_id: ID user (required)
 *   - limit: Jumlah alert terbaru (optional, default: 10)
 */
router.get('/alerts', async (req, res) => {
  try {
    const { user_id, limit = 10 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter user_id diperlukan',
      });
    }

    // Ambil alerts dari database
    const alerts = await prisma.alert.findMany({
      where: {
        user_id: parseInt(user_id),
      },
      orderBy: {
        waktu: 'desc', // alert terbaru dulu
      },
      take: parseInt(limit),
      select: {
        alert_id: true,
        user_id: true,
        reading_id: true,
        level: true,
        pesan: true,
        waktu: true,
        reading: {
          select: {
            sistolik: true,
            diastolik: true,
            nadi: true,
            waktu: true,
          },
        },
      },
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data alert',
      error: error.message,
    });
  }
});

/**
 * GET /api/readings/latest
 * Mengambil pembacaan tekanan darah terbaru
 * Query params:
 *   - user_id: ID user (required)
 */
router.get('/readings/latest', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter user_id diperlukan',
      });
    }

    const latestReading = await prisma.healthReading.findFirst({
      where: {
        user_id: parseInt(user_id),
      },
      orderBy: {
        waktu: 'desc',
      },
      select: {
        reading_id: true,
        user_id: true,
        sistolik: true,
        diastolik: true,
        nadi: true,
        waktu: true,
        kategori: true,
      },
    });

    if (!latestReading) {
      return res.status(404).json({
        success: false,
        message: 'Belum ada pembacaan untuk user ini',
      });
    }

    res.json(latestReading);
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pembacaan terbaru',
      error: error.message,
    });
  }
});

/**
 * GET /api/readings/stats
 * Mengambil statistik pembacaan (rata-rata, min, max)
 * Query params:
 *   - user_id: ID user (required)
 *   - days: Jumlah hari ke belakang (optional, default: 30)
 */
router.get('/readings/stats', async (req, res) => {
  try {
    const { user_id, days = 30 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Parameter user_id diperlukan',
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const readings = await prisma.healthReading.findMany({
      where: {
        user_id: parseInt(user_id),
        waktu: {
          gte: startDate,
        },
      },
      select: {
        sistolik: true,
        diastolik: true,
        nadi: true,
      },
    });

    if (readings.length === 0) {
      return res.json({
        total: 0,
        sistolik: { avg: 0, min: 0, max: 0 },
        diastolik: { avg: 0, min: 0, max: 0 },
        nadi: { avg: 0, min: 0, max: 0 },
      });
    }

    // Hitung statistik
    const stats = {
      total: readings.length,
      sistolik: {
        avg: Math.round(readings.reduce((sum, r) => sum + r.sistolik, 0) / readings.length),
        min: Math.min(...readings.map((r) => r.sistolik)),
        max: Math.max(...readings.map((r) => r.sistolik)),
      },
      diastolik: {
        avg: Math.round(readings.reduce((sum, r) => sum + r.diastolik, 0) / readings.length),
        min: Math.min(...readings.map((r) => r.diastolik)),
        max: Math.max(...readings.map((r) => r.diastolik)),
      },
      nadi: {
        avg: Math.round(readings.reduce((sum, r) => sum + r.nadi, 0) / readings.length),
        min: Math.min(...readings.map((r) => r.nadi)),
        max: Math.max(...readings.map((r) => r.nadi)),
      },
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik',
      error: error.message,
    });
  }
});

export default router;
