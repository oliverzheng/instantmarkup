/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import util = module('../util');

function getStructure(box: inf.Box) {
	if (box.children && box.children.length > 0) {
		var obj = {};
		obj[box.id] = box.children.map((child) => {
			return getStructure(child);
		});
		return obj;
	} else {
		return box.id;
	}
}

function equals(test, first, second) {
	return test.strictEqual(JSON.stringify(first), JSON.stringify(second));
}

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

	util.refreshParents(this.root);

	callback();
}

export function testRefreshParents(test) {
	test.equal(this.root.parent, null);
	test.strictEqual(this.root.children.length, 2);
	test.strictEqual(this.root.children[0].parent, this.root);
	test.strictEqual(this.root.children[1].parent, this.root);
	test.strictEqual(this.root.children[0].children.length, 1);
	test.strictEqual(this.root.children[0].children[0].parent, this.root.children[0]);

	util.refreshParents({});

	test.done();
}

export function testIndexOfChild(test) {
	test.strictEqual(util.indexOfChild(this.root.children[0]), 0);
	test.strictEqual(util.indexOfChild(this.root.children[1]), 1);
	test.strictEqual(util.indexOfChild(this.root.children[0].children[0]), 0);
	test.strictEqual(util.indexOfChild({}), -1);

	test.done();
}

export function testBoxForEach(test) {
	var expectedIds = ['child1', 'parent1', 'child2', 'parent2', 'root'];
	var actualIds: string[] = [];
	util.boxForEach(this.root, (box) => {
		actualIds.push(box.id);
	});
	equals(test, expectedIds, actualIds);

	test.done();
}

export function testGetBoxById(test) {
	var ids = ['child1', 'parent1'];
	for (var i = 0; i < ids.length; ++i) {
		var id = ids[i];
		var box = util.getBoxById(this.root, id);
		test.strictEqual(box.id, id);
	}

	test.equal(util.getBoxById(this.root, 'derp'), null);

	test.throws(() => {
		var root = {
			children: [
				{ id: 'test' },
				{ id: 'test' },
			]
		};
		util.getBoxById(root, 'test');
	});

	test.done();
}

export function testOrphanBox(test) {
	var child1 = util.getBoxById(this.root, 'child1');
	var parent = child1.parent;
	test.strictEqual(util.orphanBox(child1), parent);

	test.equal(child1.parent, null);
	test.strictEqual(parent.children.length, 0);

	test.done();
}

export function testIsAncestor(test) {
	test.ok(util.isAncestor(this.root, this.child1));
	test.ok(util.isAncestor(this.parent1, this.child1));
	test.ok(!util.isAncestor(this.parent2, this.child1));
	test.ok(util.isAncestor(this.child1, this.child1));

	test.done();
}

export function testGetHeight(test) {
	test.strictEqual(util.getHeight(this.child1), 2);
	test.strictEqual(util.getHeight(this.parent1), 1);
	test.strictEqual(util.getHeight(this.parent2), 1);
	test.strictEqual(util.getHeight(this.root), 0);

	test.done();
}

export function testGetAncestor(test) {
	test.strictEqual(util.getAncestor(this.child1, 0), this.child1);

	test.strictEqual(util.getAncestor(this.child1), this.parent1);
	test.strictEqual(util.getAncestor(this.child1, 1), this.parent1);
	test.strictEqual(util.getAncestor(this.child1, 2), this.root);
	test.equal(util.getAncestor(this.child1, 3), null);

	test.done();
}

export function testIsBefore(test) {
	test.ok(util.isBefore(this.child1, this.parent1));
	test.ok(util.isBefore(this.child1, this.parent2));
	test.ok(util.isBefore(this.child1, this.root));
	test.ok(util.isBefore(this.child1, this.child2));
	test.ok(!util.isBefore(this.child1, this.child1));

	test.ok(util.isBefore(this.parent1, this.root));
	test.ok(!util.isBefore(this.parent1, this.child1));
	test.ok(util.isBefore(this.parent1, this.parent2));
	test.ok(util.isBefore(this.parent1, this.child2));
	test.ok(!util.isBefore(this.parent1, this.parent1));

	test.ok(!util.isBefore(this.child2, this.parent1));
	test.ok(util.isBefore(this.child2, this.parent2));
	test.ok(util.isBefore(this.child2, this.root));
	test.ok(!util.isBefore(this.child2, this.child1));
	test.ok(!util.isBefore(this.child2, this.child2));

	test.ok(!util.isBefore(this.parent2, this.child1));
	test.ok(!util.isBefore(this.parent2, this.parent1));
	test.ok(util.isBefore(this.parent2, this.root));
	test.ok(!util.isBefore(this.parent2, this.child2));
	test.ok(!util.isBefore(this.parent2, this.parent2));

	test.ok(!util.isBefore(this.root, this.child1));
	test.ok(!util.isBefore(this.root, this.parent1));
	test.ok(!util.isBefore(this.root, this.parent1));
	test.ok(!util.isBefore(this.root, this.child2));
	test.ok(!util.isBefore(this.root, this.root));

	test.ok(!util.isBefore(this.root, null));
	test.ok(!util.isBefore(null, this.root));

	test.done();
}

export function testReparentSame(test) {
	var structure = getStructure(this.root);

	test.strictEqual(util.reparent(this.child1, this.parent1), this.parent1);
	equals(test, structure, getStructure(this.root));

	test.done();
}

export function testReparentBefore1(test) {
	debugger;
	test.strictEqual(util.reparent(this.child1, this.root), this.parent1);
	equals(test, getStructure(this.root), {
		'root': <any[]>[ // Wow #thisIsUgly.
			'child1',
			'parent1',
			{parent2: [
				'child2'
			]}
		]
	});

	test.done();
}

export function testReparentBefore2(test) {
	test.strictEqual(util.reparent(this.child1, this.parent2), this.parent1);
	equals(test, getStructure(this.root), {
		'root': <any[]>[
			'parent1',
			{parent2: [
				'child1',
				'child2'
			]}
		]
	});

	test.done();
}

export function testReparentBefore3(test) {
	test.strictEqual(util.reparent(this.parent1, this.parent2), this.root);
	equals(test, getStructure(this.root), {
		'root': [
			{parent2: <any[]>[
				{'parent1': [
					'child1',
				]},
				'child2'
			]}
		]
	});

	test.done();
}

export function testReparentAfter(test) {
	test.strictEqual(util.reparent(this.child2, this.root), this.parent2);
	equals(test, getStructure(this.root), {
		'root': <any[]>[
			{'parent1': [
				'child1',
			]},
			'child2',
			'parent2'
		]
	});

	test.done();
}
