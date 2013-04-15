/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces')

/** An iterator to get boxes. If returns null, iteration has stopped. */
export interface BoxIter {
	(): inf.Box;
	toArray: () => inf.Box[];
	first: (condition?: (box: inf.Box) => bool) => inf.Box;
	forEach: (callback: (box: inf.Box, i: number) => any) => void;
	filter: (condition: (box: inf.Box) => bool) => BoxIter;
	any: (condition?: (box: inf.Box) => bool) => bool;
}

/**
 * Take a closure and turn it into an iterator by attaching necessary methods.
 */
export function makeIter(gen: () => inf.Box): BoxIter {
	var iter: any = gen;

	iter.toArray = () => {
		return toArray(iter);
	};

	iter.first = (condition: (box: inf.Box) => bool) => {
		return first(iter, condition);
	};

	iter.forEach = (callback: (box: inf.Box, i: number) => any) => {
		return forEach(iter, callback);
	};

	iter.filter = (condition: (box: inf.Box) => bool) => {
		return filter(iter, condition);
	};

	iter.any = (condition: (box: inf.Box) => bool) => {
		return any(iter, condition);
	};

	return iter;
}

/**
 * Generate a list out of an iterator.
 */
export function toArray(iter: BoxIter): inf.Box[] {
	var array: inf.Box[] = [];
	var box: inf.Box;
	while (box = iter())
		array.push(box);
	return array;
}

/**
 * Returns the first box that matches a condition.
 */
export function first(iter: BoxIter, condition?: (box: inf.Box) => bool): inf.Box {
	var box: inf.Box;
	while ((box = iter()) && condition && !condition(box));
	return box;
}

/**
 * Iterates through all boxes.
 */
export function forEach(iter: BoxIter,
						callback: (box: inf.Box, i: number) => any): void {
	var box: inf.Box;
	var i = 0;
	while (box = iter())
		callback(box, i++);
}

/**
 * Returns a new iterator that filters things.
 */
export function filter(iter: BoxIter,
					   condition: (box: inf.Box) => bool): BoxIter {
	return makeIter(() => {
		var box: inf.Box;
		while ((box = iter()) && !condition(box));
		return box;
	});
}

/**
 * Returns whether or not any box in the iterator match the condition.
 */
export function any(iter: BoxIter, condition?: (box: inf.Box) => bool): bool {
	return first(iter, condition) != null;
}
