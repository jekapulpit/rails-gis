package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"../api/v1"
	"../api/points"
	"../api/user"
	"compress/flate"
)

// HelloWorld is a sample handler
func HelloWorld(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello world!")
}

// NewRouter returns a new HTTP handler that implements the main server routes
func NewRouter() http.Handler {
	router := chi.NewRouter()

	// Set up our middleware with sane defaults
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	//router.Use(middleware.DefaultCompress)
	
	compressor := middleware.NewCompressor(flate.DefaultCompression)
	router.Use(compressor.Handler)
	
	router.Use(middleware.Timeout(60 * time.Second))
	//Set up our API
	router.Mount("/api/v1/", v1.NewRouter())
	router.Mount("/user/", user.NewRouter())
	router.Mount("/points/", points.NewRouter())

	// Set up static file serving
	fs := http.FileServer(http.Dir("static"))
	router.Handle("/static/", http.StripPrefix("/static/", fs))

	return router
}
