/// <reference path='../../_typings.d.ts' />

var util = require('../intent/util')
var l = require('../intent/layout')
var snapshot = require('../intent/snapshot')
var generator = require('../intent/generator')

var React;

var RenderedBox = React.createClass({
	render: () => {
		return
			React.DOM.div({
			});
	}
});

/*
function(intentUtil, l, containment, ss, gen) {
	var root = intentUtil.boxFromJSON(json);
	var layout = new l.Layout(root);

	//var s1 = new ss.Snapshot(layout);
	//var diff = s1.diff(new ss.Snapshot(layout)).toArray();

	var load = toDisplay(layout);
	load.preview = 'render.png';
	load.name = 'root';


	var it = new containment.ContainBoxes(layout, 'prefix');
	var contain = {
		name: 'contain',
		it: it,
		stopped: ko.observable(false),
		status: ko.observable(''),
		counter: new gen.Counter(),
		next: function() {
			if (!contain.stopped()) {
				var box = it.next();
				if (box) {
					contain.status(contain.counter.next() + ': ' + box.id + ' (' + box.name + ')');
				} else {
					contain.stopped(true);
				}
			}
		}
	};
	var controls = [contain];
	renderDisplayed(load, controls);

}
*/
