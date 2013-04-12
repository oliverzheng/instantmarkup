/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import iter = module('../iter');
import tree = module('../tree');

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
	var it = iter.depthFirst(root);
	expectedIds.forEach((id) => {
		var box = it();
		test.strictEqual(box.id, id);
	});
	test.equal(it(), null);

	test.done();
}

