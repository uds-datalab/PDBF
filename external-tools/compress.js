var system = require('system');
var fs = require('fs');
phantom.injectJs('../data/lz-string.js');

try {
	var inflate = fs.read('../data/lz-string.js');
	var content = fs.read('../data/all.js');
	fs.write('../data/all.js', inflate + "eval(LZString.decompressFromBase64(\"" + LZString.compressToBase64(content) + "\"));", 'w');
} catch(e) {
	console.log(e);
	phantom.exit(1);
}

phantom.exit(0);


