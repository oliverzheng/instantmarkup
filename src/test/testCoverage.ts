var jsc = require('jscoverage');

process.on('exit', () => {
	jsc.coverage();
	jsc.coverageDetail();
});
