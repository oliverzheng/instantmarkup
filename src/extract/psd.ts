/// <reference path='../../_typings.d.ts' />

import path = module('path');
import interfaces = module('./interfaces');
var psdjs = require('psd');

function exportPsd(psd, name): interfaces.Layer {
	var info = psd.toJSON();
	return {
		id: name,
		name: name,
		bbox: {
			w: info.header.cols,
			h: info.header.rows,
		},
		children: exportPsdLayers(info.layerMask.layers)
	};
}

function exportPsdLayers(psdLayers): interfaces.Layer[] {
	var layers: interfaces.Layer[] = [];
	var endLoop = false;

	debugger;
	while (psdLayers.length > 0 && !endLoop) {
		var psdLayer = psdLayers.shift();
		var layer: interfaces.Layer = null;

		switch (psdLayer.layerType) {
			case 'open folder':
			case 'closed folder':
				// Group start
				var children = exportPsdLayers(psdLayers);
				var x1 = Math.min.apply(Math, children.map(function(child) {
					return child.bbox.x;
				}));
				var y1 = Math.min.apply(Math, children.map(function(child) {
					return child.bbox.y;
				}));
				var x2 = Math.max.apply(Math, children.map(function(child) {
					return child.bbox.x + child.bbox.w;
				}));
				var y2 = Math.max.apply(Math, children.map(function(child) {
					return child.bbox.y + child.bbox.h;
				}));
				layer = {
					id: psdLayer.name,
					name: psdLayer.name,
					bbox: {
						x: x1,
						y: y1,
						w: x2 - x1,
						h: y2 - y1,
					},
					children: children
				};
				break;
			case 'bounding section divider':
				// Group close. Party over.
				endLoop = true;
				break;
			default:
				// Layer
				layer = {
					id: psdLayer.name,
					name: psdLayer.name,
					bbox: {
						x: psdLayer.left,
						y: psdLayer.top,
						w: psdLayer.cols,
						h: psdLayer.rows,
					},
				};
				var text = psdLayer.adjustments.typeTool;
				if (text)
					layer.text = {
						value: 'Herp Derp', // TODO: patch psd.js to expose this
					}
				break;
		}

		if (layer)
			layers.push(layer);
	}

	return layers;
}

export function getLayers(filename: string): any {
	var psd = psdjs.PSD.fromFile(filename);
	psd.parse();
	return exportPsd(psd, path.basename(filename));
}
