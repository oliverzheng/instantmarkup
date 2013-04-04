/// <reference path="../../_typings.d.ts" />

import intf = module('./interfaces');

export function flattenLayers(layer: intf.Layer): intf.Layer[] {
	if (!layer.children || layer.children.length == 0)
		return [layer];

	var flattened: intf.Layer[] = [];
	layer.children.forEach(function(layer) {
		flattened.push.apply(flattened, flattenLayers(layer));
	});
	return flattened;
}
