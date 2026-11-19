import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI ({
    apiKey: process.env.GEMINI_API_KEY,
});

const delay = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

export async function generateAIResponse(prompt) {
    const maxAttempts = 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++){
        try {
            const response = await ai.models.generateContent ({
                model: 'gemini-3.5-flash-lite',
                contents: prompt,
            });

            return response.text;

        } catch (error) {
            console.error('Gemini API Error: ', error);

            if (error.status !== 503 || attempt === maxAttempts) {
                throw error;
            }
            
            const waitTime = 2000 * (2 ** (attempt - 1));

            console.log(
                `Gemini sedang sibuk. Percobaan ${attempt}/${maxAttempts} gagal. Mencoba lagi dalam ${waitTime / 1000} detik...` 
            );

            await delay(waitTime);
            
        }
    }
    
}