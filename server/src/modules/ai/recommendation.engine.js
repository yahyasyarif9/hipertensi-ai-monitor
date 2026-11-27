
import { checkDataMaturity } from "./data-maturity.js";
import { analyzeBloodPressureTrend } from "./blood-pressure-trend.js"; 

export async function generateRecommendation(context) {
    const maturity = checkDataMaturity(
        context.riwayat_tekanan_darah
    );

    const health = context.ringkasan_tekanan_darah;
    const condition = context.ringkasan_kondisi;
    const trend = analyzeBloodPressureTrend(
        context.riwayat_tekanan_darah
    );

    let recommendation = [];

    // Rekomendasi berdasarkan kematangan data
    if (
        maturity.fase === "umum" ||
        maturity.fase === "belum_ada_data"
    ) {
        recommendation = [
            "Pantau tekanan darah secara berkala.",
            "Terapkan pola makan DASH.",
            "Batasi asupan garam.",
            "Jaga kualitas tidur dan aktivitas fisik."
        ];
    } else if (maturity.fase === "tren") {
        recommendation = [
            "Perhatikan perubahan tekanan darah dari waktu ke waktu.",
            "Catat pola tidur dan tingkat stres.",
            "Evaluasi kebiasaan konsumsi garam.",
            "Pertahankan kebiasaan sehat secara konsisten."
        ];
    } else if (maturity.fase === "personal") {
        recommendation = [
            "Gunakan riwayat kesehatan untuk mengevaluasi pola tekanan darah.",
            "Perhatikan hubungan pola tidur, stres, dan tekanan darah.",
            "Evaluasi kepatuhan konsumsi obat.",
            "Diskusikan pola kesehatan yang berulang dengan tenaga medis."
        ];
    } else {
        recommendation = [
            "Lanjutkan pencatatan kesehatan secara rutin.",
            "Kumpulkan data tambahan sebelum membuat rekomendasi berdasarkan tren."
        ];
    }

    // Analisis tren tekanan darah
    if (trend.cukup_data) {
        if (
            trend.tren.sistolik === "meningkat" ||
            trend.tren.diastolik === "meningkat"
        ) {
            recommendation.push(
                `Rata-rata tekanan darah pada periode terbaru meningkat dibandingkan periode sebelumnya. Perubahan sistolik: ${trend.perubahan.sistolik} mmHg dan diastolik: ${trend.perubahan.diastolik} mmHg. Pantau pengukuran secara konsisten dan diskusikan hasilnya dengan tenaga medis.`
            );
        } else if (
            trend.tren.sistolik === "menurun" ||
            trend.tren.diastolik === "menurun"
        ) {
            recommendation.push(
                "Rata-rata tekanan darah pada periode terbaru menunjukkan penurunan dibandingkan periode sebelumnya. Tetap pantau tekanan darah secara berkala."
            );
        } else {
            recommendation.push(
                "Rata-rata tekanan darah relatif stabil dibandingkan periode sebelumnya. Pertahankan pemantauan secara berkala."
            );
        }
    }

    // Deteksi pengukuran tekanan darah sangat tinggi
    if (
        trend.pengukuran_sangat_tinggi?.length > 0
    ) {
        recommendation.push(
        "Terdapat pengukuran tekanan darah dengan nilai sistolik ≥180 mmHg atau diastolik ≥120 mmHg. Jika hasil ini merupakan pengukuran nyata, ulangi pengukuran setelah beristirahat sejenak dengan posisi yang benar dan segera cari evaluasi medis. Jika disertai gejala berat seperti nyeri dada, sesak napas, atau gangguan penglihatan, segera cari pertolongan darurat."
        );
    }

    // Penyesuaian berdasarkan tekanan darah
    const sistolik = health?.rata_sistolik;
    const diastolik = health?.rata_diastolik;

    if (
        Number.isFinite(sistolik) &&
        Number.isFinite(diastolik)
    ) {
        if (sistolik >= 180 || diastolik >= 120) {
            recommendation.push(
                "Hasil pengukuran berada pada rentang yang sangat tinggi. Ulangi pengukuran sesuai prosedur dan segera cari pertolongan medis."
            );
        } else if (sistolik >= 140 || diastolik >= 90) {
            recommendation.push(
                "Rata-rata tekanan darah berada pada rentang tinggi. Konsultasikan hasil pengukuran dengan tenaga medis."
            );
        } else if (sistolik >= 130 || diastolik >= 80) {
            recommendation.push(
                "Perhatikan hasil tekanan darah secara berkala dan diskusikan hasilnya dengan tenaga medis."
            );
        }
    }

    // Penyesuaian berdasarkan kondisi pasien
    if (
        Number.isFinite(condition?.rata_tidur) &&
        condition.rata_tidur < 7
    ) {
        recommendation.push(
            "Perhatikan kecukupan waktu tidur dan usahakan menjaga jadwal tidur yang teratur."
        );
    }

    if (
        Number.isFinite(condition?.rata_stres) &&
        condition.rata_stres >= 4
    ) {
        recommendation.push(
            "Perhatikan tingkat stres dan pertimbangkan aktivitas relaksasi yang sesuai."
        );
    }

    return {
        fase_data: maturity,
        rekomendasi: [...new Set(recommendation)],
        jumlah_data_dipakai: maturity.jumlah_data,
        analisis_tren: trend,
        ringkasan_dasar: {
            rata_sistolik: health?.rata_sistolik ?? null,
            rata_diastolik: health?.rata_diastolik ?? null,
            rata_tidur: condition?.rata_tidur ?? null,
            rata_stres: condition?.rata_stres ?? null
        }
    };
}
