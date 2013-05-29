/// <reference path="../../../_typings.d.ts" />

import op = module('../operations');
import inf = module('../interfaces');
import tree = module('../tree');
import l = module('../layout');
import testUtil = module('../../testUtil');

export function testGroupBoxesNone(test) {
	var group = op.groupBoxes(null, [], '');
	test.equal(group, null);
	test.done();
}

export function testGroupBoxesSingle(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
	};
	var layout = new l.Layout(root);
	var group = op.groupBoxes(layout, [root], 'group');
	test.strictEqual(group, null);

	test.done();
}

export function testGroupBoxesDifferentParents(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			children: [{
			}]
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var box2 = root.children[0].children[0];

	test.throws(() => {
		op.groupBoxes(layout, [box1, box2], '');
	});

	test.done();
}

export function testGroupBoxesAlreadyGrouped(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
		}, {
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var box2 = root.children[1];

	var group = op.groupBoxes(layout, [box1, box2], '');
	test.strictEqual(group, null);

	test.done();
}

export function testGroupBoxesMultiple(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(50),
			h: inf.px(50),
			absolute: {
				l: inf.px(10),
				t: inf.px(10),
			}
		}, {
			w: inf.px(30),
			h: inf.px(50),
			absolute: {
				l: inf.px(50),
				t: inf.px(20),
			}
		}, {
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var rect1 = layout.getRect(box1);
	var box2 = root.children[1];
	var rect2 = layout.getRect(box2);
	var box3 = root.children[2];

	var group = op.groupBoxes(layout, [box1, box2], 'group');

	test.strictEqual(group.parent, root);
	test.strictEqual(root.children.length, 2);
	test.strictEqual(root.children[0], group);
	test.strictEqual(root.children[1], box3);

	test.strictEqual(group.children.length, 2);
	test.strictEqual(group.children[0], box1);
	test.strictEqual(group.children[1], box2);
	test.strictEqual(box1.parent, group);
	test.strictEqual(box2.parent, group);
	testUtil.equals(test, rect1, layout.getRect(box1));
	testUtil.equals(test, rect2, layout.getRect(box2));

	test.done();
}
