/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces')
import gen = module('./generator');
import iter = module('./iterator');

/**
 * Recalculate parent relationships for all children.
 */
export function refreshParents(root: inf.Box): void {
	(function refresh(box: inf.Box) {
		if (box.children)
			box.children.forEach((child) => {
				child.parent = box;
				refresh(child);
			});
	})(root);
}

/**
 * Return the index of a box among its parent's children.
 */
export function indexOfChild(box: inf.Box): number {
	var parent = box.parent;
	if (parent)
		for (var i = 0; i < parent.children.length; ++i) {
			if (parent.children[i] === box)
				return i;
		}
	return -1;
}

/**
 * Find a descendant box by id.
 */
export function getBoxById(root: inf.Box, id: string): inf.Box {
	return gen.depthFirst(root).first((box) => {
		return (box.id === id);
	});
}

/**
 * Verifies if a list of boxes all have unique non-null ids.
 */
export function hasUniqueIds(it: iter.BoxIter): bool {
	var ids: { [id: string]: bool; } = {};

	var box: inf.Box;
	while ((box = it.next()) && box.id != null && !ids[box.id])
		ids[box.id] = true;

	return box == null;
}

/**
 * Whether or not a box is the ancestor of another. A box is its own ancestor.
 */
export function isAncestor(ancestor: inf.Box, descendant: inf.Box): bool {
	while (descendant) {
		if (descendant === ancestor)
			return true;
		descendant = descendant.parent;
	}
	return false;
}

/**
 * Get the height of the box in the tree. The root has a height of 0.
 */
export function getHeight(box: inf.Box): number {
	var height = 0;
	while (box.parent) {
		height++;
		box = box.parent;
	}
	return height;
}

/**
 * Get the nth ancestor of a box. The 0th ancestor of a box is itself.
 */
export function getAncestor(box: inf.Box, degree: number = 1): inf.Box {
	while (box && degree-- > 0)
		box = box.parent;

	return box;
}

/**
 * Assuming a box is before another if:
 * - they have the same parent, and its index is before the other's, or
 * - among the children of the ancestor they share, the index of the child
 *   is before the other, or
 * - the box is a descendant of the other box. (i.e. parents are on the
 *   bottom).
 *
 * If one of the boxes is not in this tree, an exception is thrown.
 */
export function isBefore(first: inf.Box, second: inf.Box): bool {
	if (!first || !second)
		return false;

	var first_height = getHeight(first);
	var second_height = getHeight(second);
	var height_diff = first_height - second_height;
	if (height_diff > 0)
		first = getAncestor(first, height_diff);
	else if (height_diff < 0)
		second = getAncestor(second, -height_diff);

	if (first === second)
		return first_height > second_height;

	while (first.parent !== second.parent) {
		first = first.parent;
		second = second.parent;
	}

	return indexOfChild(first) < indexOfChild(second);
}

/**
 * If box were to be inserted into the list of boxes so that the result is
 * sorted by depth first order, what should the insertion index be?
 *
 * boxes must already be sorted.
 */
export function depthFirstInsertionIndex(box: inf.Box, boxes: inf.Box[]): number {
	return 0;
}

/**
 * Return a list of boxes in the tree's depth first order.
 */
export function sortByDepthFirst(boxes: inf.Box[]): inf.Box[] {
	return [];
}
