import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Fungsi bantu: Tentukan status sesuai komentar schema ("tepat" | "terlambat" | "terlewat")
function hitungStatusMinum(jamJadwal, waktuAktual, isTerlewat = false) {
  if (isTerlewat) return 'terlewat';

  const [jam, menit] = jamJadwal.split(':').map(Number);
  const jadwalDate = new Date(waktuAktual);
  jadwalDate.setHours(jam, menit, 0, 0);

  const selisihMenit = Math.abs((waktuAktual - jadwalDate) / (1000 * 60));

  // Toleransi tepat waktu ±2 jam (120 menit) dari jam_minum
  if (selisihMenit <= 120) {
    return 'tepat';
  }
  return 'terlambat';
}

// Fungsi bantu: Hitung & simpan ringkasan kepatuhan ke tabel AdherenceSummary
async function syncAdherenceSummary(userId) {
  const now = new Date();
  const tujuhHariLalu = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const tigaPuluhHariLalu = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const allLogs = await prisma.medLog.findMany({
    where: { user_id: userId },
    orderBy: { tanggal: 'asc' },
  });

  const hitungPersen = (logs) => {
    if (logs.length === 0) return 0;
    const tepatWaktu = logs.filter((item) => item.status === 'tepat').length;
    return Number(((tepatWaktu / logs.length) * 100).toFixed(1));
  };

  const dataPeriode = [
    {
      periode: 'mingguan',
      mulai: tujuhHariLalu,
      selesai: now,
      persen_kepatuhan: hitungPersen(allLogs.filter((l) => new Date(l.tanggal) >= tujuhHariLalu)),
    },
    {
      periode: 'bulanan',
      mulai: tigaPuluhHariLalu,
      selesai: now,
      persen_kepatuhan: hitungPersen(allLogs.filter((l) => new Date(l.tanggal) >= tigaPuluhHariLalu)),
    },
    {
      periode: 'total',
      mulai: allLogs.length > 0 ? new Date(allLogs[0].tanggal) : now,
      selesai: now,
      persen_kepatuhan: hitungPersen(allLogs),
    },
  ];

  const hasilSimpan = [];

  for (const item of dataPeriode) {
    const existing = await prisma.adherenceSummary.findFirst({
      where: { user_id: userId, periode: item.periode },
    });

    if (existing) {
      const updated = await prisma.adherenceSummary.update({
        where: { summary_id: existing.summary_id },
        data: {
          mulai: item.mulai,
          selesai: item.selesai,
          persen_kepatuhan: item.persen_kepatuhan,
        },
      });
      hasilSimpan.push(updated);
    } else {
      const created = await prisma.adherenceSummary.create({
        data: {
          user_id: userId,
          periode: item.periode,
          mulai: item.mulai,
          selesai: item.selesai,
          persen_kepatuhan: item.persen_kepatuhan,
        },
      });
      hasilSimpan.push(created);
    }
  }

  return hasilSimpan;
}

// 1. GET: Ambil daftar obat, jadwal, riwayat log, efek samping, & ringkasan kepatuhan user
router.get('/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const medications = await prisma.medication.findMany({
      where: { user_id: userId },
      include: { schedules: true },
    });

    const logs = await prisma.medLog.findMany({
      where: { user_id: userId },
      include: {
        schedule: {
          include: { medication: true },
        },
      },
      orderBy: { tanggal: 'desc' },
      take: 20,
    });

    const sideEffects = await prisma.sideEffect.findMany({
      where: { user_id: userId },
      include: { medication: true },
      orderBy: { waktu: 'desc' },
      take: 10,
    });

    const adherenceSummaries = await prisma.adherenceSummary.findMany({
      where: { user_id: userId },
    });

    res.json({
      success: true,
      medications,
      logs,
      sideEffects,
      adherenceSummaries,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST: Tambah obat baru beserta jadwal jam minumnya (MEDICATION & MED_SCHEDULE)
router.post('/', async (req, res) => {
  try {
    const { userId, nama_obat, dosis, daftar_jam } = req.body;
    // Contoh daftar_jam: ["08:00", "20:00"]

    const newMed = await prisma.medication.create({
      data: {
        user_id: Number(userId),
        nama_obat,
        dosis,
        schedules: {
          create: daftar_jam.map((jam) => ({ jam_minum: jam })),
        },
      },
      include: { schedules: true },
    });

    res.json({ success: true, data: newMed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST: Catat log minum obat (MED_LOG) & perbarui persentase AdherenceSummary
router.post('/log', async (req, res) => {
  try {
    const { userId, scheduleId, is_terlewat, waktu_aktual } = req.body;

    // Ambil jam_minum otomatis dari tabel MedSchedule berdasarkan scheduleId
    const schedule = await prisma.medSchedule.findUnique({
      where: { schedule_id: Number(scheduleId) },
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Jadwal obat (scheduleId) tidak ditemukan' });
    }

    const waktuMinum = waktu_aktual ? new Date(waktu_aktual) : new Date();
    const terlewat = Boolean(is_terlewat);
    const statusOtomatis = hitungStatusMinum(schedule.jam_minum, waktuMinum, terlewat);

    const log = await prisma.medLog.create({
      data: {
        user_id: Number(userId),
        schedule_id: Number(scheduleId),
        tanggal: waktuMinum,
        waktu_aktual: terlewat ? null : waktuMinum,
        status: statusOtomatis,
      },
      include: {
        schedule: { include: { medication: true } },
      },
    });

    // Hitung ulang dan simpan ke tabel AdherenceSummary
    const summaries = await syncAdherenceSummary(Number(userId));

    res.json({
      success: true,
      status: statusOtomatis,
      data: log,
      adherenceSummaries: summaries,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST: Catat efek samping obat (SIDE_EFFECT)
router.post('/side-effect', async (req, res) => {
  try {
    const { userId, medId, jenis, keparahan, catatan } = req.body;

    const sideEffect = await prisma.sideEffect.create({
      data: {
        user_id: Number(userId),
        med_id: Number(medId),
        jenis, // misal: "Pusing", "Batuk kering"
        keparahan: keparahan.toLowerCase(), // "ringan" | "sedang" | "berat"
        catatan: catatan || null,
      },
      include: { medication: true },
    });

    res.json({ success: true, data: sideEffect });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET: Ambil / hitung ulang ringkasan kepatuhan pasien (ADHERENCE_SUMMARY)
router.get('/adherence/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const summaries = await syncAdherenceSummary(userId);

    res.json({
      success: true,
      adherenceSummaries: summaries,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;