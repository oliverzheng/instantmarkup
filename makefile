OUTPUT_DIR=bin

SOURCES=\
	src/extract/interfaces.ts \
	src/extract/psd.ts \
	src/extract/util.ts \
	src/extract/test/testPsd.ts \
	src/intent/interfaces.ts \
	src/intent/util.ts \
	src/intent/test/testUtil.ts \
	src/testUtil.ts \
	src/main.ts \

CC=node_modules/typescript/bin/tsc
TEST=node_modules/nodeunit/bin/nodeunit

build: $(OUTPUT_DIR)

# There is no dependency detection yet. Each incremental build is a full build.
$(OUTPUT_DIR): $(SOURCES) makefile
	@rm -rf $(OUTPUT_DIR)
	@mkdir -p $(OUTPUT_DIR)
	@echo -n Compiling...
	@$(CC) --declaration --out $(OUTPUT_DIR) $(SOURCES)
	@echo ' Done'

test: build
	@$(TEST) $(shell find $(OUTPUT_DIR) -ipath */test/test*.js)

debug: build
	@node debug $(TEST) $(shell find $(OUTPUT_DIR) -ipath */test/test*.js)

typings:
	node_modules/ntspm/bin/ntspm

clean:
	rm -rf $(OUTPUT_DIR)

.PHONY: build test debug typings clean
