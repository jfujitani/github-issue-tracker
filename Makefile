.PHONY: all build generate test test_short test_integration docker

all: test

build: generate
	go build -o ./server ./server

generate:
	mkdir -p server/.build
	cp ./api/openApi.yaml ./server/.build/openApi.yaml
	go generate ./server/...

test: build docker
	go test ./server/... -v

test_short: build
	go test ./server/... -v -short

# go test: run tests, ./... searches pattern, -v: verbose, 
# -run ^TestIntegration : only test starting with TestIntegration (test name not filename)
test_integration: build docker
	go test ./server/... -v -run ^TestIntegration

docker: 
	docker build -t github-issue-tracker ./
