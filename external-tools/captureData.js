var system = require('system');
var fs = require('fs');
if (system.args.length !== 3) {
	console.log('Usage: ' + system.args[0] + ' webpagefile basedir');
	phantom.exit();
} 

var page = require('webpage').create();

page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
	phantom.exit();
};

/*page.onConsoleMessage = function(msg, lineNum, sourceId) {
console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};*/

fs.changeWorkingDirectory(system.args[2]);

page.open(system.args[1], function() {
	var size = page.evaluate(function() {
		document.body.bgColor = 'white';
		return {w: outw, h: outh};
	});
	
	page.viewportSize = {
		width: size.w,
		height: size.h
	};

	var data = page.evaluate(function() {
		overlay();
		return {name: json.name, result: json.text};
	});
		
	window.setTimeout(function () {
		console.log("Finished " + data.name);
		fs.write('../' + data.name + '.data', data.result, 'w');
		phantom.exit();
	}, 500);
});




