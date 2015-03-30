'use strict';

var nomove = false;
function consumeEvent(evt) {
	nomove = true;
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

// Load the database
tic();
var tmp = UTF8ArrToStr(base64DecToArr(db_base64));
var tmp2 = dbjson_base64;
toc("Base64 decode time for DB");
tic();
if (tmp2 != "") {
	alasql.databases = JSON.parse(tmp2);
}
alasqlQuery(tmp);
toc("DB load time");

var rawZoomFactor;
var init = true;

var viewerContainer;
var execBtn;
var outputElm;
var errorElm;
var commandsElm;
var editorMain;
var cm;

$(function() {
	viewerContainer = document.getElementById("viewerContainer");
	// GUI.js
	execBtn = document.getElementById('execute');
	outputElm = document.getElementById('output');
	errorElm = document.getElementById('error');
	commandsElm = document.getElementById('commands');

	editorMain = CodeMirror.fromTextArea(commandsElm, {
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
	cm = document.getElementsByClassName("CodeMirror")[0];
	cm.addEventListener('mousedown', consumeEvent);
	cm.addEventListener('mouseup', consumeEvent);
});

$(window)
		.resize(
				function() {
					var tmp = document.getElementsByClassName("centerhv");
					for (var i = 0; i < tmp.length; ++i) {
						tmp[i].style.left = ($(window).width() - $(tmp[i])
								.outerWidth()) / 2;
						tmp[i].style.top = ($(window).height() - 32 - $(tmp[i])
								.outerHeight()) / 2 + 32;
					}
				});

// Load config.json
var json = JSON.parse(UTF8ArrToStr(base64DecToArr(json_base64)));
var pageOverlays = [];
for (var i = 0; i < json.length; ++i) {
	parse(json[i]);
}

function isValidDate(d) {
	if (Object.prototype.toString.call(d) !== "[object Date]")
		return false;
	return !isNaN(d.getTime());
}

function parse(json) {
	var page = json.type.I.page;
	var pageOverlay = pageOverlays[page];
	if (typeof pageOverlay == 'undefined') {
		pageOverlay = [];
		pageOverlays[page] = pageOverlay;
	}
	pageOverlay[pageOverlay.length] = json;
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

function display(json, page) {
	var zoomFactor = PDFViewerApplication.pdfViewer._currentScale
			* json.type.I.zoom;
	tic();
	var container = document.createElement('div');
	container.id = json.name;
	container.className = "overlay";
	var style = "z-index: 8; position: absolute; width:"
			+ (json.type.I.x2 - json.type.I.x1) * 100 + "%; height:"
			+ (json.type.I.y1 - json.type.I.y2) * 100 + "%; left:"
			+ json.type.I.x1 * 100 + "%; bottom:" + json.type.I.y2 * 100 + "%;";
	page.appendChild(container);

	switch (json.type.C) {
	case "pdbf.common.LineChart":
	case "pdbf.common.BarChart":
		var containerOver = document.getElementById(json.name + "Big");
		if (containerOver == null) {
			var containerOver = document.createElement('div');
			containerOver
					.setAttribute(
							'style',
							'position:fixed; z-index:9; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto;');
			containerOver.id = json.name + "Big";
			containerOver.className = "centerhv";
			buildContainerChartBig(json, containerOver, true);
		} else {
			containerOver.update();
		}
		buildContainerChart(container, json, zoomFactor, style, containerOver);
		break;
	case "pdbf.common.Text":
		container.addEventListener("click", function() {
			editorMain.setValue(json.type.I.query);
			execEditorContents();
		});
		style += 'cursor: pointer;';
		container.setAttribute('style', style);
		break;
	case "pdbf.common.Pivot":
		var containerOver = document.getElementById(json.name + "Big");
		if (containerOver == null) {
			var containerOver = document.createElement('div');
			containerOver
					.setAttribute(
							'style',
							'position:fixed; z-index:9; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto;');
			containerOver.id = json.name + "Big";
			containerOver.className = "centerhv";
			buildContainerPivotBig(json, containerOver, true);
		} else {
			containerOver.update();
		}
		buildContainerPivot(container, json, zoomFactor, style, containerOver);
		break;
	default:
		alert("Unknown: " + json.type.C);
		break;
	}
	toc("Display time for " + json.name);
}

function buildContainerChartBig(json, containerOver, initial) {
	var basetextsize = 8;

	var updateData = function() {
		jsonCpy.type.I.xUnitName = '';
		jsonCpy.type.I.yUnitName = '';
		jsonCpy.type.I.query = ref.editor.getValue();
		json.chartdataBig = getChartData(jsonCpy);
		json.resultBig = json.chartdataBig.res;
		if (json.chartdataBig.error != undefined) {
			error.innerHTML = 'Query status: ' + json.chartdataBig.error;
			containerOptions.style.visibility = 'hidden';
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
		}
		var optionsBig = getDygraphsOptions(json.jsonBig, rawZoomFactor,
				json.chartdataBig.columns);
		json.dygraphBig = new Dygraph(containerContent,
				json.chartdataBig.values, optionsBig);
	};
	var update = function() {
		var tmp = jsonCpy.type.I.showRangeSelector;
		jsonCpy.type.I.logScale = logScale.checked;
		jsonCpy.type.I.includeZero = includeZero.checked;
		jsonCpy.type.I.drawPoints = drawPoints.checked;
		jsonCpy.type.I.fillGraph = fillGraph.checked;
		jsonCpy.type.I.showRangeSelector = showRangeSelector.checked;
		if (tmp != showRangeSelector.checked) {
			// Bug in dygraph. Force complete redraw
			var optionsBig = getDygraphsOptions(json.jsonBig, rawZoomFactor,
					json.chartdataBig.columns);
			json.dygraphBig = new Dygraph(containerContent,
					json.chartdataBig.values, optionsBig);
		} else {
			json.dygraphBig.updateOptions({
				logscale : logScale.checked,
				includeZero : includeZero.checked,
				drawPoints : drawPoints.checked,
				fillGraph : fillGraph.checked,
				showRangeSelector : showRangeSelector.checked
			});
		}
	};

	var jsonCpy = jQuery.extend(true, {}, json);
	var chartdataCpy = getChartData(json);
	json.resultBig = chartdataCpy.res;
	var tip = "Tip: Click-and drag to zoom the graph. Shift + click-and drag to pan the graph.<br/>";
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip,
			[ json ], updateData, 'graph');
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

	var logScale = getCheckbox('LogScale', containerOptions);
	logScale.addEventListener('change', update);
	logScale.checked = jsonCpy.type.I.logScale;

	var includeZero = getCheckbox('IncludeZero', containerOptions);
	includeZero.addEventListener('change', update);
	includeZero.checked = jsonCpy.type.I.includeZero;

	var drawPoints = getCheckbox('DrawPoints', containerOptions);
	drawPoints.addEventListener('change', update);
	drawPoints.checked = jsonCpy.type.I.drawPoints;

	var fillGraph = getCheckbox('FillGraph', containerOptions);
	fillGraph.addEventListener('change', update);
	fillGraph.checked = jsonCpy.type.I.fillGraph;

	var showRangeSelector = getCheckbox('ShowRangeSelector', containerOptions);
	showRangeSelector.addEventListener('change', update);
	showRangeSelector.checked = jsonCpy.type.I.showRangeSelector;

	var optionsBig = getDygraphsOptions(jsonCpy, rawZoomFactor,
			chartdataCpy.columns);
	var dygraph = new Dygraph(containerContent, chartdataCpy.values, optionsBig);
	json.jsonBig = jsonCpy;
	json.dygraphBig = dygraph;
	json.chartdataBig = chartdataCpy;

	containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize + 'pt';

	containerOver.update = function() {
		var optionsBig = getDygraphsOptions(json.jsonBig, rawZoomFactor,
				json.chartdataBig.columns);
		json.dygraphBig = new Dygraph(containerContent,
				json.chartdataBig.values, optionsBig);
		containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize
				+ 'pt';
	}
}

function buildContainerChart(container, json, zoomFactor, style, containerOver) {
	var fullscreen = getFullscreenDiv();
	container.appendChild(fullscreen);
	var chart = document.createElement('div');
	chart.setAttribute('style', 'width:100%; height:100%;');
	container.appendChild(chart);

	var chartdata = getChartData(json);
	if (chartdata.error != undefined) {
		alert(chartdata.error + '\nWhere: ' + json.name + '\nQuery was: '
				+ json.type.I.query);
		return;
	}

	var options = getDygraphsOptions(json, zoomFactor, chartdata.columns);

	style = "background: white;" + style;
	container.setAttribute('style', style);
	fullscreen.addEventListener("click", function() {
		containerOver.style.visibility = 'visible';
		containerOver.style.opacity = 1;
	});
	new Dygraph(chart, chartdata.values, options);
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
		var pvtAgg = containerOver.getElementsByClassName("pvtAggregator")[0];
		$(pvtAgg).val(aggrName);
		$(pvtAgg).trigger("change");
		setTimeout(function() {
			var pvtAtt = containerOver
					.getElementsByClassName("pvtAttrDropdown")[0];
			$(pvtAtt).val(aggrAtt);
			$(pvtAtt).trigger("change");
		}, 500);
	};

	var tip = "Tip: Drag and drop attributes to the row/column area. <br/>Move the cursor over the result cells to see more detailed results for min and max aggregator.<br/>";
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip,
			[ json ], updateData, 'pivot table');
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

	var aggr = r.aggr;
	var aggrName = r.aggrName;
	var aggrAtt = r.aggrAttribute;

	containerOver.children[2].children[1].style.background = '#DDDDDD';
	containerOver.children[2].children[1].style.padding = '0px';
	$(containerContent).pivotUI(r.res, {
		rows : r.rows,
		cols : r.cols,
		aggregator : aggr
	});
	var pvtAgg = containerOver.getElementsByClassName("pvtAggregator")[0];
	$(pvtAgg).val(aggrName);
	$(pvtAgg).trigger("change");
	setTimeout(
			function() {
				var pvtAtt = containerOver
						.getElementsByClassName("pvtAttrDropdown")[0];
				$(pvtAtt).val(aggrAtt);
				$(pvtAtt).trigger("change");
			}, 500);

	containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize + 'pt';

	containerOver.update = function() {
		containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize
				+ 'pt';
	}
}

function buildContainerPivot(container, json, zoomFactor, style, containerOver) {
	var fullscreen = getFullscreenDiv();
	container.appendChild(fullscreen);
	var chart = document.createElement('div');
	chart.setAttribute('style', 'width:100%; height:100%;');
	container.appendChild(chart);
	container.setAttribute('style', style);

	var r = getPivotTableData(json, false);
	if (r.error != undefined) {
		alert(r.error);
		return;
	}

	var aggr = r.aggr;
	var aggrName = r.aggrName;
	var aggrAtt = r.aggrAttribute;
	var unused = [];
	for (key in r.res[0]) {
		if (aggrName != key && $.inArray(key, r.rows) == -1
				&& $.inArray(key, r.cols) == -1) {
			unused[unused.length] = key;
		}
	}
	$(chart).pivot(r.res, {
		rows : r.rows,
		cols : r.cols,
		aggregator : aggr,
		unused : unused
	});
	container.getElementsByClassName("pvtTable")[0].setAttribute('style',
			'width: 100%; height: 100%; font-size: ' + zoomFactor * 12 + 'pt;');
	fullscreen.addEventListener("click", function() {
		containerOver.style.visibility = 'visible';
		containerOver.style.opacity = 1;
	});
}

function buildContainerTableBig(json, containerOver) {
	var basetextsize = 8;

	var update = function() {
		jsonCpy.type.I.query = ref.editor.getValue();
		var err;
		try {
			var results = alasqlQuery(jsonCpy.type.I.query);
			json.resultBig = results;
		} catch (e) {
			err = e.message;
		}

		if (err != undefined) {
			error.innerHTML = 'Query status: ' + err;
			containerOptions.style.visibility = 'hidden';
			containerContent.innerHTML = getTableFromResults(results);
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
			containerContent.innerHTML = '';
		}
	};

	var jsonCpy = jQuery.extend(true, {}, json);
	json.jsonBig = jsonCpy;

	var err;
	try {
		var results = alasqlQuery(jsonCpy.type.I.query);
		json.resultBig = results;
	} catch (e) {
		err = e.message;
	}
	if (err != undefined) {
		alert(err);
	}

	var tip = '';
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip,
			[ json ], update, 'table');
	var containerContent = ref.containerContent;
	var containerOptions = ref.options;
	var error = ref.error;

	containerContent.innerHTML = getTableFromResults(results);

	containerOver.children[2].children[1].style.background = '#DDDDDD';
	containerOver.children[2].children[1].style.padding = '0px';

	containerOver.update = function() {
		containerOver.style['font-size'] = '' + rawZoomFactor * basetextsize
				+ 'pt';
	}
}

