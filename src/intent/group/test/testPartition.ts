/// <reference path="../../../../_typings.d.ts" />

import inf = module('../../interfaces');
import l = module('../../layout');
import tree = module('../../tree');
import util = module('../../util');
import ss = module('../../snapshot');
import testUtil = module('../../../testUtil');
import partition = module('../partition');

/* Remove an empty range from a range */
export function testRangesEmptyRange(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: 0, far: 0 });
	test.strictEqual(ranges.ranges.length, 1);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 10 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 from range2 that does not overlap range1. */
export function testRangesNonOverlap(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: 15, far: 20 });
	test.strictEqual(ranges.ranges.length, 1);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 10 });

	/* See the edge case of when they are touching. */
	ranges.removeRange({ near: 10, far: 20 });
	test.strictEqual(ranges.ranges.length, 1);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 10 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 from range2 that completely contains range1. */
export function testRangesContained(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: 2, far: 8 });
	test.strictEqual(ranges.ranges.length, 2);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 2 });
	testUtil.equals(test, ranges.ranges[1], { near: 8, far: 10 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 from range2 that equals range1. */
export function testRangesExact(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: 0, far: 10 });
	test.strictEqual(ranges.ranges.length, 2);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 0 });
	testUtil.equals(test, ranges.ranges[1], { near: 10, far: 10 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 that overlaps the top part of range2. */
export function testRangesNearExact(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: 0, far: 5 });
	test.strictEqual(ranges.ranges.length, 2);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 0 });
	testUtil.equals(test, ranges.ranges[1], { near: 5, far: 10 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 that overlaps the bottom part of range2. */
export function testRangesFarExact(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: 5, far: 10 });
	test.strictEqual(ranges.ranges.length, 2);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 5 });
	testUtil.equals(test, ranges.ranges[1], { near: 10, far: 10 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 that extends beyond the top part of range2. */
export function testRangesNearOverlap(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: -5, far: 5 });
	test.strictEqual(ranges.ranges.length, 1);
	testUtil.equals(test, ranges.ranges[0], { near: 5, far: 10 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 that extends beyond the top part of range2. */
export function testRangesFarOverlap(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: 5, far: 15 });
	test.strictEqual(ranges.ranges.length, 1);
	testUtil.equals(test, ranges.ranges[0], { near: 0, far: 5 });

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

/* Remove range1 that extends beyond the near and far of range2. */
export function testRangesOverlap(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.removeRange({ near: -5, far: 15 });
	test.strictEqual(ranges.ranges.length, 0);

	var middleRanges = ranges.getMiddleRanges();
	test.strictEqual(middleRanges.length, 0);

	test.done();
}

export var testRangesMulti = {
	setUp: function(callback) {
		this.ranges = new partition.Ranges({ near: 0, far: 10 });
		this.ranges.removeRange({ near: 4, far: 6 });
		callback();
	},

	/* Remove range1 that is contained within 2 ranges. */
	contained: function(test) {
		this.ranges.removeRange({ near: 3, far: 7 });
		testUtil.equals(test, this.ranges.ranges[0], { near: 0, far: 3 });
		testUtil.equals(test, this.ranges.ranges[1], { near: 7, far: 10 });
		test.done();
	},

	/* Remove range1 that is at the top of range2. */
	nearOverlap: function(test) {
		this.ranges.removeRange({ near: 3, far: 7 });
		testUtil.equals(test, this.ranges.ranges[0], { near: 0, far: 3 });
		testUtil.equals(test, this.ranges.ranges[1], { near: 7, far: 10 });
		test.done();
	},
};

export function testRangesSplit(test) {
	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.split(0, 5);
	test.strictEqual(ranges.ranges.length, 2);
	test.strictEqual(ranges.ranges[0].near, 0);
	test.strictEqual(ranges.ranges[0].far, 5);
	test.strictEqual(ranges.ranges[1].near, 5);
	test.strictEqual(ranges.ranges[1].far, 10);

	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.split(0, 10);
	test.strictEqual(ranges.ranges.length, 2);
	test.strictEqual(ranges.ranges[0].near, 0);
	test.strictEqual(ranges.ranges[0].far, 10);
	test.strictEqual(ranges.ranges[1].near, 10);
	test.strictEqual(ranges.ranges[1].far, 10);

	var ranges = new partition.Ranges({ near: 0, far: 10 });
	ranges.split(0, 20);
	test.strictEqual(ranges.ranges.length, 1);
	test.strictEqual(ranges.ranges[0].near, 0);
	test.strictEqual(ranges.ranges[0].far, 10);

	test.done();
}

export function testFindGapsHorizontal(test) {
	var bound = {
		x: 0,
		y: 0,
		w: 100,
		h: 1,
	};
	var rects = [{
		x: 10,
		y: 0,
		w: 10,
		h: 1,
	}, {
		x: 20,
		y: 0,
		w: 10,
		h: 1,
	}, {
		x: 25,
		y: 0,
		w: 10,
		h: 1,
	}, {
		x: 40,
		y: 0,
		w: 10,
		h: 1,
	}];
	var expectedHorizGaps = [{
		x: 20,
		y: 0,
		w: 0,
		h: 1,
	}, {
		x: 35,
		y: 0,
		w: 5,
		h: 1,
	}];

	var partitionRects = new partition.Rects(bound, rects);
	var gapsByDirection = partition.Gaps.getGapsFromRects(partitionRects);

	test.equal(gapsByDirection.vert, null);
	var horiz = gapsByDirection.horiz;
	test.equal(horiz.direction, inf.horiz);
	testUtil.equals(test, bound, horiz.bound);
	testUtil.equals(test, expectedHorizGaps, horiz.rects);

	test.done();
}

export function testPartitionEmpty(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
	};
	var layout = new l.Layout(root);
	var snapshot = new ss.Snapshot(layout);

	var actual = partition.partitionChildren(layout, root, '');
	var expected = [];

	testUtil.equals(test, actual, expected);
	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}

export function testPartitionSingle(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(50),
			h: inf.px(50),
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var snapshot = new ss.Snapshot(layout);

	var actual = partition.partitionChildren(layout, root, '');
	var expected = [];

	testUtil.equals(test, actual, expected);
	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}

export function testPartitionStackedAlready(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		direction: inf.horiz,
		children: [{
			w: inf.px(50),
			h: inf.px(50),
		}, {
			w: inf.px(50),
			h: inf.px(50),
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var snapshot = new ss.Snapshot(layout);

	var groups = partition.partitionChildren(layout, root, 'group');
	test.strictEqual(groups.length, 0);

	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}

export function testPartitionStackVertNoGaps(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(100),
			h: inf.px(30),
			absolute: {
				t: inf.px(0),
				l: inf.px(0)
			}
		}, {
			w: inf.px(50),
			h: inf.px(40),
			absolute: {
				t: inf.px(30),
				l: inf.px(0)
			}
		}, {
			w: inf.px(50),
			h: inf.px(40),
			absolute: {
				t: inf.px(30),
				l: inf.px(50)
			}
		}, {
			w: inf.px(100),
			h: inf.px(30),
			absolute: {
				b: inf.px(0),
				l: inf.px(0)
			}
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var box2 = root.children[1];
	var box3 = root.children[2];
	var box4 = root.children[3];
	var snapshot = new ss.Snapshot(layout);

	var groups = partition.partitionChildren(layout, root, 'group');
	test.strictEqual(groups.length, 1);
	var group = groups[0];

	test.strictEqual(root.children.length, 3);
	test.strictEqual(root.children[0], box1);
	test.strictEqual(root.children[1], group);
	test.strictEqual(root.children[2], box4);
	test.strictEqual(root.direction, inf.vert);

	test.strictEqual(group.children.length, 2);
	test.strictEqual(group.children[0], box2);
	test.strictEqual(group.children[1], box3);
	var groupRect = layout.getRect(group);
	var expectedGroupRect = {
		x: 0,
		y: 30,
		w: 100,
		h: 40,
	};
	testUtil.equals(test, groupRect, expectedGroupRect);

	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}

export function testPartitionStackHorizNoGaps(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(30),
			h: inf.px(100),
			absolute: {
				t: inf.px(0),
				l: inf.px(0),
			}
		}, {
			w: inf.px(40),
			h: inf.px(50),
			absolute: {
				t: inf.px(0),
				l: inf.px(30),
			}
		}, {
			w: inf.px(40),
			h: inf.px(50),
			absolute: {
				t: inf.px(50),
				l: inf.px(30),
			}
		}, {
			w: inf.px(30),
			h: inf.px(100),
			absolute: {
				t: inf.px(0),
				r: inf.px(0)
			}
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var box2 = root.children[1];
	var box3 = root.children[2];
	var box4 = root.children[3];
	var snapshot = new ss.Snapshot(layout);

	var groups = partition.partitionChildren(layout, root, 'group');
	test.strictEqual(groups.length, 1);
	var group = groups[0];

	test.strictEqual(root.children.length, 3);
	test.strictEqual(root.children[0], box1);
	test.strictEqual(root.children[1], group);
	test.strictEqual(root.children[2], box4);
	test.strictEqual(root.direction, inf.horiz);

	test.strictEqual(group.children.length, 2);
	test.strictEqual(group.children[0], box2);
	test.strictEqual(group.children[1], box3);
	var groupRect = layout.getRect(group);
	var expectedGroupRect = {
		x: 30,
		y: 0,
		w: 40,
		h: 100,
	};
	testUtil.equals(test, groupRect, expectedGroupRect);

	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}

export function testPartitionStackGaps(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(90),
			h: inf.px(20),
			absolute: {
				t: inf.px(5),
				l: inf.px(5)
			}
		}, {
			w: inf.px(40),
			h: inf.px(30),
			absolute: {
				t: inf.px(30),
				l: inf.px(5)
			}
		}, {
			w: inf.px(40),
			h: inf.px(30),
			absolute: {
				t: inf.px(30),
				l: inf.px(55)
			}
		}, {
			w: inf.px(90),
			h: inf.px(20),
			absolute: {
				b: inf.px(5),
				l: inf.px(5)
			}
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var box2 = root.children[1];
	var box3 = root.children[2];
	var box4 = root.children[3];
	var snapshot = new ss.Snapshot(layout);

	var groups = partition.partitionChildren(layout, root, 'group');
	test.strictEqual(groups.length, 1);
	var group = groups[0];

	test.strictEqual(root.children.length, 3);
	test.strictEqual(root.children[0], box1);
	test.strictEqual(root.children[1], group);
	test.strictEqual(root.children[2], box4);
	test.strictEqual(root.direction, inf.vert);

	test.strictEqual(group.children.length, 2);
	test.strictEqual(group.children[0], box2);
	test.strictEqual(group.children[1], box3);
	var groupRect = layout.getRect(group);
	var expectedGroupRect = {
		x: 5,
		y: 30,
		w: 90,
		h: 30,
	};
	testUtil.equals(test, groupRect, expectedGroupRect);

	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}

/* Test when both horizontal and vertical stacks can be made. */
export function testPartitionHorizVert(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(30),
			h: inf.px(30),
			absolute: {
				t: inf.px(0),
				l: inf.px(0),
			}
		}, {
			w: inf.px(30),
			h: inf.px(30),
			absolute: {
				t: inf.px(0),
				l: inf.px(33),
			}
		}, {
			w: inf.px(30),
			h: inf.px(30),
			absolute: {
				t: inf.px(0),
				r: inf.px(0),
			}
		}, {
			w: inf.px(30),
			h: inf.px(30),
			absolute: {
				b: inf.px(0),
				l: inf.px(0),
			}
		}, {
			w: inf.px(30),
			h: inf.px(30),
			absolute: {
				b: inf.px(0),
				l: inf.px(33),
			}
		}, {
			w: inf.px(30),
			h: inf.px(30),
			absolute: {
				b: inf.px(0),
				r: inf.px(0),
			}
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var box2 = root.children[1];
	var box3 = root.children[2];
	var box4 = root.children[3];
	var box5 = root.children[4];
	var box6 = root.children[5];
	var snapshot = new ss.Snapshot(layout);

	var groups = partition.partitionChildren(layout, root, 'group');
	test.strictEqual(groups.length, 2);

	test.strictEqual(root.children.length, 2);
	test.strictEqual(root.children[0], groups[0]);
	test.strictEqual(root.children[1], groups[1]);
	test.strictEqual(root.direction, inf.vert);

	test.strictEqual(groups[0].children.length, 3);
	test.strictEqual(groups[0].children[0], box1);
	test.strictEqual(groups[0].children[1], box2);
	test.strictEqual(groups[0].children[2], box3);

	test.strictEqual(groups[1].children.length, 3);
	test.strictEqual(groups[1].children[0], box4);
	test.strictEqual(groups[1].children[1], box5);
	test.strictEqual(groups[1].children[2], box6);

	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}

export function testPartitionMultiple(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(100),
			h: inf.px(30),
			absolute: {
				t: inf.px(0),
				l: inf.px(0)
			}
		}, {
			w: inf.px(50),
			h: inf.px(40),
			absolute: {
				t: inf.px(30),
				l: inf.px(0)
			}
		}, {
			w: inf.px(50),
			h: inf.px(40),
			absolute: {
				t: inf.px(30),
				l: inf.px(50)
			}
		}, {
			w: inf.px(100),
			h: inf.px(30),
			absolute: {
				b: inf.px(0),
				l: inf.px(0)
			}
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var box1 = root.children[0];
	var box2 = root.children[1];
	var box3 = root.children[2];
	var box4 = root.children[3];
	var snapshot = new ss.Snapshot(layout);

	var groups = partition.partition(layout, root, 'group');
	test.strictEqual(groups.length, 1);
	var group = groups[0];

	test.strictEqual(root.children.length, 3);
	test.strictEqual(root.children[1], group);
	test.strictEqual(root.direction, inf.vert);

	test.strictEqual(group.children.length, 2);
	test.strictEqual(group.children[0], box2);
	test.strictEqual(group.children[1], box3);
	test.strictEqual(group.direction, inf.horiz);

	test.equals(snapshot.equalsLayout(layout), true);

	test.done();
}
