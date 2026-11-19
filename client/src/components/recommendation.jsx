import { useEffect } from "react";
import { getRecommendation } from "../services/ai.service";
import { useState } from "react";

function Recommendation () {
    const user_id = 1;

    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                const result = await getRecommendation(user_id);
                setRecommendation(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendation();
    }, []);

    if (loading) return <p>Memuat Rekomendasi...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Rekomendasi Kesehatan</h2>

            <p>Fase data: {recommendation.fase_data.fase}</p>
            <p>Jumlah data: {recommendation.jumlah_data_dipakai}</p>

            <ul>
                {recommendation.rekomendasi.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default Recommendation;