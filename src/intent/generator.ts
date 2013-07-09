/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces')
import iter = module('./iterator')

/**
 * Turn an array into an iterator.
 */
export function arrayToIter(boxes: inf.Box[]): iter.BoxIter {
	var i = 0;
	return iter.makeIter(() => {
		if (i < boxes.length)
			return boxes[i++];
	});
}

/**
 * Iterate boxes by depth-first.
 *
 * @param root The root of the boxes to restrict depth first search to.
 * @param first The first box under root to start. All boxes before that are
 * discarded.
 */
export function depthFirst(root: inf.Box, first: inf.Box = null): iter.BoxIter {
	var prevNode: inf.Box;

	function getDeepest(box: inf.Box) {
		while ((box.children || []).length > 0)
			box = box.children[0];
		return box;
	}

	if (!first)
		first = getDeepest(root);

	return iter.makeIter(() => {
		/* First time here */
		if (!prevNode)
			return prevNode = first;

		if (prevNode === root)
			/* We are done iterating */
			return null;

		var parent = prevNode.parent;
		var siblings = parent.children;
		var nextIndex = siblings.indexOf(prevNode) + 1;
		if (nextIndex < siblings.length)
			return prevNode = getDeepest(siblings[nextIndex]);
		else
			return prevNode = parent;
	});
}

/**
 * Iter for depthFirst in reverse order. I.e. bottom up.
 */
export function reverseDepthFirst(root: inf.Box,
								  first: inf.Box = null): iter.BoxIter {
	var prevNode: inf.Box;

	function getDeepest(box: inf.Box) {
		while ((box.children || []).length > 0)
			box = box.children[0];
		return box;
	}

	if (!first)
		first = root;

	var last = getDeepest(root);

	return iter.makeIter(() => {
		/* First time here */
		if (!prevNode)
			return prevNode = first;

		if (prevNode === last)
			/* We are done iterating */
			return null;

		var children = prevNode.children || [];
		if (children.length > 0)
			return prevNode = children[children.length - 1];

		var parent = prevNode.parent;
		var prev = prevNode;
		while (parent) {
			var siblings = parent.children;
			var nextIndex = siblings.indexOf(prev) - 1;
			if (nextIndex >= 0)
				return prevNode = siblings[nextIndex];
			else {
				prev = parent;
				parent = parent.parent;
			}
		}
	});
}
