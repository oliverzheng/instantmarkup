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

export function testOtherDirection(test) {
	test.strictEqual(util.otherDirection(inf.Direction.HORIZONTAL),
					 inf.Direction.VERTICAL);

	test.strictEqual(util.otherDirection(inf.Direction.VERTICAL),
					 inf.Direction.HORIZONTAL);

	test.throws(() => {
		util.otherDirection(inf.Direction.NONE);
	});

	test.done();
}

export function testRectEmpty(test) {
	test.equal(util.rectEmpty({
		x: 0,
		y: 0,
		w: 0,
		h: 10,
	}), true);

	test.equal(util.rectEmpty({
		x: 0,
		y: 0,
		w: 10,
		h: 0,
	}), true);

	test.equal(util.rectEmpty({
		x: 0,
		y: 0,
		w: -1,
		h: 0,
	}), true);

	test.equal(util.rectEmpty({
		x: 0,
		y: 0,
		w: 1,
		h: 1,
	}), false);

	test.done();
}

export function testRectContains(test) {
	/* Complete equal containment */
	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}), true);

	/* Top left corner */
	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 0,
		y: 0,
		w: 50,
		h: 50,
	}), true);

	/* Bottom left corner */
	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 0,
		y: 50,
		w: 50,
		h: 50,
	}), true);

	/* Top right corner */
	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 50,
		y: 0,
		w: 50,
		h: 50,
	}), true);

	/* Bottom right corner */
	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 50,
		y: 50,
		w: 50,
		h: 50,
	}), true);

	/* Edge */
	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 0,
		y: 10,
		w: 50,
		h: 50,
	}), true);

	/* No containment */
	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: -1,
		y: 0,
		w: 10,
		h: 10,
	}), false);

	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 0,
		y: -1,
		w: 10,
		h: 10,
	}), false);

	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 91,
		y: 0,
		w: 10,
		h: 10,
	}), false);

	test.equal(util.rectContains({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 0,
		y: 91,
		w: 10,
		h: 10,
	}), false);

	test.done();
}

export function testRectOverlaps(test) {
	/* Exact containment */
	test.equal(util.rectOverlaps({
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}, {
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	}), true);

	/* Complete containment */
	var rect1 = {
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	};
	var rect2 = {
		x: 0,
		y: 0,
		w: 50,
		h: 50,
	};
	test.equal(util.rectOverlaps(rect1, rect2), true);
	test.equal(util.rectOverlaps(rect2, rect1), true);

	/* Edge overlap */
	var rect1 = {
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	};
	var rect2 = {
		x: 99,
		y: 0,
		w: 50,
		h: 50,
	};
	test.equal(util.rectOverlaps(rect1, rect2), true);
	test.equal(util.rectOverlaps(rect2, rect1), true);

	/* Corner overlap */
	var rect1 = {
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	};
	var rect2 = {
		x: 99,
		y: 99,
		w: 50,
		h: 50,
	};
	test.equal(util.rectOverlaps(rect1, rect2), true);
	test.equal(util.rectOverlaps(rect2, rect1), true);

	/* Edge no-overlap */
	var rect1 = {
		x: 0,
		y: 0,
		w: 100,
		h: 100,
	};
	var rect2 = {
		x: 100,
		y: 0,
		w: 50,
		h: 50,
	};
	test.equal(util.rectOverlaps(rect1, rect2), false);
	test.equal(util.rectOverlaps(rect2, rect1), false);

	/* Empty no-overlap */
	var rect1 = {
		x: 0,
		y: 0,
		w: 0,
		h: 0,
	};
	var rect2 = {
		x: 0,
		y: 0,
		w: 10,
		h: 10,
	};
	test.equal(util.rectOverlaps(rect1, rect2), false);
	test.equal(util.rectOverlaps(rect2, rect1), false);

	/* Empty overlap */
	var rect1 = {
		x: 5,
		y: 5,
		w: 0,
		h: 0,
	};
	var rect2 = {
		x: 0,
		y: 0,
		w: 10,
		h: 10,
	};
	test.equal(util.rectOverlaps(rect1, rect2), true);
	test.equal(util.rectOverlaps(rect2, rect1), true);

	test.done();
}

export function testGetBoundingRect(test) {
	var rect = {
		x: 0,
		y: 0,
		w: 0,
		h: 0,
	};
	testUtil.equals(test, util.getBoundingRect([rect]), rect);

	var rect1 = {
		x: 10,
		y: 10,
		w: 20,
		h: 20,
	};
	var rect2 = {
		x: 50,
		y: 50,
		w: 20,
		h: 20,
	};
	var contained = {
		x: 10,
		y: 10,
		w: 60,
		h: 60,
	};
	
	testUtil.equals(test, util.getBoundingRect([rect1, rect2]), contained);
	testUtil.equals(test, util.getBoundingRect([rect2, rect1]), contained);
	testUtil.equals(test, util.getBoundingRect([contained, rect1]), contained);
	testUtil.equals(test, util.getBoundingRect([rect1, contained]), contained);
	testUtil.equals(test, util.getBoundingRect([rect1, rect2, contained]), contained);

	test.throws(() => {
		util.getBoundingRect([]);
	});

	test.done();
}
