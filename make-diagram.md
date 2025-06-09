# Project Build Flow

```mermaid
flowchart TD
    D[test] --> A[all]
    C[generate] --> B[build]
    B --> B0[go build -o ./server ./server]
    C --> C0[mkdir -p server/.build]
    C --> C1[cp ./api/openApi.yaml ./server/.build/openApi.yaml]
    C --> C2[go generate ./server/...]
    B[build] --> D[test]
    G[docker] --> D[test]
    D --> D0[go test ./server/... -v]
    B[build] --> E[test_short]
    E --> E0[go test ./server/... -v -short]
    B[build] --> F[test_integration]
    G[docker] --> F[test_integration]
    F --> F0[go test ./server/... -v -run ^TestIntegration]
    G --> G0[docker build -t github-issue-tracker ./]
```

- **all**: No recipe
- **build**: Runs `go build -o ./server ./server`
- **generate**: Runs `mkdir -p server/.build; cp ./api/openApi.yaml ./server/.build/openApi.yaml; go generate ./server/...`
- **test**: Runs `go test ./server/... -v`
- **test_short**: Runs `go test ./server/... -v -short`
- **test_integration**: Runs `go test ./server/... -v -run ^TestIntegration`
- **docker**: Runs `docker build -t github-issue-tracker ./`
