/// <reference path="../../../_typings.d.ts" />

import inf = module('../interfaces');
import tree = module('../tree');
import layout = module('../layout');
import testUtil = module('../../testUtil');

export function testEffectiveChildren(test) {
	var root: inf.Box = {
		id: 'root',
		children: [{
			id: '0',
			w: inf.px(0),
		}, {
			id: '1',
			w: inf.shrink,
			children: [{
				id: '1.1',
				w: inf.px(0),
			}, {
				id: '1.2',
				w: inf.prt(1),
				children: [{
					id: '1.2.1',
					w: inf.px(0)
				}]
			}, {
				id: '1.3',
				w: inf.shrink,
				children: [{
					id: '1.3.1',
					w: inf.prt(1),
				}]
			}]
		}, {
			id: '2',
			w: inf.px(0),
		}, {
			id: '3',
			absolute: {
				l: inf.px(0)
			}
		}]
	};
	tree.refreshParents(root);

	var result = layout.effectiveChildren(root, inf.Direction.HORIZONTAL);
	var expectedIds = ['0', '1.1', '1.2', '1.3.1', '2'];
	var actualIds = result.map((box) => box.id);
	testUtil.equals(test, actualIds, expectedIds);

	var result = layout.effectiveChildren(root, inf.Direction.HORIZONTAL,
										  inf.LengthUnit.PIXELS);
	var expectedIds = ['0', '1.1', '2'];
	var actualIds = result.map((box) => box.id);
	testUtil.equals(test, actualIds, expectedIds);

	var result = layout.effectiveChildren(root, inf.Direction.HORIZONTAL,
										  inf.LengthUnit.PARTS);
	var expectedIds = ['1.2', '1.3.1'];
	var actualIds = result.map((box) => box.id);
	testUtil.equals(test, actualIds, expectedIds);

	test.done();
}

export function testGetParts(test) {
	var root: inf.Box = {
		id: 'root',
		children: [{
			id: '0',
			w: inf.px(0),
		}, {
			id: '1',
			w: inf.shrink,
			children: [{
				id: '1.1',
				w: inf.prt(1),
			}]
		}, {
			id: '2',
			w: inf.prt(2),
		}]
	};
	tree.refreshParents(root);

	var parts = layout.getParts(root, inf.Direction.HORIZONTAL);
	test.strictEqual(parts, 3);

	/* Test for zeros */

	var root: inf.Box = {
		id: 'root'
	};
	var parts = layout.getParts(root, inf.Direction.HORIZONTAL);
	test.strictEqual(parts, 0);

	var root: inf.Box = {
		id: 'root',
		children: [{
			id: '1',
			w: inf.px(0)
		}]
	};
	var parts = layout.getParts(root, inf.Direction.HORIZONTAL);
	test.strictEqual(parts, 0);

	test.done();
}

export function testCompLengthPx(test) {
	var box = {
		w: inf.px(10),
		h: inf.px(20),
	};
	var l = new layout.Layout(box);
	test.strictEqual(l.compW(box), 10);
	test.strictEqual(l.compH(box), 20);

	test.done();
}

export function testCompLengthPct(test) {
	var box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.pct(0.5),
			h: inf.pct(0.3)
		}]
	};
	tree.refreshParents(box);
	var l = new layout.Layout(box);
	test.strictEqual(l.compW(box.children[0]), 50);
	test.strictEqual(l.compH(box.children[0]), 30);

	test.done();
}

export function testCompLengthPrt(test) {
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.prt(2),
			h: inf.px(30),
		}, {
			w: inf.prt(3),
			h: inf.prt(2),
		}, {
			w: inf.prt(0),
			h: inf.pct(0.5),
		}]
	};
	tree.refreshParents(box);
	var l = new layout.Layout(box);
	var child1 = box.children[0];
	var child2 = box.children[1];
	var child3 = box.children[2];

	test.strictEqual(l.compW(child1), 40);
	test.strictEqual(l.compW(child2), 60);
	test.strictEqual(l.compW(child3), 0);
	test.strictEqual(l.compH(child1), 30);
	test.strictEqual(l.compH(child2), 20);
	test.strictEqual(l.compH(child3), 50);

	/* Test for 0 parts */
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.prt(0),
		}]
	};
	var l = new layout.Layout(box);
	var child = box.children[0];
	test.strictEqual(l.compW(child), 0);

	test.done();
}

