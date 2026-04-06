## MODIFIED Requirements

### Requirement: GreetingStore port interface is defined per language
Each language SHALL define a `GreetingStore` interface (or abstract base class) in its `domain/` package. The interface SHALL declare a `RecordGreeting(type, name)` write method and two read methods: `ListGreetingTypeStats` and `ListGreetedNames`, both accepting a limit and an opaque cursor string.

#### Scenario: TypeScript interface declared
- **WHEN** `api/domain/greeting.ts` is imported
- **THEN** it SHALL export a `GreetingStore` interface with:
  - `recordGreeting(type: string, name: string): Promise<void>`
  - `listGreetingTypeStats(limit: number, cursor: string): Promise<{ items: GreetingTypeStat[], nextCursor: string }>`
  - `listGreetedNames(limit: number, cursor: string): Promise<{ items: NameFrequency[], nextCursor: string }>`

#### Scenario: Go interface declared
- **WHEN** `api/domain/greeting.go` is compiled
- **THEN** it SHALL export a `GreetingStore` interface with:
  - `RecordGreeting(ctx context.Context, greetingType string, name string) error`
  - `ListGreetingTypeStats(ctx context.Context, limit int, cursor string) ([]GreetingTypeStat, string, error)`
  - `ListGreetedNames(ctx context.Context, limit int, cursor string) ([]NameFrequency, string, error)`

#### Scenario: Python abstract base class declared
- **WHEN** `api/domain/greeting.py` is imported
- **THEN** it SHALL export a `GreetingStore` abstract base class with abstract methods:
  - `record_greeting(greeting_type: str, name: str) -> None`
  - `list_greeting_type_stats(limit: int, cursor: str) -> tuple[list[GreetingTypeStat], str]`
  - `list_greeted_names(limit: int, cursor: str) -> tuple[list[NameFrequency], str]`

### Requirement: SayHello, SayYo, and SaySup RPCs require a valid Clerk JWT
The Go service handlers for `SayHello`, `SayYo`, and `SaySup` SHALL reject requests that do not include a valid Clerk JWT in the `Authorization: Bearer <token>` header. Requests without a token or with an invalid token SHALL be refused with gRPC status `UNAUTHENTICATED`. List and stats RPCs SHALL NOT enforce this requirement.

#### Scenario: Missing Authorization header on write RPC
- **WHEN** a `SayHello`, `SayYo`, or `SaySup` request arrives with no `Authorization` header
- **THEN** the handler SHALL return a Connect error with code `UNAUTHENTICATED` and no greeting SHALL be recorded

#### Scenario: Invalid or expired JWT on write RPC
- **WHEN** a `SayHello`, `SayYo`, or `SaySup` request arrives with an `Authorization: Bearer <token>` header where the token fails signature verification, has an invalid issuer, or is expired
- **THEN** the handler SHALL return a Connect error with code `UNAUTHENTICATED` and no greeting SHALL be recorded

#### Scenario: Valid JWT on write RPC
- **WHEN** a `SayHello`, `SayYo`, or `SaySup` request arrives with a valid, unexpired Clerk JWT from the correct issuer
- **THEN** the handler SHALL proceed normally and record the greeting

#### Scenario: Unauthenticated list/stats requests pass through
- **WHEN** a `ListGreetingTypeStats` or `ListGreetedNames` request arrives with no `Authorization` header
- **THEN** the handler SHALL process the request normally and return results

### Requirement: CLERK_JWKS_URL env var is defined for the Go backend
The Go service SHALL read the Clerk JWKS URL from the `CLERK_JWKS_URL` environment variable to verify JWTs without hardcoding a tenant URL.

#### Scenario: JWKS URL configured
- **WHEN** the Go service starts with `CLERK_JWKS_URL` set
- **THEN** it SHALL initialize a JWKS key provider using that URL before serving requests

#### Scenario: Missing JWKS URL
- **WHEN** the Go service starts without `CLERK_JWKS_URL`
- **THEN** it SHALL fail to start and log a clear error message
