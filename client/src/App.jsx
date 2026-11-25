
import Recommendation from './components/recommendation';
import AIChat from './components/AIChat';
import './App.css';

function App() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                        AI Health Assistant
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Sistem pemantauan dan rekomendasi kesehatan berbasis AI.
                    </p>
                </header>

                <div className="space-y-6">
                    <Recommendation />
                    <AIChat />
                </div>
            </div>
        </main>
    );
}

export default App;
