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
	take: (count: number) => BoxIter;
	takeWhile: (condition: (box: inf.Box) => bool) => BoxIter;
	drop: (count: number) => BoxIter;
	dropWhile: (condition: (box: inf.Box) => bool) => BoxIter;
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

	iter.take = (count: number) => {
		return take(iter, count);
	};

	iter.takeWhile = (condition: (box: inf.Box) => bool) => {
		return takeWhile(iter, condition);
	};

	iter.drop = (count: number) => {
		return drop(iter, count);
	};

	iter.dropWhile = (condition: (box: inf.Box) => bool) => {
		return dropWhile(iter, condition);
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

/**
 * Take the first count of boxes.
 */
export function take(iter: BoxIter, count: number): BoxIter {
	return makeIter(() => {
		if (count > 0) {
			count--;
			return iter();
		}
	});
}

/**
 * Returns an iterator that produces as many boxes as it can until condition
 * fails.
 */
export function takeWhile(iter: BoxIter,
						  condition: (box: inf.Box) => bool): BoxIter {
	var take = true;
	return makeIter(() => {
		if (take) {
			var box = iter();
			if (box && condition(box))
				return box;
			else
				take = false;
		}
	});
}

/**
 * Drop the first count of boxes.
 */
export function drop(iter: BoxIter, count: number): BoxIter {
	var drop = true;
	return makeIter(() => {
		if (drop) {
			while (count-- > 0 && iter());
			drop = false;
		}

		return iter();
	});
}

/**
 * Returns an iterator that only starts producing boxes when condition fails.
 */
export function dropWhile(iter: BoxIter,
						  condition: (box: inf.Box) => bool): BoxIter {
	var drop = true;
	return makeIter(() => {
		var box: inf.Box;
		while ((box = iter()) && drop && condition(box));
		drop = false;
		return box;
	});
}
