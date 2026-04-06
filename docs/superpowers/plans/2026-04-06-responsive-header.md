# Responsive Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the four nav links into a hamburger-triggered dropdown on screens narrower than 768px, while keeping ThemeDropdown and auth buttons always visible.

**Architecture:** Wrap `<header>` in a `Collapsible.Root` from `@radix-ui/react-collapsible`. The `Collapsible.Trigger` is a hamburger button hidden on desktop. `Collapsible.Content` holds a vertical copy of the nav links and appears below the header bar on mobile. The desktop nav stays in the flex row and is hidden via media query on mobile.

**Tech Stack:** React, `@radix-ui/react-collapsible`, CSS custom properties, CSS media queries

> **Note:** There is no test infrastructure in this project. Skip TDD steps — verify visually using the running dev server (`pnpm dev` in `frontend/`).

---

### Task 1: Install @radix-ui/react-collapsible

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/pnpm-lock.yaml` (auto-updated)

- [ ] **Step 1: Install the package**

```bash
cd /workspaces/stacks/frontend
pnpm add @radix-ui/react-collapsible
```

Expected output: a line like `+ @radix-ui/react-collapsible 1.x.x` with no errors.

- [ ] **Step 2: Verify it appears in package.json**

```bash
grep collapsible /workspaces/stacks/frontend/package.json
```

Expected: `"@radix-ui/react-collapsible": "^1.x.x"`

- [ ] **Step 3: Commit**

```bash
cd /workspaces/stacks
git add frontend/package.json frontend/pnpm-lock.yaml
git commit -m "chore(deps): add @radix-ui/react-collapsible"
```

---

### Task 2: Add responsive CSS

**Files:**
- Modify: `frontend/src/components/header.css`

- [ ] **Step 1: Append hamburger button, mobile nav, and media query styles**

Add the following to the end of `frontend/src/components/header.css`:

```css
/* Hamburger button — desktop: hidden, mobile: visible */
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--text-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-right: auto;
  margin-left: var(--spacing-lg);
  line-height: 1;
}

.hamburger-btn:hover {
  background-color: var(--bg-hover);
}

/* Mobile nav dropdown panel */
.mobile-nav {
  overflow: hidden;
  border-top: 1px solid var(--border);
}

.mobile-nav[data-state="open"] {
  animation: mobileNavSlideDown 150ms ease-out;
}

.mobile-nav[data-state="closed"] {
  animation: mobileNavSlideUp 150ms ease-out;
}

@keyframes mobileNavSlideDown {
  from { height: 0; }
  to { height: var(--radix-collapsible-content-height); }
}

@keyframes mobileNavSlideUp {
  from { height: var(--radix-collapsible-content-height); }
  to { height: 0; }
}

.mobile-nav .nav-link {
  display: block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 0;
}

/* Mobile breakpoint */
@media (max-width: 768px) {
  .header-nav {
    display: none;
  }

  .hamburger-btn {
    display: block;
  }
}
```

- [ ] **Step 2: Verify the dev server shows no CSS errors**

Open the browser at `http://localhost:5173`. The header should look identical to before on desktop (no visual change yet — hamburger button not in the DOM yet).

- [ ] **Step 3: Commit**

```bash
cd /workspaces/stacks
git add frontend/src/components/header.css
git commit -m "feat(header): add responsive CSS and mobile nav styles"
```

---

### Task 3: Update Header.tsx with Collapsible

**Files:**
- Modify: `frontend/src/components/Header.tsx`

- [ ] **Step 1: Replace the entire file content**

Replace `frontend/src/components/Header.tsx` with:

```tsx
import * as Collapsible from "@radix-ui/react-collapsible";
import { NavLink } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { ThemeDropdown } from "./ThemeDropdown";
import "./header.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
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
          <h1 className="header-title">Stacks</h1>
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
              <SignInButton />
              <SignUpButton />
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /workspaces/stacks/frontend
pnpm build 2>&1 | head -30
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 3: Verify visually on desktop**

Open `http://localhost:5173`. At full width:
- "Stacks" title visible
- Four nav links visible inline
- Hamburger button NOT visible
- ThemeDropdown and auth buttons visible

- [ ] **Step 4: Verify visually on mobile**

In browser DevTools, toggle device emulation (or resize window below 768px):
- Four nav links NOT visible in the header bar
- Hamburger ☰ button visible between title and auth buttons
- Clicking ☰ opens a vertical dropdown panel below the header bar containing all four nav links
- Clicking ☰ again closes the panel with a slide-up animation
- ThemeDropdown and auth buttons remain visible at all times

- [ ] **Step 5: Commit**

```bash
cd /workspaces/stacks
git add frontend/src/components/Header.tsx
git commit -m "feat(header): collapse nav into hamburger menu on mobile"
```
