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
	"github.com/maybecake/stacks/lib/pagination"
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

// ListGreetingTypeStats delegates to GetStats and applies in-process pagination.
// A real implementation would push pagination into the SQL query.
func (s *PostgresGreetingStore) ListGreetingTypeStats(ctx context.Context, limit int, cursor string) ([]domain.GreetingTypeStat, string, error) {
	all, err := s.GetStats(ctx)
	if err != nil {
		return nil, "", err
	}
	offset, err := pagination.DecodeCursor(cursor)
	if err != nil {
		return nil, "", err
	}
	if offset >= len(all) {
		return []domain.GreetingTypeStat{}, "", nil
	}
	page := all[offset:]
	if len(page) > limit {
		page = page[:limit]
	}
	typed := make([]domain.GreetingTypeStat, len(page))
	for i, s := range page {
		typed[i] = domain.GreetingTypeStat{GreetingType: s.GreetingType, Count: s.Count}
	}
	nextCursor := ""
	if offset+len(typed) < len(all) {
		nextCursor = pagination.EncodeCursor(offset + len(typed))
	}
	return typed, nextCursor, nil
}

// ListGreetedNames delegates to GetNameFrequencies and applies in-process pagination.
func (s *PostgresGreetingStore) ListGreetedNames(ctx context.Context, limit int, cursor string) ([]domain.NameFrequency, string, error) {
	all, err := s.GetNameFrequencies(ctx)
	if err != nil {
		return nil, "", err
	}
	offset, err := pagination.DecodeCursor(cursor)
	if err != nil {
		return nil, "", err
	}
	if offset >= len(all) {
		return []domain.NameFrequency{}, "", nil
	}
	page := all[offset:]
	if len(page) > limit {
		page = page[:limit]
	}
	nextCursor := ""
	if offset+len(page) < len(all) {
		nextCursor = pagination.EncodeCursor(offset + len(page))
	}
	return page, nextCursor, nil
}
