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

// ─────────────────────────────────────────────────────────────
// GET /api/meds/today?user_id=1
// Ambil jadwal obat hari ini beserta status minum
// ─────────────────────────────────────────────────────────────
router.get('/today', async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) return res.status(400).json({ success: false, message: 'Parameter user_id diperlukan' });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Ambil semua jadwal obat user
    const schedules = await prisma.medSchedule.findMany({
      where: { medication: { user_id: userId } },
      include: { medication: true },
    });

    // Ambil log minum hari ini
    const todayLogs = await prisma.medLog.findMany({
      where: {
        user_id: userId,
        tanggal: { gte: startOfDay, lt: endOfDay },
      },
    });

    const logBySchedule = {};
    for (const log of todayLogs) {
      logBySchedule[log.schedule_id] = log;
    }

    const result = schedules.map((s) => ({
      schedule_id: s.schedule_id,
      med_id: s.medication.med_id,
      nama_obat: s.medication.nama_obat,
      dosis: s.medication.dosis,
      jam_minum: s.jam_minum,
      status: logBySchedule[s.schedule_id]?.status || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching today schedule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/meds/adherence?user_id=1
// Hitung & ambil ringkasan kepatuhan
// ─────────────────────────────────────────────────────────────
router.get('/adherence', async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) return res.status(400).json({ success: false, message: 'Parameter user_id diperlukan' });

    const summaries = await syncAdherenceSummary(userId);

    // Format response sesuai yang diharapkan Dashboard: { mingguan, bulanan, total }
    const fmt = {};
    for (const s of summaries) {
      fmt[s.periode] = s.persen_kepatuhan;
    }

    res.json({
      success: true,
      mingguan: fmt.mingguan ?? 0,
      bulanan: fmt.bulanan ?? 0,
      total: fmt.total ?? 0,
      adherenceSummaries: summaries,
    });
  } catch (error) {
    console.error('Error fetching adherence:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/meds/logs?user_id=1&days=30
// Ambil riwayat log minum obat
// ─────────────────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    const days = parseInt(req.query.days || '30');
    if (!userId) return res.status(400).json({ success: false, message: 'Parameter user_id diperlukan' });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.medLog.findMany({
      where: {
        user_id: userId,
        tanggal: { gte: startDate },
      },
      include: {
        schedule: { include: { medication: true } },
      },
      orderBy: { tanggal: 'desc' },
      take: 50,
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching med logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/meds?user_id=1
// Ambil daftar obat user
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) return res.status(400).json({ success: false, message: 'Parameter user_id diperlukan' });

    const medications = await prisma.medication.findMany({
      where: { user_id: userId },
      include: { schedules: true },
    });

    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/meds
// Tambah obat baru beserta jadwal jam minumnya
// ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { user_id, userId, nama_obat, dosis, daftar_jam } = req.body;
    const uid = Number(user_id || userId);

    const newMed = await prisma.medication.create({
      data: {
        user_id: uid,
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
    console.error('Error adding medication:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/meds/:id
// Hapus obat beserta jadwal dan lognya
// ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const medId = Number(req.params.id);

    // Hapus semua log yang terkait schedule obat ini
    const schedules = await prisma.medSchedule.findMany({ where: { med_id: medId } });
    const scheduleIds = schedules.map((s) => s.schedule_id);
    if (scheduleIds.length > 0) {
      await prisma.medLog.deleteMany({ where: { schedule_id: { in: scheduleIds } } });
    }

    await prisma.medSchedule.deleteMany({ where: { med_id: medId } });
    await prisma.sideEffect.deleteMany({ where: { med_id: medId } });
    await prisma.medication.delete({ where: { med_id: medId } });

    res.json({ success: true, message: 'Obat berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/meds/log
// Catat log minum obat & perbarui AdherenceSummary
// ─────────────────────────────────────────────────────────────
router.post('/log', async (req, res) => {
  try {
    const { userId, user_id, scheduleId, schedule_id, is_terlewat, waktu_aktual } = req.body;
    const uid = Number(user_id || userId);
    const sid = Number(schedule_id || scheduleId);

    const schedule = await prisma.medSchedule.findUnique({
      where: { schedule_id: sid },
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Jadwal obat (scheduleId) tidak ditemukan' });
    }

    const waktuMinum = waktu_aktual ? new Date(waktu_aktual) : new Date();
    const terlewat = Boolean(is_terlewat);
    const statusOtomatis = hitungStatusMinum(schedule.jam_minum, waktuMinum, terlewat);

    const log = await prisma.medLog.create({
      data: {
        user_id: uid,
        schedule_id: sid,
        tanggal: waktuMinum,
        waktu_aktual: terlewat ? null : waktuMinum,
        status: statusOtomatis,
      },
      include: {
        schedule: { include: { medication: true } },
      },
    });

    const summaries = await syncAdherenceSummary(uid);

    res.json({
      success: true,
      status: statusOtomatis,
      data: log,
      adherenceSummaries: summaries,
    });
  } catch (error) {
    console.error('Error logging dose:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/side-effects?user_id=1
// Ambil daftar efek samping user
// ─────────────────────────────────────────────────────────────
router.get('/side-effects', async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) return res.status(400).json({ success: false, message: 'Parameter user_id diperlukan' });

    const sideEffects = await prisma.sideEffect.findMany({
      where: { user_id: userId },
      include: { medication: true },
      orderBy: { waktu: 'desc' },
      take: 20,
    });

    res.json(sideEffects);
  } catch (error) {
    console.error('Error fetching side effects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/side-effects
// Catat efek samping obat
// ─────────────────────────────────────────────────────────────
router.post('/side-effects', async (req, res) => {
  try {
    const { userId, user_id, medId, med_id, jenis, keparahan, catatan } = req.body;
    const uid = Number(user_id || userId);
    const mid = Number(med_id || medId);

    const sideEffect = await prisma.sideEffect.create({
      data: {
        user_id: uid,
        med_id: mid,
        jenis,
        keparahan: keparahan.toLowerCase(),
        catatan: catatan || null,
      },
      include: { medication: true },
    });

    res.json({ success: true, data: sideEffect });
  } catch (error) {
    console.error('Error adding side effect:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
