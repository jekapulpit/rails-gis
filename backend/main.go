package main

import (
	"./server"
	"context"
	"fmt"
	_ "github.com/lib/pq"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func main() {
	fmt.Println("Server listen on port: 8088")
	// This is the domain the server should accept connections for.
	//domains := []string{"localhost", "localhost:8088"}
	handler := server.NewRouter()
	srv := &http.Server{
		Addr:         ":8088",
		Handler:      handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}
	// Start the server
	go func() {
		srv.ListenAndServe()
	}()

	// Wait for an interrupt
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c

	// Attempt a graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}
