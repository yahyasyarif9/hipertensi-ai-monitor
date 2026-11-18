import { buildPatientContext } from "../modules/ai/context.builder.js";
import { generateAIResponse } from "../modules/ai/gemini.service.js";
import { generateRecommendation } from "../modules/ai/recommendation.engine.js";
import prisma from "../config/prisma.js";

export async function chatWithAI(req, res) {
    try {
        const { prompt, user_id } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Prompt wajib diisi.',
            });
        }

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID wajib diisi'
            });
        }
        //Ambil konteks pasien
        const patientContext = await buildPatientContext(user_id);

        //menggabungkan konteks pasien dengan pertanyaan
        const fullPrompt = `
            Kamu adalah AI Assistant untuk aplikasi pemantauan hipertensi. 
            
            Berikut data pasien: 
            ${JSON.stringify(patientContext, null, 2)}
            
            Pertanyaan pasien: 
            ${prompt}
            
            Berikan penjelasan berdasarkan data yang tersedia. 
            Jangan mengarang data atau memberikan diagnosis pasti`;

        const response = await generateAIResponse(fullPrompt);

        return res.status(200).json({
            success: true,
            data: { response },
        });
    } catch (error) {
        console.error('AI Controller Error:', error);

        return res.status(503).json({
            success: false,
            message: 'Gagal memproses permintaan AI'
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

        //ambil konteks pasien
        const patientContext = await buildPatientContext(user_id);

        //generate rekomendasi
        const result = generateRecommendation(patientContext);

        //simpan rekomendasi ke database
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