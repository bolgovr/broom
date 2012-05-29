REPORTER_APP = list
ALL_TESTS = test/*.js

test:
		@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER_APP) \
		$(ALL_TESTS)

.PHONY: all test clean
