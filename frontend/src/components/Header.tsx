import React from "react";
import { Link } from "react-router-dom";
import { ThemeDropdown } from "./ThemeDropdown";
import "./header.css";

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Stacks</h1>
        <nav className="header-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/samples" className="nav-link">
            Samples
          </Link>
          <Link to="/learner" className="nav-link">
            Learner
          </Link>
        </nav>
        <ThemeDropdown />
      </div>
    </header>
  );
};
