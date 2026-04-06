import { NavLink } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/react";
import { ThemeDropdown } from "./ThemeDropdown";
import "./header.css";

const ClerkDebugBadge = () => {
  const { isLoaded } = useAuth();
  const hasKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!hasKey) return <span style={{ background: "red", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>Clerk: no key</span>;
  if (!isLoaded) return <span style={{ background: "orange", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>Clerk: loading…</span>;
  return <span style={{ background: "green", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>Clerk: OK</span>;
};

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
        <ClerkDebugBadge />
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
