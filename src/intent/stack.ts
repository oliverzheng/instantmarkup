/// <reference path ="../../_typings.d.ts" />

var coll = require('coll');

import inf = module('./interfaces');
import l = module('./layout');
import gen = module('./generator');
import tree = module('./tree');
import search = module('./search');
import util = module('./util');

/**
 * A stack of boxes are horizontally or vertically aligned, and
 * non-overlapping.
 */
export class Stack {
	layout: l.Layout;
	boxes: inf.Box[];
	direction: inf.Direction;

	constructor(layout: l.Layout, direction: inf.Direction) {
		this.direction = direction;
		this.boxes = [];
	}

	removeBox(box: inf.Box) {
		var index = this.boxes.indexOf(box);
		if (index !== -1)
			this.boxes.splice(index, 1);
	}
}

/**
 * Returns if two boxes are aligned in the specified direction.
 */
export function aligned(layout: l.Layout, box1: inf.Box, box2: inf.Box,
						dir: inf.Direction): bool {
	var otherDir = util.otherDirection(dir);
	var length1 = layout.compLength(box1, dir);
	var length2 = layout.compLength(box2, dir);
	var crossPos1 = layout.compPositionAbs(box1, otherDir);
	var crossPos2 = layout.compPositionAbs(box2, otherDir);
	return length1 === length2 && crossPos1 === crossPos2;
}

/**
 * Given two non-overlapping boxes, get a rect that fills the gap between them.
 * The two boxes must be aligned.
 */
export function getGap(layout: l.Layout, box1: inf.Box, box2: inf.Box,
					   dir: inf.Direction): inf.Rect {
	var otherDir = util.otherDirection(dir);
	var length1 = layout.compLength(box1, dir);
	var pos1 = layout.compPositionAbs(box1, dir);
	var pos2 = layout.compPositionAbs(box2, dir);
	var crossLength = layout.compLength(box1, otherDir);
	var crossPos = layout.compPositionAbs(box1, otherDir);
										  
	var gap: inf.Rect;
	if (dir === inf.Direction.HORIZONTAL)
		return {
			x: pos1 + length1,
			y: crossPos,
			w: pos2 - pos1 - length1,
			h: crossLength,
		};
	else if (dir === inf.Direction.VERTICAL)
		return {
			x: crossPos,
			y: pos1 + length1,
			w: crossLength,
			h: pos2 - pos1 - length1,
		};
}

/**
 * Find stacks in a group of boxes.
 *
 * In the case where a box can be in either a vertical or horizontal stack, it
 * belongs to the stack with more boxes, since that stack will look more like
 * a stack.
 *
 * @param layout Layout the boxes belong to.
 * @param boxes List of non-overlapping boxes.
 * @return A list stacks, where each input box is in at most one of these
 * stacks.
 */
export function findStacks(layout: l.Layout, boxes: inf.Box[]): Stack[] {
	var possibleStacks: Stack[] = [];
	/* Map from box to the stacks they are in. */
	var stacksByBox = new coll.Map;

	var dirs = [inf.Direction.HORIZONTAL, inf.Direction.VERTICAL];
	var currentStack: Stack;

	for (var i = 0; i < dirs.length; ++i) {
		var dir = dirs[i];
		var otherDir = util.otherDirection(dir);

		/* We want boxes sorted in direction perpendicular to the direction of
		 * stacks we want, so the ones with the same top/left alignment are
		 * evaluated first. */
		var sorted = search.sortByDirection(layout, boxes, otherDir);
		var prevBox: inf.Box = null;
		var currentStack: Stack = null;

		sorted.forEach((box, i) => {
			if (i === 0) {
				prevBox = box;
				return;
			}

			var bound = layout.getBoundingRect([prevBox, box]);
			var gap: inf.Rect;
			/* prevBox and box are stacked if they are the same length and have
			 * the same position and if there is nothing between their gap. */
			if (aligned(layout, prevBox, box, dir) &&
				(gap = getGap(layout, prevBox, box, dir)) &&
				!search.findWithin(layout, gap, true).any((between) => {
					var rect = layout.getRect(between);
					/* Boxes in the gap must be smaller than the bound of
					 * prevBox and box; otherwise, it's just background. */
					return !util.rectContains(rect, bound);
				})) {

				if (!currentStack) {
					currentStack = new Stack(layout, dir);
					currentStack.boxes.push(prevBox);

					possibleStacks.push(currentStack);
					if (!stacksByBox.hasKey(prevBox))
						stacksByBox.set(prevBox, []);
					stacksByBox.get(prevBox).push(currentStack);
				}

				currentStack.boxes.push(box);
				if (!stacksByBox.hasKey(box))
					stacksByBox.set(box, []);
				stacksByBox.get(box).push(currentStack);

			} else {
				/* Reset the current stack if there is a gap in the middle */
				currentStack = null;
			}

			prevBox = box;
		});
	}

	/* There may be conflicts where a box may belong to two stacks. We want to
	 * maximize stack lengths. Thus, keep stacks by length. */

	var keepStacks: Stack[] = [];
	var needSort = true;

	while (possibleStacks.length > 0) {
		/* Each time a stack is kept, we remove all boxes in that stack from
		 * other possible stacks, since they can't be there anymore. This
		 * changes their lengths, and we need to resort. */
		if (needSort) {
			possibleStacks.sort((stack1, stack2) => {
				return stack2.boxes.length - stack1.boxes.length;
			});
			needSort = false;
		}

		var stack = possibleStacks.shift();
		if (stack.boxes.length <= 1)
			/* All we have left is empty stacks. We are done. */
			break;
		keepStacks.push(stack);

		/* Remove all boxes of our kept stack from other stacks. */
		stack.boxes.forEach((box) => {
			var stacks = stacksByBox.get(box, null);
			if (stacks) {
				if (stacks.length >= 2) {
					for (var j = 0; j < stacks.length; ++j) {
						var otherStack = stacks[j];
						if (otherStack !== stack) {
							otherStack.removeBox(box);
							needSort = true;
						}
					}
				}
				stacksByBox.remove(box);
			}
		});
	}
	return keepStacks;
}
