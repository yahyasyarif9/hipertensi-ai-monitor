import { checkDataMaturity } from "./data-maturity.js";

export async function generateRecommendation(context) {
    const maturity = checkDataMaturity(
        context.riwayat_tekanan_darah
    );

    let recommendation =[]

    if (maturity.fase === 'umum' || maturity.fase === 'belum_ada_data') {
        recommendation = [
            'Pantau tekanan darah secara berkala.',
            "Terapkan pola makan DASH.",
            'Batasi asupan garam.',
            'Jaga kualitas tidur dan aktivitas fisik.'
        ];
    }

    else if (maturity.fase === 'tren') {
        recommendation = [
            'Perhatikan perubahan tekanan darah dari waktu ke waktu.',
            'Catat pola tidur dan tingkat stres.',
            'Evaluasi kebiasaan konsumsi garam.',
            'Pertahankan kebiasaan sehat secara konsisten.',
        ];
    }

    else if (maturity.fase == 'personal') {
        recommendation = [
            'Gunakan riwayat kesehatan untuk mengevaluasi pola tekanan darah.',
            'Perhatikan hubungan pola tidur, stres, dan tekanan darah.',
            'Evaluasi kepatuhan konsumsi obat.',
            'Diskusikan pola kesehatan yang berulang dengan tenaga medis.',
        ];
    }

    else {
        recommendation = [
            'Lanjutkan pencatatan kesehatan secara rutin.',
            'Kumpulkan data tambahan sebelum membuat rekomendasi berdasarkan tren.',
        ];
    }

    return {
        fase_data: maturity,
        rekomendasi: recommendation,
        jumlah_data_dipakai: maturity.jumlah_data
    };
}