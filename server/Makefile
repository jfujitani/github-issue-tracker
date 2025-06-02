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
	go test -v ./...

test_integration: build docker
	go test -v ./integration

docker: build 
	docker build -t github-issue-tracker .
