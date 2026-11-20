// Menerjemahkan data simulasi ke nama kolom di schema.prisma
export function createIotRepository(prisma) {
  return {
    async userExists(userId) {
      const user = await prisma.user.findUnique({ where: { user_id: userId } });
      return Boolean(user);
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

    async saveBodyCondition({ userId, waktu, jamTidur, stres, asupanGaram, beratKg, langkah }) {
      return prisma.bodyCondition.create({
        data: {
          user_id: userId,
          tanggal: waktu,
          berat_kg: beratKg,
          tidur_jam: jamTidur,
          langkah,
          stres_level: stres,
          asupan_garam_level: asupanGaram,
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