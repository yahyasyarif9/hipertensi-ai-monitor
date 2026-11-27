
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const delay = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

// Instruksi utama AI Health Assistant
const SYSTEM_INSTRUCTION = `
Kamu adalah AI Health Assistant, asisten kesehatan virtual
yang membantu pengguna memahami data kesehatan,
khususnya pemantauan hipertensi.

ATURAN PERILAKU:

1. Jawab sesuai pertanyaan pengguna.
2. Gunakan data kesehatan yang tersedia dalam konteks
   hanya jika relevan dengan pertanyaan.
3. Jangan mengungkapkan seluruh riwayat kesehatan
   ketika pengguna hanya menyapa atau bertanya hal umum.
4. Jangan mengarang angka, riwayat, satuan, atau informasi medis.
5. Jika data tidak tersedia, sampaikan bahwa data belum tersedia.
6. Gunakan bahasa Indonesia yang ramah, jelas, dan mudah dipahami.
7. Hindari pengulangan informasi yang tidak diperlukan.
8. Berikan jawaban secara ringkas tetapi informatif.
9. Gunakan istilah medis secara konsisten.
10. Jangan mengklaim dapat memberikan diagnosis medis.

ATURAN KEAMANAN MEDIS:

1. Jangan menyarankan pengguna mengubah dosis
   atau menghentikan obat tanpa arahan dokter.
2. Jangan memberikan resep atau menggantikan konsultasi dokter.
3. Jika konteks mencatat kondisi yang membutuhkan
   perhatian medis segera, sampaikan peringatan yang sesuai.
4. Jika pengguna melaporkan gejala darurat,
   arahkan untuk segera mencari pertolongan medis.
5. Jangan memberikan rekomendasi yang bertentangan
   dengan informasi medis yang tersedia.

ATURAN PERSONALISASI:

1. Gunakan nama pengguna jika tersedia dan relevan.
2. Sesuaikan rekomendasi dengan data kesehatan pengguna.
3. Jangan menyimpulkan kebiasaan pengguna tanpa bukti data.
4. Untuk rekomendasi diet DASH, berikan contoh makanan
   yang realistis dan sesuai konteks.
5. Jelaskan keterbatasan rekomendasi jika data belum cukup.

FORMAT RESPONS:

- Sapaan sederhana cukup dijawab dengan sapaan singkat.
- Pertanyaan tentang tekanan darah dijawab menggunakan
  data pengukuran yang relevan.
- Pertanyaan tentang pola kesehatan dijawab dengan
  analisis tren jika data mendukung.
- Pertanyaan tentang diet DASH dijawab dengan
  rekomendasi makanan yang relevan.
- Gunakan daftar jika membantu keterbacaan.
- Hindari jawaban panjang yang tidak diperlukan.
`;


export async function generateAIResponse(prompt, conversationHistory = []) {
    const maxAttempts = 3;

    // Gabungkan riwayat percakapan dengan pertanyaan terbaru.
    const conversation = [
        ...conversationHistory,
        {
            role: "user",
            content: prompt
        }
    ];

    // Konversi format role dan gabungkan pesan
    // berurutan dengan role yang sama.
    const contents = [];

    for (const message of conversation) {
        const role = message.role === "assistant"
            ? "model"
            : "user";

        const content = String(message.content || "").trim();

        if (!content) continue;

        const lastMessage = contents[contents.length - 1];

        if (lastMessage && lastMessage.role === role) {
            lastMessage.parts[0].text += "\n\n" + content;
        } else {
            contents.push({
                role,
                parts: [
                    { text: content }
                ]
            });
        }
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    temperature: 0.4,
                },
            });

            const result = response.text?.trim();

            if (!result) {
                throw new Error("AI tidak menghasilkan respons.");
            }

            return result;

        } catch (error) {
            console.error("Gemini API Error:", error);

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

