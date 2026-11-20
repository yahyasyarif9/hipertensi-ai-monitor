import { buildPatientContext } from "../modules/ai/context.builder.js";
import { generateAIResponse } from "../modules/ai/gemini.service.js";
import { generateRecommendation } from "../modules/ai/recommendation.engine.js";
import prisma from "../config/prisma.js";

export async function chatWithAI(req, res) {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Prompt wajib diisi.',
            });
        }

        const response = await generateAIResponse(prompt);

        return res.status(200).json({
            success: true,
            data: {
                response,
            },
        });
    } catch (error) {
        console.error('AI Controller Error:', error.message);

        return res.status(503).json({
            success: false,
            message: 'Layanan AI sedang tidak tersedia. Silakan coba lagi.',
        });
    }
}

export async function getRecommendation(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID wajib diisi'
            });
        }

        const patientContext = await buildPatientContext(user_id);
        const result = await generateRecommendation(patientContext);

        const savedRecommendation = await prisma.recommendation.create({
            data: {
                user_id: Number(user_id),
                sumber: 'hybrid',
                isi: result.rekomendasi.join('\n'),
                jumlah_data_dipakai: result.jumlah_data_dipakai
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
        console.error('Recommendation Error: ', error);

        return res.status(500).json({
            success: false,
            message: 'Gagal membuat rekomendasi'
        });
    }
}