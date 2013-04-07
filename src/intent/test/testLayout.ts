/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import layout = module('../layout');
import testUtil = module('../../testUtil');

export function testEffectiveChildren(test) {
	var root: inf.Box = {
		id: 'root',
		children: [{
			id: '0',
			w: inf.px(0),
		}, {
			id: '1',
			w: inf.shrink,
			children: [{
				id: '1.1',
				w: inf.px(0),
			}, {
				id: '1.2',
				w: inf.prt(1),
				children: [{
					id: '1.2.1',
					w: inf.px(0)
				}]
			}, {
				id: '1.3',
				w: inf.shrink,
				children: [{
					id: '1.3.1',
					w: inf.prt(1),
				}]
			}]
		}, {
			id: '2',
			w: inf.px(0),
		}, {
			id: '3',
			absolute: {
				l: inf.px(0)
			}
		}]
	};

	var result = layout.effectiveChildren(root, inf.Direction.HORIZONTAL);
	var expectedIds = ['0', '1.1', '1.2', '1.3.1', '2'];
	var actualIds = result.map((box) => box.id);
	testUtil.equals(test, actualIds, expectedIds);

	var result = layout.effectiveChildren(root, inf.Direction.HORIZONTAL,
										  inf.LengthUnit.PIXELS);
	var expectedIds = ['0', '1.1', '2'];
	var actualIds = result.map((box) => box.id);
	testUtil.equals(test, actualIds, expectedIds);

	var result = layout.effectiveChildren(root, inf.Direction.HORIZONTAL,
										  inf.LengthUnit.PARTS);
	var expectedIds = ['1.2', '1.3.1'];
	var actualIds = result.map((box) => box.id);
	testUtil.equals(test, actualIds, expectedIds);

	test.done();
}

export function testGetParts(test) {
	var root: inf.Box = {
		id: 'root',
		children: [{
			id: '0',
			w: inf.px(0),
		}, {
			id: '1',
			w: inf.shrink,
			children: [{
				id: '1.1',
				w: inf.prt(1),
			}]
		}, {
			id: '2',
			w: inf.prt(2),
		}]
	};

	var parts = layout.getParts(root, inf.Direction.HORIZONTAL);
	test.strictEqual(parts, 3);

	/* Test for zeros */

	var root: inf.Box = {
		id: 'root'
	};
	var parts = layout.getParts(root, inf.Direction.HORIZONTAL);
	test.strictEqual(parts, 0);

	var root: inf.Box = {
		id: 'root',
		children: [{
			id: '1',
			w: inf.px(0)
		}]
	};
	var parts = layout.getParts(root, inf.Direction.HORIZONTAL);
	test.strictEqual(parts, 0);

	test.done();
}

export function testCompLengthPx(test) {
	var box = {
		w: inf.px(10),
		h: inf.px(20),
	};
	var l = new layout.Layout(box);
	test.strictEqual(l.compW(box), 10);
	test.strictEqual(l.compH(box), 20);

	test.done();
}

export function testCompLengthPct(test) {
	var box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.pct(0.5),
			h: inf.pct(0.3)
		}]
	};
	var l = new layout.Layout(box);
	test.strictEqual(l.compW(box.children[0]), 50);
	test.strictEqual(l.compH(box.children[0]), 30);

	test.done();
}

export function testCompLengthPrt(test) {
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.prt(2),
			h: inf.px(30),
		}, {
			w: inf.prt(3),
			h: inf.prt(2),
		}, {
			w: inf.prt(0),
			h: inf.pct(0.5),
		}]
	};
	var l = new layout.Layout(box);
	var child1 = box.children[0];
	var child2 = box.children[1];
	var child3 = box.children[2];

	test.strictEqual(l.compW(child1), 40);
	test.strictEqual(l.compW(child2), 60);
	test.strictEqual(l.compW(child3), 0);
	test.strictEqual(l.compH(child1), 30);
	test.strictEqual(l.compH(child2), 20);
	test.strictEqual(l.compH(child3), 50);

	/* Test for 0 parts */
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.prt(0),
		}]
	};
	var l = new layout.Layout(box);
	var child = box.children[0];
	test.strictEqual(l.compW(child), 0);

	test.done();
}

export function testCompExpand(test) {
	var box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(20),
		}, {
			w: inf.pct(0.3),
		}, {
			w: inf.prt(1),
		}, {
			w: inf.expand,
		}, {
			w: inf.expand,
		}]
	};
	var l = new layout.Layout(box);
	var expand1 = box.children[3];
	var expand2 = box.children[4];

	/* These are 0 because of the prt(1) */
	test.strictEqual(l.compW(expand1), 0);
	test.strictEqual(l.compW(expand2), 0);

	var child = box.children[2];
	child.w = inf.prt(0);
	test.strictEqual(l.compW(expand1), 25);
	test.strictEqual(l.compW(expand2), 25);

	test.done();
}

export function testCompShrink(test) {
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.shrink,
			children: [{
				w: inf.px(20)
			}, {
				w: inf.pct(0.3) /* of 100 */
			}, {
				w: inf.prt(1)
			}, {
				w: inf.prt(2)
			}]
		}]
	};
	var l = new layout.Layout(box);
	var child = box.children[0];
	test.strictEqual(l.compW(child), 100);

	child.children[2].w = inf.prt(0);
	child.children[3].w = inf.prt(0);
	test.strictEqual(l.compW(child), 50);

	child.children[2].w = inf.expand;
	test.strictEqual(l.compW(child), 100);

	child.children[2].w = inf.shrink;
	test.strictEqual(l.compW(child), 50);

	test.done();
}
