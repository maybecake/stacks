## ADDED Requirements

### Requirement: Mock adapter implements GreetingStore interface
Each language SHALL have a mock `GreetingStore` adapter in `api/adapters/mock/` that implements the corresponding language's `GreetingStore` interface. The mock SHALL be the default adapter used by handlers until a real storage adapter is configured.

#### Scenario: TypeScript mock satisfies interface
- **WHEN** `MockGreetingStore` from `api/adapters/mock/greeting_store.ts` is used where a `GreetingStore` is expected
- **THEN** it SHALL compile without type errors

#### Scenario: Go mock satisfies interface
- **WHEN** `MockGreetingStore` from `api/adapters/mock/greeting_store.go` is assigned to a variable of type `domain.GreetingStore`
- **THEN** it SHALL compile without errors

#### Scenario: Python mock satisfies abstract base class
- **WHEN** `MockGreetingStore` from `api/adapters/mock/greeting_store.py` is instantiated
- **THEN** it SHALL not raise `TypeError` for unimplemented abstract methods

### Requirement: Mock adapter writes are no-ops
The mock adapter's `RecordGreeting` method SHALL succeed without writing to any external system or in-memory state.

#### Scenario: RecordGreeting returns success
- **WHEN** `RecordGreeting` (or equivalent) is called on the mock with any type and name
- **THEN** it SHALL return without error (TypeScript: resolves; Go: returns nil; Python: returns without raising)

#### Scenario: Mock has no side effects
- **WHEN** `RecordGreeting` is called multiple times
- **THEN** no persistent state SHALL accumulate — subsequent calls are independent

### Requirement: Mock adapter has no external dependencies
The mock adapter SHALL use only language stdlib. It SHALL NOT import database drivers, ORM packages, or network libraries.

#### Scenario: TypeScript mock imports
- **WHEN** `api/adapters/mock/greeting_store.ts` is inspected
- **THEN** it SHALL only import from `../../domain/greeting.js` (the port interface) and no third-party packages

#### Scenario: Go mock imports
- **WHEN** `api/adapters/mock/greeting_store.go` is inspected
- **THEN** it SHALL only import `context` from stdlib and the local domain package

#### Scenario: Python mock imports
- **WHEN** `api/adapters/mock/greeting_store.py` is inspected
- **THEN** it SHALL only import from the local domain module and Python stdlib
