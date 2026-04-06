import React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import "./home.css";
import { Button } from "@ui/button";

export const Home: React.FC = () => {
  return (
    <div className="home">
      <h1>Stacks</h1>
      <p>
        A collection of experimental utilities and features - used for testing a variety of tech
        stack options.
      </p>

      <Collapsible.Root>
        <Collapsible.Trigger aria-label="Toggle notes section" asChild>
          <Button variant="default">Open Dialog</Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="notes">
            <h2>Notes</h2>
            <p>2026-04-05: Using Claude Code + openspec to drive development here.</p>
            <p>
              Cursor used a complicated way to style the active nav link when react router already
              has a way to do it. After reminding it, it switched but still had an overcomplicated
              way switch styles.
            </p>
            <p>
              Cursor keeps adding tailwind css for styling even though this project does not use it.
            </p>
            <p>Cursor uses native url handling when the project uses react router.</p>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
};
