import { useState } from 'react';
import { sendMessage } from '../services/ai.service';

function AIChat () {
    const user_id = 1;
    
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setResponse('');

        try {
            const result = await sendMessage(prompt);
            setResponse(result);
        } catch (err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Asisten AI Hipertensi</h2>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Tulis pertanyaanmu di sini.."
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Memproses...' : 'Kirim'}
                </button>
            </form>

            {response && (
                <div>
                    <h3>Respons AI:</h3>
                    <p>{response}</p>
                </div>
            )}

            {error && <p>{error}</p>}
        </div>
    );
}

export default AIChat;