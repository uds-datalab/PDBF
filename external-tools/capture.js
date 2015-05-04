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
		return {w: outw, h: outh, json: JSON.stringify(json.result), jsonBig: JSON.stringify(json.resultBig)};
	});
	
	page.viewportSize = {
		width: size.w,
		height: size.h
	};

	page.evaluate(function() {
		overlay();
	});
		
	window.setTimeout(function () {
		var name = page.evaluate(function() {
			return json.name;
		});
		fs.write(name + '.json', size.json, 'w');
		fs.write(name + '.jsonBig', size.jsonBig, 'w');
		page.render(size.name +'.png');
		phantom.exit();
	}, 500);
});




