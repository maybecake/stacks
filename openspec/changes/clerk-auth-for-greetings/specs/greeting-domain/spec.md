## ADDED Requirements

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
