package handler

import (
	"context"
	"fmt"
	"net/http"

	"connectrpc.com/connect"
	yov1 "github.com/maybecake/stacks/gen/go/yo"
	"github.com/maybecake/stacks/gen/go/yo/yoconnect"
)

type yoServer struct{}

func (s *yoServer) SayYo(_ context.Context, req *connect.Request[yov1.YoRequest]) (*connect.Response[yov1.YoResponse], error) {
	return connect.NewResponse(&yov1.YoResponse{
		Message: fmt.Sprintf("Yo, %s!", req.Msg.Name),
	}), nil
}

func Yo(w http.ResponseWriter, r *http.Request) {
	mux := http.NewServeMux()
	_, h := yoconnect.NewYoServiceHandler(&yoServer{})
	mux.Handle("/", h)
	mux.ServeHTTP(w, r)
}
