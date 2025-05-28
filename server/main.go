package main

import (
	"fmt"
	"github-issue-tracker/api"
	"github-issue-tracker/datastore"
	"github-issue-tracker/services"
	"log"
	"net/http"
	"os"
)

func main() {
	storeType := os.Getenv("ISSUE_STORE_TYPE")
	var store datastore.IssueStore

	switch storeType {
	case "memory", "":
		store = datastore.NewMemoryIssueStore()
	case "json-file":
		var jsonPath string
		if jsonPath := os.Getenv("ISSUE_STORE_PATH"); jsonPath == "" {
			jsonPath = "./.data/issues.json"
		}
		store = datastore.NewJsonIssueStore(jsonPath)
	default:
		log.Fatalf("Unknown ISSUE_STORE_TYPE: %s", storeType)
	}

	statusProviderType := os.Getenv("STATUS_PROVIDER_TYPE")
	var provider services.StatusProvider

	switch statusProviderType {
	case "github", "":
		provider = services.NewGithubStatusProvider()
	case "stub":
		provider = services.NewStubStatusProvider()
	}

	issueService := services.NewIssueService(store, provider)
	server := api.NewServer(issueService)

	r := http.NewServeMux()

	// TODO "/api" should be configured through openApi.yaml
	// h := api.HandlerFromMux(server, r)
	h := api.HandlerFromMuxWithBaseURL(server, r, "/api")

	s := &http.Server{
		Handler: h,
		Addr:    "0.0.0.0:8080",
	}

	fmt.Println("Starting server on :8080...")
	log.Fatal(s.ListenAndServe())
}
