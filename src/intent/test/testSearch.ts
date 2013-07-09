/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import layout = module('../layout');
import gen = module('../generator');
import tree = module('../tree');
import search = module('../search');
import testUtil = module('../../testUtil');

export function testBoxOverlaps(test) {
	var root = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(0),
				t: inf.px(0),
			}
		}, {
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(10),
				t: inf.px(0),
			}
		}, {
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(15),
				t: inf.px(0),
			}
		}, {
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(0),
				t: inf.px(20),
			}
		}, {
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(0),
				t: inf.px(30),
			}
		}, {
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(10),
				t: inf.px(20),
			}
		}, {
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(0),
				t: inf.px(50),
			}
		}, {
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(5),
				t: inf.px(45),
			}
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	test.equal(search.boxOverlaps(l, root.children[0], root.children[1]), false);
	test.equal(search.boxOverlaps(l, root.children[1], root.children[0]), false);
	test.equal(search.boxOverlaps(l, root.children[1], root.children[2]), true);
	test.equal(search.boxOverlaps(l, root.children[2], root.children[1]), true);
	test.equal(search.boxOverlaps(l, root.children[0], root.children[2]), false);
	test.equal(search.boxOverlaps(l, root.children[2], root.children[0]), false);

	test.equal(search.boxOverlaps(l, root.children[3], root.children[4]), false);
	test.equal(search.boxOverlaps(l, root.children[4], root.children[3]), false);
	test.equal(search.boxOverlaps(l, root.children[3], root.children[5]), false);
	test.equal(search.boxOverlaps(l, root.children[5], root.children[3]), false);

	test.equal(search.boxOverlaps(l, root.children[6], root.children[7]), true);
	test.equal(search.boxOverlaps(l, root.children[7], root.children[6]), true);

	test.done();
}

export function testGetTopMost(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: '1',
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(0),
				t: inf.px(0),
			}
		}, {
			id: '2',
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(0),
				t: inf.px(5),
			}
		}, {
			id: '3',
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(10),
				t: inf.px(10),
			}
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	var expectedIds = ['1', '3'];
	var actualIds: string[] = [];
	search.getTopMost(l, l.root).forEach((box) => {
		actualIds.push(box.id);
	});
	testUtil.equals(test, expectedIds, actualIds);

	var expectedIds = ['2', '3'];
	var actualIds: string[] = [];
	search.getTopMost(l, l.root, [root.children[0]]).forEach((box) => {
		actualIds.push(box.id);
	});
	testUtil.equals(test, expectedIds, actualIds);

	test.done()
}

export function testSortByDirection(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: '1',
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(50),
				t: inf.px(50),
			}
		}, {
			id: '2',
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(0),
				t: inf.px(0),
			}
		}, {
			id: '3',
			w: inf.px(10),
			h: inf.px(10),
			absolute: {
				l: inf.px(10),
				t: inf.px(10),
			}
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	var sorted = search.sortByDirection(l, root.children,
										inf.Direction.HORIZONTAL);
	var ids = sorted.map((box) => {
		return box.id;
	});
	var expected = ['2', '3', '1'];
	testUtil.equals(test, ids, expected);

	test.done();
}

export function testFindContainment(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		direction: inf.Direction.VERTICAL,
		children: [{
			id: '1',
			w: inf.px(20),
			h: inf.px(20),
		}, {
			id: '2',
			w: inf.px(20),
			h: inf.px(20),
		}, {
			id: '3',
			w: inf.px(20),
			h: inf.px(20),
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	function expect(rect: inf.Rect,
					within: bool, partial: bool, contained: bool,
					expected: string[]) {
		var ids: string[] = [];
		search.findContainment(l, rect,
							   within, partial, contained).forEach((box) => {
			ids.push(box.id);
		});
		testUtil.equals(test, expected, ids);
	}

	var rect = {
		x: 0,
		y: 0,
		w: 20,
		h: 20,
	};
	expect(rect, false, false, false, []);
	expect(rect, false, false, true, ['1', 'root']);
	expect(rect, false, true, false, []);
	expect(rect, false, true, true, ['1', 'root']);
	expect(rect, true, false, false, ['1']);
	expect(rect, true, false, true, ['1', 'root']);
	expect(rect, true, true, false, ['1']);
	expect(rect, true, true, true, ['1', 'root']);

	var rect = {
		x: 0,
		y: 0,
		w: 30,
		h: 30,
	};
	expect(rect, false, false, false, []);
	expect(rect, false, false, true, ['root']);
	expect(rect, false, true, false, ['2']);
	expect(rect, false, true, true, ['2', 'root']);
	expect(rect, true, false, false, ['1']);
	expect(rect, true, false, true, ['1', 'root']);
	expect(rect, true, true, false, ['1', '2']);
	expect(rect, true, true, true, ['1', '2', 'root']);

	var rect = {
		x: 0,
		y: 20,
		w: 10,
		h: 10,
	};
	expect(rect, false, false, false, []);
	expect(rect, false, false, true, ['2', 'root']);
	expect(rect, false, true, false, []);
	expect(rect, false, true, true, ['2', 'root']);
	expect(rect, true, false, false, []);
	expect(rect, true, false, true, ['2', 'root']);
	expect(rect, true, true, false, []);
	expect(rect, true, true, true, ['2', 'root']);

	var rect = {
		x: 5,
		y: 30,
		w: 5,
		h: 5,
	};
	expect(rect, false, false, false, []);
	expect(rect, false, false, true, ['2', 'root']);
	expect(rect, false, true, false, []);
	expect(rect, false, true, true, ['2', 'root']);
	expect(rect, true, false, false, []);
	expect(rect, true, false, true, ['2', 'root']);
	expect(rect, true, true, false, []);
	expect(rect, true, true, true, ['2', 'root']);

	var rect = {
		x: 0,
		y: 0,
		w: 20,
		h: 60,
	};
	expect(rect, false, false, false, []);
	expect(rect, false, false, true, ['root']);
	expect(rect, false, true, false, []);
	expect(rect, false, true, true, ['root']);
	expect(rect, true, false, false, ['1', '2', '3']);
	expect(rect, true, false, true, ['1', '2', '3', 'root']);
	expect(rect, true, true, false, ['1', '2', '3']);
	expect(rect, true, true, true, ['1', '2', '3', 'root']);

	test.done();
}
