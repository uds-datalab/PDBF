'use strict';

function fixOverlaySize() {
	var tmp = document.getElementsByClassName("centerhv");
	for (var i = 0; i < tmp.length; ++i) {
		tmp[i].style.left = ($(window).width() - $(tmp[i]).outerWidth()) / 2;
		tmp[i].style.top = ($(window).height() - 32 - $(tmp[i]).outerHeight()) / 2 + 32;
	}
}

// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) {
	window.performance = {
		now : Date.now
	}
}
function tic() {/* tictime = performance.now() */
}
function toc(msg) {
	// var dt = performance.now()-tictime;
	// console.log((msg||'toc') + ": " + dt + "ms");
}

function replaceAll(str, s, r) {
	return str.split(s).join(r);
}

function isValidDate(d) {
	if (Object.prototype.toString.call(d) !== "[object Date]")
		return false;
	return !isNaN(d.getTime());
}

function getCheckbox(labelname, containerControl) {
	var label = document.createElement('label');
	var span = document.createElement('span');
	span.innerHTML = ' ' + labelname + '<br />';
	var checkbox = document.createElement('input');
	checkbox.setAttribute('style', 'position:relative; top:2px;');
	label.appendChild(checkbox);
	label.appendChild(span);
	checkbox.type = 'checkbox';
	containerControl.appendChild(label);
	return checkbox;
}

function display(json, page, phantomJS) {
	tic();
	var container = document.createElement('div');
	container.id = json.name;
	container.className = "overlay";
	var style;
	if (phantomJS) {
		style = "width: 100%; height: 100%; margin-bottom: 0.2em;";
	} else {
		style = "z-index: 8; position: absolute; width:" + (json.type.I.x2 - json.type.I.x1 + 0.001) * 100 + "%; height:" + (json.type.I.y1 - json.type.I.y2 + 0.001) * 100 + "%; left:" + json.type.I.x1 * 100 + "%; bottom:" + (json.type.I.y2 - 0.001) * 100 + "%;";
	}
	page.appendChild(container);

	switch (json.type.C) {
	case "pdbf.common.MultiplotChart":
		var containerOver = document.getElementById(json.name + "Big");
		if (containerOver != null) {
			containerOver.update();
		}
		
		if (!phantomJS) {
			var fullscreen = getFullscreenDiv();
			container.appendChild(fullscreen);
			fullscreen.addEventListener("click", function() {
				if (containerOver == null) {
					containerOver = document.createElement('div');
					containerOver.setAttribute('style', 'position:fixed; z-index:-1; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; white-space: nowrap;');
					containerOver.id = json.name + "Big";
					containerOver.className = "centerhv";
					buildContainerMultiplotChartBig(json, containerOver, true);
				}
				containerOver.style.visibility = 'visible';
				containerOver.style['z-index'] = 9;
				containerOver.style.opacity = 1;
				$("svg").css('display', 'none');
				$("svg").css('height');
				$("svg").css('display', 'initial');//HACK for redraw of SVG
			});
		}
		container.setAttribute('style', style);
		buildContainerMultiplotChart(container, json, zoomFactor, style, containerOver);
		break;
	case "pdbf.common.Chart":
		var containerOver = document.getElementById(json.name + "Big");
		if (containerOver != null) {
			containerOver.update();
		}

		if (!phantomJS) {
			var fullscreen = getFullscreenDiv();
			container.appendChild(fullscreen);
			fullscreen.addEventListener("click", function() {
				if (containerOver == null) {
					containerOver = document.createElement('div');
					containerOver.setAttribute('style', 'position:fixed; z-index:-1; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; white-space: nowrap;');
					containerOver.id = json.name + "Big";
					containerOver.className = "centerhv";
					buildContainerChartBig(json, containerOver, true);
				}
				containerOver.style.visibility = 'visible';
				containerOver.style['z-index'] = 9;
				containerOver.style.opacity = 1;
				$("svg").css('display', 'none');
				$("svg").css('height');
				$("svg").css('display', 'initial');//HACK for redraw of SVG
			});
		}
		container.setAttribute('style', style);
		buildContainerChart(container, json, zoomFactor, style, containerOver);
		break;
	case "pdbf.common.Text":
		var containerOver = document.getElementById(json.name + "Big");
		if (containerOver != null) {
			containerOver.update();
		}
		
		container.addEventListener("click", function() {
			if (containerOver == null) {
				containerOver = document.createElement('div');
				containerOver.setAttribute('style', 'position:fixed; z-index:-1; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; white-space: nowrap;');
				containerOver.id = json.name + "Big";
				containerOver.className = "centerhv";
				buildContainerTableBig(json, containerOver);
			}
			containerOver.style.visibility = 'visible';
			containerOver.style['z-index'] = 9;
			containerOver.style.opacity = 1;
		});
		style += 'cursor: pointer;';
		container.setAttribute('style', style);
		break;
	case "pdbf.common.Pivot":
		var containerOver = document.getElementById(json.name + "Big");
		if (containerOver != null) {
			containerOver.update();
		}

		if (!phantomJS) {
			var fullscreen = getFullscreenDiv();
			container.appendChild(fullscreen);
			fullscreen.addEventListener("click", function() {
				if (containerOver == null) {
					containerOver = document.createElement('div');
					containerOver.setAttribute('style', 'position:fixed; z-index:-1; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; white-space: nowrap;');
					containerOver.id = json.name + "Big";
					containerOver.className = "centerhv";
					buildContainerPivotBig(json, containerOver, true);
				}
				containerOver.style.visibility = 'visible';
				containerOver.style['z-index'] = 9;
				containerOver.style.opacity = 1;
			});
		}
		container.setAttribute('style', style);
		buildContainerPivot(container, json, zoomFactor, style, containerOver);
		break;
	default:
		alert("Unknown type: " + json.type.C);
		break;
	}
	toc("Display time for " + json.name);
}

