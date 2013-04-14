/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import gen = module('../generator');
import iter = module('../iterator');
import testutil = module('../../testUtil');

var boxes: inf.Box[] = [{
	id: '0'
}, {
	id: '1'
}, {
	id: '2'
}];

export function testToArray(test) {
	var it = gen.arrayToIter(boxes);
	var array = it.toArray();

	testutil.equals(test, boxes, array);

	test.done();
}

export function testFirst(test) {
	var it = gen.arrayToIter(boxes);
	var box = it.first();
	test.strictEqual(box.id, '0');

	var it = gen.arrayToIter(boxes);
	var box = it.first((box) => {
		return box.id === '2';
	});
	test.strictEqual(box.id, '2');

	var it = gen.arrayToIter(boxes);
	var box = it.first((box) => {
		return false;
	});
	test.equal(box, null);

	test.done();
}

export function testForEach(test) {
	var it = gen.arrayToIter(boxes);
	var count = 0;
	it.forEach((box: inf.Box, i: number) => {
		count++;
		test.strictEqual(box.id, i.toString());
	});
	test.strictEqual(count, 3);

	test.done();
}

export function testFilter(test) {
	var it = gen.arrayToIter(boxes);
	var it2 = it.filter((box: inf.Box) => {
		return box.id === '0' || box.id === '2';
	});
	var ids = it2.toArray().map((box) => {
		return box.id;
	});
	var expected = ['0', '2'];
	testutil.equals(test, expected, ids);

	test.done();
}
