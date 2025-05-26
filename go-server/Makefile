.phony: build

build: generate
	go build ./...

generate:
	go generate ./...

docker: build
	docker build -t github-issue-tracker .