function buildContainerChartBig(json, containerOver, initial) {
	var basetextsize = 8;

	var updateData = function() {
		json.jsonBig.type.I.xUnitName = '';
		json.jsonBig.type.I.yUnitName = '';
		json.jsonBig.type.I.query = ref.editor.getValue();
		json.chartdataBig = getChartData(json.jsonBig);
		json.resultBig = json.chartdataBig.res;
		if (json.chartdataBig.error != undefined) {
			error.innerHTML = 'Query status: ' + json.chartdataBig.error;
			containerOptions.style.visibility = 'hidden';
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
		}
		var optionsBig = getChartOptions(json.jsonBig, rawZoomFactor, json.chartdataBig.values, containerContent);
		json.chart = c3.generate(optionsBig);
	};
	var update = function() {
		// json.jsonBig.type.I.logScale = logScale.checked;
		// json.jsonBig.type.I.includeZero = includeZero.checked;
		// json.jsonBig.type.I.drawPoints = drawPoints.checked;
		// json.jsonBig.type.I.fillGraph = fillGraph.checked;
		// json.jsonBig.type.I.showRangeSelector = showRangeSelector.checked;

		var optionsBig = getChartOptions(json.jsonBig, rawZoomFactor, json.chartdataBig.values, containerContent);
		json.chart = c3.generate(optionsBig);
	};

	json.jsonBig = jQuery.extend(true, {}, json);
	var chartdataCpy = getChartData(json);
	json.resultBig = chartdataCpy.res;
	var viewerContainer = document.getElementById("viewerContainer");
	var tip = "Tip: Scroll to zoom the graph. Click and drag to pan the graph.<br/>";
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip, [ json ], updateData, 'graph', true);
	var containerContent = ref.containerContent;
	var containerControl = ref.containerControl;
	var containerOptions = ref.options;
	var error = ref.error;

	if (initial) {
		if (chartdataCpy.error != undefined) {
			alert(json.name + "Big reports error:\n" + chartdataCpy.error);
		}
	} else {
		if (chartdataCpy.error != undefined) {
			error.innerHTML = 'Query status: ' + chartdataCpy.error;
			containerOptions.style.visibility = 'hidden';
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
		}
	}

	/*
	 * var logScale = getCheckbox('LogScale', containerOptions);
	 * logScale.addEventListener('change', update); logScale.checked =
	 * json.jsonBig.type.I.logScale;
	 * 
	 * var includeZero = getCheckbox('IncludeZero', containerOptions);
	 * includeZero.addEventListener('change', update); includeZero.checked =
	 * json.jsonBig.type.I.includeZero;
	 * 
	 * var drawPoints = getCheckbox('DrawPoints', containerOptions);
	 * drawPoints.addEventListener('change', update); drawPoints.checked =
	 * json.jsonBig.type.I.drawPoints;
	 * 
	 * var fillGraph = getCheckbox('FillGraph', containerOptions);
	 * fillGraph.addEventListener('change', update); fillGraph.checked =
	 * json.jsonBig.type.I.fillGraph;
	 * 
	 * var showRangeSelector = getCheckbox('ShowRangeSelector',
	 * containerOptions); showRangeSelector.addEventListener('change', update);
	 * showRangeSelector.checked = json.jsonBig.type.I.showRangeSelector;
	 */

	var optionsBig = getChartOptions(json.jsonBig, rawZoomFactor, chartdataCpy.values, containerContent);

	json.chart = c3.generate(optionsBig);
	json.chartdataBig = chartdataCpy;

	containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize + 'pt';

	containerOver.update = function() {
		var optionsBig = getChartOptions(json.jsonBig, rawZoomFactor, json.chartdataBig.values, containerContent);
		json.chart = c3.generate(optionsBig);
		containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize + 'pt';
	}
}

function buildContainerChart(container, json, zoomFactor, style, containerOver) {
	var chart = document.createElement('div');
	chart.setAttribute('style', 'width:100%; height:100%;');
	container.appendChild(chart);

	var chartdata;
	if (json.result == undefined) {
		chartdata = getChartData(json);
		if (chartdata.error != undefined) {
			alert(chartdata.error + '\nWhere: ' + json.name + '\nQuery was: ' + json.type.I.query);
			return;
		}
		chartdata = chartdata.values;
		json.result = chartdata;
	} else {
		chartdata = json.result;
	}

	style = "background: white; font-size: " + (zoomFactor * 10) + "pt; " + style;
	container.setAttribute('style', style);

	var options = getChartOptions(json, zoomFactor, chartdata, chart);

	c3.generate(options);
}

function buildContainerPivotBig(json, containerOver, initial) {
	var basetextsize = 8;

	var updateData = function() {
		json.type.I.queryB = ref.editor.getValue();
		// save pivot table settings (aggr, aggrAtt, renderer)
		var r = getPivotTableData(json, true);
		json.resultBig = r.res;
		if (r.error != undefined) {
			error.innerHTML = 'Query status: ' + r.error;
			containerOptions.style.visibility = 'hidden';
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
		}

		var aggr = r.aggr;
		var aggrName = r.aggrName;
		var aggrAtt = r.aggrAttribute;

		$(containerContent).pivotUI(r.res, {
			aggregator : aggr
		}, true);
	};

	var viewerContainer = document.getElementById("viewerContainer");
	var tip = "Tip: Drag and drop attributes to the row/column area. <br/>Move the cursor over the result cells to see more detailed results for min and max aggregator.<br/>";
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip, [ json ], updateData, 'pivot table', false);
	var containerContent = ref.containerContent;
	var containerControl = ref.containerControl;
	var containerOptions = ref.options;
	var editor = ref.editor;
	var error = ref.error;
	editor.setValue(json.type.I.queryB);

	var r = getPivotTableData(json, true);
	json.resultBig = r.res;
	if (initial) {
		if (r.error != undefined) {
			alert(r.error);
			return;
		}
	} else {
		if (r.error != undefined) {
			error.innerHTML = 'Query status: ' + r.error;
			containerOptions.style.visibility = 'hidden';
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
		}
	}

	var aggrName = r.aggrName;
	var aggrAtt = r.aggrAttribute;
	var aggr = $.pivotUtilities.aggregators[aggrName]([ aggrAtt ]);

	$(containerContent).pivotUI(r.res, {
	rows : r.rows,
	cols : r.cols,
	aggregator : aggr,
	vals : [ aggrAtt ],
	aggregatorName : aggrName
	});

	containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize + 'pt';

	containerOver.update = function() {
		containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize + 'pt';
	}
}

function buildContainerPivot(container, json, zoomFactor, style, containerOver) {
	var chart = document.createElement('div');
	chart.setAttribute('style', 'width:100%; height:100%;');
	container.appendChild(chart);
	container.setAttribute('style', style + "background: white;");

	var r;
	if (json.result == undefined) {
		r = getPivotTableData(json, false);
		if (r.error != undefined) {
			alert(r.error);
			return;
		}
		json.result = r;
	} else {
		r = json.result;
	}

	var aggrName = r.aggrName;
	var aggrAtt = r.aggrAttribute;
	var aggr = $.pivotUtilities.aggregators[aggrName]([ aggrAtt ]);
	var unused = [];
	for (var key in r.res[0]) {
		if (aggrAtt != key && $.inArray(key, r.rows) == -1 && $.inArray(key, r.cols) == -1) {
			unused[unused.length] = key;
		}
	}
	$(chart).pivot(r.res, {
	rows : r.rows,
	cols : r.cols,
	aggregator : aggr,
	unused : unused
	});
	container.getElementsByClassName("pvtTable")[0].setAttribute('style', 'width: 100%; height: 100%; font-size: ' + zoomFactor * 12 + 'pt;');
}

function buildContainerTableBig(json, containerOver) {
	var basetextsize = 8;

	var update = function() {
		json.jsonBig.type.I.queryB = ref.editor.getValue();
		var err;
		try {
			var results = alasqlQuery(json.jsonBig.type.I.queryB);
			json.resultBig = results;
		} catch (e) {
			err = e.message;
		}

		if (err != undefined) {
			error.innerHTML = 'Query status: ' + err;
			containerOptions.style.visibility = 'hidden';
			containerContent.innerHTML = '';
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
			getTableFromResults(results, containerContent);
		}
	};

	json.jsonBig = jQuery.extend(true, {}, json);

	var err;
	try {
		var results = alasqlQuery(json.jsonBig.type.I.queryB);
		json.resultBig = results;
	} catch (e) {
		err = e.message;
	}
	if (err != undefined) {
		alert(err);
	}

	var viewerContainer = document.getElementById("viewerContainer");
	var tip = 'Tip: Click on the attributes to change the sorting.';
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip, [ json ], update, 'table', false);
	var containerContent = ref.containerContent;
	var containerOptions = ref.options;
	var error = ref.error;
	ref.editor.setValue(json.type.I.queryB);

	getTableFromResults(results, containerContent);

	containerOver.update = function() {
		containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize + 'pt';
	}
}

