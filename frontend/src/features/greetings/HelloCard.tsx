import React, { useState } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { HelloService, HelloRequestSchema } from "../../gen/hello_pb.js";

const transport = createConnectTransport({ baseUrl: "" });
const client = createClient(HelloService, transport);

export const HelloCard: React.FC = () => {
  const [name, setName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await client.sayHello(create(HelloRequestSchema, { name }));
      setResult(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="greeting-card">
      <p className="greeting-card__description">Hello · TypeScript / Node.js</p>
      <form className="greeting-card__form" onSubmit={handleSubmit}>
        <input
          className="greeting-card__input"
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="greeting-card__submit" type="submit" disabled={loading}>
          Send
        </button>
      </form>
      {loading && <p className="greeting-card__status greeting-card__status--loading">Loading…</p>}
      {result && <p className="greeting-card__status greeting-card__status--result">{result}</p>}
      {error && <p className="greeting-card__status greeting-card__status--error">{error}</p>}
    </div>
  );
};
