var system = require('system');
if (system.args.length !== 2) {
console.log('Usage: ' + system.args[0] + ' webpagefile');
phantom.exit();
} 

//try {
	var page = require('webpage').create();

	page.open(system.args[1], function() {
		var w = page.evaluate(function() {
			return outw;
		});
		var h = page.evaluate(function() {
			return outh;
		});
		page.evaluate(function() {
			document.body.bgColor = 'white';
		});
		page.viewportSize = {
			width: w,
			height: h
		};
		window.setTimeout(function () {
			var name = page.evaluate(function() {
				return json.name;
			});
			page.render(name +'.png');
			phantom.exit();
		}, 500);
	});
//} catch(e) {
//	console.log(e);
//	phantom.exit();
//}