function overlay(pageNr) {
	if (init) {
		rawZoomFactor = 1.25;// PDFViewerApplication.pdfViewer._currentScale;
		init = false;
	}

	var query = document.getElementById('SQLQuery');
	query.style['font-size'] = 12 * rawZoomFactor;

	if (typeof pageOverlays[pageNr] != 'undefined') {
		var page = document.getElementById("pageContainer" + pageNr);
		for (var i = 0; i < pageOverlays[pageNr].length; ++i) {
			display(pageOverlays[pageNr][i], page)
		}
	}
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
		outputElm.innerHTML = getTableFromResults(results);
		toc("Displaying results");
	} catch (e) {
		error(e);
		outputElm.innerHTML = "";
	}
}

function tableCreate(res) {
	var s = [];
	var j = -1;
	if (res.length == 0) {
		s[++j] = 'No rows returned';
	} else {
		s[++j] = '<tr>';
		var keys = [];
		for (key in res[0]) {
			s[++j] = '<th>';
			s[++j] = key;
			keys[keys.length] = key;
		}
		;

		res.forEach(function(row) {
			s[++j] = '<tr>';
			for (var i = 0; i < keys.length; ++i) {
				s[++j] = '<td>';
				s[++j] = (typeof row[keys[i]] == 'undefined' ? ''
						: row[keys[i]]);
			}
			;
		});
	}
	return s.join('');
}

