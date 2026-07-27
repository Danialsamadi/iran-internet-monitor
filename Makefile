BIN := bin/monitor

.PHONY: build test run run-once cron clean

build:
	go build -o $(BIN) ./cmd/monitor

test:
	go test ./...

## one full pass (checks + LLM + git commit/push)
run: build
	./$(BIN) -repo .

## one pass without Ollama or git — for local testing
run-once: build
	./$(BIN) -repo . -no-llm -no-git

## print the crontab line for this checkout
cron: build
	@echo '*/10 * * * * cd $(CURDIR) && ./$(BIN) -repo . >> monitor.log 2>&1'

clean:
	rm -rf bin
