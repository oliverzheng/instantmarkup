/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import extinf = module('../../extract/interfaces')
import util = module('../util');
import testUtil = module('../../testUtil');

export function testLayerToBox(test) {
	var layer: extinf.Layer = {
		id: 'root',
		name: 'root',
		bbox: {
			w: 100,
			h: 100,
		},
		children: [{
			id: 'child',
			name: 'child',
			bbox: {
				x: 0,
				x: 0,
				w: 100,
				h: 100,
			},
		}]
	};

	var box = util.layerToBox(layer);
	test.strictEqual(box.id, 'root');
	test.strictEqual(box.children.length, 2);
	test.strictEqual(box.children[0].id, 'child');
	test.strictEqual(box.children[1].id, 'root');

	test.done();
}

export function testLengthEquals(test) {
	test.equal(util.lengthEquals(null, null), true);
	test.equal(util.lengthEquals(null, inf.defaultLength), true);
	test.equal(util.lengthEquals(inf.defaultLength, null), true);
	test.equal(util.lengthEquals(inf.px(0), inf.px(0)), true);

	test.equal(util.lengthEquals(inf.px(0), inf.px(1)), false);
	test.equal(util.lengthEquals(inf.expand, inf.shrink), false);

	test.done();
}