function getTableFromResults(results) {
	var tmp = "Result:<br/>";
	if (typeof (results) == 'number') {
		tmp += "Query executed successfully.<br/>";
	} else {
		for (var i = 0; i < results.length; ++i) {
			if (typeof (results[i]) == 'number') {
				tmp += "Query executed successfully.<br/>";
			} else if (typeof (results[i][0]) != 'undefined') {
				tmp += '<table border="1" id="res'
						+ i
						+ '" style="border-collapse: collapse; margin-top:1px; margin-bottom:2px; margin-right:8px;">'
				tmp += tableCreate(results[i]);
				tmp += '</table>';
			} else {
				tmp += '<table border="1" id="res'
						+ i
						+ '" style="border-collapse: collapse; margin-top:1px; margin-bottom:2px; margin-right:8px;">'
				tmp += tableCreate(results);
				tmp += '</table>';
				break;
			}
		}
		if (results.length == 0) {
			tmp += 'No rows returned';
		}
	}
	return tmp;
	/*
	 * TODO: change to dynamic add of results tic(); if (typeof(results) ==
	 * 'number') { outputElm.innerHTML = "Result:<br/>Query executed
	 * successfully.<br/>"; } else { outputElm.innerHTML = 'Result:<br/>'; for
	 * (var i=0; i<results.length; ++i) { if (typeof(results[i]) == 'number') {
	 * outputElm.appendChild() = "Query executed successfully.<br/>"; } else if
	 * (typeof(results[i][0]) != 'undefined') { outputElm.appendChild()'<table
	 * border="1" id="res' +i+ '" style="border-collapse: collapse;
	 * margin-top:1px; margin-bottom:2px;"></table>' var res =
	 * document.getElementById("res" + i); s[++j] = tableCreate(results[i],
	 * res); } else { outputElm.appendChild()'<table border="1" id="res' +i+ '"
	 * style="border-collapse: collapse; margin-top:1px; margin-bottom:2px;"></table>'
	 * var res = document.getElementById("res" + i); s[++j] =
	 * tableCreate(results, res); break; } } if (results.length == 0) {
	 * outputElm.innerHTML = 'No rows returned'; } tmp += s.join(''); }
	 * toc("Displaying results");
	 */
}

