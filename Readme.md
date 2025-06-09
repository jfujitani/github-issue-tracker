# Project Build Flow

```mermaid
flowchart TD
    A[all] --> B[test]
    B --> C[build]
    B --> D[docker]
    B --> E[go test ./server/... -v]
    C --> F[generate]
    F --> G[mkdir -p server/.build]
    F --> H[cp ./api/openApi.yaml ./server/.build/openApi.yaml]
    F --> I[go generate ./server/...]
    D --> J[docker build -t github-issue-tracker ./]
    K[test_short] --> C
    K --> L[go test ./server/... -v -short]
    M[test_integration] --> C
    M --> D
    M --> N[go test ./server/... -v -run ^TestIntegration]
```

- **all**: Runs `test`
- **test**: Depends on `build` and `docker`, then runs all tests
- **build**: Depends on `generate`, then builds the server
- **generate**: Prepares build directory, copies OpenAPI spec, runs code generation
- **test_short**: Runs short tests after build
- **test_integration**: Runs integration tests after build and docker
- **docker**: Builds Docker image

```

```
