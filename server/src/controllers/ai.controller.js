
import { buildPatientContext } from "../modules/ai/context.builder.js";
import { generateAIResponse } from "../modules/ai/gemini.service.js";
import { generateRecommendation } from "../modules/ai/recommendation.engine.js";
import prisma from "../config/prisma.js";

export async function chatWithAI(req, res) {
    try {
        const {
            prompt,
            user_id,
            conversation_history = []
        } = req.body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt wajib diisi."
            });
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User ID wajib diisi."
            });
        }

        if (!Array.isArray(conversation_history)) {
            return res.status(400).json({
                success: false,
                message: "Format riwayat percakapan tidak valid."
            });
        }

        const conversationHistory = conversation_history
            .filter((message) =>
                message &&
                ["user", "assistant"].includes(message.role) &&
                typeof message.content === "string" &&
                message.content.trim()
            )
            .slice(-10)
            .map((message) => ({
                role: message.role,
                content: message.content.trim().slice(0, 4000)
            }));

        // 1. Ambil konteks kesehatan pasien
        const context = await buildPatientContext(user_id);

        // 2. Jalankan Hybrid Recommendation Engine
        const recommendation = await generateRecommendation(context);

        // 3. Susun seluruh konteks untuk Gemini
        const patientContext = {
            profil: context.profil,
            tekanan_darah: context.ringkasan_tekanan_darah,
            kondisi: context.ringkasan_kondisi,
            kepatuhan_obat: context.ringkasan_kepatuhan_obat,
            efek_samping: context.ringkasan_efek_samping,
            obat: context.obat,
            riwayat_alert: context.riwayat_alert,

            analisis_tren: recommendation.analisis_tren,
            fase_data: recommendation.fase_data,
            rekomendasi_hybrid: recommendation.rekomendasi,
            jumlah_data_dipakai: recommendation.jumlah_data_dipakai
        };

        // 4. Kirim konteks dan pertanyaan ke Gemini
        const contextualPrompt = `
        DATA KESEHATAN PASIEN:
        ${JSON.stringify(patientContext, null, 2)}

        PERTANYAAN PENGGUNA:
        ${prompt.trim()}

        INSTRUKSI:
        1. Gunakan data pasien sebagai konteks jawaban.
        2. Gunakan hasil Hybrid Recommendation Engine sebagai dasar rekomendasi.
        3. Jangan mengubah atau mengarang angka hasil analisis.
        4. Jelaskan tren tekanan darah jika relevan.
        5. Sesuaikan jawaban dengan fase kematangan data.
        6. Berikan saran gaya hidup dan pola makan DASH jika relevan.
        7. Jangan membuat diagnosis medis.
        8. Jangan menyarankan perubahan dosis atau penghentian obat.
        9. Jangan mengarang data pasien yang tidak tersedia.
        10. Jika data tidak tersedia, sampaikan dengan jujur.
        11. Jika terdapat pengukuran tekanan darah sangat tinggi,
            jangan menganggapnya sebagai kondisi biasa.
        12. Jika terdapat indikasi darurat atau gejala berat,
            arahkan pengguna segera mencari pertolongan medis.
        13. Jangan menyebut seluruh riwayat kesehatan jika tidak relevan.

        Berikan jawaban yang jelas, relevan, dan mudah dipahami.`;

        const response = await generateAIResponse(
            contextualPrompt,
            conversationHistory
        );

        return res.status(200).json({
            success: true,
            data: {
                response,
                fase_data: recommendation.fase_data,
                rekomendasi_hybrid: recommendation.rekomendasi
            }
        });

    } catch (error) {
        console.error("AI Chat Error:", error);

        return res.status(503).json({
            success: false,
            message: error.message || "Gagal menghubungi AI."
        });
    }
}

export async function getRecommendation(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "User ID wajib diisi"
            });
        }

        const patientContext = await buildPatientContext(user_id);
        const result = await generateRecommendation(patientContext);

        const savedRecommendation = await prisma.recommendation.create({
            data: {
                user_id: Number(user_id),
                sumber: "hybrid",
                isi: result.rekomendasi.join("\n"),
                jumlah_data_dipakai: result.jumlah_data_dipakai,
                fase_data: result.fase_data.fase
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                recommendation: result,
                saved_id: savedRecommendation.rec_id
            }
        });

    } catch (error) {
        console.error("Recommendation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal membuat rekomendasi"
        });
    }
}