function execEditorContents() {
	noerror();
	var query = document.getElementById("SQLQuery");
	query.style.visibility = 'visible';
	query.style.opacity = 1;
	execute(editorMain.getValue() + ';');
}

var mydragg = function() {
	return {
		move : function(divid, xpos, ypos, container) {
			divid.style.left = xpos + 'px';
			divid.style.top = ypos + 'px';
		},
		startMoving : function(divid, container, evt) {
			if (nomove) {
				nomove = false;
				return;
			}
			evt = evt || window.event;
			var posX = evt.clientX, posY = evt.clientY, divTop = divid.style.top, divLeft = divid.style.left, eWi = parseInt(divid.style.width), eHe = parseInt(divid.style.height), cWi = parseInt(document
					.getElementById(container).style.width), cHe = parseInt(document
					.getElementById(container).style.height);
			document.getElementById(container).style.cursor = 'move';
			divTop = divTop.replace('px', '');
			divLeft = divLeft.replace('px', '');
			var diffX = posX - divLeft, diffY = posY - divTop;
			document.onmousemove = function(evt) {
				evt = evt || window.event;
				var posX = evt.clientX, posY = evt.clientY, aX = posX - diffX, aY = posY
						- diffY;
				if (aX < 0)
					aX = 0;
				if (aY < 0)
					aY = 0;
				if (aX + eWi > cWi)
					aX = cWi - eWi;
				if (aY + eHe > cHe)
					aY = cHe - eHe;
				mydragg.move(divid, aX, aY, container);
			}
		},
		stopMoving : function(container) {
			document.getElementById(container).style.cursor = 'default';
			document.onmousemove = function() {
			}
		},
	}
}();

