## ADDED Requirements

### Requirement: Upgrades execute in defined dependency order
Each upgrade step SHALL be performed in the sequence: patch-only packages → TypeScript → ESLint stack → Vite/build tools → React → React Router. No step SHALL be started until the preceding step passes `pnpm build` and `pnpm lint` without errors.

#### Scenario: Radix UI patches applied first
- **WHEN** the upgrade procedure begins
- **THEN** all `@radix-ui/*` packages are updated to their latest patch versions before any other package is upgraded

#### Scenario: TypeScript upgraded before build tools
- **WHEN** Radix UI patches are complete and green
- **THEN** TypeScript is upgraded to v6 and the build passes before Vite or ESLint are touched

#### Scenario: React upgraded before React Router
- **WHEN** Vite and ESLint upgrades are complete and green
- **THEN** React 19 is installed and verified before React Router v7 is upgraded

### Requirement: Each step validated independently
After each upgrade step, `pnpm build` and `pnpm lint` SHALL both pass before the next step begins. Any errors introduced by an upgrade step SHALL be fixed in the same step's commit.

#### Scenario: Build passes after each step
- **WHEN** a package group upgrade is applied
- **THEN** running `pnpm build` exits with code 0 before proceeding

#### Scenario: Lint passes after each step
- **WHEN** a package group upgrade is applied
- **THEN** running `pnpm lint` exits with code 0 before proceeding

#### Scenario: Errors fixed before moving on
- **WHEN** a build or lint error is introduced by an upgrade
- **THEN** the error is resolved and the fix is included in the same commit as the upgrade

### Requirement: React Router v7 adopted in library mode
The React Router upgrade SHALL use library mode only. The project SHALL NOT adopt React Router v7 framework mode, data router loaders/actions patterns, or server-side rendering as part of this upgrade.

#### Scenario: Vite config unchanged by Router upgrade
- **WHEN** React Router v7 is installed
- **THEN** `vite.config.ts` requires no changes specific to React Router

#### Scenario: Existing routes continue to function
- **WHEN** React Router v7 is installed in library mode
- **THEN** all existing routes (`/`, `/samples`, `/learner`) render correctly

### Requirement: TypeScript 6 errors resolved without config relaxation
If TypeScript 6 introduces new type errors, they SHALL be fixed in source code. The `tsconfig.json` strict settings SHALL NOT be loosened to suppress errors.

#### Scenario: New type error fixed in source
- **WHEN** TypeScript 6 produces a new error not present in v5.8
- **THEN** the error is corrected in the affected source file, not suppressed with `@ts-ignore` or a tsconfig flag change

### Requirement: Legacy React APIs absent before React 19 upgrade
Before installing React 19, the codebase SHALL be confirmed free of `ReactDOM.render`, string refs, and `defaultProps` on function components.

#### Scenario: Pre-upgrade scan passes
- **WHEN** preparing to upgrade to React 19
- **THEN** a grep for `ReactDOM.render`, `ref=` string usage, and `defaultProps` on function components returns no matches in `frontend/src/`

### Requirement: Each upgrade step committed separately
Each package group upgrade (and any associated source fixes) SHALL be committed as its own git commit. This enables atomic rollback of individual steps.

#### Scenario: Rollback to pre-step state
- **WHEN** a step needs to be rolled back
- **THEN** reverting a single git commit and running `pnpm install` fully restores the prior state
