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

