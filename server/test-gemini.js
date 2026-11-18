import dotenv from 'dotenv';
import { generateAIResponse } from './src/modules/ai/gemini.service.js';

dotenv.config();

console.log('1. Test dimulai');

try {
    console.log('2. Memanggil Gemini...');

    const result = await generateAIResponse(
        'Halo, perkenalkan dirimu secara singkat.'
    );

    console.log('3. Respons Gemini:', result);
} catch (error) {
    console.error('4. Testing gagal:', error);
}