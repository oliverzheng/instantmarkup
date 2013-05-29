/// <reference path='../../_typings.d.ts' />

import extinf = module('../extract/interfaces')
import extutil = module('../extract/util')
import inf = module('./interfaces')
import tree = module('./tree')

export function sortNumbers(numbers: number[]) {
	/* Damn it JavaScript. Why is this not built in? Go home, you are drunk. */
	numbers.sort((a, b) => {
		return a - b;
	});
}

export function layerToBox(rootLayer: extinf.Layer): inf.Box {
	var root: inf.Box = {
		id: rootLayer.id,
		layerId: rootLayer.id,
		w: inf.px(rootLayer.bbox.w),
		h: inf.px(rootLayer.bbox.h),
	};

	var layers = extutil.flattenLayers(rootLayer);
	root.children = layers.map(function(layer): inf.Box {
		return {
			id: layer.id,
			layerId: layer.id,
			parent: root,
			absolute: {
				l: inf.px(layer.bbox.x),
				t: inf.px(layer.bbox.y),
			},
			w: inf.px(layer.bbox.w),
			h: inf.px(layer.bbox.h),
		};
	});

	return root;
}

/**
 * Whether the two lengths are identical.
 */
export function lengthEquals(first: inf.Length, second: inf.Length): bool {
	if (!first)
		first = inf.defaultLength;
	if (!second)
		second = inf.defaultLength;

	if (first.unit === second.unit) {
		if (first.unit === inf.LengthUnit.EXPAND ||
			first.unit === inf.LengthUnit.SHRINK)
			return true;
		else
			return first.value === second.value;
	}

	return false;
}

/**
 * Get the other direction.
 */
export function otherDirection(dir: inf.Direction): inf.Direction {
	if (dir === inf.Direction.HORIZONTAL)
		return inf.Direction.VERTICAL;
	if (dir === inf.Direction.VERTICAL)
		return inf.Direction.HORIZONTAL;
	throw 'Invalid direction';
}

/**
 * Returns if two rects are the same.
 */
export function rectEquals(rect1: inf.Rect, rect2: inf.Rect): bool {
	return (
		rect1.x === rect2.x &&
		rect1.y === rect2.y &&
		rect1.w === rect2.w &&
		rect1.h === rect2.h
	);
}

/**
 * Returns true if a rect is empty.
 */
export function rectEmpty(rect: inf.Rect): bool {
	return rect.w <= 0 || rect.h <= 0;
}

/**
 * Returns whether or not rect1 completely contains rect2.
 */
export function rectContains(rect1: inf.Rect, rect2: inf.Rect): bool {
	return (
		rect1.x <= rect2.x &&
		rect1.y <= rect2.y &&
		(rect1.x + rect1.w) >= (rect2.x + rect2.w) &&
		(rect1.y + rect1.h) >= (rect2.y + rect2.h)
	);
}

/**
 * Returns if one rect is bigger than another. This differs from rectContains in
 * that it returns false when any edges touch.
 */
export function rectBiggerThan(rect1: inf.Rect, rect2: inf.Rect): bool {
	return (
		rect1.x < rect2.x &&
		rect1.y < rect2.y &&
		(rect1.x + rect1.w) > (rect2.x + rect2.w) &&
		(rect1.y + rect1.h) > (rect2.y + rect2.h)
	);
}

/**
 * Returns whether or not rect1 overlaps rect2.
 */
export function rectOverlaps(rect1: inf.Rect, rect2: inf.Rect): bool {
	var horizOverlap = (
		/* Left edge of rect1 is between rect2. */
		(rect1.x >= rect2.x && rect1.x < (rect2.x + rect2.w) &&
		 rect1.x + rect1.w > rect2.x) || /* Zero width does not overlap. */
		/* Left edge of rect2 is between rect1. */
		(rect2.x >= rect1.x && rect2.x < (rect1.x + rect1.w) &&
		 rect2.x + rect2.w > rect1.x)
	);

	var vertOverlap = (
		/* Top edge of rect1 is between rect2. */
		(rect1.y >= rect2.y && rect1.y < (rect2.y + rect2.h) &&
		 rect1.y + rect1.h > rect2.y) ||
		/* Top edge of rect2 is between rect1. */
		(rect2.y >= rect1.y && rect2.y < (rect1.y + rect1.h) &&
		 rect2.y + rect2.h > rect1.y)
	);

	return horizOverlap && vertOverlap;
}

/**
 * Returns the area of a rect.
 */
export function rectArea(rect: inf.Rect): number {
	return rect.w * rect.h;
}

/**
 * Sort comparison function for the area of two rectangles. If both rectangles
 * have zero area, the one with a longer side is bigger.
 */
export function rectCmpArea(rect1: inf.Rect, rect2: inf.Rect): number {
	var rectArea1 = rectArea(rect1);
	var rectArea2 = rectArea(rect2);
	if (rectArea1 !== 0 && rectArea2 !== 0)
		return rectArea1 - rectArea2;
	else
		return Math.max(rect1.w, rect1.h) - Math.max(rect2.w, rect2.h);
}

/**
 * Given two rects that are aligned horizontally or vertically, get the rect
 * that fills the gap between them.
 */
export function getRectBetween(rect1: inf.Rect, rect2: inf.Rect): inf.Rect {
	var horizontal = [rect1.x, rect1.x + rect1.w, rect2.x, rect2.x + rect2.w];
	var vertical = [rect1.y, rect1.y + rect1.h, rect2.y, rect2.y + rect2.h];
	sortNumbers(horizontal);
	sortNumbers(vertical);
	return {
		x: horizontal[1],
		y: vertical[1],
		w: horizontal[2] - horizontal[1],
		h: vertical[2] - vertical[1],
	};
}

/**
 * Get the rectangle that most tightly fits an input of rectangles.
 */
export function getBoundingRect(rects: inf.Rect[]): inf.Rect {
	if (rects.length === 0)
		throw 'No rects';

	/* Don't modify the original rects. */
	var first = rects.pop();
	var bound = {
		x: first.x,
		y: first.y,
		w: first.w,
		h: first.h,
	};
	while (rects.length > 0) {
		var rect = rects.pop();
		bound = {
			x: Math.min(bound.x, rect.x),
			y: Math.min(bound.y, rect.y),
			w: Math.max(bound.x + bound.w, rect.x + rect.w),
			h: Math.max(bound.y + bound.h, rect.y + rect.h),
		};
		bound.w -= bound.x;
		bound.h -= bound.y;
	}
	return bound;
}
