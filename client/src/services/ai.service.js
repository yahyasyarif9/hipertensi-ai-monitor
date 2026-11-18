
const API_URL = 'http://localhost:5000/api/ai';

export async function sendMessage(prompt, user_id) {
    const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            prompt,
            user_id
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Gagal menghubungi AI.');
    }

    return result.data.response;
}
