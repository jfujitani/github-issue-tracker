package main

import (
	"fmt"
	"github-issue-tracker-server/api"
	"github-issue-tracker-server/datastore"
	"github-issue-tracker-server/services"
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
		store = datastore.NewJsonIssueStore("./build/issues.json")
	default:
		log.Fatalf("Unknown ISSUE_STORE_TYPE: %s", storeType)
	}
	issueService := services.NewIssueService(store)
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
