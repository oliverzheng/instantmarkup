/// <reference path="../../_typings.d.ts" />

var coll = require('coll');

import _ = module('underscore');

import inf = module('./interfaces');
import iter = module('./iterator');
import gen = module('./generator');
import search = module('./search');
import util = module('./util');
import l = module('./layout');

export enum SnapshotType {
	POSITION,
	VISUAL,

	ALL,
}

interface SnapshotBoxInfo {
	box: inf.Box;
	rect: inf.Rect;
	below: inf.Box[];
}

/**
 * Snapshot remembers the visual layout of a hierarchy of boxes. The layout is
 * what boxes are above and below each other. When boxes are reorganized, the
 * hierarchy may change, but the visual layout should not. Snapshots can be
 * compared to verify the fidelity of hierarchy modifications.
 */
export class Snapshot {
	private type: SnapshotType;

	/* A map from box to rect */
	private boxInfos: { [id: string]: SnapshotBoxInfo; };

	constructor(layout: l.Layout, type: SnapshotType = SnapshotType.ALL) {
		this.type = type;
		this.boxInfos = {};

		function notGen(box) {
			return !box.generated;
		}

		gen.depthFirst(layout.root).filter(notGen).forEach((box) => {
			/* AUto-generate box id */
			if (box.id == null)
				box.id = util.genId();

			var rect = layout.getRect(box);

			var below = gen.depthFirst(layout.root)
							.filter(notGen)
							.dropWhile((other) => {
								return other !== box;
							}).drop(1); /* The first is box. */

			this.boxInfos[box.id] = {
				box: box,
				rect: rect,
				below: search.findTouching(layout, rect, below).toArray(),
			};
		});
	}

	equalsLayout(layout: l.Layout): bool {
		return this.equals(new Snapshot(layout));
	}

	equals(other: Snapshot): bool {
		return !this.diff(other).any();
	}

	diff(other: Snapshot): iter.BoxIter {
		if (this.type !== other.type)
			throw 'Types of snapshots are not the same';

		var ownIds: string[] = Object.keys(this.boxInfos);
		var otherIds: string[] = Object.keys(other.boxInfos);
		var diffIds: string[] = _.difference(ownIds, otherIds);

		var it: iter.BoxIter = 
			gen.fromArray<string>(diffIds).map((id) => {
				return (this.boxInfos[id] || other.boxInfos[id]).box;
			});

		var sharedIds: string[] = _.intersection(ownIds, otherIds);

		if (this.type === SnapshotType.POSITION ||
			this.type === SnapshotType.ALL)
			it = it.chain(
					gen.fromArray(sharedIds).filter((id) => {
						var rect1 = this.boxInfos[id].rect;
						var rect2 = other.boxInfos[id].rect;
						return !util.rectEquals(rect1, rect2);
					}).map((id) => {
						return this.boxInfos[id].box;
					})
				);

		/* We only need to check what's below (and not above). For a box
		 * that's above another, it's already counted for by the box on top. */

		if (this.type === SnapshotType.VISUAL ||
			this.type === SnapshotType.ALL)
			it = it.chain(
					gen.fromArray(sharedIds).filter((id) => {
						var below1 = this.boxInfos[id].below;
						var below2 = other.boxInfos[id].below;
						return _.difference(below1, below2).length > 0;
					}).map((id) => {
						return this.boxInfos[id].box;
					})
				);

		return it.unique();
	}
}
