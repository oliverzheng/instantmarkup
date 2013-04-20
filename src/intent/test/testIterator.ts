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

export function testTake(test) {
	var it = gen.arrayToIter(boxes).take(0);
	test.strictEqual(it.toArray().length, 0);

	var it = gen.arrayToIter(boxes).take(2);
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['0', '1'];
	testutil.equals(test, expected, ids);

	var it = gen.arrayToIter(boxes).take(5);
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['0', '1', '2'];
	testutil.equals(test, expected, ids);

	test.done();
}

export function testTakeWhile(test) {
	var it = gen.arrayToIter(boxes).takeWhile((box) => {
		return box.id !== '2';
	});
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['0', '1'];
	testutil.equals(test, expected, ids);

	var it = gen.arrayToIter(boxes).takeWhile((box) => {
		return false;
	});
	test.strictEqual(it.toArray().length, 0);

	var it = gen.arrayToIter(boxes).takeWhile((box) => {
		return true;
	});
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['0', '1', '2'];
	testutil.equals(test, expected, ids);

	test.done();
}

export function testDrop(test) {
	var it = gen.arrayToIter(boxes).drop(0);
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['0', '1', '2'];
	testutil.equals(test, expected, ids);

	var it = gen.arrayToIter(boxes).drop(1);
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['1', '2'];
	testutil.equals(test, expected, ids);

	var it = gen.arrayToIter(boxes).drop(5);
	test.strictEqual(it.toArray().length, 0);

	test.done();
}

export function testDropWhile(test) {
	var it = gen.arrayToIter(boxes).dropWhile((box) => {
		return box.id !== '1';
	});
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['1', '2'];
	testutil.equals(test, expected, ids);

	var it = gen.arrayToIter(boxes).dropWhile((box) => {
		return false;
	});
	var ids = it.toArray().map((box) => {
		return box.id;
	});
	var expected = ['0', '1', '2'];
	testutil.equals(test, expected, ids);

	var it = gen.arrayToIter(boxes).dropWhile((box) => {
		return true;
	});
	test.strictEqual(it.toArray().length, 0);

	test.done();
}
