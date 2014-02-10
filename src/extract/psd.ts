/// <reference path='../../_typings.d.ts' />

import path = module('path');
import inf = module('./interfaces');
var async = require('async');

var psdjs = require('psd');

export interface PSDLayer extends inf.Layer {
	psdLayer?: any;
}

function exportPsd(psd, name): PSDLayer {
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

function exportPsdLayers(psdLayers): PSDLayer[] {
	var layers: PSDLayer[] = [];
	var endLoop = false;

	while (psdLayers.length > 0 && !endLoop) {
		var psdLayer = psdLayers.shift();
		var layer: PSDLayer = null;

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
					id: psdLayer.layerId,
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

		if (layer) {
			layer.psdLayer = psdLayer;
			layers.push(layer);
		}
	}

	return layers;
}

export function getLayers(filename: string): inf.Layer {
	var psd = psdjs.PSD.fromFile(filename);
	psd.setOptions({
		layerImages: true,
		onlyVisibleLayers: true,
	});
	psd.parse();
	return exportPsd(psd, path.basename(filename));
}

export function getDesignFile(filename: string, outDir: string,
							  getFilename: (id: string, name: string) => string,
							  onComplete: any): inf.DesignFile {
	var psd = psdjs.PSD.fromFile(filename);
	psd.setOptions({
		layerImages: true,
		onlyVisibleLayers: true,
	});
	psd.parse();
	var rootLayer = exportPsd(psd, path.basename(filename));
	var bitmapFilenames: {[id: string]: string;} = {};

	var rendered = 'rendered.png';
	psd.toFileSync(outDir + '/' + rendered);

	async.parallel(
		psd.layers.filter(function(layer) {
			return !layer.isFolder && !layer.isHidden;
		}).map(function (layer) {
			var filename = getFilename(layer.layerId, layer.name);
			var callback = null;
			var done = false;
			layer.image.toFile(outDir + '/' + filename, function() {
				bitmapFilenames[layer.layerId] = filename;
				if (callback)
					callback(null);
				done = true;
			});
			return function(cb) {
				if (done)
					cb();
				else
					callback = cb;
			};
		}),
		function(err, results) {
			onComplete(bitmapFilenames);
		}
	);

	return {
		rootLayer: rootLayer,
		bitmapFilenames: bitmapFilenames,
	}
}
