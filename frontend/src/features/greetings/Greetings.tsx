import React from "react";
import { HelloCard } from "./HelloCard";
import { YoCard } from "./YoCard";
import { SupCard } from "./SupCard";
import { TestCard } from "./TestCard";
import "./greetings.css";

export const Greetings: React.FC = () => {
  return (
    <div className="greetings">
      <h1 className="greetings__title">Connect-RPC Greetings</h1>
      <p className="greetings__subtitle">Three endpoints, three languages — one proto contract.</p>
      <div className="greetings__cards">
        <HelloCard />
        <YoCard />
        <SupCard />
        <TestCard />
      </div>
    </div>
  );
};
