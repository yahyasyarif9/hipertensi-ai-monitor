// Menerjemahkan data simulasi ke nama kolom di schema.prisma
export function createIotRepository(prisma) {
  return {
    async userExists(userId) {
      const user = await prisma.user.findUnique({ where: { user_id: userId } });
      return Boolean(user);
    },

    async getPatientContext(userId) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const [user, latestCondition, medications, todayLogs, weeklyAdherence] = await Promise.all([
        prisma.user.findUnique({
          where: { user_id: userId },
          select: {
            user_id: true,
            nama: true,
            usia: true,
            tinggi_cm: true,
            riwayat_penyakit: true,
            gaya_hidup: true,
          },
        }),
        prisma.bodyCondition.findFirst({
          where: { user_id: userId },
          orderBy: { tanggal: 'desc' },
        }),
        prisma.medication.findMany({
          where: { user_id: userId },
          include: { schedules: true },
        }),
        prisma.medLog.findMany({
          where: { user_id: userId, tanggal: { gte: startOfDay, lt: endOfDay } },
        }),
        prisma.adherenceSummary.findFirst({
          where: { user_id: userId, periode: 'mingguan' },
        }),
      ]);

      if (!user) return null;

      const allSchedules = medications.flatMap((m) =>
        m.schedules.map((s) => {
          const log = todayLogs.find((l) => l.schedule_id === s.schedule_id);
          return {
            schedule_id: s.schedule_id,
            nama_obat: m.nama_obat,
            dosis: m.dosis,
            jam_minum: s.jam_minum,
            status: log?.status || null,
          };
        })
      );

      const totalJadwal = allSchedules.length;
      const sudahDiminum = allSchedules.filter((s) => s.status === 'tepat' || s.status === 'terlambat').length;
      const terlewat = allSchedules.filter((s) => s.status === 'terlewat').length;
      const patuhObatHariIni = totalJadwal === 0
        ? true
        : terlewat === 0 && sudahDiminum > 0;

      return {
        user,
        latestCondition,
        medications: allSchedules,
        adherence: {
          totalJadwal,
          sudahDiminum,
          terlewat,
          persenMingguan: weeklyAdherence?.persen_kepatuhan ?? null,
          patuhObatHariIni,
        },
      };
    },

     // Hanya menghapus data simulasi milik satu user, tabel lain tidak disentuh
    async resetSimulasi(userId) {
      const [a, r, b] = await prisma.$transaction([
        prisma.alert.deleteMany({ where: { user_id: userId } }),
        prisma.healthReading.deleteMany({ where: { user_id: userId, sumber: 'simulasi_iot' } }),
        prisma.bodyCondition.deleteMany({ where: { user_id: userId } }),
      ]);
      return { alerts: a.count, readings: r.count, bodies: b.count };
    },

    async saveHealthReading({ userId, waktu, sistolik, diastolik, nadi, kategori }) {
      const r = await prisma.healthReading.create({
        data: { user_id: userId, waktu, sistolik, diastolik, nadi, kategori },
      });
      return { id: r.reading_id, ...r };
    },

    async saveBodyCondition({ userId, waktu, jamTidur, stres, asupanGaram, beratKg, langkah, gejala = null }) {
      return prisma.bodyCondition.create({
        data: {
          user_id: userId,
          tanggal: waktu,
          berat_kg: beratKg,
          tidur_jam: jamTidur,
          langkah,
          stres_level: stres,
          asupan_garam_level: asupanGaram,
          gejala,
        },
      });
    },

    async saveAlert({ userId, readingId, waktu, level, sistolik, diastolik }) {
      const pesan = level === 'krisis_hipertensi'
        ? `Tekanan darah ${sistolik}/${diastolik} mmHg masuk kategori krisis hipertensi. Segera cari pertolongan medis.`
        : `Tekanan darah ${sistolik}/${diastolik} mmHg di atas batas normal. Istirahat dan cek jadwal minum obat.`;

      return prisma.alert.create({
        data: { user_id: userId, reading_id: readingId, level, pesan, waktu },
      });
    },
  };
}