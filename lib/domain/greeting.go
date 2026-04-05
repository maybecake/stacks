package domain

import "context"

// GreetingStats holds a per-type greeting count.
type GreetingStats struct {
	GreetingType string
	Count        int64
}

// GreetingTypeStat is the paginated read-side view of a per-type greeting count.
type GreetingTypeStat struct {
	GreetingType string
	Count        int64
}

// NameFrequency holds a name with its total greeting frequency.
type NameFrequency struct {
	Name  string
	Count int64
}

// GreetingStore is the storage port. Implementations must record greeting events
// and provide read access to aggregated stats.
type GreetingStore interface {
	RecordGreeting(ctx context.Context, greetingType string, name string) error
	GetStats(ctx context.Context) ([]GreetingStats, error)
	GetNameFrequencies(ctx context.Context) ([]NameFrequency, error)
	ListGreetingTypeStats(ctx context.Context, limit int, cursor string) ([]GreetingTypeStat, string, error)
	ListGreetedNames(ctx context.Context, limit int, cursor string) ([]NameFrequency, string, error)
}

// Greet returns the Yo greeting string and records the event via the store.
// Storage errors are swallowed — the greeting response is the primary contract.
func Greet(ctx context.Context, name string, store GreetingStore) (string, error) {
	_ = store.RecordGreeting(ctx, "yo", name)
	return "Yo, " + name + "!", nil
}
