/// <reference path='../../_typings.d.ts' />

import extinf = module('../extract/interfaces')
import extutil = module('../extract/util')
import inf = module('./interfaces')

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
