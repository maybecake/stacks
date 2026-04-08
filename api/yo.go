package handler

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"connectrpc.com/connect"
	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	yov1 "github.com/maybecake/stacks/gen/go/yo"
	"github.com/maybecake/stacks/gen/go/yo/yoconnect"
	"github.com/maybecake/stacks/lib/adapters/postgres"
	"github.com/maybecake/stacks/lib/domain"
	"github.com/maybecake/stacks/lib/pagination"
)

var (
	jwksOnce   sync.Once
	jwksClient keyfunc.Keyfunc
	jwksErr    error
)

func jwksURLFromPublishableKey(key string) (string, error) {
	for _, prefix := range []string{"pk_test_", "pk_live_"} {
		if strings.HasPrefix(key, prefix) {
			key = strings.TrimPrefix(key, prefix)
			break
		}
	}
	// Add base64 padding if needed
	switch len(key) % 4 {
	case 2:
		key += "=="
	case 3:
		key += "="
	}
	decoded, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		return "", fmt.Errorf("decode publishable key: %w", err)
	}
	domain := strings.TrimSuffix(string(decoded), "$")
	return "https://" + domain + "/.well-known/jwks.json", nil
}

func getJWKS() (keyfunc.Keyfunc, error) {
	jwksOnce.Do(func() {
		key := os.Getenv("VITE_CLERK_PUBLISHABLE_KEY")
		if key == "" {
			jwksErr = errors.New("VITE_CLERK_PUBLISHABLE_KEY not set")
			return
		}
		url, err := jwksURLFromPublishableKey(key)
		if err != nil {
			jwksErr = err
			return
		}
		jwksClient, jwksErr = keyfunc.NewDefault([]string{url})
	})
	return jwksClient, jwksErr
}

func requireAuth(authHeader string) error {
	const prefix = "Bearer "
	if !strings.HasPrefix(authHeader, prefix) {
		return connect.NewError(connect.CodeUnauthenticated, errors.New("missing Authorization header"))
	}
	jwks, err := getJWKS()
	if err != nil {
		return connect.NewError(connect.CodeInternal, err)
	}
	tokenStr := strings.TrimPrefix(authHeader, prefix)
	_, err = jwt.Parse(tokenStr, jwks.Keyfunc, jwt.WithValidMethods([]string{"RS256"}))
	if err != nil {
		return connect.NewError(connect.CodeUnauthenticated, err)
	}
	return nil
}

const (
	defaultPageSize = 20
	maxPageSize     = 100
)

func clampPageSize(size int) int {
	if size <= 0 {
		return defaultPageSize
	}
	if size > maxPageSize {
		return maxPageSize
	}
	return size
}

type YoServer struct {
	store domain.GreetingStore
}

func (s *YoServer) SayYo(ctx context.Context, req *connect.Request[yov1.YoRequest]) (*connect.Response[yov1.YoResponse], error) {
	if err := requireAuth(req.Header().Get("Authorization")); err != nil {
		return nil, err
	}
	message, err := domain.Greet(ctx, req.Msg.Name, s.store)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&yov1.YoResponse{Message: message}), nil
}

func (s *YoServer) ListGreetingTypeStats(ctx context.Context, req *connect.Request[yov1.ListGreetingTypeStatsRequest]) (*connect.Response[yov1.ListGreetingTypeStatsResponse], error) {
	offset, err := pagination.DecodeCursor(req.Msg.PageToken)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	limit := clampPageSize(int(req.Msg.PageSize))
	items, nextCursor, err := s.store.ListGreetingTypeStats(ctx, limit, pagination.EncodeCursor(offset))
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	pbItems := make([]*yov1.GreetingTypeStat, len(items))
	for i, it := range items {
		pbItems[i] = &yov1.GreetingTypeStat{GreetingType: it.GreetingType, Count: it.Count}
	}
	return connect.NewResponse(&yov1.ListGreetingTypeStatsResponse{
		GreetingTypes: pbItems,
		NextPageToken: nextCursor,
	}), nil
}

func (s *YoServer) ListGreetedNames(ctx context.Context, req *connect.Request[yov1.ListGreetedNamesRequest]) (*connect.Response[yov1.ListGreetedNamesResponse], error) {
	offset, err := pagination.DecodeCursor(req.Msg.PageToken)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	limit := clampPageSize(int(req.Msg.PageSize))
	items, nextCursor, err := s.store.ListGreetedNames(ctx, limit, pagination.EncodeCursor(offset))
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	pbItems := make([]*yov1.NameFrequency, len(items))
	for i, it := range items {
		pbItems[i] = &yov1.NameFrequency{Name: it.Name, Count: it.Count}
	}
	return connect.NewResponse(&yov1.ListGreetedNamesResponse{
		Names:         pbItems,
		NextPageToken: nextCursor,
	}), nil
}

// Handler is the Vercel entrypoint for the Yo service.
func Handler(w http.ResponseWriter, r *http.Request) {
	store, err := postgres.NewPostgresGreetingStore()
	if err != nil {
		log.Printf("yo: failed to create store: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	mux := http.NewServeMux()
	server := &YoServer{store: store}
	_, h := yoconnect.NewYoServiceHandler(server)
	mux.Handle("/", h)
	mux.ServeHTTP(w, r)
}
