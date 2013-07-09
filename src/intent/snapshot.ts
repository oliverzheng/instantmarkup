/// <reference path="../../_typings.d.ts" />

var coll = require('coll');

import inf = module('./interfaces');
import gen = module('./generator');
import search = module('./search');
import util = module('./util');
import l = module('./layout');

export class Snapshot {
	/* A map from box to rect */
	private rects: any;

	/* A map from box to a list of boxes below it. */
	private below: any;

	constructor(layout: l.Layout) {
		this.rects = new coll.Map;
		this.below = new coll.Map;

		function notGen(box) {
			return !box.generated;
		}

		gen.depthFirst(layout.root).filter(notGen).forEach((box) => {
			var rect = layout.getRect(box);
			this.rects.set(box, rect);

			var below = gen.depthFirst(layout.root)
							.filter(notGen)
							.dropWhile((other) => {
								return other !== box;
							}).drop(1); /* The first is box. */
			this.below.set(box, search.findTouching(layout, rect,
													below).toArray());
		});
	}

	equalsLayout(layout: l.Layout) {
		return this.equals(new Snapshot(layout));
	}

	equals(other: Snapshot) {
		if (this.rects.length !== other.rects.length)
			return false;

		if (this.rects.some((box, rect) => {
				return (!other.rects.hasKey(box) ||
						!util.rectEquals(other.rects.get(box), rect));
			}))
			return false;

		/* We only need to check what's below (and not above). For a box
		 * that's above another, it's already counted for by the box on top. */
		if (this.below.some((box, below) => {
				/* We already have the key, as checked above. */
				var l1 = coll.List(below);
				var l2 = coll.List(other.below.get(box));
				return l1.difference(l2).length > 0;
			}))
			return false;

		return true;
	}
}
