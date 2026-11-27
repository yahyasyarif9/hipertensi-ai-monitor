import { useEffect, useRef, useState } from "react";
import { getRecommendation } from "../services/ai.service";

function Recommendation() {
    const user_id = 1;

    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Mencegah request ganda akibat React StrictMode saat development.
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchRecommendation = async () => {
            try {
                const result = await getRecommendation(user_id);
                setRecommendation(result);
            } catch (err) {
                setError(err.message || "Gagal mengambil rekomendasi.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendation();
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-slate-500">
                    Memuat rekomendasi kesehatan...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-semibold text-red-700">
                    Gagal Memuat Rekomendasi
                </h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
        );
    }

    if (!recommendation) {
        return (
            <div className="rounded-xl bg-white p-6 shadow-sm">
                Belum ada rekomendasi kesehatan.
            </div>
        );
    }

    const faseData = recommendation.fase_data || {};
    const daftarRekomendasi = Array.isArray(recommendation.rekomendasi)
        ? recommendation.rekomendasi
        : [];

    const jumlahData =
        recommendation.jumlah_data_dipakai ??
        faseData.jumlah_data ??
        0;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    <h2 className="text-xl font-bold text-slate-800">
                        Rekomendasi Kesehatan
                    </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                    Rekomendasi berdasarkan riwayat data kesehatan Anda.
                </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm text-slate-500">
                        Fase Kematangan Data
                    </p>
                    <p className="mt-1 text-lg font-bold capitalize text-blue-700">
                        {faseData.fase || "Belum tersedia"}
                    </p>
                    {faseData.rekomendasi && (
                        <p className="mt-1 text-xs text-slate-500">
                            {faseData.rekomendasi}
                        </p>
                    )}
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-sm text-slate-500">
                        Jumlah Data Digunakan
                    </p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">
                        {jumlahData} data
                    </p>
                    {faseData.rentang_hari != null && (
                        <p className="mt-1 text-xs text-slate-500">
                            Rentang {faseData.rentang_hari} hari
                        </p>
                    )}
                </div>
            </div>

            <div>
                <h3 className="mb-3 font-semibold text-slate-800">
                    Saran Kesehatan
                </h3>

                {daftarRekomendasi.length > 0 ? (
                    <ul className="space-y-3">
                        {daftarRekomendasi.map((item, index) => (
                            <li
                                key={index}
                                className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700"
                            >
                                <span className="font-bold text-emerald-600">
                                    {index + 1}.
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500">
                        Belum ada rekomendasi yang tersedia.
                    </p>
                )}
            </div>

            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
                Rekomendasi ini merupakan informasi pendukung pemantauan
                kesehatan dan bukan pengganti diagnosis atau konsultasi
                tenaga medis.
            </p>
        </section>
    );
}

export default Recommendation;
