/// <reference path="../../../_typings.d.ts" />

import op = module('../operations');
import inf = module('../interfaces');
import tree = module('../tree');
import l = module('../layout');
import testUtil = module('../../testUtil');

export function testGroupChildrenNone(test) {
	var group = op.groupChildren(null, [], '');
	test.equal(group, null);
	test.done();
}

export function testGroupChildrenSingle(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
	};
	var layout = new l.Layout(root);
	var group = op.groupChildren(layout, [root], 'group');
	test.strictEqual(group, null);

	test.done();
}

export function testGroupChildrenDifferentParents(test) {
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
		op.groupChildren(layout, [box1, box2], '');
	});

	test.done();
}

export function testGroupChildrenAlreadyGrouped(test) {
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

	var group = op.groupChildren(layout, [box1, box2], '');
	test.strictEqual(group, null);

	test.done();
}

export function testGroupChildrenMultiple(test) {
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

	var group = op.groupChildren(layout, [box1, box2], 'group');

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

export var group = {
	setUp: function(callback) {
		this.root = {
			id: 'root',
			w: inf.px(100),
			h: inf.px(100),
			children: [{
				id: 'parent1',
				children: [{
					id: 'child1',
				}]
			}, {
				id: 'parent2',
				children: [{
					id: 'child2',
				}]
			}],
		};
		this.parent1 = this.root.children[0];
		this.parent2 = this.root.children[1];
		this.child1 = this.root.children[0].children[0];
		this.child2 = this.root.children[1].children[0];

		tree.refreshParents(this.root);
		this.layout = new l.Layout(this.root);

		callback();
	},

	testOrphanBox: function(test) {
		var parent = this.child1.parent;
		test.strictEqual(op.orphanBox(this.child1), parent);

		test.equal(this.child1.parent, null);
		test.strictEqual(parent.children.length, 0);

		test.equal(op.orphanBox({}), null);

		test.done();
	},
};
