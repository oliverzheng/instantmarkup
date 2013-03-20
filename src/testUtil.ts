import path = module('path')

export function getPsdPath(filename: string): string {
	return path.resolve(__dirname, '../collateral/psd', filename)
}

export function getSchemaPath(name: string): string {
	return path.resolve(__dirname, '../collateral/schema', name + '.json')
}
