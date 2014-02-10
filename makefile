BIN_DIR=bin
JS_DIR=$(BIN_DIR)/js
JS_NODTS_DIR=$(BIN_DIR)/js-nodts
JS_INST_DIR=$(BIN_DIR)/js-inst
WEB_DIR=$(BIN_DIR)/web

#TSX=\
#	src/tools/render.tsx \
#JSX=$(TSX:.tsx=.jsx)

TS=\
	src/extract/interfaces.ts \
	src/extract/psd.ts \
	src/extract/util.ts \
	src/intent/interfaces.ts \
	src/intent/generator.ts \
	src/intent/iterator.ts \
	src/intent/layout.ts \
	src/intent/operations.ts \
	src/intent/search.ts \
	src/intent/tree.ts \
	src/intent/util.ts \
	src/intent/snapshot.ts \
	src/intent/test/testGenerator.ts \
	src/intent/test/testIterator.ts \
	src/intent/test/testLayout.ts \
	src/intent/test/testOperations.ts \
	src/intent/test/testSearch.ts \
	src/intent/test/testTree.ts \
	src/intent/test/testUtil.ts \
	src/intent/test/testSnapshot.ts \
	src/intent/group/containment.ts \
	src/intent/group/partition.ts \
	src/intent/group/test/testContainment.ts \
	src/intent/group/test/testPartition.ts \
	src/test/testCoverage.ts \
	src/test/testTestUtil.ts \
	src/testUtil.ts \
	src/main.ts \


#src/extract/test/testPsd.ts \
#src/extract/test/testUtil.ts \

CC=node_modules/.bin/tsc
TEST=node_modules/.bin/nodeunit
INST=node_modules/.bin/jscoverage

RUNTEST=$(TEST) $(shell find $(JS_DIR) -ipath '*/test/test*.js')

build: deps $(JS_DIR)

# There is no dependency detection yet. Each incremental build is a full build.
$(JS_DIR): $(TS) makefile
	@rm -rf $(JS_DIR)
	@mkdir -p $(JS_DIR)
	@echo -n Compiling for node...
	@$(CC) --declaration --out $(JS_DIR) $(TS)
	@echo ' Done'

web: $(WEB_DIR)

$(WEB_DIR): $(TS) makefile
	@rm -rf $(WEB_DIR)
	@mkdir -p $(WEB_DIR)
	@echo -n Compiling for web...
	@$(CC) --module amd --out $(WEB_DIR) $(TS)
	@echo ' Done'

test: build
	@$(RUNTEST)

debug: build
	@node debug $(RUNTEST)

$(JS_INST_DIR): $(JS_DIR)
	@rm -rf $(JS_NODTS_DIR) $(JS_INST_DIR)
	@cp -r $(JS_DIR) $(JS_NODTS_DIR)
	@find $(JS_NODTS_DIR) -name '*.d.ts' -exec rm -r {} \;
	@echo -n Instrumenting...
	@$(INST) $(JS_NODTS_DIR) $(JS_INST_DIR)
	@touch $(JS_INST_DIR)
	@echo ' Done'

instrument: $(JS_INST_DIR)

coverage: instrument
	@$(TEST) --reporter minimal $(shell find $(JS_INST_DIR) -ipath '*/test/test*.js')

precheckin:
	@echo Remove 'debugger' statements:
	@grep -i -R --color 'debugger' src || echo 'None found.'
	@echo Remove 'console.log' statements:
	@grep -i -R --color 'console.log' src || echo 'None found.'

deps: node_modules

node_modules: package.json
	npm install
	node_modules/ntspm/bin/ntspm

clean:
	rm -rf $(BIN_DIR)

cleanall: clean
	rm -rf _typings.d.ts typings node_modules

.PHONY: build web test debug instrument coverage precheckin deps clean cleanall
