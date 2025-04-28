import React from "react";
import { NavLink } from "react-router-dom";
import { ThemeDropdown } from "./ThemeDropdown";
import "./header.css";

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Stacks</h1>
        <nav className="header-nav">
          <NavLink
            to="/"
            exact
            className="nav-link"
            activeClassName="nav-link--active"
          >
            Home
          </NavLink>
          <NavLink
            to="/samples"
            className="nav-link"
            activeClassName="nav-link--active"
          >
            Samples
          </NavLink>
          <NavLink
            to="/learner"
            className="nav-link"
            activeClassName="nav-link--active"
          >
            Learner
          </NavLink>
        </nav>
        <ThemeDropdown />
      </div>
    </header>
  );
};
