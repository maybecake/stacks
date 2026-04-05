## ADDED Requirements

### Requirement: Greeting logic is isolated in the domain layer
The domain layer SHALL contain all greeting business logic and SHALL NOT import transport, framework, or persistence packages. It accepts a name and a store, produces a greeting string, and delegates the side-effect write to the store via the port interface.

#### Scenario: Greeting returned for valid name
- **WHEN** the domain greeting function is called with a non-empty name and a store
- **THEN** it SHALL return the appropriate greeting string (e.g. "Hello, Alice!")

#### Scenario: Domain function calls store record method
- **WHEN** the domain greeting function is called
- **THEN** it SHALL call the store's record method exactly once with the greeting type and name

#### Scenario: Store error does not prevent greeting response
- **WHEN** the store's record method returns an error or raises an exception
- **THEN** the domain function SHALL still return the greeting string and SHALL NOT propagate the storage error to the caller

### Requirement: GreetingStore port interface is defined per language
Each language SHALL define a `GreetingStore` interface (or abstract base class) in its `domain/` package. The interface SHALL declare at minimum a `RecordGreeting(type, name)` method.

#### Scenario: TypeScript interface declared
- **WHEN** `api/domain/greeting.ts` is imported
- **THEN** it SHALL export a `GreetingStore` interface with a `recordGreeting(type: string, name: string): Promise<void>` method signature

#### Scenario: Go interface declared
- **WHEN** `api/domain/greeting.go` is compiled
- **THEN** it SHALL export a `GreetingStore` interface with a `RecordGreeting(ctx context.Context, greetingType string, name string) error` method signature

#### Scenario: Python abstract base class declared
- **WHEN** `api/domain/greeting.py` is imported
- **THEN** it SHALL export a `GreetingStore` abstract base class with an abstract `record_greeting(greeting_type: str, name: str) -> None` method

### Requirement: Handlers depend on the port interface, not concrete adapters
Each handler file (`hello.ts`, `yo.go`, `sup.py`) SHALL accept or construct a `GreetingStore` and pass it to the domain function. The handler MUST NOT contain greeting logic inline.

#### Scenario: Handler delegates to domain
- **WHEN** a greeting request arrives at any of the three endpoints
- **THEN** the handler SHALL invoke the domain greeting function and return its result as the response

#### Scenario: Adapter is the composition root
- **WHEN** a handler initialises
- **THEN** it SHALL construct a concrete `GreetingStore` adapter and inject it into the domain call, with no reference to the adapter's concrete type in the domain layer
