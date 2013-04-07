import path = module('path')

export function getPsdPath(filename: string): string {
	return path.resolve(__dirname, '../collateral/psd', filename)
}

export function getSchemaPath(name: string): string {
	return path.resolve(__dirname, '../collateral/schema', name + '.json')
}

export function equals(test, first, second) {
	return test.strictEqual(JSON.stringify(first), JSON.stringify(second));
}