export function testCompLengthExpand(test) {
	var box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(20),
		}, {
			w: inf.pct(0.3),
		}, {
			w: inf.prt(1),
		}, {
			w: inf.expand,
		}, {
			w: inf.expand,
		}]
	};
	tree.refreshParents(box);
	var l = new layout.Layout(box);
	var expand1 = box.children[3];
	var expand2 = box.children[4];

	/* These are 0 because of the prt(1) */
	test.strictEqual(l.compW(expand1), 0);
	test.strictEqual(l.compW(expand2), 0);

	var child = box.children[2];
	child.w = inf.prt(0);
	test.strictEqual(l.compW(expand1), 25);
	test.strictEqual(l.compW(expand2), 25);

	test.done();
}

export function testCompLengthShrink(test) {
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.shrink,
			children: [{
				w: inf.px(20)
			}, {
				w: inf.pct(0.3) /* of 100 */
			}, {
				w: inf.prt(1)
			}, {
				w: inf.prt(2)
			}]
		}]
	};
	tree.refreshParents(box);
	var l = new layout.Layout(box);
	var child = box.children[0];
	test.strictEqual(l.compW(child), 100);

	child.children[2].w = inf.prt(0);
	child.children[3].w = inf.prt(0);
	test.strictEqual(l.compW(child), 50);

	child.children[2].w = inf.expand;
	test.strictEqual(l.compW(child), 100);

	child.children[2].w = inf.shrink;
	test.strictEqual(l.compW(child), 50);

	test.done();
}

export function testCompLengthAbs(test) {
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			absolute: {
				l: inf.px(0),
				r: inf.px(0),
			}
		}, {
			absolute: {
				l: inf.pct(0.1),
				r: inf.pct(0.1),
			}
		}, {
			absolute: {
				l: inf.pct(-0.1),
				r: inf.px(-5),
			}
		}, {
			absolute: {
				l: inf.px(100),
				r: inf.px(100),
			}
		}]
	};
	tree.refreshParents(box);
	var l = new layout.Layout(box);

	test.strictEqual(l.compW(box.children[0]), 100);
	test.strictEqual(l.compW(box.children[1]), 80);
	test.strictEqual(l.compW(box.children[2]), 115);
	test.strictEqual(l.compW(box.children[3]), 0);

	test.done();
}

export function testCompLengthCross(test) {
	var box: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		direction: inf.Direction.HORIZONTAL,
		children: [{
			h: inf.px(50),
		}, {
			h: inf.pct(0.5),
		}, {
			h: inf.prt(1),
		}, {
			h: inf.prt(2),
		}, {
			h: inf.expand,
		}, {
			h: inf.shrink,
		}]
	};
	tree.refreshParents(box);
	var l = new layout.Layout(box);

	test.strictEqual(l.compH(box.children[0]), 50);
	test.strictEqual(l.compH(box.children[1]), 50);
	test.strictEqual(l.compH(box.children[2]), 100);
	test.strictEqual(l.compH(box.children[3]), 100);
	test.strictEqual(l.compH(box.children[4]), 100);
	test.strictEqual(l.compH(box.children[5]), 0);

	test.done();
}

