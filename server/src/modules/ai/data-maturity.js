export function checkDataMaturity(readings) {
    if (!readings || readings.length === 0) {
        return {
            fase: 'belum_ada_data', 
            jumlah_data: 0,
            rekomendasi: 'Belum cukup data pasien'
        };
    }

    const dates = readings.map(item => 
        new Date(item.waktu).getTime()
    );

    const firstDate = Math.min(...dates); 
    const latestDate = Math.max(...dates);

    const totalDays = Math.floor(
        (latestDate - firstDate) / (1000 * 60 * 60 * 24)
    );

    if (totalDays < 7) {
        return {
            fase: 'umum',
            jumlah_data: readings.length,
            rentang_hari: totalDays,
            rekomendasi: 'Rekomendasi umum'
        };
    }

    if (totalDays >= 14 && totalDays <= 28) {
        return {
            fase: 'tren',
            jumlah_data: readings.length,
            rentang_hari: totalDays,
            rekomendasi: 'Rekomendasi berdasarkan tren'
        };
    }

    if (totalDays > 30) {
        return {
            fase: 'personal',
            jumlah_data: readings.length,
            rentang_hari: totalDays,
            rekomendasi: 'Rekomendasi personal'
        };
    }

    return {
        fase: 'transisi',
        jumlah_data: readings.length,
        rentang_hari: totalDays,
        rekomendasi: 'Data masih dalam tahap pengumpulan'
    };
}
