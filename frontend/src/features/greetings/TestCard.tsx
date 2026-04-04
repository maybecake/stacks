import React, { useState } from "react";

export const TestCard: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/test");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      setResult(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="greeting-card">
      <p className="greeting-card__description">Test · Go</p>
      <div className="greeting-card__form">
        <button
          className="greeting-card__submit"
          onClick={handleTest}
          disabled={loading}
        >
          {loading ? "Testing…" : "Test"}
        </button>
      </div>
      {result && <p className="greeting-card__status greeting-card__status--result">{result}</p>}
      {error && <p className="greeting-card__status greeting-card__status--error">{error}</p>}
    </div>
  );
};
