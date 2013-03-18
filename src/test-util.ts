import path = module('path')

export function getCollateralPath(filename: string): string {
	return path.resolve(__dirname, '../collateral/psd', filename)
}
