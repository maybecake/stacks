package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"

	pgdb "github.com/maybecake/stacks/lib/adapters/postgres/db"
	"github.com/maybecake/stacks/lib/domain"
)

// PostgresGreetingStore implements domain.GreetingStore using pgx + sqlc.
type PostgresGreetingStore struct {
	db *sql.DB
}

var _ domain.GreetingStore = (*PostgresGreetingStore)(nil)

// NewPostgresGreetingStore opens a pgx connection using DATABASE_URL.
func NewPostgresGreetingStore() (*PostgresGreetingStore, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}
	return &PostgresGreetingStore{db: db}, nil
}

func (s *PostgresGreetingStore) RecordGreeting(ctx context.Context, greetingType string, name string) error {
	q := pgdb.New(s.db)
	if err := q.InsertGreetingLog(ctx, pgdb.InsertGreetingLogParams{
		GreetingType: greetingType,
		Name:         name,
	}); err != nil {
		log.Printf("greeting-store: InsertGreetingLog failed: %v", err)
		return nil
	}
	if err := q.UpsertGreetingStats(ctx, greetingType); err != nil {
		log.Printf("greeting-store: UpsertGreetingStats failed: %v", err)
	}
	return nil
}

func (s *PostgresGreetingStore) GetStats(ctx context.Context) ([]domain.GreetingStats, error) {
	q := pgdb.New(s.db)
	rows, err := q.GetAllStats(ctx)
	if err != nil {
		return nil, err
	}
	stats := make([]domain.GreetingStats, len(rows))
	for i, r := range rows {
		stats[i] = domain.GreetingStats{GreetingType: r.GreetingType, Count: int64(r.Count)}
	}
	return stats, nil
}

func (s *PostgresGreetingStore) GetNameFrequencies(ctx context.Context) ([]domain.NameFrequency, error) {
	q := pgdb.New(s.db)
	rows, err := q.GetNameFrequencies(ctx)
	if err != nil {
		return nil, err
	}
	freqs := make([]domain.NameFrequency, len(rows))
	for i, r := range rows {
		freqs[i] = domain.NameFrequency{Name: r.Name, Count: r.Count}
	}
	return freqs, nil
}
