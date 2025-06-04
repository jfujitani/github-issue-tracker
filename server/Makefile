.phony: build

build: generate
	go build

generate:
	go generate ./...
	@echo "server Makefile will not copy new openApi.yaml file"
	@echo "run root Makefile to retrieve new spec."
	$(warning server ********************************************)
	@echo "***************************************************************"

test: build docker
	go test ./... -v

test_short: build
	go test ./... -v --short

# go test: run tests, ./... searches pattern, -v: verbose, 
# -run ^TestIntegration : only test starting with TestIntegration (test name not filename)
test_integration: build docker
	go test ./... -v -run ^TestIntegration

docker: build 
	docker build -t github-issue-tracker .
