import * as Collapsible from "@radix-ui/react-collapsible";
import { NavLink } from "react-router-dom";
import { Show, SignInButton, UserButton } from "@clerk/react";
import { ThemeDropdown } from "./ThemeDropdown";
import "./header.css";
import { Button } from "@ui/button";

const NAV_LINKS = [
  { to: "/samples", label: "Samples" },
  { to: "/learner", label: "Learner" },
  { to: "/greetings", label: "Greetings" },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link nav-link--active" : "nav-link";

export const Header = () => {
  return (
    <Collapsible.Root>
      <header className="header">
        <div className="header-content">
          <NavLink to="/">
            <h1 className="header-title">Stacks</h1>
          </NavLink>
          <nav className="header-nav">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Collapsible.Trigger className="hamburger-btn" aria-label="Toggle navigation">
            ☰
          </Collapsible.Trigger>
          <div className="header-auth">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton>
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </Show>
          </div>
          <ThemeDropdown />
        </div>

        <Collapsible.Content className="mobile-nav">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </Collapsible.Content>
      </header>
    </Collapsible.Root>
  );
};
