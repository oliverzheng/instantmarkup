var jsc = require('jscoverage');

process.on('exit', () => {
	jsc.coverageDetail();
});
