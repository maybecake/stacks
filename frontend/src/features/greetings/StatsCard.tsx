import React, { useCallback, useEffect, useState } from "react";

interface GreetingStats {
  greetingType: string;
  count: number;
}

interface NameFrequency {
  name: string;
  count: number;
}

interface StatsResponse {
  stats: GreetingStats[];
  names: NameFrequency[];
}

export const StatsCard: React.FC = () => {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="greeting-card stats-card">
      <div className="stats-card__header">
        <p className="greeting-card__description">Greeting Stats</p>
        <button className="stats-card__refresh" onClick={fetchStats} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading && <p className="greeting-card__status greeting-card__status--loading">Loading…</p>}
      {error && <p className="greeting-card__status greeting-card__status--error">{error}</p>}

      {data && !loading && (
        <>
          <div className="stats-card__counts">
            {data.stats.map((s) => (
              <div key={s.greetingType} className="stats-card__count-row">
                <span className="stats-card__type">{s.greetingType}</span>
                <span className="stats-card__count">{s.count}</span>
              </div>
            ))}
          </div>

          {data.names.length > 0 && (
            <div className="stats-card__names">
              <p className="stats-card__names-label">Greeted names</p>
              <ul className="stats-card__names-list">
                {data.names.map((n) => (
                  <li key={n.name} className="stats-card__name-row">
                    <span className="stats-card__name">{n.name}</span>
                    <span className="stats-card__name-count">{n.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
