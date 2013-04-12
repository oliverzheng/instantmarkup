/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces')

export function makeIter(gen: () => inf.Box): inf.BoxIter {
	var iter: any = gen;
	iter.first = (condition: (box: inf.Box) => bool) => {
		return first(gen, condition);
	};

	iter.forEach = (callback: (box: inf.Box) => any) => {
		return forEach(gen, callback);
	};

	return iter;
}

/**
 * Iterate boxes by depth-first
 */
export function depthFirst(root: inf.Box): inf.BoxIter {
	var prevNode: inf.Box;

	function getDeepest(box: inf.Box) {
		while ((box.children || []).length > 0)
			box = box.children[0];
		return box;
	}

	return makeIter(() => {
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

/**
 * Returns the first box that matches a condition.
 */
export function first(iter: inf.BoxIter, condition: (box: inf.Box) => bool): inf.Box {
	var box: inf.Box;
	while ((box = iter()) && !condition(box));
	return box;
}

/**
 * Iterates through all boxes.
 */
export function forEach(iter: inf.BoxIter,
						callback: (box: inf.Box) => any): void {
	var box: inf.Box;
	while (box = iter())
		callback(box);
}
