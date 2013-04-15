/// <reference path="../../_typings.d.ts" />

/**
 * Yes, testTestUtil. This tests the util used for tests. Yo, dawg.
 *
 * This is really just to boost the code coverage.
 */

import testUtil = module('../testUtil');

export function testEquals(test) {
	function mockTest() {
		var result: bool = true;
		return {
			ok: (value) => {
				if (!value)
					result = false;
			},
			strictEqual: (one, two) => {
				if (one !== two)
					result = false;
			},
			getResult: () => {
				return result;
			}
		};
	}
	var mock = mockTest();
	testUtil.equals(mock, {}, {});
	test.equal(mock.getResult(), true);

	var mock = mockTest();
	testUtil.equals(mock, {a: 1}, {a: 1});
	test.equal(mock.getResult(), true);

	var mock = mockTest();
	testUtil.equals(mock, {a: [1,2]}, {a: [1,2]});
	test.equal(mock.getResult(), true);

	var mock = mockTest();
	testUtil.equals(mock,
					{a: [1,2], b: {c: 3, d: 4}},
					{a: [1,2], b: {c: 3, d: 4}});
	test.equal(mock.getResult(), true);

	var mock = mockTest();
	testUtil.equals(mock, {a: 1}, {});
	test.equal(mock.getResult(), false);

	var mock = mockTest();
	testUtil.equals(mock, {}, {a: 1});
	test.equal(mock.getResult(), false);

	test.done();
}
