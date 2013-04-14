/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import util = module('../util');
import testutil = module('../../testUtil');

export function testFlattenLayers(test) {
	var layer: inf.Layer = {
		id: 'root',
		name: 'root',
		bbox: {
			w: 100,
			h: 100,
		},
		children: [{
			id: 'child1',
			name: 'child1',
			bbox: {
				w: 100,
				h: 100,
			},
			children: [{
				id: 'grandchild',
				name: 'grandchild',
				bbox: {
					w: 100,
					h: 100,
				},
			}]
		}, {
			id: 'child2',
			name: 'child2',
			bbox: {
				w: 100,
				h: 100,
			},
		}]
	};
	var flattened = util.flattenLayers(layer);
	var ids = flattened.map((layer) => {
		return layer.id;
	});
	var expected = ['grandchild', 'child1', 'child2', 'root'];
	testutil.equals(test, expected, ids);

	test.done();
}
