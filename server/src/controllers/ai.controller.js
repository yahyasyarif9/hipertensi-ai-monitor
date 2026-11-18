import { generateAIResponse } from "../modules/ai/gemini.service.js";

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