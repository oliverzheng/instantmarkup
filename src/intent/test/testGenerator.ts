/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import gen = module('../generator');
import tree = module('../tree');
import testutil = module('../../testUtil');

export function testArrayToIter(test) {
	var array: inf.Box[] = [{
		id: '1'
	}, {
		id: '2'
	}, {
		id: '3'
	}];

	var it = gen.arrayToIter(array);
	var expected = ['1', '2', '3'];
	var ids: string[] = [];
	var box: inf.Box;
	while (box = it())
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
		var box = it();
		test.strictEqual(box.id, id);
	});
	test.equal(it(), null);

	test.done();
}