export var testCompPosition = {
	setUp: function (callback) {
		this.root = {
			id: 'root',
			w: inf.px(100),
			h: inf.px(100),
			children: [{
				id: '1',
				w: inf.px(30),
				children: [{
					id: '1.1',
					w: inf.shrink, /* =20px */
					children: [{
						id: '1.1.1',
						w: inf.pct(0.5), /* =15px */
					}, {
						id: '1.1.2',
						w: inf.px(5),
					}]
				}]
			}, {
				id: '2',
				w: inf.prt(3), /* =30px */
				children: [{
					id: '2.1',
					w: inf.pct(0.5), /* =15px */
				}, {
					id: '2.2',
					w: inf.px(5),
				}, {
					id: '2.3',
					w: inf.expand, /* =10px */
				}]
			}, {
				id: '3',
				w: inf.prt(4), /* =40px */
				children: [{
					id: '3.1',
					w: inf.px(50), /* Purposely bigger than parent */
				}, {
					id: '3.2',
					w: inf.px(10),
					absolute: {
						l: inf.px(5),
					}
				}, {
					id: '3.3',
					w: inf.px(10),
					absolute: {
						l: inf.pct(0.5), /* =20px */
					}
				}, {
					id: '3.4',
					w: inf.px(10),
					absolute: {
						l: inf.pct(-0.5), /* =-20px */
					}
				}, {
					id: '3.5',
					w: inf.px(10),
					absolute: {
						r: inf.pct(0.5), /* =20px */
					}
				}]
			}]
		};
		tree.refreshParents(this.root);
		this.l = new layout.Layout(this.root);

		this.getW = function(id: string) {
			return this.l.compX(tree.getBoxById(this.root, id));
		};
		this.getWAbs = function(id: string) {
			return this.l.compXAbs(tree.getBoxById(this.root, id));
		};

		callback();
	},

	directionNone: function (test) {
		test.strictEqual(this.getW('root'),		0);
		test.strictEqual(this.getW('1'),		0);
		test.strictEqual(this.getW('1.1'),		0);
		test.strictEqual(this.getW('1.1.1'),	0);
		test.strictEqual(this.getW('1.1.2'),	0);
		test.strictEqual(this.getW('2'),		0);
		test.strictEqual(this.getW('2.1'),		0);
		test.strictEqual(this.getW('2.2'),		0);
		test.strictEqual(this.getW('2.3'),		0);
		test.strictEqual(this.getW('3'),		0);
		test.strictEqual(this.getW('3.1'),		0);
		test.strictEqual(this.getW('3.2'),		5);
		test.strictEqual(this.getW('3.3'),		20);
		test.strictEqual(this.getW('3.4'),		-20);
		test.strictEqual(this.getW('3.5'),		10);

		test.strictEqual(this.getWAbs('root'),	0);
		test.strictEqual(this.getWAbs('1'),		0);
		test.strictEqual(this.getWAbs('1.1'),	0);
		test.strictEqual(this.getWAbs('1.1.1'),	0);
		test.strictEqual(this.getWAbs('1.1.2'),	0);
		test.strictEqual(this.getWAbs('2'),		0);
		test.strictEqual(this.getWAbs('2.1'),	0);
		test.strictEqual(this.getWAbs('2.2'),	0);
		test.strictEqual(this.getWAbs('2.3'),	0);
		test.strictEqual(this.getWAbs('3'),		0);
		test.strictEqual(this.getWAbs('3.1'),	0);
		test.strictEqual(this.getWAbs('3.2'),	5);
		test.strictEqual(this.getWAbs('3.3'),	20);
		test.strictEqual(this.getWAbs('3.4'),	-20);
		test.strictEqual(this.getWAbs('3.5'),	10);

		test.done();
	},

	directionHoriz: function (test) {
		tree.boxForEach(this.root, function(box) {
			box.direction = inf.Direction.HORIZONTAL;
		});

		test.strictEqual(this.getW('root'),		0);
		test.strictEqual(this.getW('1'),		0);
		test.strictEqual(this.getW('1.1'),		0);
		test.strictEqual(this.getW('1.1.1'),	0);
		test.strictEqual(this.getW('1.1.2'),	15);
		test.strictEqual(this.getW('2'),		30);
		test.strictEqual(this.getW('2.1'),		0);
		test.strictEqual(this.getW('2.2'),		15);
		test.strictEqual(this.getW('2.3'),		20);
		test.strictEqual(this.getW('3'),		60);
		test.strictEqual(this.getW('3.1'),		0);
		test.strictEqual(this.getW('3.2'),		5);
		test.strictEqual(this.getW('3.3'),		20);
		test.strictEqual(this.getW('3.4'),		-20);
		test.strictEqual(this.getW('3.5'),		10);

		test.strictEqual(this.getWAbs('root'),	0);
		test.strictEqual(this.getWAbs('1'),		0);
		test.strictEqual(this.getWAbs('1.1'),	0);
		test.strictEqual(this.getWAbs('1.1.1'),	0);
		test.strictEqual(this.getWAbs('1.1.2'),	15);
		test.strictEqual(this.getWAbs('2'),		30);
		test.strictEqual(this.getWAbs('2.1'),	30);
		test.strictEqual(this.getWAbs('2.2'),	45);
		test.strictEqual(this.getWAbs('2.3'),	50);
		test.strictEqual(this.getWAbs('3'),		60);
		test.strictEqual(this.getWAbs('3.1'),	60);
		test.strictEqual(this.getWAbs('3.2'),	65);
		test.strictEqual(this.getWAbs('3.3'),	80);
		test.strictEqual(this.getWAbs('3.4'),	40);
		test.strictEqual(this.getWAbs('3.5'),	70);

		test.done();
	},

	directionHorizAlignCenter: function(test) {
		tree.boxForEach(this.root, function(box) {
			box.direction = inf.Direction.HORIZONTAL;
			box.alignment = inf.Alignment.CENTER;
		});

		test.strictEqual(this.getW('root'),		0);
		test.strictEqual(this.getW('1'),		0);
		test.strictEqual(this.getW('1.1'),		5);
		test.strictEqual(this.getW('1.1.1'),	0);
		test.strictEqual(this.getW('1.1.2'),	15);
		test.strictEqual(this.getW('2'),		30);
		test.strictEqual(this.getW('2.1'),		0);
		test.strictEqual(this.getW('2.2'),		15);
		test.strictEqual(this.getW('2.3'),		20);
		test.strictEqual(this.getW('3'),		60);
		test.strictEqual(this.getW('3.1'),		-5);
		test.strictEqual(this.getW('3.2'),		5);
		test.strictEqual(this.getW('3.3'),		20);
		test.strictEqual(this.getW('3.4'),		-20);
		test.strictEqual(this.getW('3.5'),		10);

		test.strictEqual(this.getWAbs('root'),	0);
		test.strictEqual(this.getWAbs('1'),		0);
		test.strictEqual(this.getWAbs('1.1'),	5);
		test.strictEqual(this.getWAbs('1.1.1'),	5);
		test.strictEqual(this.getWAbs('1.1.2'),	20);
		test.strictEqual(this.getWAbs('2'),		30);
		test.strictEqual(this.getWAbs('2.1'),	30);
		test.strictEqual(this.getWAbs('2.2'),	45);
		test.strictEqual(this.getWAbs('2.3'),	50);
		test.strictEqual(this.getWAbs('3'),		60);
		test.strictEqual(this.getWAbs('3.1'),	55);
		test.strictEqual(this.getWAbs('3.2'),	65);
		test.strictEqual(this.getWAbs('3.3'),	80);
		test.strictEqual(this.getWAbs('3.4'),	40);
		test.strictEqual(this.getWAbs('3.5'),	70);

		test.done();
	},

	directionHorizAlignRight: function(test) {
		tree.boxForEach(this.root, function(box) {
			box.direction = inf.Direction.HORIZONTAL;
			box.alignment = inf.Alignment.FAR;
		});

		test.strictEqual(this.getW('root'),		0);
		test.strictEqual(this.getW('1'),		0);
		test.strictEqual(this.getW('1.1'),		10);
		test.strictEqual(this.getW('1.1.1'),	0);
		test.strictEqual(this.getW('1.1.2'),	15);
		test.strictEqual(this.getW('2'),		30);
		test.strictEqual(this.getW('2.1'),		0);
		test.strictEqual(this.getW('2.2'),		15);
		test.strictEqual(this.getW('2.3'),		20);
		test.strictEqual(this.getW('3'),		60);
		test.strictEqual(this.getW('3.1'),		-10);
		test.strictEqual(this.getW('3.2'),		5);
		test.strictEqual(this.getW('3.3'),		20);
		test.strictEqual(this.getW('3.4'),		-20);
		test.strictEqual(this.getW('3.5'),		10);

		test.strictEqual(this.getWAbs('root'),	0);
		test.strictEqual(this.getWAbs('1'),		0);
		test.strictEqual(this.getWAbs('1.1'),	10);
		test.strictEqual(this.getWAbs('1.1.1'),	10);
		test.strictEqual(this.getWAbs('1.1.2'),	25);
		test.strictEqual(this.getWAbs('2'),		30);
		test.strictEqual(this.getWAbs('2.1'),	30);
		test.strictEqual(this.getWAbs('2.2'),	45);
		test.strictEqual(this.getWAbs('2.3'),	50);
		test.strictEqual(this.getWAbs('3'),		60);
		test.strictEqual(this.getWAbs('3.1'),	50);
		test.strictEqual(this.getWAbs('3.2'),	65);
		test.strictEqual(this.getWAbs('3.3'),	80);
		test.strictEqual(this.getWAbs('3.4'),	40);
		test.strictEqual(this.getWAbs('3.5'),	70);

		test.done();
	},
}

