import prisma from "../../config/prisma.js";

export async function buildPatientContext(userId) {
    const user = await prisma.user.findUnique({
        where: {
            user_id: Number(userId)
        },
        include: {
            health_readings: {
                orderBy: { waktu: 'desc' },
                take: 30
            },
            body_conditions: {
                orderBy: { tanggal: 'desc' },
                take: 30
            },
            medications: {
                include: {
                    schedules: true
                }
            },
            med_logs: {
                orderBy: { tanggal: 'desc' },
                take: 30
            },
            side_effects: {
                orderBy: { waktu: 'desc' }, 
                take: 30
            },
            adherence_sums: {
                orderBy: { selesai: 'desc' }, 
                take: 30
            }, 
            alerts: {
                orderBy: { waktu: 'decs' }, 
                take: 30
            }
        }
    });

    if (!user) {
        throw new Error('Data pasien tidak ditemukan');
    }

    const readings = user.health_readings;
    const conditions = user.body_conditions; 

    const average = (values) => {
        if (values.length === 0) return null; 

        return Number (
            (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2)
        );
    };

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
        tekanan_tertinggi: readings.length > 0
        ? Math.max(...readings.map(item => item.sistolik))
        : null
    };

    const conditionSummary = {
        jumlah_data: conditions.length, 

        rata_tidur: average(
            conditions.map(item => item.tidur_jam)
        ),
        rata_stress: average(
            conditions.map(item => item.stress_level)
        ), 
        rata_langkah: average(
            conditions.map(item => item.langkah)
        ), 
        rata_asupan_garam: average(
            conditions.map(item => item.asupan_garam_level)
        ), 
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
        riwayat_tekanan_darah: user.health_readings, 
        riwayat_kondisi: user.body_conditions,
        obat: user.medications,
        riwayat_konsumsi_obat: user.medications, 
        riwayat_efek_samping: user.side_effects, 
        kepatuhan_obat: user.adherence_sums,
        riwayat_alert: user.alerts
    };
    
}