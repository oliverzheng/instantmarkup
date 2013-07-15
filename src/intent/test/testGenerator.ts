/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import gen = module('../generator');
import tree = module('../tree');
import testutil = module('../../testUtil');

export function testFromArray(test) {
	var array: inf.Box[] = [{
		id: '1'
	}, {
		id: '2'
	}, {
		id: '3'
	}];

	var it = gen.fromArray(array);
	var expected = ['1', '2', '3'];
	var ids: string[] = [];
	var box: inf.Box;
	while (box = it.next())
		ids.push(box.id);

	testutil.equals(test, expected, ids);

	test.done();
}

export function testDepthFirst(test) {
	var root: inf.Box = {
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
	tree.refreshParents(root);

	var expectedIds = ['child1', 'parent1', 'child2', 'parent2', 'root'];
	var it = gen.depthFirst(root);
	expectedIds.forEach((id) => {
		var box = it.next();
		test.strictEqual(box.id, id);
	});
	test.equal(it.next(), null);

	expectedIds.reverse();
	var reverseIt = gen.reverseDepthFirst(root);
	expectedIds.forEach((id) => {
		var box = reverseIt.next();
		test.strictEqual(box.id, id);
	});
	test.equal(it.next(), null);

	var expectedIds = ['parent1', 'child2', 'parent2', 'root'];
	var it = gen.depthFirst(root, root.children[0]);
	expectedIds.forEach((id) => {
		var box = it.next();
		test.strictEqual(box.id, id);
	});
	test.equal(it.next(), null);

	expectedIds.reverse();
	var reverseIt = gen.reverseDepthFirst(root);
	expectedIds.forEach((id) => {
		var box = reverseIt.next();
		test.strictEqual(box.id, id);
	});
	test.equal(it.next(), null);

	test.done();
}

