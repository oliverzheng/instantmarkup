
/**
 * An overlap group is a list of boxes such that:
 * - for each box, there is at least another box that overlaps it, by
 *   rectangular bound, and
 * - all the boxes that overlaps any of the boxes in this list are in this list,
 *   which is to say each box in a layout has one and only 1 overlapping group,
 *   and
 * - the list of boxes is sorted in the z-order in the layout, and
 */
export class OverlapGroup {
	layout: l.Layout;
	boxes: inf.Box[];

	/**
	 * Find all the boxes that overlap for a given box in the layout, and return
	 * an overlap group for it.
	 */
	static fromBox(layout: l.Layout, box: inf.Box): OverlapGroup {
		return null;
	}

	/**
	 * Group all layers into siblings under one parent and return the parent.
	 */
	group(): inf.Box {
		return null;
	}
}

/**
 * Group a group of overlapping boxes together. Their visual positions and
 * sizing are retained.
 */
export function createOverlapParent(layout: l.Layout, boxes: inf.Box[]): inf.Box {
	var boundingRect = layout.getBoundingRect(boxes);

	/* Use the first overlap box's parent as the grandparent, since
	 * z-order-wise the overlaps belong there. */
	var grandParent = boxes[0].parent;
	var grandRect = layout.getBoundingRect(boxes);
	var parent: inf.Box = {
		parent: grandParent,
		w: inf.px(boundingRect.w),
		h: inf.px(boundingRect.h),
		generated: true,
	};

	return parent;
}

/**
 * For all boxes that overlap other boxes, find a home for them.
 *
 * @return Generated list of boxes, which are parents of overlaps.
 */
export function containOverlapBoxes(layout: l.Layout, idPrefix: string,
									boxes?: inf.Box[]): inf.Box[] {
	if (!boxes)
		boxes = gen.depthFirst(layout.root).toArray();

	/* Each element is a group of boxes. Each group of boxes overlap among each
	 * other, and need to be grouped. Within a group, all boxes overlap
	 * atomically, in that there is no other box between them. */
	var overlapGroups: inf.Box[][] = [];

	while (boxes.length > 0) {
		var box = boxes.shift();
		var boxRect = layout.getRect(box);

		var overlapsToProcess = [box];
		var overlapped: inf.Box[] = [box];

		/* Find a group of boxes that are all entangled somehow. */
		while (overlapsToProcess.length > 0) {
			var processing = overlapsToProcess.shift();
			var rect = layout.getRect(processing);

			search.findOverlap(layout, rect).filter((overlap) => {
				return overlapped.indexOf(overlap) !== -1;
			}).forEach((overlap) => {
				overlapped.push(overlap);
				overlapsToProcess.push(overlap);
			});
		}

		if (overlapped.length <= 1)
			continue;

		/* Don't process again. */
		overlapped.forEach((overlap) => {
			var index = boxes.indexOf(overlap);
			if (index !== -1)
				boxes.splice(index, 1);
		});

		/* If there are other boxes that are in the same area as our overlaps,
		 * but don't overlap because they are too big, we need to split up our
		 * overlaps so that z-order-wise, things are still visually correct. */
		var boundingRect = layout.getBoundingRect(overlapped);
		/* TODO: When TS generics land, add .map to iterators. */
		var containers = search.findContainer(layout, boundingRect).toArray();

		overlapped = tree.sortByDepthFirst(overlapped);

		var indices = containers.map((container) => {
			return tree.depthFirstInsertionIndex(container, overlapped);
		}).filter((index) => {
			return index !== 0 && index < overlapped.length;
		});

		var smallIndices = [0].concat(indices);
		var bigIndices = indices.concat([overlapped.length]);

		var groups = _.zip(smallIndices, bigIndices).map((twoIndices) => {
			return twoIndices[1] - twoIndices[0];
		}).map((length) => {
			return overlapped.splice(0, length);
		});
		overlapGroups.push.apply(overlapGroups, groups);
	}

	var parents: inf.Box[] = overlapGroups.map((group) => {
		return createOverlapParent(layout, group);
	});

	return parents;
}
