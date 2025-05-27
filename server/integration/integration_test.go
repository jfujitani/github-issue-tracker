package integration

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestIntegrationWithDocker(t *testing.T) {
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
	url := fmt.Sprintf("http://%s:%s/api/issues", host, port.Port())

	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("failed to call /api/issues: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200 OK, got %d", resp.StatusCode)
	}
}
