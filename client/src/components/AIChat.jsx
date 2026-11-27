import { useState } from "react";
import { sendMessage } from "../services/ai.service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AIChat() {
    const user_id = 1;

    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const question = prompt.trim();

        if (!question || loading) return;

        setError("");
        setPrompt("");
        setLoading(true);

        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: question
            }
        ]);

        try {
            const conversation_history = messages
                .slice(-10)
                .map((message) => ({
                    role: message.role,
                    content: message.content
                }));

            const result = await sendMessage(
                question,
                user_id,
                conversation_history
            );

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: result
                }
            ]);
        } catch (err) {
            setError(err.message || "Gagal menghubungi AI.");
            setPrompt(question);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <h2 className="text-xl font-bold text-slate-800">
                        AI Health Assistant
                    </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                    Konsultasikan pertanyaan seputar tekanan darah dan
                    kesehatan Anda.
                </p>
            </div>

            <div className="mb-5 flex min-h-64 flex-col gap-4 rounded-xl bg-slate-50 p-4">
                {messages.length === 0 && (
                    <div className="my-auto text-center">
                        <div className="mb-3 text-4xl">💬</div>
                        <h3 className="font-semibold text-slate-700">
                            Halo! Ada yang bisa saya bantu?
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Tanyakan tentang tekanan darah, pola makan DASH,
                            gaya hidup sehat, atau riwayat kesehatan Anda.
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-relaxed ${
                                message.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "border border-slate-200 bg-white text-slate-700"
                            }`}
                        >
                            {message.role === "assistant" ? (
                                <div className="space-y-3">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ children }) => (
                                                <h1 className="text-lg font-bold text-slate-800">
                                                    {children}
                                                </h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-base font-bold text-slate-800">
                                                    {children}
                                                </h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="font-bold text-slate-800">
                                                    {children}
                                                </h3>
                                            ),
                                            p: ({ children }) => (
                                                <p className="leading-relaxed">{children}</p>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc space-y-2 pl-5">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal space-y-2 pl-5">
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="pl-1">{children}</li>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="font-bold text-slate-800">
                                                    {children}
                                                </strong>
                                            ),
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                message.content
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                        AI sedang menyusun jawaban...
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Contoh: Bagaimana cara menjaga tekanan darah tetap stabil?"
                    rows={3}
                    disabled={loading}
                    className="w-full resize-y rounded-xl border border-slate-300 p-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <div className="mt-3 flex justify-between gap-3">
                    <p className="self-center text-xs text-slate-400">
                        Jawaban AI bukan pengganti konsultasi medis.
                    </p>

                    <button
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Memproses..." : "Kirim"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default AIChat;
