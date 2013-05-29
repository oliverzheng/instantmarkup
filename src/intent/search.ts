/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces');
import l = module('./layout');
import iter = module('./iterator');
import gen = module('./generator');
import util = module('./util');

/**
 * If two boxes overlap each other.
 */
export function boxOverlaps(layout: l.Layout,
							first: inf.Box, second: inf.Box): bool {
	var rect1 = layout.getRect(first);
	var rect2 = layout.getRect(second);

	return util.rectOverlaps(rect1, rect2);
}

/**
 * Get the top most boxes that aren't overlapped by anyone.
 *
 * @param layout Layout of the root.
 * @param root The box to look for children.
 * @param ignore The boxes to ignore if they overlap our top most boxes.
 * @return List of all boxes that are not overlapped by anything else.
 */
export function getTopMost(layout: l.Layout, root: inf.Box,
						   ignore: inf.Box[] = []): iter.BoxIter {
	return gen.depthFirst(root).filter((box) => {
		if (ignore.indexOf(box) !== -1)
			return false;

		var before: inf.Box;
		var it = gen.depthFirst(root);
		while (before = it()) {
			/* Only boxes before box can overlap box. Once we reach when before
			 * is box, everything that follows must not overlap box. */
			if (before === box)
				break;

			if (ignore.indexOf(before) !== -1)
				continue;

			if (boxOverlaps(layout, before, box))
				return false;
		};
		return true;
	});
}

/**
 * @param layout The layout the boxes belong to.
 * @param boxes List of boxes to sort.
 * @param dir Direction to sort by.
 * @return A new list of the input boxes sorted by that direction.
 */
export function sortByDirection(layout: l.Layout, boxes: inf.Box[],
								dir: inf.Direction): inf.Box[] {
	var sorted = boxes.slice(0);
	sorted.sort((box1, box2) => {
		var posAbs1 = layout.compPositionAbs(box1, dir);
		var posAbs2 = layout.compPositionAbs(box2, dir);
		var diff = posAbs1 - posAbs2;
		return diff;
	});
	return sorted;
}

/**
 * @param layout The layout to look within.
 * @param rect The bounding rectangle to search boxes within.
 * @param partial If boxes that overlap partial edges should be included.
 * @param contained If boxes that contain the rect completely should be
 * included.
 * @param it The iterator to use. Defaults to depthFirst on layout.root.
 * @return Iterator of boxes that are contained within rect.
 */
export function findWithin(layout: l.Layout, rect: inf.Rect,
						   partial: bool, contained: bool,
						   it?: iter.BoxIter): iter.BoxIter {
	if (!it)
		it = gen.depthFirst(layout.root);

	return it.filter((box) => {
		var boxRect = layout.getRect(box);

		if (contained && util.rectContains(boxRect, rect))
			return true;

		if (partial)
			/* We do not want boxes that contain the specified rect. */
			return (util.rectOverlaps(boxRect, rect) &&
					(util.rectEquals(boxRect, rect) ||
					 !util.rectBiggerThan(boxRect, rect)));
		else
			return util.rectContains(rect, boxRect);
	});
}
