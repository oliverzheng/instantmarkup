#!/usr/bin/env node

var fs = require('fs');

var extractPsd = require('../bin/js/extract/psd');
var intentUtil = require('../bin/js/intent/util');
var l = require('../bin/js/intent/layout');

var psd = process.argv[2];
var outputDir = process.argv[3];

var counter = 0;
var designFile = extractPsd.getDesignFile(psd, outputDir, function(id) {
	return (counter++) + ' - ' + id + '.jpg';
}, function(bitmapFilenames) {
	var root = intentUtil.layerToBox(designFile.rootLayer);
	var layout = new l.Layout(root);
	var layers = (function getlayers(box) {
		var ret = {
		};
		ret.rect = layout.getRect(box);
		ret.name = box.name;
		ret.children = [];
		ret.preview = bitmapFilenames[box.id];
		if (box.children)
			ret.children = box.children.map(getlayers);
		return ret;
	})(root);
	layers.name = designFile.rootLayer.name;
	fs.writeFile(outputDir + '/' + 'layers.json', JSON.stringify(layers, null, '\t'), function(err) {
		if (err)
			console.log(err);
		else
			console.log('exported layers to ' + outputDir);

		var jsonRoot = intentUtil.boxToJSON(root);
		fs.writeFile(outputDir + '/' + 'root.json', JSON.stringify(jsonRoot, null, '\t'), function(err) {
			if (err)
				console.log(err);
			else
				console.log('exported root to ' + outputDir);
		});
	});
});
