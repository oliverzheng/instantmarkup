/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces')
import iter = module('./iterator')

/**
 * Turn an array into an iterator.
 */
export function arrayToIter(boxes: () => inf.Box): iter.BoxIter {
	var i = 0;
	return iter.makeIter(() => {
		if (i < boxes.length)
			return boxes[i++];
	});
}

/**
 * Iterate boxes by depth-first.
 */
export function depthFirst(root: inf.Box): iter.BoxIter {
	var prevNode: inf.Box;

	function getDeepest(box: inf.Box) {
		while ((box.children || []).length > 0)
			box = box.children[0];
		return box;
	}

	return iter.makeIter(() => {
		/* First time here */
		if (!prevNode)
			return prevNode = getDeepest(root);

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
