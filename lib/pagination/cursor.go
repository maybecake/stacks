package pagination

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
)

const (
	DefaultPageSize = 50
	MaxPageSize     = 1000
)

// EffectivePageSize returns the page size to use for a request.
// If requested is 0 or negative, DefaultPageSize is used.
// If requested exceeds MaxPageSize, MaxPageSize is used.
func EffectivePageSize(requested int32) int {
	if requested <= 0 {
		return DefaultPageSize
	}
	if int(requested) > MaxPageSize {
		return MaxPageSize
	}
	return int(requested)
}

type cursorPayload struct {
	Offset int `json:"offset"`
}

// EncodeCursor encodes an integer offset into an opaque base64 cursor token.
func EncodeCursor(offset int) string {
	b, _ := json.Marshal(cursorPayload{Offset: offset})
	return base64.StdEncoding.EncodeToString(b)
}

// DecodeCursor decodes a cursor token produced by EncodeCursor.
// An empty token is treated as offset 0. Any other malformed token returns an error.
func DecodeCursor(token string) (int, error) {
	if token == "" {
		return 0, nil
	}
	b, err := base64.StdEncoding.DecodeString(token)
	if err != nil {
		return 0, fmt.Errorf("invalid page_token: %w", err)
	}
	var p cursorPayload
	if err := json.Unmarshal(b, &p); err != nil {
		return 0, fmt.Errorf("invalid page_token: %w", err)
	}
	if p.Offset < 0 {
		return 0, fmt.Errorf("invalid page_token: negative offset")
	}
	return p.Offset, nil
}
