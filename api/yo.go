package handler

import (
	"context"
	"net/http"

	"connectrpc.com/connect"
	"github.com/maybecake/stacks/lib/adapters/mock"
	"github.com/maybecake/stacks/lib/domain"
	yov1 "github.com/maybecake/stacks/gen/go/yo"
	"github.com/maybecake/stacks/gen/go/yo/yoconnect"
)

type YoServer struct {
	store domain.GreetingStore
}

func (s *YoServer) SayYo(ctx context.Context, req *connect.Request[yov1.YoRequest]) (*connect.Response[yov1.YoResponse], error) {
	message, err := domain.Greet(ctx, req.Msg.Name, s.store)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&yov1.YoResponse{Message: message}), nil
}

// Handler is the Vercel entrypoint for the Yo service.
func Handler(w http.ResponseWriter, r *http.Request) {
	mux := http.NewServeMux()
	server := &YoServer{store: &mock.MockGreetingStore{}}
	_, h := yoconnect.NewYoServiceHandler(server)
	mux.Handle("/", h)
	mux.ServeHTTP(w, r)
}
