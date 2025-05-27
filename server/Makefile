.phony: build

build: generate
	go build ./...

generate:
	go generate ./...

test: build 
	go test -v ./...

test_integration: build
	go test -v ./integration

docker: build test_all
	docker build -t github-issue-tracker .
