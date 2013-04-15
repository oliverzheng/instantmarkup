import path = module('path')

export function getPsdPath(filename: string): string {
	return path.resolve(__dirname, '../../collateral/psd', filename)
}

export function getSchemaPath(name: string): string {
	return path.resolve(__dirname, '../../collateral/schema', name + '.json')
}

export function equals(test, first, second) {
	if (typeof first === 'object') {
		for (var prop in first)
			if (first.hasOwnProperty(prop)) {
				test.ok(second.hasOwnProperty(prop));
				equals(test, first[prop], second[prop]);
			}
		for (var prop in second)
			if (second.hasOwnProperty(prop))
				test.ok(first.hasOwnProperty(prop));
	} else {
		return test.strictEqual(JSON.stringify(first), JSON.stringify(second));
	}
}
