/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import layout = module('../layout');
import gen = module('../generator');
import tree = module('../tree');
import stack = module('../stack');
import vs = module('../visualSnapshot');
import util = module('../util');
import testUtil = module('../../testUtil');

/**
 * Find two boxes trivially stacked on top of each other.
 */
export function testFindStacksBasic(test) {
	/* These boxes are trivially stacked, since that's how direction defines
	 * them. */
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: 'child1',
			w: inf.px(50),
			h: inf.px(50),
		}, {
			id: 'child2',
			w: inf.px(50),
			h: inf.px(50),
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	root.direction = inf.Direction.HORIZONTAL;
	var stacks = stack.findStacks(l, root.children);
	test.strictEqual(stacks.length, 1);
	test.strictEqual(stacks[0].direction, inf.Direction.HORIZONTAL);
	test.strictEqual(stacks[0].boxes.length, 2);
	test.strictEqual(stacks[0].boxes[0], root.children[0]);
	test.strictEqual(stacks[0].boxes[1], root.children[1]);

	root.direction = inf.Direction.VERTICAL;
	var stacks = stack.findStacks(l, root.children);
	test.strictEqual(stacks.length, 1);
	test.strictEqual(stacks[0].direction, inf.Direction.VERTICAL);
	test.strictEqual(stacks[0].boxes.length, 2);
	test.strictEqual(stacks[0].boxes[0], root.children[0]);
	test.strictEqual(stacks[0].boxes[1], root.children[1]);

	test.done();
}

/**
 * Find two boxes stacked on top of each other with a gap in middle.
 */
export function testFindStacksGap(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: 'child1',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				l: inf.px(0),
				t: inf.px(0),
			}
		}, {
			id: 'child2',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				l: inf.px(50),
				t: inf.px(0),
			}
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	var stacks = stack.findStacks(l, root.children);
	test.strictEqual(stacks.length, 1);
	test.strictEqual(stacks[0].direction, inf.Direction.HORIZONTAL);
	test.strictEqual(stacks[0].boxes.length, 2);
	test.strictEqual(stacks[0].boxes[0].id, 'child1');
	test.strictEqual(stacks[0].boxes[1].id, 'child2');

	test.done();
}

/**
 * Two boxes have something between them.
 */
export function testFindStacksBetween(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: 'child1',
			w: inf.px(50),
			h: inf.px(50),
		}, {
			id: 'between',
			w: inf.px(20),
			h: inf.px(20),
		}, {
			id: 'child2',
			w: inf.px(50),
			h: inf.px(50),
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	var children = [root.children[0], root.children[2]];

	root.direction = inf.Direction.HORIZONTAL;
	var stacks = stack.findStacks(l, children);
	test.strictEqual(stacks.length, 0);

	root.direction = inf.Direction.VERTICAL;
	var stacks = stack.findStacks(l, children);
	test.strictEqual(stacks.length, 0);

	test.done();
}

/**
 * There are multiple boxes that stack up.
 */
export function testFindStacksMultiple(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: 'child1',
			w: inf.px(20),
			h: inf.px(20),
		}, {
			id: 'child2',
			w: inf.px(20),
			h: inf.px(20),
		}, {
			id: 'child3',
			w: inf.px(20),
			h: inf.px(20),
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	root.direction = inf.Direction.HORIZONTAL;
	var stacks = stack.findStacks(l, root.children);
	test.strictEqual(stacks.length, 1);
	test.strictEqual(stacks[0].direction, inf.Direction.HORIZONTAL);
	test.strictEqual(stacks[0].boxes.length, 3);
	test.strictEqual(stacks[0].boxes[0], root.children[0]);
	test.strictEqual(stacks[0].boxes[1], root.children[1]);
	test.strictEqual(stacks[0].boxes[2], root.children[2]);

	root.direction = inf.Direction.VERTICAL;
	var stacks = stack.findStacks(l, root.children);
	test.strictEqual(stacks.length, 1);
	test.strictEqual(stacks[0].direction, inf.Direction.VERTICAL);
	test.strictEqual(stacks[0].boxes.length, 3);
	test.strictEqual(stacks[0].boxes[0], root.children[0]);
	test.strictEqual(stacks[0].boxes[1], root.children[1]);
	test.strictEqual(stacks[0].boxes[2], root.children[2]);

	test.done();
}

/**
 * A box can be in both the vertical and horizontal stack.
 */
