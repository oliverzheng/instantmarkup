/// <reference path ="../../_typings.d.ts" />

import _ = module('underscore');

import inf = module('./interfaces');
import l = module('./layout');
import gen = module('./generator');
import tree = module('./tree');
import search = module('./search');
import util = module('./util');

/* Near may equal to far. The range becomes an empty range then. */
export interface Range {
	near: number;
	far: number;
}

/* A list of ranges.
 *
 * Starts as a continuous range. Range may be subtracted away from the initial.
 * The end result is a list of discrete ranges within the initial range.
 */
export class Ranges {
	ranges: Range[];
	initialRange: Range;

	constructor(initial: Range) {
		this.ranges = [{ near: initial.near, far: initial.far }];
		this.initialRange = { near: initial.near, far: initial.far };
	}

	split(index: number, firstLength: number) {
		var first = this.ranges[index];
		if (firstLength > (first.far - first.near))
			return;

		var second = {
			near: first.near + firstLength,
			far: first.far
		};
		first.far = first.near + firstLength;
		this.ranges.splice(index + 1, 0, second);
	}

	removeRange(rangeToRemove: Range) {
		if (rangeToRemove.far - rangeToRemove.near === 0)
			return;

		var index = 0;
		while (index < this.ranges.length) {
			var curRange = this.ranges[index];
			var prevRange = (index > 0) ? this.ranges[index - 1] : null;

			/* If rangeToRemove is after the current range, leave it alone. */
			if (curRange.far <= rangeToRemove.near)
				index++;

			/* The front of the current range is before rangeToRemove, we want
			 * to keep some of the current range. */
			else if (curRange.near < rangeToRemove.near)
				this.split(index++, rangeToRemove.near - curRange.near);

			/* If the current range and rangeToRemove start together, we only
			 * want to create a 0 sized range if the previous range doesn't end
			 * here. */
			else if (curRange.near === rangeToRemove.near &&
					 (!prevRange ||
					  prevRange && prevRange.far !== curRange.near))
				this.split(index++, 0);

			/* The end of the current range is before rangeToRemove, so delete
			 * it. */
			else if (curRange.far < rangeToRemove.far)
				/* We do not have to worry about creating a range of size 0; the
				 * condition above would have taken care of it. */
				this.ranges.splice(index, 1);

			/* The end of the current range is after rangeToRemove, split it and
			 * delete the first. */
			else {
				this.split(index, rangeToRemove.far - curRange.near);
				this.ranges.splice(index++, 1);

				/* We are done processing the range. */
				break;
			}
		}
	}

	private firstNonBoundaryIndex(): number {
		if (this.ranges.length > 0 &&
			this.ranges[0].near <= this.initialRange.near)
			return 1;

		return 0;
	}

	private lastNonBoundaryIndex(): number {
		var length = this.ranges.length;
		if (length > 0 && this.ranges[length - 1].far >= this.initialRange.far)
			return length - 1;

		return length;
	}

	/* Return the list of gaps that do not include ranges at the edge. */
	getMiddleRanges(): Range[] {
		var first = this.firstNonBoundaryIndex();
		var last = this.lastNonBoundaryIndex();
		return this.ranges.slice(first, last);
	}
}

/**
 * A list of rects within a bounding rect.
 */
export export class Rects {
	bound: inf.Rect;
	rects: inf.Rect[];

	static fromBox(layout: l.Layout, box: inf.Box): Rects {
		var bound = layout.getRect(box);
		var rects = (box.children || []).map((child) => {
			return layout.getRect(child);
		});
		return new Rects(bound, rects);
	}

	constructor(bound: inf.Rect, rects: inf.Rect[]) {
		this.bound = bound;
		this.rects = rects;
	}

	totalArea(): number {
		var sum = 0;
		this.rects.forEach((rect) => {
			sum += util.rectArea(rect);
		});
		return sum;
	}
}

export interface GapsByDirection {
	horiz: Gaps;
	vert: Gaps;
}

/* Gaps are rects that have a direction. They are all the same width/height
 * along the direction.
 */
export class Gaps extends Rects {
	direction: inf.Direction;

	constructor(bound: inf.Rect, gaps: inf.Rect[], direction: inf.Direction) {
		super(bound, gaps);
		this.direction = direction;
	}

