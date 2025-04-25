package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	pb "com.github/maybecake/stacks/api/protos/hello"
)

type server struct {
	pb.UnimplementedHelloServiceServer
}

func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloResponse, error) {
	return &pb.HelloResponse{Message: "Hello, " + in.Name + "!"}, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterHelloServiceServer(s, &server{})
	// Register reflection service on gRPC server
	reflection.Register(s)
	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