export function testFindStacksConflict(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		direction: inf.Direction.HORIZONTAL,
		children: [{
			id: 'col1',
			direction: inf.Direction.VERTICAL,
			children: [{
				id: 'child1',
				w: inf.px(20),
				h: inf.px(20),
			}, {
				id: 'child2',
				w: inf.px(20),
				h: inf.px(20),
			}, {
				id: 'child3',
				w: inf.px(20),
				h: inf.px(20),
			}]
		}, {
			id: 'col2',
			direction: inf.Direction.VERTICAL,
			children: [{
				id: 'child4',
				w: inf.px(20),
				h: inf.px(20),
			}]
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	var stacks = stack.findStacks(l, gen.depthFirst(root).filter((box) => {
		return box.id.substr(0, 5) === 'child';
	}).toArray());
	test.strictEqual(stacks.length, 1);
	test.strictEqual(stacks[0].direction, inf.Direction.VERTICAL);
	test.strictEqual(stacks[0].boxes.length, 3);
	test.strictEqual(stacks[0].boxes[0], root.children[0].children[0]);
	test.strictEqual(stacks[0].boxes[1], root.children[0].children[1]);
	test.strictEqual(stacks[0].boxes[2], root.children[0].children[2]);

	test.done();
}

/**
 * Group two boxes next to each other.
 */
export function testStackGroupingSimple(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		direction: inf.Direction.HORIZONTAL,
		children: [{
			id: 'child1',
			w: inf.px(50),
			h: inf.px(50),
		}, {
			id: 'child2',
			w: inf.px(50),
			h: inf.px(50),
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);
	var initialState = new vs.VisualSnapshot(l);

	var count = 0;
	stack.applyStacks(l, 'prefix', () => {
		count++;
	});

	test.strictEqual(count, 1);
	test.strictEqual(initialState.equalsLayout(l), true);
	test.strictEqual(root.children.length, 1);
	test.strictEqual(root.children[0].children.length, 2);
	test.strictEqual(root.children[0].children[0].id, 'child1');
	test.strictEqual(root.children[0].children[1].id, 'child2');

	test.done();
}

/**
 * Group two boxes with a gap in the middle.
 */
export function testStackGroupGap(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: 'child1',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(0),
				l: inf.px(0),
			}
		}, {
			id: 'child2',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(0),
				l: inf.px(30),
			}
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);
	var initialState = new vs.VisualSnapshot(l);

	var count = 0;
	stack.applyStacks(l, 'prefix', () => {
		count++;
	});

	test.strictEqual(count, 1);
	test.strictEqual(initialState.equalsLayout(l), true);
	test.strictEqual(root.children.length, 1);
	test.strictEqual(root.children[0].direction, inf.Direction.HORIZONTAL);
	test.strictEqual(root.children[0].children.length, 3);
	test.strictEqual(root.children[0].children[0].id, 'child1');
	test.strictEqual(root.children[0].children[2].id, 'child2');
	test.ok(util.lengthEquals(root.children[0].children[1].w, inf.px(10)));
	test.ok(util.lengthEquals(root.children[0].children[1].h, inf.px(20)));

	test.done();
}

/**
 * Group two rows of boxes.
 */
export function testStackGroupMultiple(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: 'child1',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(0),
				l: inf.px(0),
			}
		}, {
			id: 'child2',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(0),
				l: inf.px(30),
			}
		}, {
			id: 'child3',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(30),
				l: inf.px(5),
			}
		}, {
			id: 'child4',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(30),
				l: inf.px(25),
			}
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);
	var initialState = new vs.VisualSnapshot(l);

	var count = 0;
	stack.applyStacks(l, 'prefix', () => {
		count++;
	});

	test.strictEqual(count, 1);
	test.strictEqual(initialState.equalsLayout(l), true);
	test.strictEqual(root.children.length, 2);

	test.strictEqual(root.children[0].direction, inf.Direction.HORIZONTAL);
	test.strictEqual(root.children[0].children.length, 3);
	test.strictEqual(root.children[0].children[0].id, 'child1');
	test.strictEqual(root.children[0].children[2].id, 'child2');
	test.ok(util.lengthEquals(root.children[0].children[1].w, inf.px(10)));
	test.ok(util.lengthEquals(root.children[0].children[1].h, inf.px(20)));

	test.strictEqual(root.children[1].direction, inf.Direction.HORIZONTAL);
	test.strictEqual(root.children[1].children.length, 2);
	test.strictEqual(root.children[1].children[0].id, 'child3');
	test.strictEqual(root.children[1].children[1].id, 'child4');

	test.done();
}

/**
 * Group two boxes, and then group the result with another box.
 */
export function testStackGroupIterative(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			id: 'child1',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(0),
				l: inf.px(0),
			}
		}, {
			id: 'child2',
			w: inf.px(20),
			h: inf.px(20),
			absolute: {
				t: inf.px(0),
				l: inf.px(30),
			}
		}, {
			id: 'child3',
			w: inf.px(50),
			h: inf.px(20),
			absolute: {
				t: inf.px(30),
				l: inf.px(0),
			}
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);
	var initialState = new vs.VisualSnapshot(l);

	var count = 0;
	stack.applyStacks(l, 'prefix', () => {
		count++;
	});

	test.strictEqual(count, 2);
	test.strictEqual(initialState.equalsLayout(l), true);
	test.strictEqual(root.children.length, 1);

	test.strictEqual(root.children[0].direction, inf.Direction.VERTICAL);
	test.strictEqual(root.children[0].children.length, 3);

	test.strictEqual(root.children[0].children[0].children.length, 3);
	test.strictEqual(root.children[0].children[0].direction,
					 inf.Direction.HORIZONTAL);
	test.strictEqual(root.children[0].children[0].children[0].id, 'child1');
	test.strictEqual(root.children[0].children[0].children[2].id, 'child2');
	test.ok(util.lengthEquals(root.children[0].children[0].children[1].w,
							  inf.px(10)));
	test.ok(util.lengthEquals(root.children[0].children[0].children[1].h,
							  inf.px(20)));

	test.ok(util.lengthEquals(root.children[0].children[1].w, inf.px(50)));
	test.ok(util.lengthEquals(root.children[0].children[1].h, inf.px(10)));

	test.strictEqual(root.children[0].children[2].id, 'child3');

	test.done();
}
