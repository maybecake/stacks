import React, { useState } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { Show, SignInButton, useAuth } from "@clerk/react";
import { SupService, SupRequestSchema } from "../../gen/sup/sup_pb.js";
import { makeAuthInterceptor } from "../../lib/authInterceptor.js";
import { Button } from "@ui/button.js";

export const SupCard: React.FC = () => {
  const [name, setName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const transport = createConnectTransport({
        baseUrl: "",
        interceptors: [makeAuthInterceptor(getToken)],
      });
      const client = createClient(SupService, transport);
      const res = await client.saySup(create(SupRequestSchema, { name }));
      setResult(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="greeting-card">
      <p className="greeting-card__description">Sup · Python</p>
      {!isLoaded && (
        <p className="greeting-card__status greeting-card__status--loading">Loading…</p>
      )}
      <Show when="signed-in">
        <form className="greeting-card__form" onSubmit={handleSubmit}>
          <input
            className="greeting-card__input"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button variant="default" type="submit" disabled={loading}>
            Send
          </Button>
        </form>
        {loading && (
          <p className="greeting-card__status greeting-card__status--loading">Loading…</p>
        )}
        {result && <p className="greeting-card__status greeting-card__status--result">{result}</p>}
        {error && <p className="greeting-card__status greeting-card__status--error">{error}</p>}
      </Show>
      <Show when="signed-out">
        <p className="greeting-card__status">Sign in to say sup</p>
        <SignInButton>
          <Button variant="default">Sign In</Button>
        </SignInButton>
      </Show>
    </div>
  );
};