var debugmode = 0;
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
		var query = document.getElementById('SQLQuery');
		setTimeout(function(o) {
			o.style.visibility = 'hidden';
		}, 500, query);
		query.style.opacity = 0;
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

function multiColumnBarPlotterTmp(overlap, overlapnumber) {
	var updated = false;
	// Multiple column bar chart
	return function(e) {
		// We need to handle all the series simultaneously.
		if (e.seriesIndex !== 0)
			return;

		var g = e.dygraph;
		var ctx = e.drawingContext;
		var sets = e.allSeriesPoints;
		var y_bottom = e.dygraph.toDomYCoord(1);

		// Find the minimum separation between x-values.
		// This determines the bar width.
		var min_sep = Infinity;
		for (var j = 0; j < sets.length; j++) {
			var points = sets[j];
			for (var i = 1; i < points.length; i++) {
				var sep = points[i].canvasx - points[i - 1].canvasx;
				if (sep < min_sep)
					min_sep = sep;
			}
		}
		var bar_width = Math.floor(2.0 / 3.5 * min_sep) * overlapnumber;

		if (!updated) {
			updated = true;
			e.dygraph.ready(function(d) {
				d.updateOptions({
					xRangePad : bar_width * sets.length / overlapnumber / 2
				});
			});
			return;
		}

		var fillColors = [];
		var strokeColors = g.getColors();
		for (var i = 0; i < strokeColors.length; i++) {
			fillColors.push(darkenColor(strokeColors[i]));
		}

		/*
		 * TODO: fix overlapping bars. lower values have to be drawn last. var
		 * nrofpoints = sets[0].length; for (var j = 0; j < sets.length; j++) {
		 * if (sets[j].length != nrofpoints) { alert('Barplotter only allows
		 * same number of points for all series'); return; }
		 * 
		 * use own compare function. sort. then draw: function compare(a,b) { if
		 * (a.last_nom < b.last_nom) return -1; if (a.last_nom > b.last_nom)
		 * return 1; return 0; } objs.sort(compare); }
		 */
		for (var j = 0; j < sets.length; j++) {
			ctx.fillStyle = fillColors[j];
			ctx.strokeStyle = strokeColors[j];
			for (var i = 0; i < sets[j].length; i++) {
				var p = sets[j][i];
				var center_x = p.canvasx;
				var x_left;
				if (overlap) {
					x_left = center_x - (bar_width / 4);
				} else {
					x_left = center_x - (bar_width / 2)
							* (1 - j / (sets.length - 1));
				}

				ctx.fillRect(x_left, p.canvasy, bar_width / sets.length,
						y_bottom - p.canvasy);

				ctx.strokeRect(x_left, p.canvasy, bar_width / sets.length,
						y_bottom - p.canvasy);
			}
		}
	}
}