	/**
	 * Find gaps that run the whole horizontal and vertical direction of the
	 * bound.
	 */
	static getGapsFromRects(rects: Rects): GapsByDirection {
		var horizRanges = new Ranges({
			near: rects.bound.x,
			far: rects.bound.x + rects.bound.w
		});
		var vertRanges = new Ranges({
			near: rects.bound.y,
			far: rects.bound.y + rects.bound.h
		});

		rects.rects.forEach((rect) => {
			horizRanges.removeRange({ near: rect.x, far: rect.x + rect.w });
			vertRanges.removeRange({ near: rect.y, far: rect.y + rect.h });
		});
		var horizMiddleRanges = horizRanges.getMiddleRanges();
		var vertMiddleRanges = vertRanges.getMiddleRanges();

		var horizGapRects: inf.Rect[] = [];
		horizMiddleRanges.forEach((horizRange) => {
			/* Horizontal gaps run vertically. */
			horizGapRects.push({
				x: horizRange.near,
				y: rects.bound.y,
				w: horizRange.far - horizRange.near,
				h: rects.bound.h,
			});
		});

		var vertGapRects: inf.Rect[] = [];
		vertMiddleRanges.forEach((vertRange) => {
			/* Vertical gaps run horizontally. */
			vertGapRects.push({
				x: rects.bound.x,
				y: vertRange.near,
				w: rects.bound.w,
				h: vertRange.far - vertRange.near,
			});
		});

		var horizGaps: Gaps;
		if (horizGapRects.length > 0)
			horizGaps = new Gaps(rects.bound, horizGapRects, inf.horiz);

		var vertGaps: Gaps;
		if (vertGapRects.length > 0)
			vertGaps = new Gaps(rects.bound, vertGapRects, inf.vert);

		return {
			horiz: horizGaps,
			vert: vertGaps
		}
	}
}

/**
 * Group certain boxes of a parent under a new parent. The newly generated
 * parent becomes a child of the old parent. The new parent is placed on top for
 * z-order.
 *
 * If there is only 1 box, it's returned. If the list of boxes is all children
 * of the parent, the parent is returned.
 *
 * @param newParentId Id for the new parent.
 * @return The new group parent.
 */
export function groupBoxes(layout: l.Layout, boxes: inf.Box[],
						   newParentId: string): inf.Box {
	if (boxes.length <= 1)
		return null;

	var parent = boxes[0].parent;
	if (!boxes.every((box) => {
			return box.parent === parent;
		}))
		throw 'The list of boxes need to have the same parent';

	if (boxes.length === parent.children.length)
		/* We are already done. */
		return null;

	/* This will be the size of the parent. */
	var bound = layout.getBoundingRect(boxes);
	var generated: inf.Box = {
		id: newParentId,
		parent: parent,
		w: inf.px(bound.w),
		h: inf.px(bound.h),
		absolute: {
			l: inf.px(bound.x - layout.compX(parent)),
			t: inf.px(bound.y - layout.compY(parent)),
		},
		children: [],
		generated: true,
	};
	parent.children.unshift(generated);

	boxes.forEach((box) => {
		/* We don't want to reparent. That maintains z-order and thus
		 * children ordering. We want to construct our own z-ordering
		 * because we know the boxes are sorted. */
		var rect = layout.getRect(box);
		box.absolute = {
			l: inf.px(rect.x - bound.x),
			t: inf.px(rect.y - bound.y),
		};
		tree.orphanBox(box);
		box.parent = generated;
		generated.children.push(box);
	});

	return generated;
}

/**
 * Partition a box's children into a stack.
 *
 * @return A list of new children that have been generated as groups.
 */
export function partitionChildren(layout: l.Layout, box: inf.Box, 
								  idPrefix: string): inf.Box[] {
	var bound = layout.getRect(box);
	var rects = Rects.fromBox(layout, box);
	var gapsByDirection = Gaps.getGapsFromRects(rects);

	/* Use the direction of gaps that give the biggest area. */
	var gaps = gapsByDirection.horiz || gapsByDirection.vert;
	if (gapsByDirection.vert && gapsByDirection.horiz &&
		gapsByDirection.vert.totalArea() > gapsByDirection.horiz.totalArea())
		gaps = gapsByDirection.vert;

	if (!gaps)
		/* No stacks have been found */
		return [];

	/* Rects are the gaps that separate boxes */
	var gapRects = gaps.rects;
	var beginning = _.clone(bound);
	var ending = _.clone(bound);

	if (gaps.direction === inf.horiz) {
		beginning.w = 0;
		ending.x = ending.x + ending.w;
		ending.w = 0;
	} else if (gaps.direction === inf.vert) {
		beginning.h = 0;
		ending.y = ending.y + ending.h;
		ending.h = 0;
	}
	gapRects.unshift(beginning);
	gapRects.push(ending);

	var newGroups: inf.Box[] = [];

	var prevRect: inf.Rect;
	gapRects.forEach((rect, i) => {
		if (!prevRect) {
			prevRect = rect;
			return;
		}
		var rectBetween = util.getRectBetween(prevRect, rect);
		var it = search.findWithin(layout, rectBetween, false, false,
								   gen.arrayToIter(box.children));

		var g = groupBoxes(layout, it.toArray(), idPrefix + '-partition-' + i);
		if (g)
			newGroups.push(g);
		prevRect = rect;
	});

	box.children = search.sortByDirection(layout, box.children, gaps.direction);
	box.direction = gaps.direction;

	return newGroups;
}

/*
 * Recursively put children into stacks.
 */
export function partition(layout: l.Layout, box: inf.Box,
						  idPrefix: string): inf.Box[] {
	var generated: inf.Box[] = [];
	var todo = [box];
	var counter = 0;
	while (todo.length > 0) {
		var current = todo.shift();
		var newGroups = partitionChildren(layout, current,
										  idPrefix + '-' + counter++);
		if (newGroups.length > 0) {
			todo.push.apply(todo, newGroups);
			generated.push.apply(generated, newGroups);
		}
	}
	return generated;
}
