/// <reference path='../../_typings.d.ts' />

import extinf = module('../extract/interfaces')
import extutil = module('../extract/util')
import inf = module('./interfaces')
import tree = module('./tree')

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
		rect1.x >= rect2.x && rect1.x < (rect2.x + rect2.w) ||
		/* Left edge of rect2 is between rect1. */
		rect2.x >= rect1.x && rect2.x < (rect1.x + rect1.w)
	);

	var vertOverlap = (
		/* Left edge of rect1 is between rect2. */
		rect1.y >= rect2.y && rect1.y < (rect2.y + rect2.h) ||
		/* Left edge of rect2 is between rect1. */
		rect2.y >= rect1.y && rect2.y < (rect1.y + rect1.h)
	);

	return horizOverlap && vertOverlap;
}