function multiColumnBarPlotterCreate() {
	return multiColumnBarPlotterTmp(false, 1);
}

function multiColumnBarPlotterOverlapCreate(overlapnumber) {
	return multiColumnBarPlotterTmp(true, overlapnumber);
}

function darkenColor(colorStr) {
	// Defined in dygraph-utils.js
	var color = Dygraph.toRGB_(colorStr);
	color.r = Math.floor((255 + color.r) / 2);
	color.g = Math.floor((255 + color.g) / 2);
	color.b = Math.floor((255 + color.b) / 2);
	return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
}

function addClickCloseHandler(elem, o) {
	elem.addEventListener('click', function(e) {
		setTimeout(function(o) {
			o.style.visibility = 'hidden';
		}, 500, o);
		o.style.opacity = 0;
	});
}

function getDygraphsOptions(json, zoomFactor, columns) {
	var options = {
		labels : columns,
		logscale : json.type.I.logScale,
		animatedZooms : true,
		labelsSeparateLines : true,
		legend : "always",
		axisLabelFontSize : 14,
		xAxisHeight : 14,
		axisLabelWidth : 52,
		titleHeight : 18,
		xLabelHeight : 18,
		yLabelWidth : 18,
		xlabel : json.type.I.xUnitName,
		ylabel : json.type.I.yUnitName,
		labelsDivStyles : {
			'text-align' : 'right',
			'background' : 'none',
			'font-size' : 14
		},
		axes : {
			x : {
				pixelsPerLabel : 50
			},
			y : {
				pixelsPerLabel : 30
			}
		},
		gridLineWidth : 0.3,
		axisLineWidth : 0.3,
		highlightCircleSize : 2,
		strokeWidth : 1,
		includeZero : json.type.I.includeZero,
		drawPoints : json.type.I.drawPoints,
		pointSize : 3,
		fillGraph : json.type.I.fillGraph,
		visibility : json.type.I.visibility,
		showRangeSelector : json.type.I.showRangeSelector,
	};
	try {
		var addOpt = JSON.parse(json.type.I.options);
	} catch (e) {
		alert('Parsing of options for '
				+ json.name
				+ ' failed. \nDid you forgot to enclose every field and value by ", or did your TeX program replace " by \'\'?\nRemember that the correct JSON String syntax is: "key": "value"\n JSON String was:\n'
				+ json.type.I.options);
	}
	function mergeAintoB(a, b) {
		for ( var key in a) {
			if (typeof a[key] === 'object' && typeof b[key] === 'object') {
				mergeAinB(a[key], b[key]);
			} else {
				b[key] = a[key];
			}
		}
	}
	mergeAintoB(addOpt, options);

	options.titleHeight = options.titleHeight * zoomFactor + 8;
	options.axisLabelFontSize = options.axisLabelFontSize * zoomFactor;
	options.xAxisHeight = options.xAxisHeight * zoomFactor + 12;
	options.axisLabelWidth = options.axisLabelWidth * zoomFactor;
	options.xLabelHeight = options.xLabelHeight * zoomFactor;
	options.yLabelWidth = options.yLabelWidth * zoomFactor;
	options.axes.x.pixelsPerLabel = options.axes.x.pixelsPerLabel * zoomFactor;
	options.axes.y.pixelsPerLabel = options.axes.y.pixelsPerLabel * zoomFactor;
	options.labelsDivStyles['font-size'] = options.labelsDivStyles['font-size']
			* zoomFactor;
	options.gridLineWidth = options.gridLineWidth * zoomFactor;
	options.pointSize = options.pointSize * zoomFactor;
	options.highlightCircleSize = options.highlightCircleSize * zoomFactor;
	options.strokeWidth = options.strokeWidth * zoomFactor;
	options.axisLineWidth = options.axisLineWidth * zoomFactor;
	if (options.xlabel == '')
		options.xlabel = undefined;
	if (options.ylabel == '')
		options.ylabel = undefined;
	if (options.visibility == undefined) {
		delete options.visibility;
	}
	if (json.type.C == 'pdbf.common.BarChart') {
		if (json.type.I.overlap != -1) {
			var func = multiColumnBarPlotterOverlapCreate(json.type.I.overlap);
			options['plotter'] = func;
		} else {
			var func = multiColumnBarPlotterCreate();
			options['plotter'] = func;
		}
	}
	return options;
}

