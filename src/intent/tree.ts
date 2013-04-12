/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces')
import iter = module('./iter');

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
	return iter.depthFirst(root).first((box) => {
		return (box.id === id);
	});
}

/**
 * Remove a box from the tree.
 *
 * @return The box's original parent.
 */
export function orphanBox(box: inf.Box): inf.Box {
	var i = indexOfChild(box);
	if (i !== -1) {
		var parent = box.parent;
		parent.children.splice(i, 1);
		box.parent = null;
		return parent;
	}
	return null;
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
export function getAncestor(box: inf.Box, degree?: number = 1): inf.Box {
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
 * Repath box to be under another parent. Relative z-order is maintained.
 *
 * @param box Box to reparent.
 * @param parent Box to be the new parent.
 * @return The original parent of the box.
 */
export function reparent(box: inf.Box, parent: inf.Box): inf.Box {
	if (parent === box.parent)
		return parent;

	if (!parent.children)
		parent.children = [];
	var oldParent = box.parent;

	if (isAncestor(parent, box)) {
		var child = box;
		while (child.parent !== parent)
			child = child.parent;

		orphanBox(box);

		parent.children.splice(indexOfChild(child), 0, box);

	} else {
		var before = isBefore(box, parent);

		orphanBox(box);

		if (before)
			parent.children.unshift(box);
		else
			parent.children.push(box);
	}

	box.parent = parent;

	return oldParent;
}
