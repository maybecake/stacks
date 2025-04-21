from concurrent import futures
import grpc
import hello_service_pb2
import hello_service_pb2_grpc

class HelloService(hello_service_pb2_grpc.HelloServiceServicer):
    def SayHello(self, request, context):
        return hello_service_pb2.HelloResponse(
            message=f"Hello, {request.name}!"
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    hello_service_pb2_grpc.add_HelloServiceServicer_to_server(
        HelloService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve() 