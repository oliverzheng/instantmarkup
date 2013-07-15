/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import tree = module('../tree');
import gen = module('../generator');
import testUtil = module('../../testUtil');

export function setUp(callback) {
	this.root = {
		id: 'root',
		children: [
			{
				id: 'parent1',
				children: [
					{
						id: 'child1',
					}
				]
			},
			{
				id: 'parent2',
				children: [
					{
						id: 'child2',
					}
				]
			},
		],
	};
	this.parent1 = this.root.children[0];
	this.parent2 = this.root.children[1];
	this.child1 = this.root.children[0].children[0];
	this.child2 = this.root.children[1].children[0];

	tree.refreshParents(this.root);

	callback();
}

export function testRefreshParents(test) {
	test.equal(this.root.parent, null);
	test.strictEqual(this.root.children.length, 2);
	test.strictEqual(this.root.children[0].parent, this.root);
	test.strictEqual(this.root.children[1].parent, this.root);
	test.strictEqual(this.root.children[0].children.length, 1);
	test.strictEqual(this.root.children[0].children[0].parent, this.root.children[0]);

	tree.refreshParents({});

	test.done();
}

export function testIndexOfChild(test) {
	test.strictEqual(tree.indexOfChild(this.root.children[0]), 0);
	test.strictEqual(tree.indexOfChild(this.root.children[1]), 1);
	test.strictEqual(tree.indexOfChild(this.root.children[0].children[0]), 0);
	test.strictEqual(tree.indexOfChild({}), -1);

	test.done();
}

export function testGetBoxById(test) {
	var ids = ['child1', 'parent1'];
	for (var i = 0; i < ids.length; ++i) {
		var id = ids[i];
		var box = tree.getBoxById(this.root, id);
		test.strictEqual(box.id, id);
	}

	test.equal(tree.getBoxById(this.root, 'derp'), null);

	test.done();
}

export function testHasUniqueIds(test) {
	var boxes: inf.Box[] = [{
		id: '3'
	}, {
		id: '4'
	}];

	test.equal(tree.hasUniqueIds(gen.fromArray(boxes)), true);

	boxes[1].id = '3';
	test.equal(tree.hasUniqueIds(gen.fromArray(boxes)), false);

	boxes[1].id = null;
	test.equal(tree.hasUniqueIds(gen.fromArray(boxes)), false);

	test.done();
}

export function testIsAncestor(test) {
	test.ok(tree.isAncestor(this.root, this.child1));
	test.ok(tree.isAncestor(this.parent1, this.child1));
	test.ok(!tree.isAncestor(this.parent2, this.child1));
	test.ok(tree.isAncestor(this.child1, this.child1));

	test.done();
}

export function testGetHeight(test) {
	test.strictEqual(tree.getHeight(this.child1), 2);
	test.strictEqual(tree.getHeight(this.parent1), 1);
	test.strictEqual(tree.getHeight(this.parent2), 1);
	test.strictEqual(tree.getHeight(this.root), 0);

	test.done();
}

export function testGetAncestor(test) {
	test.strictEqual(tree.getAncestor(this.child1, 0), this.child1);

	test.strictEqual(tree.getAncestor(this.child1), this.parent1);
	test.strictEqual(tree.getAncestor(this.child1, 1), this.parent1);
	test.strictEqual(tree.getAncestor(this.child1, 2), this.root);
	test.equal(tree.getAncestor(this.child1, 3), null);

	test.done();
}

export function testIsBefore(test) {
	test.ok(tree.isBefore(this.child1, this.parent1));
	test.ok(tree.isBefore(this.child1, this.parent2));
	test.ok(tree.isBefore(this.child1, this.root));
	test.ok(tree.isBefore(this.child1, this.child2));
	test.ok(!tree.isBefore(this.child1, this.child1));

	test.ok(tree.isBefore(this.parent1, this.root));
	test.ok(!tree.isBefore(this.parent1, this.child1));
	test.ok(tree.isBefore(this.parent1, this.parent2));
	test.ok(tree.isBefore(this.parent1, this.child2));
	test.ok(!tree.isBefore(this.parent1, this.parent1));

	test.ok(!tree.isBefore(this.child2, this.parent1));
	test.ok(tree.isBefore(this.child2, this.parent2));
	test.ok(tree.isBefore(this.child2, this.root));
	test.ok(!tree.isBefore(this.child2, this.child1));
	test.ok(!tree.isBefore(this.child2, this.child2));

	test.ok(!tree.isBefore(this.parent2, this.child1));
	test.ok(!tree.isBefore(this.parent2, this.parent1));
	test.ok(tree.isBefore(this.parent2, this.root));
	test.ok(!tree.isBefore(this.parent2, this.child2));
	test.ok(!tree.isBefore(this.parent2, this.parent2));

	test.ok(!tree.isBefore(this.root, this.child1));
	test.ok(!tree.isBefore(this.root, this.parent1));
	test.ok(!tree.isBefore(this.root, this.parent1));
	test.ok(!tree.isBefore(this.root, this.child2));
	test.ok(!tree.isBefore(this.root, this.root));

	test.ok(!tree.isBefore(this.root, null));
	test.ok(!tree.isBefore(null, this.root));

	test.done();
}
