/// <reference path ="../../_typings.d.ts" />

import _ = module('underscore');

import inf = module('./interfaces');
import l = module('./layout');
import search = module('./search');
import gen = module('./generator');
import util = module('./util');
import tree = module('./tree');
import op = module('./operations');

/* The goal here is to group boxes into layers of non-overlapping boxes, which
 * will then get processed by partitioning. The heuristic here tries to maximize
 * the number non-overlapping boxes in the layer with the most boxes.
 *
 * - Containment. The boundary of box 1 contains the boundary of box 2.
 * - Uncontainment. Box 1 overlaps box 2 (e.g. a visual emphasis). There are two
 *   scenarios:
 *   - Box 1 only overlaps box 2. Treat it as containment so box 2 contains
 *     box 1.
 *   - Box 1 overlaps more than box 2 and box 3 (or more). Put box 1 on another
 *     layer.
 * - Stack. If (un)containment does not apply, a series of overlapping boxes is
 *   grouped into its own box with a layer for each box.
 */


function isContainedBy(layout: l.Layout, box: inf.Box, parent: inf.Box): bool {
	if (tree.isAncestor(parent, box))
		return true;

	if (box.parent === parent.parent &&
		tree.indexOfChild(parent) === 0 &&
		util.rectEquals(layout.getRect(box), layout.getRect(parent)))
		return true;

	return false;
}

/**
 * Group boxes into their containing parents.
 */
export function containBoxes(layout: l.Layout, idPrefix: string,
							 boxes?: inf.Box[]): inf.Box[] {
	/* Process each box top down. */
	if (!boxes)
		boxes = gen.depthFirst(layout.root).toArray();

	var createdBoxes: inf.Box[] = [];
	var counter = 0;

	while (boxes.length > 0) {
		var box = boxes.shift();
		var boxRect = layout.getRect(box);

		/* We only want boxes that don't overlap anything. */
		if (search.findOverlap(layout, boxRect).not(box).any())
			continue;

		function isntDescendant(target: inf.Box): bool {
			return !tree.isAncestor(box, target);
		}
		var boxesBelowIt = gen.depthFirst(layout.root, box).
								// Don't want box itself
								drop(1).
								// Don't want children of box
								filter(isntDescendant);
		/* We don't want the smallest box. We want the closest box in z-order.
		 * Otherwise, we could reparent with an incorrect z-order. */
		var parentBelow = search.findContainer(layout, boxRect,
											   boxesBelowIt).first();
		var boxesAboveIt = gen.reverseDepthFirst(layout.root, box).
								drop(1).
								filter(isntDescendant);
		var parentAbove = search.findContainer(layout, boxRect,
											   boxesAboveIt).first();

		var parent: inf.Box = parentBelow || parentAbove;

		/* No parents found? Okay.jpg */
		if (!parent)
			continue;

		/* Presumably, if parentAbove exists, it's transparent and box is
		 * visible. Use the parent that's smaller. */
		if (parentBelow && parentAbove &&
			util.rectArea(layout.getRect(parentAbove)) <
				util.rectArea(layout.getRect(parentBelow)))
			parent = parentAbove;

		if (isContainedBy(layout, box, parent))
			continue;

		var created = op.reparent(layout, box, parent, idPrefix + counter);

		if (created) {
			counter++;
			createdBoxes.push(created);
		}
	}

	return createdBoxes;
}

/**
 * Contain all boxes into an appropriate parent.
 */
export function containLayout(layout: l.Layout, idPrefix: string): inf.Box[] {
	var created: inf.Box[] = [];
	while (true) {
		var newlyCreated = containBoxes(layout, idPrefix);
		if (newlyCreated.length > 0)
			created.push.apply(created, newlyCreated);
		else
			break;
	}
	return created;
}
