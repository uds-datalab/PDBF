var system = require('system');
var fs = require('fs');
if (system.args.length !== 2) {
	console.log('Usage: ' + system.args[0] + ' webpagefile');
	phantom.exit();
} 

var page = require('webpage').create();

page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};

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
		return {name: json.name, result: JSON.stringify(json.result)};
	});
		
	window.setTimeout(function () {
		fs.write(data.name + '.json', data.result, 'w');
		page.render(data.name +'.png');
		phantom.exit();
	}, 500);
});




