import fs = module('fs');
import testutil = module('../../testUtil');
import psd = module('../psd');
var Validator = require('jsonschema').Validator;

var fixtures = [
	'square',
	'group',
];

export function testGetLayers(test) {
	var schemaPath = testutil.getSchemaPath('layer');
	var schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

	var validator = new Validator();
	validator.addSchema(schema);

	fixtures.forEach(function(fixture) {
		var psdPath = testutil.getPsdPath(fixture + '.psd');
		var expectedPath = testutil.getPsdPath(fixture + '.extract.json');

		var result = psd.getLayers(psdPath);
		var expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));

		test.deepEqual(result, expected);

		var validation = validator.validate(result, schema);
		test.deepEqual([], validation);
	})

	test.done();
}
