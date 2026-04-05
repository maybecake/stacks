package pagination

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
)

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
