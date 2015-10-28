var system = require('system');
var fs = require('fs');
if (system.args.length !== 3) {
    console.log('Usage: ' + system.args[0] + ' webpagefile basedir');
    phantom.exit();
}

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx
 *            javascript condition that evaluates to a boolean, it can be passed
 *            in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or as
 *            a callback function.
 * @param onReady
 *            what to do when testFx condition is fulfilled, it can be passed in
 *            as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or as a
 *            callback function.
 * @param timeOutMillis
 *            the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000,
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx());
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition
                    // is 'false')
                    // console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    // console.log("'waitFor()' finished in " + (new
                    // Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady();
                    clearInterval(interval); // < Stop this interval
                }
            }
        }, 250); // < repeat check every 250ms
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

var waitAndCapture = function (i) {
	var name = '';
    window.setTimeout(function () {
        waitFor(
            function() {
                return page.evaluate(function(i) {
                	var n = json[i].name;
                	return document.getElementById(n) != null;
                }, i);
            },
            function() {
            	window.setTimeout(function () {
	                o = page.evaluate(function(i) {
	                    var n = json[i].name;
	                    var o = document.getElementById(n);
	                    if (o.childNodes.length > 0) {
	                    	o.childNodes[0].click();
	                    } else {
	                    	o.click();
	                    }
	                    return {name: n, len: json.length};
	                }, i);
	                window.setTimeout(function () {
	                    console.log("processing " + o.name + " of " + o.len);
	                    page.render('./' + system.args[1] + o.name + '.png', {format: 'png', quality: '0'});
		                if (i + 1 < o.len) {
		                    page.evaluate(function(i) {
		                        PDFViewerApplication.page = json[i+1].type.I.page;
		                    }, i);
		                    waitAndCapture(i+1);
		                } else {
		                    phantom.exit();
		                }
	                }, 1000);
            	}, 500);
            },
            60000 // timeout 1m
        );
    }, 500);
};

page.viewportSize = {
    width: 1050,
    height: 1485
};

page.open(system.args[1], function() {
    waitFor(
        function() {
            return page.evaluate(function() {
                return typeof font_store !== "undefined";
            });
        },
        function() {
            var cont = page.evaluate(function() {
                var vc = document.getElementById("viewerContainer");
                vc.setAttribute("style", "overflow:hidden;");
                var tv = document.getElementById("toolbarViewer");
                tv.setAttribute("style", "visibility:hidden;");
                PDFViewerApplication.setScale("page-fit");

                if (json.length > 0) {
                    PDFViewerApplication.page = json[0].type.I.page;
                    return true;
                } else {
                    return false;
                }
            });
            window.setTimeout(function () {
	            if (cont) {
	                waitAndCapture(0);
	            } else {
	            	phantom.exit();
	            }
            }, 500);
        },
        60000 // timeout 1m
    );
});