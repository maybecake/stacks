import React from "react";
import "./home.css";

export const Home: React.FC = () => {
  return (
    <div className="home">
      <h1>Welcome to Stacks</h1>
      <p>Navigate using the header links to explore the application.</p>
      <div className="notes">
        <h2>Notes</h2>
        <p>
          Cursor used a complicated way to style the active nav link when react router already has a
          way to do it. After reminding it, it switched but still had an overcomplicated way switch
          styles.
        </p>
        <p>
          Cursor keeps adding tailwind css for styling even though this project does not use it.
        </p>
        <p>Cursor uses native url handling when the project uses react router.</p>
      </div>
    </div>
  );
};
