package main

import (
	"fmt"
	"github-issue-tracker/api"
	"github-issue-tracker/datastore"
	"github-issue-tracker/services"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	server := buildServer()

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./public")))

	api.HandlerFromMuxWithBaseURL(server, mux, "/api")

	handler := stripTrailingSlash(mux)

	s := &http.Server{
		Handler: handler,
		Addr:    "0.0.0.0:8080",
	}

	fmt.Println("Starting server on :8080...")
	log.Fatal(s.ListenAndServe())
}

func stripTrailingSlash(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && strings.HasSuffix(r.URL.Path, "/") {
			r.URL.Path = strings.TrimSuffix(r.URL.Path, "/")
		}
		next.ServeHTTP(w, r)
	})
}

func buildServer() *api.Server {
	store := buildDataStore()
	provider := buildStatusProvider()
	issueService := services.NewIssueService(store, provider)

	return api.NewServer(issueService)
}

func buildDataStore() datastore.IssueStore {
	storeType := os.Getenv("ISSUE_STORE_TYPE")

	var store datastore.IssueStore
	switch storeType {
	case "memory", "":
		store = datastore.NewMemoryIssueStore()
	case "json-file":
		jsonPath := os.Getenv("ISSUE_STORE_PATH")
		if jsonPath == "" {
			jsonPath = "./.data/issues.json"
		}
		store = datastore.NewJsonIssueStore(jsonPath)
	default:
		log.Fatalf("Unknown ISSUE_STORE_TYPE: %s", storeType)
		return nil
	}
	return store
}

func buildStatusProvider() services.StatusProvider {
	statusProviderType := os.Getenv("STATUS_PROVIDER_TYPE")

	var provider services.StatusProvider
	switch statusProviderType {
	case "github", "":
		provider = services.NewGithubStatusProvider()
	case "stub":
		provider = services.NewStubStatusProvider()
	default:
		log.Fatalf("Unknown STATUS_PROVIDER_TYPE: %s", statusProviderType)
		return nil
	}
	return provider
}
