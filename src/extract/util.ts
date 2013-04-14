/// <reference path="../../_typings.d.ts" />

import intf = module('./interfaces');

/**
 * Return a depth-first flattened list of layers.
 */
export function flattenLayers(layer: intf.Layer): intf.Layer[] {
	if (!layer.children || layer.children.length == 0)
		return [layer];

	var flattened: intf.Layer[] = [];
	layer.children.forEach((layer) => {
		flattened.push.apply(flattened, flattenLayers(layer));
	});
	flattened.push(layer);
	return flattened;
}
