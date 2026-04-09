package main

// A simple standalong golang server.
// This is unrelated to the deployed vercel services, which use serverless functions.

import (
	"context"
	"log"
	"net/http"

	"connectrpc.com/connect"

	hellogen "github.com/maybecake/stacks/gen/go"
	"github.com/maybecake/stacks/gen/go/helloconnect"
	"github.com/maybecake/stacks/lib/adapters/mock"
	"github.com/maybecake/stacks/lib/domain"
	"github.com/maybecake/stacks/lib/pagination"
)

const (
	defaultPageSize = 20
	maxPageSize     = 100
)

type helloServer struct {
	store domain.GreetingStore
}

func (s *helloServer) SayHello(ctx context.Context, req *connect.Request[hellogen.HelloRequest]) (*connect.Response[hellogen.HelloResponse], error) {
	_ = s.store.RecordGreeting(ctx, "hello", req.Msg.Name)
	return connect.NewResponse(&hellogen.HelloResponse{Message: "Hello, " + req.Msg.Name + "!"}), nil
}

func (s *helloServer) ListGreetingTypeStats(ctx context.Context, req *connect.Request[hellogen.ListGreetingTypeStatsRequest]) (*connect.Response[hellogen.ListGreetingTypeStatsResponse], error) {
	limit := clampPageSize(int(req.Msg.PageSize))
	offset, err := pagination.DecodeCursor(req.Msg.PageToken)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	items, nextCursor, err := s.store.ListGreetingTypeStats(ctx, limit, pagination.EncodeCursor(offset))
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	pbItems := make([]*hellogen.GreetingTypeStat, len(items))
	for i, it := range items {
		pbItems[i] = &hellogen.GreetingTypeStat{GreetingType: it.GreetingType, Count: it.Count}
	}
	return connect.NewResponse(&hellogen.ListGreetingTypeStatsResponse{
		GreetingTypes: pbItems,
		NextPageToken: nextCursor,
	}), nil
}

func (s *helloServer) ListGreetedNames(ctx context.Context, req *connect.Request[hellogen.ListGreetedNamesRequest]) (*connect.Response[hellogen.ListGreetedNamesResponse], error) {
	limit := clampPageSize(int(req.Msg.PageSize))
	offset, err := pagination.DecodeCursor(req.Msg.PageToken)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	items, nextCursor, err := s.store.ListGreetedNames(ctx, limit, pagination.EncodeCursor(offset))
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	pbItems := make([]*hellogen.NameFrequency, len(items))
	for i, it := range items {
		pbItems[i] = &hellogen.NameFrequency{Name: it.Name, Count: it.Count}
	}
	return connect.NewResponse(&hellogen.ListGreetedNamesResponse{
		Names:         pbItems,
		NextPageToken: nextCursor,
	}), nil
}

func clampPageSize(size int) int {
	if size <= 0 {
		return defaultPageSize
	}
	if size > maxPageSize {
		return maxPageSize
	}
	return size
}

func main() {
	mux := http.NewServeMux()
	path, handler := helloconnect.NewHelloServiceHandler(&helloServer{store: &mock.MockGreetingStore{}})
	mux.Handle(path, handler)
	log.Println("Connect server listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
