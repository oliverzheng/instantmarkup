/// <reference path="../../_typings.d.ts" />

import inf = module('./interfaces');
import util = module('./util');

/**
 * Get the property length for a given direction.
 */
function lengthFromDirection(box: inf.Box, dir: inf.Direction): inf.Length {
	if (dir === inf.Direction.HORIZONTAL)
		return box.w || inf.defaultLength;
	else if (dir === inf.Direction.VERTICAL)
		return box.h || inf.defaultLength;
	throw 'Direction must be horizontal or vertical';
}

/**
 * If the box participates in layout.
 */
function inLayoutLoop(box: inf.Box): bool {
	return box.absolute == null;
}

/**
 * A box with a length of shrink is skipped in computed length calculations. It
 * is non-effective when calculating lengths. If a box has a child that shrinks,
 * that child's children are effectively used as children of their grandparent
 * for length calculations. Direct non-shrink children and those descendants are
 * effective children.
 *
 * Given a box, this function returns its effective children. The order
 * depth-first based, so that children of a shrink box are between that box's
 * siblings.
 */
export function effectiveChildren(parent: inf.Box, dir: inf.Direction,
								  unit?: inf.LengthUnit): inf.Box[] {
	if (unit === inf.LengthUnit.SHRINK)
		throw 'Shrink cannot be used to filter effective children';

	var units = unit != null ? [unit] : [
		inf.LengthUnit.PIXELS,
		inf.LengthUnit.PERCENT,
		inf.LengthUnit.PARTS,
		inf.LengthUnit.EXPAND,
	];

	/* Copy the children to be examined */
	var queue: inf.Box[] = (parent.children || []).slice(0);
	var eff: inf.Box[] = [];

	while (queue.length > 0) {
		var box = queue.shift();
		var unit = lengthFromDirection(box, dir).unit;

		if (units.indexOf(unit) !== -1 && inLayoutLoop(box))
			eff.push(box);
		else if (unit === inf.LengthUnit.SHRINK)
			/* unshift for depth first */
			queue.unshift.apply(queue, box.children || []);

	}

	return eff;
}

/**
 * Get the sum of all parts of effective children.
 */
export function getParts(box: inf.Box, dir: inf.Direction): number {
	var parts = 0;

	effectiveChildren(box, dir, inf.LengthUnit.PARTS).forEach((child) => {
		var length = lengthFromDirection(child, dir);
		parts += length.value;
	});

	return parts;
}


export class Layout {

	/* Global layout size in pixels */
	private w: number;
	private h: number;

	private root: inf.Box;

	constructor(root: inf.Box, w: number = null, h: number = null) {
		this.root = root;

		/* Inherit the root dimensions for the layout */

		this.w = w;
		if (w == null) {
			if (root.w.unit !== inf.LengthUnit.PIXELS)
				throw 'Layout width not defined';
			this.w = root.w.value;
		}

		this.h = h;
		if (h == null) {
			if (root.h.unit !== inf.LengthUnit.PIXELS)
				throw 'Layout height not defined';
			this.h = root.h.value;
		}
	}

	private getLayoutLength(dir: inf.Direction): number {
		if (dir === inf.Direction.HORIZONTAL)
			return this.w;
		if (dir === inf.Direction.VERTICAL)
			return this.h;
	}

	/** Computed properties. All in pixels. */

	/**
	 * For a given direction, get the sum of lengths of children that are fixed.
	 */
	private compFixedChildren(box: inf.Box, dir: inf.Direction): number {
		var fixedSum = 0;

		effectiveChildren(box, dir, inf.LengthUnit.PIXELS).forEach((child) => {
			fixedSum += this.compLength(child, dir);
		});

		effectiveChildren(box, dir, inf.LengthUnit.PERCENT).forEach((child) => {
			fixedSum += this.compLength(child, dir);
		});

		return fixedSum;
	}

	/**
	 * Calculate the computed length for a given direction.
	 */
	compLength(box: inf.Box, dir: inf.Direction): number {
		var length = lengthFromDirection(box, dir);

		/* Pixels are always fixed */
		if (length.unit === inf.LengthUnit.PIXELS)
			return length.value;

		/* Find the first non-shrink parent */
		var parent = box.parent;
		while (parent &&
			   util.lengthEquals(lengthFromDirection(parent, dir), inf.shrink))
			parent = box.parent;

		var parentComp;
		if (parent)
			parentComp = this.compLength(parent, dir);
		else
			parentComp = this.getLayoutLength(dir);

		parent = parent || this.root;

		/* Percentages only require the parent computed length */
		if (length.unit === inf.LengthUnit.PERCENT)
			return parentComp * length.value;

		/* Parts require existing fixed siblings to be computed */
		var fixedChildren = this.compFixedChildren(parent, dir);
		var free = Math.max(parentComp - fixedChildren, 0);

		var parts = getParts(parent, dir);
		if (length.unit === inf.LengthUnit.PARTS)
			return parts ? (free * length.value / parts) : 0;

		if (length.unit === inf.LengthUnit.EXPAND) {
			/* Parts have priority over expand. If there are any parts, no room
			 * is left for expand. */
			if (parts > 0)
				return 0;

			var expands = effectiveChildren(parent, dir,
											inf.LengthUnit.EXPAND).length;
			return free / expands;
		}

		if (length.unit === inf.LengthUnit.SHRINK) {
			var sum = 0;
			effectiveChildren(box, dir).forEach((child) => {
				sum += this.compLength(child, dir);
			});
			return sum;
		}
	}

	/**
	 * Width and height.
	 */
	compW(box: inf.Box): number {
		return this.compLength(box, inf.Direction.HORIZONTAL);
	}
	compH(box: inf.Box): number {
		return this.compLength(box, inf.Direction.VERTICAL);
	}
}
