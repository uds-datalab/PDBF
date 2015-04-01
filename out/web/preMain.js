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
							'position:fixed; z-index:9; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; white-space: nowrap;');
			containerOver.id = json.name + "Big";
			containerOver.className = "centerhv";
			buildContainerChartBig(json, containerOver, true);
		} else {
			containerOver.update();
		}
		buildContainerChart(container, json, zoomFactor, style, containerOver, true);
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
							'position:fixed; z-index:9; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; white-space: nowrap;');
			containerOver.id = json.name + "Big";
			containerOver.className = "centerhv";
			buildContainerPivotBig(json, containerOver, true);
		} else {
			containerOver.update();
		}
		buildContainerPivot(container, json, zoomFactor, style, containerOver, true);
		break;
	default:
		alert("Unknown: " + json.type.C);
		break;
	}
	toc("Display time for " + json.name);
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