function prepopulateContainerOver(containerOver, viewerContainer, tip, jsonArr,
		update, f) {
	var json = jsonArr[0]; // pass by reference
	var containerChart = document.createElement('div');
	containerChart
			.setAttribute(
					'style',
					'width:65%; height:80%; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; padding:2%; background:white; margin:1%; display: inline-block; vertical-align:top');

	var containerControl = document.createElement('div');
	containerControl
			.setAttribute(
					'style',
					'width:20%; height:80%; -moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px; padding:2%; background:white; margin:1%; display: inline-block; text-align: left;');

	var header = document.createElement('span');
	header.innerHTML = 'SQL Query for ' + f
			+ ':<br />Tip: Press CTRL-Space for autocomplete';
	containerControl.appendChild(header);

	var textarea = document.createElement('textarea');
	containerControl.appendChild(textarea);

	var error = document.createElement('span');
	containerControl.appendChild(error);
	error.innerHTML = 'Query status: OK';

	var spacer = document.createElement('span');
	spacer.innerHTML = '<br /><br />';
	containerControl.appendChild(spacer);

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
	options.appendChild(spacer);

	var containerChartSub = document.createElement('div');
	containerChartSub.setAttribute('style',
			'width:100%; height:100%; z-index:9999');
	containerChart.appendChild(containerChartSub);

	var containerCloseAndTip = document.createElement('div');
	containerCloseAndTip.setAttribute('style',
			'display: inline-block; margin-right: 30px;');
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
	containerSwitch.setAttribute('style',
			'margin-bottom:5px; display: inline-block; vertical-align:top;');
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

	$(window).resize();
	var ref = {
		containerContent : containerChartSub,
		containerOver : containerOver,
		containerControl : containerControl,
		editor : editor,
		error : error,
		options : options
	};
	return ref;
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
			error : "Query \"" + json.type.I.query
					+ "\" returns multiple statements!"
		};
	}
	var values = [];
	var columns = [];
	for (key in results[0]) {
		columns[columns.length] = key;
	}

	var curmain = results[0];
	var count = -1;
	for (key in curmain) {
		++count;

		// Try to parse as Number
		var next = false;
		for (var i = 0; i < results.length; i++) {
			if (next)
				break;
			var cur = results[i];
			var val;
			if (count == 0) {
				val = [];
			} else {
				val = values[i];
			}
			var tmp;
			if (typeof (cur[key]) == "string") {
				try {
					tmp = Number(cur[key]);
				} catch (e) {
					next = true;
				}
			} else {
				tmp = cur[key];
			}
			if (!isNaN(tmp)) {
				val[val.length] = tmp;
			} else {
				next = true;
			}
			values[i] = val;
		}

		// Try to parse as Date
		if (next) {
			next = false;
			for (var i = 0; i < results.length; i++) {
				if (next)
					break;
				var cur = results[i];
				var val;
				if (count == 0) {
					val = [];
				} else {
					val = values[i];
				}
				var tmp;
				if (typeof (cur[key]) == "string") {
					try {
						tmp = new Date(replaceAll(cur[key], "-", "/"));
					} catch (e) {
						next = true;
					}
				} else {
					tmp = cur[key];
				}
				if (isValidDate(tmp)) {
					val[val.length] = tmp;
				} else {
					next = true;
				}
				values[i] = val;
			}
		}

		if (next) {
			// No parsing method found
			return {
				error : 'Attribute '
						+ key
						+ ' cannot be used in a chart. Must be of type date or number!'
			};
		}
	}
	return {
		values : values,
		columns : columns,
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
			error : "Query of " + (isBig ? json.name + 'Big' : json.name)
					+ "returns empty result!\nQuery was: \""
					+ (isBig ? json.type.I.queryB : json.type.I.query) + "\""
		};
	}
	if (results[0] instanceof Array) {
		return {
			error : "Query of " + (isBig ? json.name + 'Big' : json.name)
					+ "returns multiple statements!\nQuery was: \""
					+ (isBig ? json.type.I.queryB : json.type.I.query) + "\""
		};
	}
	try {
		var rows = JSON.parse("[" + json.type.I.rows + "]");
	} catch (e) {
		return {
			error : 'Parsing of rows for '
					+ (isBig ? json.name + 'Big' : json.name)
					+ ' failed. \nDid you forgot to enclose every row by ", or did you TeX program replace " by \'\'?\n JSON String was:\n'
					+ json.type.I.rows
		};
	}
	try {
		var cols = JSON.parse("[" + json.type.I.cols + "]");
	} catch (e) {
		return {
			error : 'Parsing of cols for '
					+ (isBig ? json.name + 'Big' : json.name)
					+ ' failed. \nDid you forgot to enclose every col by ", or did you TeX program replace " by \'\'?\n JSON String was:\n'
					+ json.type.I.cols
		};
	}
	for (var i = 0; i < rows.length; ++i) {
		if (results[0][rows[i]] == undefined) {
			return {
				error : 'Rows attribute "' + rows[i] + '" for '
						+ (isBig ? json.name + 'Big' : json.name)
						+ ' does not exist!'
			};
		}
	}
	for (var i = 0; i < cols.length; ++i) {
		if (results[0][cols[i]] == undefined) {
			return {
				error : 'Cols attribute "' + cols[i] + '" for '
						+ (isBig ? json.name + 'Big' : json.name)
						+ ' does not exist!'
			};
		}
	}

	var aggrAttribute = (isBig ? json.type.I.aggregationattributeBig
			: json.type.I.aggregationattribute);
	if (aggrAttribute != '' && results[0][aggrAttribute] == undefined) {
		return {
			error : 'Aggregation attribute "' + aggrAttribute + '" for '
					+ (isBig ? json.name + 'Big' : json.name)
					+ ' does not exist!'
		};
	}

	var aggrName = (isBig ? json.type.I.aggregationBig
			: json.type.I.aggregation);
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
		aggr : aggr,
		aggrAttribute : aggrAttribute,
		aggrName : aggrName
	};
}

function getFullscreenDiv() {
	var fullscreen = document.createElement('div');
	var rawZoomFactor = PDFViewerApplication.pdfViewer._currentScale;
	fullscreen
			.setAttribute(
					'style',
					'z-index:9999; position:absolute; opacity:0.5; -webkit-transition:opacity 200ms ease-out; -moz-transition:opacity 200ms ease-out; -o-transition:opacity 200ms ease-out; transition:opacity 200ms ease-out;');
	fullscreen.innerHTML = "<img style=\"width:"
			+ 17
			* rawZoomFactor
			+ "px; height:"
			+ 17
			* rawZoomFactor
			+ "px;\" src=\"data:image/png;base64,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\"/>";
	$(fullscreen).hover(function() {
		this.style.opacity = 1;
	}, function() {
		this.style.opacity = 0.5;
	});
	return fullscreen;
}

var rownumcount = false;
alasql.fn.ROWNUM = function() {
	rownumcount = true;
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