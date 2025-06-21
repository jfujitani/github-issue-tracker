package main_test

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestIntegrationWithDocker(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	ctx := context.Background()
	req := testcontainers.ContainerRequest{
		Image:        "github-issue-tracker",
		ExposedPorts: []string{"8080/tcp"},
		Env: map[string]string{
			"ISSUE_STORE_TYPE":     "memory",
			"STATUS_PROVIDER_TYPE": "stub",
		},
		WaitingFor: wait.ForListeningPort("8080/tcp"),
	}
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("failed to start container: %v", err)
	}
	defer container.Terminate(ctx)

	// ... your integration test logic here ...
	host, err := container.Host(ctx)
	if err != nil {
		t.Fatalf("failed to get container host: %v", err)
	}
	port, err := container.MappedPort(ctx, "8080")
	if err != nil {
		t.Fatalf("failed to get mapped port: %v", err)
	}

	baseURL := fmt.Sprintf("http://%s:%s/api/issues", host, port.Port())

	// 1. GET /api/issues should return empty array
	resp, err := http.Get(baseURL)
	if err != nil {
		t.Fatalf("failed to GET /api/issues: %v", err)
	}
	defer resp.Body.Close()
	var issues []map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&issues); err != nil {
		t.Fatalf("failed to decode issues: %v", err)
	}
	if len(issues) != 0 {
		t.Errorf("expected no issues, got %d", len(issues))
	}

	// 2. POST /api/issues to create an issue
	payload := `{"url":"https://github.com/jfujitani/github-issue-tracker/issues/1234"}`
	resp, err = http.Post(baseURL, "application/json", strings.NewReader(payload))
	if err != nil {
		logs, _ := container.Logs(ctx)
		logContent, _ := io.ReadAll(logs)
		t.Logf("container logs:\n%s", logContent)
		t.Fatalf("failed to POST /api/issues: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 201 Created or 200 OK, got %d", resp.StatusCode)
	}
	var created map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatalf("failed to decode created issue: %v", err)
	}
	id, ok := created["id"].(string)
	if !ok || id == "" {
		t.Fatalf("expected created issue to have an id, got %v", created)
	}

	// 3. GET /api/issues should return the new issue
	resp, err = http.Get(baseURL)
	if err != nil {
		t.Fatalf("failed to GET /api/issues: %v", err)
	}
	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&issues); err != nil {
		t.Fatalf("failed to decode issues: %v", err)
	}
	if len(issues) != 1 {
		t.Errorf("expected 1 issue, got %d", len(issues))
	}

	// 4. GET /api/issues/{id} should return the created issue
	issueURL := fmt.Sprintf("%s/%s", baseURL, id)
	resp, err = http.Get(issueURL)
	if err != nil {
		t.Fatalf("failed to GET /api/issues/%s: %v", id, err)
	}
	defer resp.Body.Close()
	var fetched map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&fetched); err != nil {
		t.Fatalf("failed to decode fetched issue: %v", err)
	}
	if fetched["id"] != id {
		t.Errorf("expected fetched issue id %s, got %v", id, fetched["id"])
	}

	// 5. DELETE /api/issues/{id}
	reqDel, err := http.NewRequest(http.MethodDelete, issueURL, nil)
	if err != nil {
		t.Fatalf("failed to create DELETE request: %v", err)
	}
	resp, err = http.DefaultClient.Do(reqDel)
	if err != nil {
		t.Fatalf("failed to DELETE /api/issues/%s: %v", id, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 204 No Content or 200 OK, got %d", resp.StatusCode)
	}

	// 6. GET /api/issues should return empty array again
	resp, err = http.Get(baseURL)
	if err != nil {
		t.Fatalf("failed to GET /api/issues: %v", err)
	}
	defer resp.Body.Close()
	if err := json.NewDecoder(resp.Body).Decode(&issues); err != nil {
		t.Fatalf("failed to decode issues: %v", err)
	}
	if len(issues) != 0 {
		t.Errorf("expected no issues after delete, got %d", len(issues))
	}

	// 7. POST /api/issues with invalid payload should return 400 Bad Request
	resp, err = http.Post(baseURL, "application/json", strings.NewReader(`{"bad":"data"}`))
	if err != nil {
		t.Fatalf("failed to POST invalid payload: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request for invalid payload, got %d", resp.StatusCode)
	}

	// 8. GET /api/issues/{nonexistent} should return 404 Not Found
	nonexistentURL := fmt.Sprintf("%s/%s", baseURL, "nonexistent-id")
	resp, err = http.Get(nonexistentURL)
	if err != nil {
		t.Fatalf("failed to GET nonexistent issue: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("expected 404 Not Found for nonexistent issue, got %d", resp.StatusCode)
	}
}
