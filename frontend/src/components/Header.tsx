import { NavLink } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { ThemeDropdown } from "./ThemeDropdown";
import "./header.css";

export const Header =() => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Stacks</h1>
        <nav className="header-nav">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}
          >
            Home
          </NavLink>
          <NavLink
            to="/samples"
            className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}
          >
            Samples
          </NavLink>
          <NavLink
            to="/learner"
            className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}
          >
            Learner
          </NavLink>
          <NavLink
            to="/greetings"
            className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}
          >
            Greetings
          </NavLink>
        </nav>
        <div className="header-auth">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton />
            <SignUpButton />
          </Show>
        </div>
        <ThemeDropdown />
      </div>
    </header>
  );
};
