OUTPUT_DIR=bin

SOURCES=\
	src/extract/interfaces.ts \
	src/extract/psd.ts \
	src/extract/util.ts \
	src/extract/test/testPsd.ts \
	src/intent/interfaces.ts \
	src/intent/generator.ts \
	src/intent/iterator.ts \
	src/intent/layout.ts \
	src/intent/tree.ts \
	src/intent/util.ts \
	src/intent/test/testGenerator.ts \
	src/intent/test/testIterator.ts \
	src/intent/test/testLayout.ts \
	src/intent/test/testTree.ts \
	src/testUtil.ts \
	src/main.ts \

CC=node_modules/typescript/bin/tsc
TEST=node_modules/nodeunit/bin/nodeunit

build: deps $(OUTPUT_DIR)

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

deps: node_modules

node_modules: package.json
	npm install
	node_modules/ntspm/bin/ntspm

clean:
	rm -rf $(OUTPUT_DIR)

cleanall: clean
	rm -rf _typings.d.ts typings node_modules

.PHONY: build test debug deps clean cleanall
