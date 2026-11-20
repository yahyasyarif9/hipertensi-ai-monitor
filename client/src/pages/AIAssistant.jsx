import AIChat from '../components/AIChat';
import Recommendation from '../components/recommendation';

export default function AIAssistant() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink md:text-4xl">Asisten AI</h1>
        <p className="mt-1 text-muted">Rekomendasi kesehatan dan konsultasi AI</p>
      </div>

      {/* Recommendation Section */}
      <section className="panel">
        <Recommendation />
      </section>

      {/* AI Chat Section */}
      <section className="panel">
        <AIChat />
      </section>
    </div>
  );
}
