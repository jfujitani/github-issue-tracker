# Project Build Flow

```mermaid
flowchart TD
    A[all] --> B[test]
    B --> C[build]
    B --> D[docker]
    C --> E[generate]
    E --> F[mkdir -p server/.build]
    E --> G[cp ./api/openApi.yaml ./server/.build/openApi.yaml]
    E --> H[go generate ./server/...]
    D --> I[docker build -t github-issue-tracker ./]
    J[test_short] --> C
    J --> K[go test ./server/... -v -short]
    L[test_integration] --> C
    L --> D
    L --> M[go test ./server/... -v -run ^TestIntegration]
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
