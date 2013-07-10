/// <reference path="../../../../_typings.d.ts" />

import inf = module('../../interfaces');
import tree = module('../../tree');
import l = module('../../layout');
import gen = module('../../generator');
import testUtil = module('../../../testUtil');
import ss = module('../../snapshot');
import contain = module('../containment');

export function testContainmentSingleAbove(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(40),
			h: inf.px(40),
			absolute: {
				l: inf.px(20),
				t: inf.px(20),
			}
		}, {
			w: inf.px(80),
			h: inf.px(80),
			absolute: {
				l: inf.px(0),
				t: inf.px(0),
			}
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var snapshot = new ss.Snapshot(layout);
	var box1 = root.children[0];
	var box2 = root.children[1];

	var created = contain.containLayout(layout, 'prefix');

	test.strictEqual(root.children.length, 1);
	test.strictEqual(root.children[0], box2);
	test.strictEqual(box2.children.length, 1);
	test.strictEqual(box2.children[0], box1);
	test.strictEqual(created.length, 0);

	test.equal(snapshot.equalsLayout(layout), true);

	test.done();
}

export function testContainmentSingleBelow(test) {
	var root: inf.Box = {
		w: inf.px(100),
		h: inf.px(100),
		children: [{
			w: inf.px(80),
			h: inf.px(80),
			absolute: {
				l: inf.px(0),
				t: inf.px(0),
			}
		}, {
			w: inf.px(40),
			h: inf.px(40),
			absolute: {
				l: inf.px(20),
				t: inf.px(20),
			}
		}]
	};
	tree.refreshParents(root);
	var layout = new l.Layout(root);
	var snapshot = new ss.Snapshot(layout);
	var box1 = root.children[0];
	var box2 = root.children[1];

	var created = contain.containLayout(layout, 'prefix');

	test.strictEqual(created.length, 1);
	test.strictEqual(root.children.length, 1);
	test.strictEqual(root.children[0], created[0]);
	test.strictEqual(created[0].children.length, 2);
	test.strictEqual(created[0].children[0], box1);
	test.strictEqual(created[0].children[1], box2);

	test.equal(snapshot.equalsLayout(layout), true);

	test.done();
}
