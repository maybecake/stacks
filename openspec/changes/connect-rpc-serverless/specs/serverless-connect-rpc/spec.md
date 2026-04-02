## ADDED Requirements

### Requirement: Proto definitions for all three services
The system SHALL define three proto services in `api/protos/`: `HelloService` (existing), `YoService` (new, in `yo.proto`), and `SupService` (new, in `sup.proto`). Each service SHALL have a single unary RPC accepting a `name` field and returning a `message` field.

#### Scenario: YoService proto is valid
- **WHEN** `buf build` is run at the repo root
- **THEN** `api/protos/yo.proto` compiles without errors

#### Scenario: SupService proto is valid
- **WHEN** `buf build` is run at the repo root
- **THEN** `api/protos/sup.proto` compiles without errors

### Requirement: Generated files excluded from version control
The system SHALL gitignore all `buf`-generated output directories (`frontend/src/gen/`, `api/gen/go/`, `api/gen/python/`). Generated files SHALL NOT be committed to the repository.

#### Scenario: Generated directories are gitignored
- **WHEN** `buf generate` has been run and `git status` is checked
- **THEN** no files under `frontend/src/gen/`, `api/gen/go/`, or `api/gen/python/` appear as untracked or staged

### Requirement: Generated files produced at build time
The system SHALL regenerate all proto-derived files as part of the Vercel build command before compiling any language-specific code. Locally, running `pnpm gen:proto` from the repo root SHALL regenerate all output directories.

#### Scenario: Build succeeds from clean state
- **WHEN** all generated directories are deleted and the Vercel build command is run
- **THEN** `buf generate` runs, generated files are created, and the frontend build completes without errors

### Requirement: TypeScript serverless function for HelloService
The system SHALL expose `HelloService.SayHello` at `/api/hello` as a Vercel Node.js serverless function written in TypeScript using `@connectrpc/connect-node`. It SHALL return `"Hello, <name>!"`.

#### Scenario: SayHello returns correct greeting
- **WHEN** a Connect-RPC client calls `SayHello` with `name` set to `"World"`
- **THEN** the response `message` equals `"Hello, World!"`

### Requirement: Go serverless function for YoService
The system SHALL expose `YoService.SayYo` at `/api/yo` as a Vercel Go serverless function using `connectrpc.com/connect`. It SHALL return `"Yo, <name>!"`.

#### Scenario: SayYo returns correct greeting
- **WHEN** a Connect-RPC client calls `SayYo` with `name` set to `"World"`
- **THEN** the response `message` equals `"Yo, World!"`

### Requirement: Python serverless function for SupService
The system SHALL expose `SupService.SaySup` at `/api/sup` as a Vercel Python serverless function. It SHALL return `"Sup, <name>!"`.

#### Scenario: SaySup returns correct greeting
- **WHEN** a Connect-RPC client calls `SaySup` with `name` set to `"World"`
- **THEN** the response `message` equals `"Sup, World!"`

### Requirement: React client integration for all three endpoints
The system SHALL add a new **Greetings** tab to the frontend navigation. The tab SHALL contain three independent cards — one for `/api/hello` (TypeScript), one for `/api/yo` (Go), and one for `/api/sup` (Python) — each implemented using `@connectrpc/connect-web`. Each card SHALL include a short description of the endpoint and the backing technology, a text input for the `name` parameter, a submit button, and an output area that shows the response message, a loading indicator while the request is in flight, or a human-readable error on failure. Submitting one card SHALL NOT affect the state of the other cards.

#### Scenario: User submits a greeting card
- **WHEN** a user navigates to the Greetings tab, types a name into a card's input, and clicks its submit button
- **THEN** that card independently calls its endpoint and displays the returned greeting

#### Scenario: Loading state shown
- **WHEN** any Connect client request is pending
- **THEN** the corresponding card displays a loading indicator

#### Scenario: Error state shown
- **WHEN** any Connect client request fails
- **THEN** the corresponding card displays a human-readable error message

#### Scenario: Cards are independent
- **WHEN** a user submits one card while another card is loading or has an error
- **THEN** each card's state is unaffected by the other cards
