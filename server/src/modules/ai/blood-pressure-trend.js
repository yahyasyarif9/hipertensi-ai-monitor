export function analyzeBloodPressureTrend(readings = []) {
    if (!Array.isArray(readings) || readings.length < 4) {
        return {
            cukup_data: false,
            pesan: "Data belum cukup untuk analisis tren."
        };
    }

    const sorted = [...readings].sort(
        (a, b) => new Date(a.waktu) - new Date(b.waktu)
    );

    const midpoint = Math.floor(sorted.length / 2);

    const periodeAwal = sorted.slice(0, midpoint);
    const periodeTerbaru = sorted.slice(midpoint);

    const average = (data, field) =>
        data.reduce((total, item) => total + item[field], 0) / data.length;

    const awal = {
        sistolik: average(periodeAwal, "sistolik"),
        diastolik: average(periodeAwal, "diastolik")
    };

    const terbaru = {
        sistolik: average(periodeTerbaru, "sistolik"),
        diastolik: average(periodeTerbaru, "diastolik")
    };

    const perubahan = {
        sistolik: Number((terbaru.sistolik - awal.sistolik).toFixed(2)),
        diastolik: Number((terbaru.diastolik - awal.diastolik).toFixed(2))
    };

    const getTrend = (selisih) => {
        if (selisih >= 5) return "meningkat";
        if (selisih <= -5) return "menurun";
        return "stabil";
    };

    return {
        cukup_data: true,
        jumlah_data_dipakai: sorted.length,
        periode_awal: awal,
        periode_terbaru: terbaru,
        perubahan,
        tren: {
            sistolik: getTrend(perubahan.sistolik),
            diastolik: getTrend(perubahan.diastolik)
        },
        pengukuran_sangat_tinggi: sorted.filter(
            item => item.sistolik >= 180 || item.diastolik >= 120
        ).map(item => ({
            reading_id: item.reading_id,
            waktu: item.waktu,
            sistolik: item.sistolik,
            diastolik: item.diastolik
        }))
    };
}