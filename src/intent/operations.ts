/// <reference path ="../../_typings.d.ts" />

import _ = module('underscore');

import l = module('./layout');
import inf = module('./interfaces');
import util = module('./util');
import tree = module('./tree');

/**
 * Remove a box from the tree.
 *
 * @return The box's original parent.
 */
export function orphanBox(box: inf.Box): inf.Box {
	var i = tree.indexOfChild(box);
	if (i !== -1) {
		var parent = box.parent;
		parent.children.splice(i, 1);
		box.parent = null;
		return parent;
	}
	return null;
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
export function groupChildren(layout: l.Layout, boxes: inf.Box[],
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
		orphanBox(box);
		box.parent = generated;
		generated.children.push(box);
	});

	return generated;
}

/**
 * Reparents a box to a new parent. Visual layout information is retained.
 *
 * @param box Box to reparent.
 * @param parent Box to be the new parent.
 * @return If a new parent was created, that box is returned; else, null.
 */
export function reparent(layout: l.Layout, box: inf.Box, parent: inf.Box,
						 idPrefix: string): inf.Box {
	if (tree.isAncestor(box, parent))
		throw 'A box cannot be reparented to its descendant.';

	if (parent === box.parent)
		return;

	if (!parent.children)
		parent.children = [];

	var proposedParent = parent;

	var rect = layout.getRect(box);

	if (tree.isAncestor(parent, box)) {
		var child = box;
		while (child.parent !== parent)
			child = child.parent;

		orphanBox(box);

		parent.children.splice(tree.indexOfChild(child), 0, box);

	} else {
		var before = tree.isBefore(box, parent);

		orphanBox(box);

		if (before)
			parent.children.unshift(box);
		else {
			if (util.hasContent(parent))
				parent = wrapBox(parent, idPrefix + 'wrap');

			parent.children.push(box);
		}
	}

	box.parent = parent;

	var parentRect = layout.getRect(parent);
	var rectOffset = util.rectOffset(rect, parentRect);
	box.absolute = {
		l: inf.px(rectOffset.x),
		t: inf.px(rectOffset.y),
	};

	return (proposedParent !== parent) ? parent : null;
}

/**
 * Generate a box that's just like the input box, without content or children.
 */
export function cloneBox(box: inf.Box, id: string): inf.Box {
	return {
		w: box.w,
		h: box.h,
		absolute: _.clone(box.absolute),
		direction: box.direction,
		alignment: box.alignment,
		crossAlignment: box.crossAlignment,
		generated: true,
	};
}

/**
 * Generate a box and wrap the input box inside of it.
 */
export function wrapBox(box: inf.Box, id: string): inf.Box {
	var parent = cloneBox(box, id);

	var boxIndex = box.parent.children.indexOf(box);
	box.parent.children.splice(boxIndex, 1, parent);

	parent.children = box.children;
	delete box.children;
	parent.children.forEach((child) => {
		child.parent = parent;
	});
	parent.parent = box.parent;

	/* Put the original box at the bottom and make it as big as it was. */
	parent.children.push(box);
	box.w = inf.pct(1);
	box.h = inf.pct(1);
	box.absolute = {
		l: inf.px(0),
		t: inf.px(0),
	};
	box.parent = parent;

	return parent;
}
