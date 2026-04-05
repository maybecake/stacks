package domain

import "context"

// GreetingStore is the storage port. Implementations must record greeting events.
type GreetingStore interface {
	RecordGreeting(ctx context.Context, greetingType string, name string) error
}

// Greet returns the Yo greeting string and records the event via the store.
// Storage errors are swallowed — the greeting response is the primary contract.
func Greet(ctx context.Context, name string, store GreetingStore) (string, error) {
	_ = store.RecordGreeting(ctx, "yo", name)
	return "Yo, " + name + "!", nil
}
