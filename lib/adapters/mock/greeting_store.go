package mock

import (
	"context"

	"github.com/maybecake/stacks/lib/domain"
)

// MockGreetingStore is a no-op implementation of domain.GreetingStore.
// It satisfies the interface without writing to any external system.
type MockGreetingStore struct{}

var _ domain.GreetingStore = (*MockGreetingStore)(nil)

func (m *MockGreetingStore) RecordGreeting(_ context.Context, _ string, _ string) error {
	return nil
}

func (m *MockGreetingStore) GetStats(_ context.Context) ([]domain.GreetingStats, error) {
	return []domain.GreetingStats{}, nil
}

func (m *MockGreetingStore) GetNameFrequencies(_ context.Context) ([]domain.NameFrequency, error) {
	return []domain.NameFrequency{}, nil
}
