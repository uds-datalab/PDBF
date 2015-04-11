var system = require('system');
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
		return {w: outw, h: outh};
	});
	
	page.viewportSize = {
		width: size.w,
		height: size.h
	};

	var name = page.evaluate(function() {
		overlay();
		return json.name;
	});
	
	page.evaluate(function() {
		zoomFactor = 1.2;
		overlay();
	});
		
	page.render(name + '.png');	
	phantom.exit();
});




