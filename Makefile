.PHONY: build test test_integration generate docker

build: generate 
	$(MAKE) -C server build

generate:
	mkdir -p server/.build
	cp ./api/openApi.yaml ./server/.build/openApi.yaml
	$(MAKE) -C server generate 

test: build
	$(MAKE) -C server test 

test_integration: build
	$(MAKE) -C server test_integration 

docker: build
	$(MAKE) -C server docker 
