# Responsive Header Design

**Date:** 2026-04-06  
**Status:** Approved

## Problem

The header has no responsive handling. On small screens it overflows horizontally due to a minimum effective width from all flex items being inline.

## Goal

On mobile (< 768px), collapse the four nav links into a hamburger menu that drops down below the header bar. The ThemeDropdown and auth buttons (sign in / sign up / user avatar) remain visible in the header row at all times.

## Approach

Use `@radix-ui/react-collapsible` (already available via Radix UI) to manage the hamburger toggle. Radix provides `aria-expanded`, `data-state`, and keyboard handling out of the box.

## Component Structure

```
<Collapsible.Root>                  ← wraps header, owns open/closed state + ARIA
  <header class="header">
    <div class="header-content">   ← existing horizontal flex row
      <h1>Stacks</h1>
      <nav class="header-nav">    ← desktop nav (hidden below 768px)
        Home | Samples | Learner | Greetings
      </nav>
      <Collapsible.Trigger         ← hamburger button (hidden above 768px)
        class="hamburger-btn"
        aria-label="Toggle navigation"
      >
        ☰ / ✕ icon
      </Collapsible.Trigger>
      <div class="header-auth">   ← always visible
      <ThemeDropdown />            ← always visible
    </div>
    <Collapsible.Content           ← full-width panel, drops below the flex row
      class="mobile-nav"
    >
      vertical nav links (same NavLink components, same active styles)
    </Collapsible.Content>
  </header>
</Collapsible.Root>
```

## Breakpoint

768px. Above: desktop nav visible, hamburger hidden. Below: desktop nav hidden, hamburger visible.

## Animation

Radix exposes `data-state="open|closed"` on `Collapsible.Content`. Use a CSS `max-height` transition (0 → a fixed max like 300px) for a smooth slide-down. `overflow: hidden` on the content container.

## New Dependency

`@radix-ui/react-collapsible` is not yet installed. Add it to `frontend/package.json` via `pnpm add @radix-ui/react-collapsible` before implementation.

## Files Changed

- `frontend/package.json` + `pnpm-lock.yaml` — add `@radix-ui/react-collapsible`
- `frontend/src/components/Header.tsx` — restructure JSX, add Collapsible, hamburger icon
- `frontend/src/components/header.css` — add mobile nav styles, hamburger styles, media query

## Out of Scope

- Theming or auth button layout changes
- Breakpoints other than 768px
- Any other pages or components
