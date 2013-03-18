/// <reference path='../../../_test_typings.d.ts' />

import fs = module('fs')

import testutil = module('../../test-util')
import psd = module('../psd')

var fixtures = [
	'square',
]

export function testGetLayers(test) {
	fixtures.forEach(function(fixture) {
		var psdPath = testutil.getCollateralPath(fixture + '.psd')
		var extractJson = testutil.getCollateralPath(fixture + '.extract.json')

		var result = psd.getLayers(psdPath)
		var expected = JSON.parse(fs.readFileSync(extractJson, 'utf8'))

		test.deepEqual(result, expected)
	})

	test.done();
}
