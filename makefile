OUTPUT_DIR=bin

SOURCES=\
	src/extract/interfaces.ts \
	src/extract/psd.ts \
	src/extract/test/test_psd.ts \
	src/test-util.ts \
	src/main.ts \

CC=node_modules/typescript/bin/tsc
TEST=node_modules/nodeunit/bin/nodeunit

build: $(OUTPUT_DIR)

$(OUTPUT_DIR): $(SOURCES)
	@rm -rf $(OUTPUT_DIR)
	@mkdir -p $(OUTPUT_DIR)
	@echo -n Compiling...
	@$(CC) --declaration --out $(OUTPUT_DIR) $(SOURCES)
	@echo ' Done'

test: build
	@$(TEST) $(shell find $(OUTPUT_DIR) -ipath */test/*.js)

debug: build
	@node debug $(TEST) $(shell find $(OUTPUT_DIR) -ipath *test*.js)

clean:
	rm -rf $(OUTPUT_DIR)

.PHONY: build test clean
