
import prisma from "../../config/prisma.js";

export async function buildPatientContext(userId) {
    const user = await prisma.user.findUnique({
        where: {
            user_id: Number(userId)
        },
        include: {
            health_readings: {
                orderBy: { waktu: "desc" }
            },
            body_conditions: {
                orderBy: { tanggal: "desc" }
            },
            medications: {
                include: {
                    schedules: true
                }
            },
            med_logs: {
                orderBy: { tanggal: "desc" },
                take: 30
            },
            side_effects: {
                orderBy: { waktu: "desc" },
                take: 30
            },
            adherence_sums: {
                orderBy: { selesai: "desc" },
                take: 30
            },
            alerts: {
                orderBy: { waktu: "desc" },
                take: 30
            }
        }
    });

    if (!user) {
        throw new Error("Data pasien tidak ditemukan");
    }

    const readings = user.health_readings;
    const conditions = user.body_conditions;

    // Fungsi perhitungan rata-rata
    const average = (values) => {
        const validValues = values
            .map(Number)
            .filter(Number.isFinite);

        if (validValues.length === 0) return null;

        return Number(
            (
                validValues.reduce((total, value) => total + value, 0) /
                validValues.length
            ).toFixed(2)
        );
    };

    // Pengukuran dengan sistolik tertinggi
    const highestReading = readings.length > 0
        ? readings.reduce((highest, current) =>
            current.sistolik > highest.sistolik
                ? current
                : highest
        )
        : null;

    // Ringkasan tekanan darah
    const healthSummary = {
        jumlah_data: readings.length,

        rata_sistolik: average(
            readings.map(item => item.sistolik)
        ),

        rata_diastolik: average(
            readings.map(item => item.diastolik)
        ),

        rata_nadi: average(
            readings.map(item => item.nadi)
        ),

        sistolik_tertinggi: highestReading?.sistolik ?? null,

        pengukuran_tertinggi: highestReading
            ? {
                sistolik: highestReading.sistolik,
                diastolik: highestReading.diastolik,
                waktu: highestReading.waktu
            }
            : null
    };

    // Ringkasan kondisi harian
    const conditionSummary = {
        jumlah_data: conditions.length,

        rata_tidur: average(
            conditions.map(item => item.tidur_jam)
        ),

        rata_stres: average(
            conditions.map(item => item.stres_level)
        ),

        rata_langkah: average(
            conditions.map(item => item.langkah)
        ),

        rata_asupan_garam: average(
            conditions.map(item => item.asupan_garam_level)
        ),

        rata_asupan_garam_level: average(
            conditions.map(item => item.asupan_garam_level)
        )
    };

    // Ringkasan kepatuhan obat
    const adherenceSummary = {
        jumlah_periode: user.adherence_sums.length,

        rata_persentase: average(
            user.adherence_sums.map(
                item => item.persen_kepatuhan
            )
        )
    };

    // Ringkasan efek samping
    const sideEffectSummary = {
        jumlah_laporan: user.side_effects.length,
        efek_terakhir: user.side_effects.slice(0, 5)
    };

    return {
        profil: {
            nama: user.nama,
            usia: user.usia,
            tinggi_cm: user.tinggi_cm,
            riwayat_penyakit: user.riwayat_penyakit,
            gaya_hidup: user.gaya_hidup
        },

        ringkasan_tekanan_darah: healthSummary,
        ringkasan_kondisi: conditionSummary,
        ringkasan_kepatuhan_obat: adherenceSummary,
        ringkasan_efek_samping: sideEffectSummary,
        riwayat_tekanan_darah: readings,
        riwayat_kondisi: conditions,
        obat: user.medications,
        riwayat_konsumsi_obat: user.med_logs,
        riwayat_efek_samping: user.side_effects,
        kepatuhan_obat: user.adherence_sums,
        riwayat_alert: user.alerts
    };
}
