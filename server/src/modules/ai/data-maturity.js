
export function checkDataMaturity(readings) {
    if (!readings || readings.length === 0) {
        return {
            fase: "umum",
            jumlah_data: 0,
            rentang_hari: 0,
            rekomendasi: "Belum cukup data pasien"
        };
    }

    const validDates = readings
        .map(item => new Date(item.waktu))
        .filter(date => !isNaN(date.getTime()));

    if (validDates.length === 0) {
        return {
            fase: "umum",
            jumlah_data: 0,
            rentang_hari: 0,
            rekomendasi: "Belum cukup data pasien"
        };
    }

    const timestamps = validDates.map(date =>
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        )
    );

    const firstDate = Math.min(...timestamps);
    const latestDate = Math.max(...timestamps);

    // Menghitung jumlah hari kalender termasuk tanggal awal
    const totalDays =
        Math.floor((latestDate - firstDate) / 86400000) + 1;

    const jumlahData = validDates.length;

    if (totalDays < 14) {
        return {
            fase: "umum",
            jumlah_data: jumlahData,
            rentang_hari: totalDays,
            rekomendasi: "Rekomendasi umum"
        };
    }

    if (totalDays <= 30) {
        return {
            fase: "tren",
            jumlah_data: jumlahData,
            rentang_hari: totalDays,
            rekomendasi: "Rekomendasi berdasarkan tren"
        };
    }

    return {
        fase: "personal",
        jumlah_data: jumlahData,
        rentang_hari: totalDays,
        rekomendasi: "Rekomendasi personal"
    };
}
