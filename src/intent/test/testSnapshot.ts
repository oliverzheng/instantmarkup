/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import tree = module('../tree');
import l = module('../layout');
import ss = module('../snapshot');

export function setUp(cb) {
	this.root = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		direction: inf.Direction.HORIZONTAL,
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
			/* Right below child1 */
			absolute: {
				l: inf.px(0),
				t: inf.px(0),
			}
		}]
	};
	tree.refreshParents(this.root);

	this.layout = new l.Layout(this.root);
	this.snapshot = new ss.Snapshot(this.layout);

	cb();
}

export function testSame(test) {
	test.strictEqual(this.snapshot.equalsLayout(this.layout), true);
	test.done();
}

export function testNoDirection(test) {
	this.root.direction = inf.Direction.NONE;
	test.strictEqual(this.snapshot.equalsLayout(this.layout), false);
	test.done();
}

export function testMoveChildren(test) {
	this.root.children[0].w = inf.px(19);
	test.strictEqual(this.snapshot.equalsLayout(this.layout), false);
	test.done();
}

export function testZOrder(test) {
	var abs = this.root.children.pop();
	this.root.children.unshift(abs);
	test.strictEqual(this.snapshot.equalsLayout(this.layout), false);
	test.done();
}

export function testMissingChildren(test) {
	this.root.children.pop();
	test.strictEqual(this.snapshot.equalsLayout(this.layout), false);
	test.done();
}
