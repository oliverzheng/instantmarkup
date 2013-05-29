/// <reference path ="../../_typings.d.ts" />

import l = module('./layout');
import inf = module('./interfaces');
import tree = module('./tree');

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
