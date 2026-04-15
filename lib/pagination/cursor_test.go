package pagination_test

import (
	"testing"

	"github.com/maybecake/stacks/lib/pagination"
)

func TestEncodeDecode_RoundTrip(t *testing.T) {
	for _, offset := range []int{0, 1, 20, 99, 1000} {
		token := pagination.EncodeCursor(offset)
		got, err := pagination.DecodeCursor(token)
		if err != nil {
			t.Fatalf("DecodeCursor(%q) unexpected error: %v", token, err)
		}
		if got != offset {
			t.Fatalf("round-trip failed: encoded %d, decoded %d", offset, got)
		}
	}
}

func TestDecodeCursor_EmptyTokenReturnsZero(t *testing.T) {
	got, err := pagination.DecodeCursor("")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != 0 {
		t.Fatalf("expected 0, got %d", got)
	}
}

func TestDecodeCursor_MalformedToken(t *testing.T) {
	// "not-base64!!!" fails base64 decode; "aGVsbG8=" decodes to "hello" (not JSON)
	cases := []string{"not-base64!!!", "aGVsbG8="}
	for _, tc := range cases {
		_, err := pagination.DecodeCursor(tc)
		if err == nil {
			t.Errorf("expected error for token %q, got nil", tc)
		}
	}
}

func TestEffectivePageSize(t *testing.T) {
	cases := []struct {
		input int32
		want  int
	}{
		{0, pagination.DefaultPageSize},
		{-1, pagination.DefaultPageSize},
		{10, 10},
		{50, 50},
		{1000, 1000},
		{1001, pagination.MaxPageSize},
		{9999, pagination.MaxPageSize},
	}
	for _, c := range cases {
		got := pagination.EffectivePageSize(c.input)
		if got != c.want {
			t.Errorf("EffectivePageSize(%d) = %d, want %d", c.input, got, c.want)
		}
	}
}