function buildContainerMultiplotChart(container, json, zoomFactor, style, containerOver) {

	function getLeft(cur, json, td) {
		var ret;
		var div = document.createElement('div');
		div.className = 'vertical-text';
		div.setAttribute('style', 'width: ' + left + 'px;');
		td.appendChild(div);
		if (typeof cur == 'string' || cur instanceof String) {
			td.setAttribute('rowspan', 1);
			div.innerHTML = "<div class=\"vertical-text__innerL\">" + cur + "</div>";
			ret = 1;
		} else {
			if (cur.c == undefined || cur.text == undefined) {
				alert("leftArr of " + json.name + " has wrong format!\nShould be: [{text: \"...\", c:somenumber}, ...]\nBut it was: " + JSON.stringify(topArr));
			}
			td.setAttribute('rowspan', cur.c);
			div.innerHTML = "<div class=\"vertical-text__innerL\">" + cur.text + "</div>";
			ret = cur.c;
		}
		return ret;
	}

	function getRight(cur, json, td) {
		var ret;
		var div = document.createElement('div');
		div.className = 'vertical-text';
		div.setAttribute('style', 'width: ' + right + 'px;');
		td.appendChild(div);
		if (typeof cur == 'string' || cur instanceof String) {
			td.setAttribute('rowspan', 1);
			div.innerHTML = "<div class=\"vertical-text__innerR\">" + cur + "</div>";
			ret = 1;
		} else {
			if (cur.c == undefined || cur.text == undefined) {
				alert("rightArr of " + json.name + " has wrong format!\nShould be: [{text: \"...\", c:somenumber}, ...]\nBut it was: " + JSON.stringify(topArr));
			}
			td.setAttribute('rowspan', cur.c);
			div.innerHTML = "<div class=\"vertical-text__innerR\">" + cur.text + "</div>";
			ret = cur.c;
		}
		return ret;
	}

	function getTop(cur, json, td) {
		var ret;
		if (typeof cur == 'string' || cur instanceof String) {
			td.setAttribute('colspan', 1);
			td.innerHTML = cur;
			ret = 1;
		} else {
			if (cur.c == undefined || cur.text == undefined) {
				alert("topArr of " + json.name + " has wrong format!\nShould be: [{text: \"...\", c:somenumber}, ...]\nBut it was: " + JSON.stringify(topArr));
			}
			td.setAttribute('colspan', cur.c);
			td.innerHTML = cur.text;
			ret = cur.c;
		}
		td.setAttribute('style', 'height: 1.5em; width: ' + w + 'px;');
		return ret;
	}

	function getBottom(cur, json, td) {
		var ret;
		if (typeof cur == 'string' || cur instanceof String) {
			td.setAttribute('colspan', 1);
			td.innerHTML = cur;
			ret = 1;
		} else {
			if (cur.c == undefined || cur.text == undefined) {
				alert("bottomArr of " + json.name + " has wrong format!\nShould be: [{text: \"...\", c:somenumber}, ...]\nBut it was: " + JSON.stringify(topArr));
			}
			td.setAttribute('colspan', cur.c);
			td.innerHTML = cur.text;
			ret = cur.c;
		}
		td.setAttribute('style', 'height: 1.5em; width: ' + w + 'px;');
		return ret;
	}

	style = "background: white;" + style;
	container.setAttribute('style', style);

	var overlay = container;
	var xCount = json.type.I.xCount;
	var yCount = json.type.I.yCount;

	var leftArr;
	try {
		leftArr = JSON.parse(json.type.I.leftArr);
	} catch (e) {
		alert("Parsing of leftArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.leftArr);
	}

	var rightArr;
	try {
		rightArr = JSON.parse(json.type.I.rightArr);
	} catch (e) {
		alert("Parsing of rightArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.rightArr);
	}

	var topArr;
	try {
		topArr = JSON.parse(json.type.I.topArr);
	} catch (e) {
		alert("Parsing of topArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.topArr);
	}

	var bottomArr;
	try {
		bottomArr = JSON.parse(json.type.I.bottomArr);
	} catch (e) {
		alert("Parsing of bottomArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.bottomArr);
	}

	var xValues;
	try {
		xValues = JSON.parse(json.type.I.xValues);
	} catch (e) {
		alert("Parsing of xValues for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.xValues);
	}

	var yValues;
	try {
		yValues = JSON.parse(json.type.I.yValues);
	} catch (e) {
		alert("Parsing of yValues for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.yValues);
	}

	var queryBackup = json.type.I.query;
	var yFirst = json.type.I.yFirst;
	var forceXequal = json.type.I.forceXequal;
	var forceYequal = json.type.I.forceYequal;

	if (xValues.length != xCount) {
		alert("Length of xValues array does not match xCount!\nxValues has length " + xCount.length + " but xCount is " + xCount);
	}
	if (yValues.length != yCount) {
		alert("Length of yValues array does not match yCount!\nyValues has length " + yCount.length + " but yCount is " + yCount);
	}

	if (((queryBackup.match(/\?/g) || []).length) != 2) {
		alert("Query for multiplot must contain exactly 2 occurrences of \"?\"\nQuery was: " + queryBackup);
	}

	if (leftArr.length == 0) {
		leftArr = [ {
		text : json.type.I.yUnitName,
		c : yCount
		} ];
	}
	if (rightArr.length == 0) {
		rightArr = [];
		for (var i = 0; i < yValues.length; ++i) {
			rightArr[rightArr.length] = {
			text : yValues[i],
			c : 1
			};
		}
	}
	if (topArr.length == 0) {
		topArr = [];
		for (var i = 0; i < xValues.length; ++i) {
			topArr[topArr.length] = {
			text : xValues[i],
			c : 1
			};
		}
	}
	if (bottomArr.length == 0) {
		bottomArr = [ {
		text : json.type.I.xUnitName,
		c : xCount
		} ];
	}

	// TODO: right now only labels of one line height are supported!
	var fontbasesize = 13;
	var left = leftArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var right = rightArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var top = topArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var bottom = bottomArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var options = getChartOptions(json, zoomFactor, {});
	var legend = options.legend.show ? fontbasesize * zoomFactor * 1.6 : 0;
	var inner = document.createElement('table');
	var charts = [];
	inner.setAttribute('style', 'height: 100%; width: 100%; border-collapse: collapse; text-align:center; font-size: ' + fontbasesize * zoomFactor + 'px; font-weight: bold;');
	overlay.appendChild(inner);
	inner.className = 'multiplot';

	var css = document.createElement('style');
	css.setAttribute('scoped', 'scoped');
	overlay.appendChild(css);
	css.innerHTML = '.multiplot td {padding:0;} .c3-tooltip td {padding:0.3em;}';

	var overlaywidth = $(overlay).width();
	var overlayheight = $(overlay).height();

	var nextLeft = 0;
	var nextRight = 0;

	var h = Math.floor((overlayheight - top - bottom - legend - 1) / yCount);
	var w = Math.floor((overlaywidth - left - right - 1) / xCount);
	var style = 'width: ' + w + 'px;' + 'height: ' + h + 'px;';

	var yExtent;
	var xExtent = [];

	var legendItems = [];
	var colors = {};

	// Calculate size of axis labels
	var div = document.createElement('div');
	div.setAttribute('style', style);
	overlay.appendChild(div);
	var cellquery = queryBackup;
	if (yFirst) {
		cellquery = cellquery.replace("?", yValues[0]);
		cellquery = cellquery.replace("?", xValues[0]);
	} else {
		cellquery = cellquery.replace("?", xValues[0]);
		cellquery = cellquery.replace("?", yValues[0]);
	}
	json.type.I.query = cellquery;
	defaultChartOptions.noyticks = true;
	defaultChartOptions.noxticks = true;
	
	var chartdata;
	if (json.result == undefined) {
		json.result = [];
	}
	
	var chartdata = getChartData(json);
	if (chartdata.error != undefined) {
		alert(json.name + " has error:\n" + chartdata.error);
	}
	var options = getChartOptions(json, zoomFactor, chartdata.values, div);
	delete options.axis.y.label;
	delete options.axis.x.label;
	options.legend.show = false;
	var chart = c3.generate(options);
	var pl = chart.pl();
	var pb = chart.pb();
	overlay.removeChild(div);

	var div = document.createElement('div');
	div.setAttribute('style', style);
	overlay.appendChild(div);
	var cellquery = queryBackup;
	if (yFirst) {
		cellquery = cellquery.replace("?", yValues[0]);
		cellquery = cellquery.replace("?", xValues[0]);
	} else {
		cellquery = cellquery.replace("?", xValues[0]);
		cellquery = cellquery.replace("?", yValues[0]);
	}
	json.type.I.query = cellquery;
	defaultChartOptions.noyticks = false;
	defaultChartOptions.noxticks = false;

	if (json.result[0] == undefined) {
		chartdata = getChartData(json);
		if (chartdata.error != undefined) {
			alert(json.name + " has error:\n" + chartdata.error);
		}
		chartdata = chartdata.values;
		json.result[0] = chartdata;
	} else {
		chartdata = json.result[0];
	}

	var options = getChartOptions(json, zoomFactor, chartdata, div);
	delete options.axis.y.label;
	delete options.axis.x.label;
	options.legend.show = false;
	var chart = c3.generate(options);
	var pl = chart.pl() - pl;
	var pb = chart.pb() - pb;
	overlay.removeChild(div);
	// /////////////////////////////

	var h = Math.floor((overlayheight - top - bottom - legend - pb - 1) / yCount);
	var w = Math.floor((overlaywidth - left - right - pl - 1) / xCount);

	if (top != 0) {
		var tr = document.createElement('tr');
		inner.appendChild(tr);
		if (left != 0) {
			var td = document.createElement('td');
			tr.appendChild(td);
		}
		var cur = topArr.shift();
		var td = document.createElement('td');
		tr.appendChild(td);
		getTop(cur, json, td);
		$(td).css("padding-left", pl);
		while (topArr.length != 0) {
			var cur = topArr.shift();
			var td = document.createElement('td');
			tr.appendChild(td);
			getTop(cur, json, td);
		}
		if (right != 0) {
			var td = document.createElement('td');
			tr.appendChild(td);
		}
	}
	for (var y = 0; y < yCount; ++y) {
		var tr = document.createElement('tr');
		inner.appendChild(tr);
		if (y == nextLeft) {
			var cur = leftArr.shift();
			var td = document.createElement('td');
			tr.appendChild(td);
			nextLeft += getLeft(cur, json, td);
			if (y == yCount - 1) {
				$(td).css("padding-bottom", pb);
			}
		}
		for (var x = 0; x < xCount; ++x) {
			var td = document.createElement('td');
			tr.appendChild(td);
			var cellInner = document.createElement('div');
			td.appendChild(cellInner);

			var cellquery = queryBackup;
			if (yFirst) {
				cellquery = cellquery.replace("?", yValues[y]);
				cellquery = cellquery.replace("?", xValues[x]);
			} else {
				cellquery = cellquery.replace("?", xValues[x]);
				cellquery = cellquery.replace("?", yValues[y]);
			}
			json.type.I.query = cellquery;

			if (x % xCount != 0) {
				defaultChartOptions.noyticks = true;
				var style = 'width: ' + w + 'px;';
			} else {
				defaultChartOptions.noyticks = false;
				var style = 'width: ' + (w + pl) + 'px;';
			}
			if (y % yCount != yCount - 1) {
				defaultChartOptions.noxticks = true;
				style += 'height: ' + h + 'px;';
			} else {
				defaultChartOptions.noxticks = false;
				style += 'height: ' + (h + pb) + 'px;';
			}
			cellInner.setAttribute('style', style);
			td.setAttribute('style', style);

			var chartdata;
			if (json.result[x + y * yCount] == undefined) {
				chartdata = getChartData(json);
				if (chartdata.error != undefined) {
					alert(json.name + " has error:\n" + chartdata.error);
				}
				chartdata = chartdata.values;
				json.result[x + y * yCount] = chartdata;
			} else {
				chartdata = json.result[x + y * yCount];
			}
			var options = getChartOptions(json, zoomFactor, chartdata, cellInner);

			if (forceYequal) {
				if (x != 0) {
					// replace y extent
					options.axis.y.min = yExtent[0];
					options.axis.y.max = yExtent[1];
					options.axis.y.padding = {
					top : 0,
					bottom : 0
					};
				}
			}
			if (forceXequal) {
				if (y != 0) {
					// replace x extent
					options.axis.x.min = xExtent[x][0];
					options.axis.x.max = xExtent[x][1];
					options.axis.x.padding = {
					left : 0,
					right : 0
					};
				}
			}

			delete options.axis.y.label;
			delete options.axis.x.label;
			options.legend.show = false;

			var chart = c3.generate(options);
			charts[charts.length] = chart;

			if (legend != 0) {
				var a = options.data.keys.value;
				for (var i = 1; i < a.length; ++i) {
					if (legendItems.indexOf(a[i]) === -1) {
						legendItems[legendItems.length] = a[i];
						colors[a[i]] = chart.color(a[i]);
					}
				}
			}

			if (forceYequal) {
				if (x == 0) {
					// save y extent
					yExtent = chart.yd();
				}
			}
			if (forceXequal) {
				if (y == 0) {
					// save x extent
					xExtent[x] = chart.xd();
				}
			}
		}
		if (y == nextRight) {
			var cur = rightArr.shift();
			var td = document.createElement('td');
			tr.appendChild(td);
			nextRight += getRight(cur, json, td);
			if (y == yCount - 1) {
				$(td).css("padding-bottom", pb);
			}
		}
	}
	if (bottom != 0) {
		var tr = document.createElement('tr');
		inner.appendChild(tr);
		if (left != 0) {
			var td = document.createElement('td');
			tr.appendChild(td);
		}
		while (bottomArr.length != 0) {
			var cur = bottomArr.shift();
			var td = document.createElement('td');
			tr.appendChild(td);
			getBottom(cur, json, td);
		}
		if (right != 0) {
			var td = document.createElement('td');
			tr.appendChild(td);
		}
	}

	if (legend != 0) {
		var tr = document.createElement('tr');
		inner.appendChild(tr);
		if (left != 0) {
			var td = document.createElement('td');
			tr.appendChild(td);
		}

		var td = document.createElement('td');
		tr.appendChild(td);
		td.setAttribute('style', 'height: 1.5em; width: ' + w + 'px;');
		td.setAttribute('colspan', cur.c);

		d3.select(td).insert('div', '.chart').attr('class', 'legend').selectAll('span').data(legendItems).enter().append('span').attr('data-id', function(id) {
			return id;
		}).html(function(id) {
			return "<span style='width:" + (11 * zoomFactor) + "px; height:" + (11 * zoomFactor) + "px; background-color: " + colors[id] + "; margin-right:" + (5 * zoomFactor) + "px; margin-left:" + (10 * zoomFactor) + "px;'></span>" + id;
		}).on('mouseover', function(id) {
			charts.forEach(function(c, i, a) {
				c.focus(id);
			});
		}).on('mouseout', function(id) {
			charts.forEach(function(c, i, a) {
				legendItems.forEach(function(c2, i2, a2) {
					c.revert(c2);
				});
			});
		}).on('click', function(id) {
			charts.forEach(function(c, i, a) {
				c.toggle(id);
			});
		});

		if (right != 0) {
			var td = document.createElement('td');
			tr.appendChild(td);
		}
	}

	json.type.I.query = queryBackup;
	defaultChartOptions.noxticks = false;
	defaultChartOptions.noyticks = false;
}

function buildContainerMultiplotChartBig(json, containerOver, initial) {
	// TODO: maybe handle this different
	var xValues;
	try {
		xValues = JSON.parse(json.type.I.xValues);
	} catch (e) {
		alert("Parsing of xValues for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.xValues);
	}
	var yValues;
	try {
		yValues = JSON.parse(json.type.I.yValues);
	} catch (e) {
		alert("Parsing of yValues for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.yValues);
	}

	var queryBackup = json.type.I.query;
	var queryBackupB = json.type.I.queryB;
	var cellquery = json.type.I.query;
	var yFirst = json.type.I.yFirst;
	if (yFirst) {
		cellquery = cellquery.replace("?", yValues[0]);
		cellquery = cellquery.replace("?", xValues[0]);
	} else {
		cellquery = cellquery.replace("?", xValues[0]);
		cellquery = cellquery.replace("?", yValues[0]);
	}
	json.type.I.query = cellquery;
	json.type.I.queryB = cellquery;
	buildContainerChartBig(json, containerOver, true);
	json.type.I.query = queryBackup;
	json.type.I.queryB = queryBackupB;
}

function print(text) {
	outputElm.innerHTML = text.replace(/\n/g, '<br>');
}

function error(e) {
	console.log(e);
	errorElm.setAttribute('style', "margin-top:5px;overflow: auto;");
	errorElm.innerHTML = "<pre>" + e.message + "</pre>";
}

function noerror() {
	errorElm.innerHTML = "";
	errorElm.setAttribute('style', "height:0px;");
}

function execute(commands) {
	try {
		tic();
		var results = alasqlQuery(commands);
		toc("Executing SQL");

		tic();
		getTableFromResults(results, outputElm);
		toc("Displaying results");
	} catch (e) {
		error(e);
		outputElm.innerHTML = "";
	}
}

function tableCreate(res, table) {
	var columns = [];
	for (key in res[0]) {
		columns[columns.length] = {
		data : key,
		title : key
		};
	}

	$(table).dataTable({
	data : res,
	columns : columns,
	});
}

function getTableFromResults(results, container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	if (typeof (results) == 'number') {
		var span = document.createElement('span');
		span.innerHTML = '<u><b>Result for Query</b></u>:';
		container.appendChild(span);
		container.appendChild(getSpacer());
		var span = document.createElement('span');
		span.innerHTML = 'Query executed successfully.';
		container.appendChild(span);
	} else {
		for (var i = 0; i < results.length; ++i) {
			if (typeof (results[i]) == 'number') {
				var span = document.createElement('span');
				span.innerHTML = '<u><b>Result for Query' + (i + 1) + '</b></u>:';
				container.appendChild(span);
				container.appendChild(getSpacer());
				var span = document.createElement('span');
				span.innerHTML = 'Query executed successfully.';
				container.appendChild(span);
				container.appendChild(getSpacer());
			} else if (results[i] instanceof Array) {
				var span = document.createElement('span');
				span.innerHTML = '<u><b>Result for Query' + (i + 1) + '</b></u>:';
				container.appendChild(span);
				container.appendChild(getSpacer());
				if (results[i].length > 0) {
					var table = document.createElement('table');
					table.cellpadding = 0;
					table.cellspacing = 0;
					table.border = 0;
					table.className = 'display';
					table.setAttribute('style', 'border: 1px solid black; margin-top: 5px;');
					container.appendChild(table);
					tableCreate(results[i], table);
				} else {
					var span = document.createElement('span');
					span.innerHTML = 'No rows returned.';
					container.appendChild(span);
				}
			} else {
				var span = document.createElement('span');
				span.innerHTML = '<u><b>Result for Query</b></u>:';
				container.appendChild(span);
				container.appendChild(getSpacer());
				var table = document.createElement('table');
				table.cellpadding = 0;
				table.cellspacing = 0;
				table.border = 0;
				table.className = 'display';
				table.setAttribute('style', 'border: 1px solid black; margin-top: 5px;');
				container.appendChild(table);
				tableCreate(results, table);
				break;
			}
		}
		if (results.length == 0) {
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
			var span = document.createElement('span');
			span.innerHTML = '<u><b>Result for Query</b></u>:<br/>No rows returned.';
			container.appendChild(span);
			return;
		}
	}
	return tmp;
}

function execEditorContents() {
	noerror();
	var query = document.getElementById("SQLQuery");
	query.style.visibility = 'visible';
	query.style.opacity = 1;
	execute(editorMain.getValue() + ';');
}

// var debugmode = 0;
window.addEventListener('keydown', function keydown(evt) {
	switch (evt.keyCode) {
	case 27: // 27 == 'ESC'
		var tmp = document.getElementsByClassName("centerhv");
		for (var i = 0; i < tmp.length; ++i) {
			setTimeout(function(o) {
				o.style.visibility = 'hidden';
			}, 500, tmp[i]);
			tmp[i].style.opacity = 0;
		}
		break;
	// case 81: //81 == 'Q'
	// list = document.getElementsByClassName("overlay");
	// if (debugmode == 3) {
	// for (var i=list.length-1; i>=0; --i) {
	// list[i].setAttribute('class', 'overlay');
	// }
	// debugmode = 0;
	// } else if (debugmode == 0) {
	// for (var i=list.length-1; i>=0; --i) {
	// list[i].setAttribute('class', 'overlay debug');
	// }
	// debugmode = 1;
	// } else if (debugmode == 1) {
	// for (var i=list.length-1; i>=0; --i) {
	// if (list[i].children.length > 0) {
	// list[i].children[0].setAttribute('class', 'hide');
	// list[i].setAttribute('style', list[i].getAttribute('style').substring(18,
	// list[i].getAttribute('style').length));
	// }
	// }
	// debugmode = 2;
	// } else {
	// for (var i=list.length-1; i>=0; --i) {
	// if (list[i].children.length > 0) {
	// list[i].children[0].setAttribute('class', '');
	// list[i].setAttribute('style', 'background: white;' +
	// list[i].getAttribute('style'));
	// }
	// list[i].setAttribute('class', 'overlay hide');
	// }
	// debugmode = 3;
	// }
	// break;
	}
});

function addClickCloseHandler(elem, o) {
	elem.addEventListener('click', function(e) {
		setTimeout(function(o) {
			o.style.visibility = 'hidden';
			o.style['z-index'] = -1;
		}, 500, o);
		o.style.opacity = 0;
	});
}

var defaultChartOptions = {
noxticks : false,
noyticks : false,
legend : {
	show : true
}
};

function getChartOptions(json, zoomFactor, values, chart) {
	var options = {
	bindto : chart,
	data : values,
	size : {
	width : $(chart).width(),
	height : $(chart).height()
	},
	axis : {
	x : {
	label : json.type.I.xUnitName,
	tick : {
		fit : false,
	},
	},
	y : {
	label : json.type.I.yUnitName,
	tick : {
		fit : false,
	}
	},
	y2 : {
		tick : {
			fit : false,
		}
	}
	},
	zoom : {
	enabled : true,
	rescale : true
	},
	point : {
		show : false
	},
	completeScale : zoomFactor * 1.45,
	onresize : function() {
	}
	};

	jQuery.extend(true, options, defaultChartOptions);

	try {
		var addOpt = JSON.parse(json.type.I.options);
	} catch (e) {
		alert('Parsing of options for ' + json.name + ' failed. \nDid you forgot to enclose every field and value by ", or did your TeX program replace " by \'\'?\nRemember that the correct JSON String syntax is: "key": "value"\n JSON String was:\n' + json.type.I.options);
	}
	jQuery.extend(true, options, addOpt);

	if (options.axis.x.label == '')
		delete options.axis.x.label;
	if (options.axis.y.label == '')
		delete options.axis.y.label;

	switch (json.type.I.chartType) {
	case 'Line':
	case 'line':
		break;
	case 'Bar':
	case 'bar':
		options.data.type = 'bar';
		break;
	case 'SignaturePlot':
	case 'signatureplot':
		try {
			options.data = signaturePlot([ options.data ]);
			options.axis.x.tick.format = function(x) {
				return '' + (Math.round(x * 10000) / 100) + '%';
			};
			options.axis.y.tick.format = function(y) {
				return '' + (Math.round(y * 10000) / 100) + '%';
			};
		} catch (e) {
			alert(e);
		}
		break;
	default:
		alert('Unknown chart type. Type was: "' + json.type.I.chartType + '"');
	}

	if (values.json != undefined && isNaN(values.json[0][values.x])) {
		options.axis.x.type = "timeseries";
	}

	// add scoped css
	var css = document.createElement('style');
	css.setAttribute('scoped', 'scoped');
	$(chart).parent().append(css);
	css.innerHTML = '																' + '.c3-line {																	' + ' stroke-width: ' + (zoomFactor) + 'px; }										' + '																			' + '.c3-circle._expanded_ {													' + ' stroke-width: ' + (zoomFactor) + 'px;											' + ' stroke: white; }															' + '																			' + '.c3-selected-circle {														' + ' fill: white;																' + ' stroke-width: ' + (2 * zoomFactor) + 'px; }										' + '																			' + '.c3-target.c3-focused path.c3-line, .c3-target.c3-focused path.c3-step {	' + ' stroke-width: ' + (2 * zoomFactor) + 'px; }										' + '																			' + '.c3-legend-background {													' + ' opacity: 0.75;															' + ' fill: white;																' + ' stroke: lightgray;														' + ' stroke-width: ' + (zoomFactor) + '; }											';

	return options;
}

function prepopulateContainerOver(containerOver, viewerContainer, tip, jsonArr, update, f, fixed) {
	var json = jsonArr[0]; // pass by reference
	var containerChart = document.createElement('div');
	if (fixed) {
		containerChart.setAttribute('style', 'width:50%; height:80%; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; padding:2%; background:white; margin:1%; display: inline-block; vertical-align:top; white-space: normal;');
	} else {
		containerChart.setAttribute('style', '-moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; padding:2%; background:white; margin:1%; display: inline-block; vertical-align:top; white-space: normal;');
	}
	var containerControl = document.createElement('div');
	containerControl.setAttribute('style', 'width:40%; height:80%; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; padding:2%; background:white; margin:1%; display: inline-block; text-align: left; white-space: normal;');

	var header = document.createElement('span');
	header.innerHTML = 'SQL Query for ' + f + ':<br />Tip: Press CTRL-Space for autocomplete';
	containerControl.appendChild(header);

	var textareaWrapper = document.createElement('div');
	containerControl.appendChild(textareaWrapper);
	textareaWrapper.setAttribute('style', 'border: 1px solid black; margin-top: 3px; margin-bottom: 3px;');

	var textarea = document.createElement('textarea');
	textareaWrapper.appendChild(textarea);

	var def = document.createElement('input');
	def.type = 'button';
	def.value = 'Restore Default';
	def.setAttribute('style', 'font-size:inherit;');
	def.addEventListener('click', function() {
		delete json.jsonBig;
		json.jsonBig = jQuery.extend(true, {}, json);

		while (containerOver.firstChild) {
			containerOver.removeChild(containerOver.firstChild);
		}
		switch (json.type.C) {
		case "pdbf.common.MultiplotChart":
			buildContainerMultiplotChartBig(json, containerOver, true);
			break;
		case "pdbf.common.Chart":
			buildContainerChartBig(json, containerOver, true);
			break;
		case "pdbf.common.Text":
			buildContainerTableBig(json, containerOver);
			break;
		case "pdbf.common.Pivot":
			buildContainerPivotBig(json, containerOver, true);
			break;
		}
	});
	containerControl.appendChild(def);

	containerControl.appendChild(getSpacer());

	var error = document.createElement('span');
	containerControl.appendChild(error);
	error.innerHTML = 'Query status: OK';

	containerControl.appendChild(getSpacer());

	var options = document.createElement('div');
	containerControl.appendChild(options);

	var download = document.createElement('input');
	download.type = 'button';
	download.value = 'Download query result as CSV';
	download.setAttribute('style', 'font-size:inherit;');
	download.addEventListener('click', function() {
		var cols = [];
		for (key in json.resultBig[0]) {
			cols[cols.length] = {
				columnid : key
			};
		}
		alasql.into.CSV('result.csv', {
			headers : true
		}, json.resultBig, cols);
	});
	options.appendChild(download);
	options.appendChild(getSpacer());
	options.appendChild(getSpacer());

	if (fixed) {
		var containerChartSub = document.createElement('div');
		containerChartSub.setAttribute('style', 'width:100%; height:100%; z-index:9999');
		containerChart.appendChild(containerChartSub);
	}

	var containerCloseAndTip = document.createElement('div');
	containerCloseAndTip.setAttribute('style', 'display: inline-block; margin-right: 30px;');
	containerOver.appendChild(containerCloseAndTip);

	var containerClose = document.createElement('div');
	containerClose.innerHTML = "<b>Click here to close this window (or press Escape)</b>";
	containerClose.setAttribute('style', 'margin-bottom:5px;');
	addClickCloseHandler(containerClose, containerOver);
	containerCloseAndTip.appendChild(containerClose);

	var containerTip = document.createElement('div');
	containerTip.innerHTML = tip;
	containerCloseAndTip.appendChild(containerTip);

	var containerSwitch = document.createElement('div');
	containerSwitch.setAttribute('style', 'margin-bottom:5px; display: inline-block; vertical-align:top;');
	containerOver.appendChild(containerSwitch);

	var containerLabel = document.createElement('span');
	containerLabel.innerHTML = 'Switch representation:<br />';
	containerSwitch.appendChild(containerLabel);

	if (json.type.C != 'pdbf.common.Pivot') {
		var buttonChart = document.createElement('input');
		buttonChart.type = 'button';
		buttonChart.value = 'Chart';
		buttonChart.setAttribute('style', 'font-size:inherit;');
		buttonChart.addEventListener('click', function() {
			while (containerOver.firstChild) {
				containerOver.removeChild(containerOver.firstChild);
			}
			buildContainerChartBig(json, containerOver, false);
		});
		containerSwitch.appendChild(buttonChart);
	}

	var buttonPivot = document.createElement('input');
	buttonPivot.type = 'button';
	buttonPivot.value = 'Pivot Table';
	buttonPivot.setAttribute('style', 'font-size:inherit;');
	buttonPivot.addEventListener('click', function() {
		while (containerOver.firstChild) {
			containerOver.removeChild(containerOver.firstChild);
		}
		buildContainerPivotBig(json, containerOver, false);
	});
	containerSwitch.appendChild(buttonPivot);

	var buttonTable = document.createElement('input');
	buttonTable.type = 'button';
	buttonTable.value = 'Table';
	buttonTable.setAttribute('style', 'font-size:inherit;');
	buttonTable.addEventListener('click', function() {
		while (containerOver.firstChild) {
			containerOver.removeChild(containerOver.firstChild);
		}
		buildContainerTableBig(json, containerOver);
	});
	containerSwitch.appendChild(buttonTable);

	var center = document.createElement('center');
	center.appendChild(containerControl);
	center.appendChild(containerChart);
	containerOver.appendChild(center);
	viewerContainer.appendChild(containerOver);

	var editor = CodeMirror.fromTextArea(textarea, {
	mode : "text/x-sql",
	indentWithTabs : true,
	smartIndent : true,
	lineNumbers : true,
	lineWrapping : true,
	matchBrackets : true,
	viewportMargin : Infinity,
	extraKeys : {
		"Ctrl-Space" : "autocomplete"
	}
	});
	editor.setValue(json.type.I.query);
	editor.on('blur', update);

	fixOverlaySize();
	var ref = {
	containerContent : fixed ? containerChartSub : containerChart,
	containerOver : containerOver,
	containerControl : containerControl,
	containerChart : containerChart,
	editor : editor,
	error : error,
	options : options
	};
	return ref;
}

function getSpacer() {
	return document.createElement('br');
}

function getChartData(json) {
	var results;
	try {
		results = alasqlQuery(json.type.I.query);
	} catch (e) {
		return {
			error : e.message
		};
	}
	var error;
	if (results.length == 0) {
		return {
			error : "Query \"" + json.type.I.query + "\" returns empty result!"
		};

	}
	if (results[0] instanceof Array) {
		return {
			error : "Query \"" + json.type.I.query + "\" contains multiple statements!"
		};
	}
	var columns = [];
	for (key in results[0]) {
		columns[columns.length] = key;
	}

	/*
	 * TODO: check if parsing is necessary var curmain = results[0]; var count =
	 * -1; for (key in curmain) { ++count; // Try to parse as Number var next =
	 * false; for (var i = 0; i < results.length; i++) { if (next) break; var
	 * cur = results[i]; var val; if (count == 0) { val = []; } else { val =
	 * values[i]; } var tmp; if (typeof (cur[key]) == "string") { try { tmp =
	 * Number(cur[key]); } catch (e) { next = true; } } else { tmp = cur[key]; }
	 * if (!isNaN(tmp)) { val[val.length] = tmp; } else { next = true; }
	 * values[i] = val; } // Try to parse as Date if (next) { next = false; for
	 * (var i = 0; i < results.length; i++) { if (next) break; var cur =
	 * results[i]; var val; if (count == 0) { val = []; } else { val =
	 * values[i]; } var tmp; if (typeof (cur[key]) == "string") { try { tmp =
	 * new Date(replaceAll(cur[key], "-", "/")); } catch (e) { next = true; } }
	 * else { tmp = cur[key]; } if (isValidDate(tmp)) { val[val.length] = tmp; }
	 * else { next = true; } values[i] = val; } }
	 * 
	 * if (next) { // No parsing method found return { error : 'Attribute ' +
	 * key + ' cannot be used in a chart. Must be of type date or number!' }; } }
	 */
	return {
	values : {
	x : columns[0],
	json : results,
	keys : {
		value : columns
	}
	},
	error : error,
	res : results
	};
}

function getPivotTableData(json, isBig) {
	var error;
	var results;
	try {
		results = alasqlQuery(isBig ? json.type.I.queryB : json.type.I.query);
	} catch (e) {
		return {
			error : e.message
		};
	}
	if (results.length == 0) {
		return {
			error : "Query of " + (isBig ? json.name + 'Big' : json.name) + "returns empty result!\nQuery was: \"" + (isBig ? json.type.I.queryB : json.type.I.query) + "\""
		};
	}
	if (results[0] instanceof Array) {
		return {
			error : "Query of " + (isBig ? json.name + 'Big' : json.name) + "returns multiple statements!\nQuery was: \"" + (isBig ? json.type.I.queryB : json.type.I.query) + "\""
		};
	}
	try {
		var rows = JSON.parse("[" + json.type.I.rows + "]");
	} catch (e) {
		return {
			error : 'Parsing of rows for ' + (isBig ? json.name + 'Big' : json.name) + ' failed. \nDid you forgot to enclose every row by ", or did you TeX program replace " by \'\'?\n JSON String was:\n' + json.type.I.rows
		};
	}
	try {
		var cols = JSON.parse("[" + json.type.I.cols + "]");
	} catch (e) {
		return {
			error : 'Parsing of cols for ' + (isBig ? json.name + 'Big' : json.name) + ' failed. \nDid you forgot to enclose every col by ", or did you TeX program replace " by \'\'?\n JSON String was:\n' + json.type.I.cols
		};
	}
	for (var i = 0; i < rows.length; ++i) {
		if (results[0][rows[i]] == undefined) {
			return {
				error : 'Rows attribute "' + rows[i] + '" for ' + (isBig ? json.name + 'Big' : json.name) + ' does not exist!'
			};
		}
	}
	for (var i = 0; i < cols.length; ++i) {
		if (results[0][cols[i]] == undefined) {
			return {
				error : 'Cols attribute "' + cols[i] + '" for ' + (isBig ? json.name + 'Big' : json.name) + ' does not exist!'
			};
		}
	}

	var aggrAttribute = (isBig ? json.type.I.aggregationattributeBig : json.type.I.aggregationattribute);
	if (aggrAttribute != '' && results[0][aggrAttribute] == undefined) {
		return {
			error : 'Aggregation attribute "' + aggrAttribute + '" for ' + (isBig ? json.name + 'Big' : json.name) + ' does not exist!'
		};
	}

	var aggrName = (isBig ? json.type.I.aggregationBig : json.type.I.aggregation);
	try {
		var aggr = $.pivotUtilities.aggregators[aggrName]([ aggrAttribute ]);
	} catch (e) {
		return {
			error : 'Aggregation function ' + aggrName + ' does not exist!'
		};
	}

	return {
	rows : rows,
	cols : cols,
	res : results,
	error : error,
	aggrAttribute : aggrAttribute,
	aggrName : aggrName
	};
}

function getFullscreenDiv() {
	var fullscreen = document.createElement('div');
	var rawZoomFactor = PDFViewerApplication.pdfViewer._currentScale;
	fullscreen.setAttribute('style', 'z-index:9999; position:absolute; opacity:0.5; -webkit-transition:opacity 200ms ease-out; -moz-transition:opacity 200ms ease-out; -o-transition:opacity 200ms ease-out; transition:opacity 200ms ease-out;');
	fullscreen.innerHTML = "<img style=\"width:" + 17 * rawZoomFactor + "px; height:" + 17 * rawZoomFactor + "px;\" src=\"data:image/png;base64,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\"/>";
	$(fullscreen).hover(function() {
		this.style.opacity = 1;
	}, function() {
		this.style.opacity = 0.5;
	});
	return fullscreen;
}

/*
 * Does not work for queries with multiple statements Does not work for
 * subqueries Does not work for multiple occurences of ROWNUM() in one query
 */
var rownumcount = false;
alasql.fn.ROWNUM = function() {
	rownumcount = true;
}

function GRUBBS_FILTER(arr, alpha) {
	var arr = arr.slice();
	if (!Array.isArray(arr)) {
		throw new Error("Argument of GRUBBS_FILTER is not an array!");
	}
	if (alpha == undefined) {
		var alpha = 0.05;
	}
	var gogo = true;
	while (gogo) {
		var N = arr.length;
		var t = jStat.studentt.inv((alpha) / (2 * N), N - 2);
		var ZCrit = (N - 1) / Math.sqrt(N) * Math.sqrt((t * t) / (N - 2 + t * t));
		var M = jStat.mean(arr);
		var SD = jStat.stdev(arr, true);
		var Z = undefined;
		var Zindex = -1;
		arr.forEach(function(e, i) {
			var tmp = Math.abs(e - M) / SD;
			if (Z == undefined || tmp > Z) {
				Z = tmp;
				Zindex = i;
			}
		});
		var margin_of_error_runtime = MARGIN_OF_ERROR(arr);
		var avg_runtime = MEAN(arr);
		if (Z > ZCrit && margin_of_error_runtime / avg_runtime >= 0.025) {
			arr.splice(Zindex, 1);
		} else {
			gogo = false;
		}
	}
	return arr;
}
alasql.fn.GRUBBS_FILTER = GRUBBS_FILTER;

function MEAN(arr) {
	if (!Array.isArray(arr)) {
		throw new Error("Argument of MEAN is not an array!");
	}
	return jStat.mean(arr);
}
alasql.fn.MEAN = MEAN;

function STDDEV_SAMP(arr) {
	if (!Array.isArray(arr)) {
		throw new Error("Argument of STDDEV_SAMP is not an array!");
	}
	return jStat.stdev(arr, true);
}
alasql.fn.STDDEV_SAMP = STDDEV_SAMP;

function MARGIN_OF_ERROR(arr, alpha) {
	if (!Array.isArray(arr)) {
		throw new Error("Argument of MARGIN_OF_ERROR is not an array!");
	}
	var stdev = jStat.stdev(arr, true);
	if (alpha == undefined) {
		var alpha = 0.05;
	}
	var n = arr.length;
	return jStat.studentt.inv(1 - alpha / 2, n - 1) * stdev * Math.sqrt(n);
}
alasql.fn.MARGIN_OF_ERROR = MARGIN_OF_ERROR;

function CONF_INT(arr) {
	if (!Array.isArray(arr)) {
		throw new Error("Argument of CONF_INT is not an array!");
	}
	var MOE = alasql.fn.MARGIN_OF_ERROR(arr); // TODO: maybe remove
	// null/undefined values?
	var MEAN = alasql.fn.MEAN(arr); // TODO: maybe remove null/undefined values?
	return [ MEAN - MOE, MEAN + MOE ]
}
alasql.fn.CONF_INT = CONF_INT;

function T_TEST(arr1, arr2, alpha) {
	if (!Array.isArray(arr1)) {
		throw new Error("Argument 1 of T_TEST is not an array!");
	}
	if (!Array.isArray(arr2)) {
		throw new Error("Argument 2 of T_TEST is not an array!");
	}
	if (alpha == undefined) {
		var alpha = 0.05;
	}
	if (arr1 == arr2)
		return true;

	var m1 = jStat.mean(arr1);
	var m2 = jStat.mean(arr2);
	var n1 = arr1.length;
	var n2 = arr2.length;
	var s1 = jStat.stdev(arr1, true);
	var s2 = jStat.stdev(arr2, true);

	var sp = Math.sqrt(((n1 - 1) * (s1 * s1) + (n2 - 1) * (s2 * s2)) / (n1 + n2 - 2));
	var t = Math.abs((m1 - m2) / (sp * Math.sqrt(1 / n1 + 1 / n2)));
	var df = n1 + n2 - 2;
	var p = 2 - jStat.studentt.cdf(t, df) * 2;

	return p >= alpha;
}
alasql.fn.T_TEST = T_TEST;

function WELCH_TEST(arr1, arr2, alpha) {
	if (!Array.isArray(arr1)) {
		throw new Error("Argument 1 of WELCH_TEST is not an array!");
	}
	if (!Array.isArray(arr2)) {
		throw new Error("Argument 2 of WELCH_TEST is not an array!");
	}
	if (alpha == undefined) {
		var alpha = 0.05;
	}
	if (arr1 == arr2)
		return true;

	var m1 = jStat.mean(arr1);
	var m2 = jStat.mean(arr2);
	var n1 = arr1.length;
	var n2 = arr2.length;
	var s1 = jStat.stdev(arr1, true);
	var s2 = jStat.stdev(arr2, true);

	var s1s1n1 = s1 * s1 / n1;
	var s2s2n2 = s2 * s2 / n2;

	var t = Math.abs((m1 - m2) / Math.sqrt(s1s1n1 + s2s2n2));
	var df = ((s1s1n1 + s2s2n2) * (s1s1n1 + s2s2n2)) / (((s1s1n1 * s1s1n1) / (n1 - 1)) + ((s2s2n2 * s2s2n2) / (n2 - 1)));
	var p = 2 - jStat.studentt.cdf(t, df) * 2;

	return p >= alpha;
}
alasql.fn.WELCH_TEST = WELCH_TEST;

function signaturePlot(valuesArr) {
	var values = valuesArr[0]; // Call by reference
	if (values.keys == undefined)
		return values;
	var keys = values.keys.value;
	if (values.finished) {
		return values;
	}
	if (keys.length > 1) {
		throw new Error("SignaturePlot does only support one attribute");
	}
	values.x = "x";
	var aname = keys[0];
	keys[keys.length] = "x";
	var runtimes = values.json;

	var runtime_count = runtimes.length;
	var means = [];
	var min;
	var min_int;

	// calculate mean of each experiment, search minimum of conf. int. lower
	// bounds
	for (var i = 0; i < runtime_count; ++i) {
		var cur = runtimes[i][aname];
		means[i] = alasql.fn.MEAN(cur);
		var ci = alasql.fn.CONF_INT(cur);
		if (min_int == undefined || ci[0] < min_int[0]) {
			min = i;
			min_int = ci;
		}
	}

	var distance = []; // distance from best experiment

	for (var i = 0; i < runtime_count; ++i) {
		// for t_bests the distance is set to 0
		if (alasql.fn.WELCH_TEST(runtimes[min][aname], runtimes[i][aname])) {
			distance[i] = 0;
		} else {
			distance[i] = means[i] - min_int[1];
			if (distance[i] < 0) {
				distance[i] = 0;
			}
		}
	}

	var slowDown = [];
	distance.forEach(function(v, i) {
		slowDown[i] = (distance[i] + min_int[1]) / min_int[1] - 1.0;

	});

	slowDown.sort(function(a, b) {
		return a - b;
	});

	var res = [];
	slowDown.forEach(function(v, i) {
		res[i] = {
			x : i / (runtime_count - 1)
		};
		res[i][aname] = slowDown[i];
	});

	values.json = res;
	values.finished = true;
	return values;
}

function alasqlQuery(q) {
	var results = alasql(q);
	if (rownumcount) {
		results.forEach(function(d, idx) {
			d['ROWNUM()'] = idx
		});
		rownumcount = false;
	}
	return results;
}