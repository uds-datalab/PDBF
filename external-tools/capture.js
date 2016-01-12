var system = require('system');
var fs = require('fs');
if (system.args.length !== 4) {
	console.log('Usage: ' + system.args[0] + ' webpagefile basedir dpiScalingFactor');
	phantom.exit();
} 

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    //console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

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
	
	page.paperSize = {
		width: 1.0*size.w/system.args[3],
		height: 1.0*size.h/system.args[3],
		margin: '0px'
	};
	
	page.zoomFactor = 1.0;
	
	waitFor(
		function() {
			return page.evaluate(function() {
				return typeof font_store !== "undefined" && typeof font_store[json.name] !== "undefined";
			});
		}, 
		function() {
		    var data = page.evaluate(function() {
				overlay();
				return {name: json.name, result: JSON.stringify(json.result)};
			});
			window.setTimeout(function () {
				console.log("Finished " + data.name);
				fs.write('../' + data.name + '.json', data.result, 'w');
				page.render('../' + data.name +'Tmp.pdf', {format: 'pdf', quality: '0'});
				phantom.exit();
			}, 1000);
		},
		60000 //timeout 1m
	);
});




