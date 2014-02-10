/// <reference path="../../_typings.d.ts" />

import intf = module('./interfaces');

/**
 * Return a depth-first flattened list of layers.
 */
export function flattenLayers(layer: intf.Layer,
							  includeSelf: bool = true): intf.Layer[] {
	var flattened: intf.Layer[] = [];

	(layer.children || []).forEach((layer) => {
		flattened.push.apply(flattened, flattenLayers(layer));
	});
	if (includeSelf)
		flattened.push(layer);
	return flattened;
}