export function testCompPositionCross(test) {
	var root: inf.Box = {
		id: 'root',
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			h: inf.px(100),
		}, {
			h: inf.pct(0.5),
			children: [{
				h: inf.px(10),
			}]
		}, {
			h: inf.prt(1),
		}, {
			h: inf.prt(2),
		}, {
			h: inf.expand,
		}, {
			h: inf.shrink,
		}]
	};
	tree.refreshParents(root);
	var l = new layout.Layout(root);

	tree.boxForEach(root, function(box) {
		box.direction = inf.Direction.HORIZONTAL;
	});

	/* Alignment should be NEAR right now */
	test.strictEqual(l.compY(root), 0);
	test.strictEqual(l.compY(root.children[0]), 0);
	test.strictEqual(l.compY(root.children[1]), 0);
	test.strictEqual(l.compY(root.children[1].children[0]), 0);
	test.strictEqual(l.compYAbs(root.children[1].children[0]), 0);
	test.strictEqual(l.compY(root.children[2]), 0);
	test.strictEqual(l.compY(root.children[3]), 0);
	test.strictEqual(l.compY(root.children[4]), 0);
	test.strictEqual(l.compY(root.children[5]), 0);

	tree.boxForEach(root, function(box) {
		box.crossAlignment = inf.Alignment.CENTER;
	});
	test.strictEqual(l.compY(root), 0);
	test.strictEqual(l.compY(root.children[0]), 0);
	test.strictEqual(l.compY(root.children[1]), 25);
	test.strictEqual(l.compY(root.children[1].children[0]), 20);
	test.strictEqual(l.compYAbs(root.children[1].children[0]), 45);
	test.strictEqual(l.compY(root.children[2]), 0);
	test.strictEqual(l.compY(root.children[3]), 0);
	test.strictEqual(l.compY(root.children[4]), 0);
	test.strictEqual(l.compY(root.children[5]), 50);

	tree.boxForEach(root, function(box) {
		box.crossAlignment = inf.Alignment.FAR;
	});
	test.strictEqual(l.compY(root), 0);
	test.strictEqual(l.compY(root.children[0]), 0);
	test.strictEqual(l.compY(root.children[1]), 50);
	test.strictEqual(l.compY(root.children[1].children[0]), 40);
	test.strictEqual(l.compYAbs(root.children[1].children[0]), 90);
	test.strictEqual(l.compY(root.children[2]), 0);
	test.strictEqual(l.compY(root.children[3]), 0);
	test.strictEqual(l.compY(root.children[4]), 0);
	test.strictEqual(l.compY(root.children[5]), 100);

	test.done();
}
