'use strict';

function fixOverlaySize() {
	var tmp = document.getElementsByClassName("centerhv");
	for (var i = 0; i < tmp.length; ++i) {
		tmp[i].style.left = ($(window).width() - $(tmp[i]).outerWidth()) / 2;
		tmp[i].style.top = ($(window).height() - 32 - $(tmp[i]).outerHeight()) / 2 + 32;
	}
}

var namedContainers = [];

// for Compare (Parameter)
var foundDatasource = false, additive = false;
var useTextCompare = false, distanceWithoutBrackets = true;
var logFileFounds = false;
var useTextDiff = 60;

var dmp = new diff_match_patch();

// For FileReading
var reader;

// Database Information
var JSON_TABLE = "json_files";
var JSON_COMPARE_TABLE = "json_compare_files";
var JSON_FILENAME = "json_filename";

// Performance measurement functions
// var tictime;
/*
 * if (!window.performance || !performance.now) { window.performance = { now:
 * Date.now } }
 */
function tic() {/* tictime = performance.now() */
}
function toc(msg) {
	// var dt = performance.now()-tictime;
	// console.log((msg||'toc') + ": " + dt + "ms");
}

function replaceAll(str, s, r) {
	return str.split(s).join(r);
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function contains(str, p) {
	return str.indexOf(p) != -1;
}

function isValidDate(d) {
	if (Object.prototype.toString.call(d) !== "[object Date]")
		return false;
	return !isNaN(d.getTime());
}

function getCheckbox(labelname, containerControl) {
	var div = document.createElement('div');
	var checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.setAttribute('style', 'position:relative; top:2px;');
	checkbox.setAttribute('id', labelname);
	var label = document.createElement('label');
	label.setAttribute('for', labelname);
	label.innerHTML = ' ' + labelname;
	div.appendChild(checkbox);
	div.appendChild(label);
	containerControl.appendChild(div);
	return checkbox;
}

function display(json, page, phantomJS) {
	tic();
	var container = document.createElement('div');
	container.id = json.name;
	container.className = "overlay";
	var style;
	if (phantomJS) {
		style = "width: 100%; height: 100%; margin: 0px;";
	} else {
		style = "position: absolute; width:" + (json.type.I.x2 - json.type.I.x1 + 0.001) * 100 + "%; height:" + (json.type.I.y1 - json.type.I.y2 + 0.001) * 100 + "%; left:" + json.type.I.x1 * 100 + "%; bottom:" + (json.type.I.y2 - 0.001) * 100 + "%;";
	}
	if (typeof font_store === "undefined" || typeof font_store[json.name] === "undefined") {
		style += "font-size: " + (zoomFactor * 12.0) + "pt; font-family: sans-serif;"
	} else {
		style += "font-size: " + (zoomFactor * 12.0) + "pt; font-family: " + font_store[json.name] + ", sans-serif;"
	}
	page.appendChild(container);
	
	var containerOver = document.getElementById(json.name + "Big");
	var containerOverCompare = document.getElementById(json.name + "Compare");
	var containerOverSetting = document.getElementById(json.name + "Setting");

	// if (containerOver != null) {
	// containerOver.update();
	// } TODO: reenable if textsize of overlays can be changed
	
	var styleBig = 'position:fixed; z-index:-1; border:1px solid black; padding:10px; background:#DDDDDD; width:95%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; overflow-y:scroll; white-space: nowrap;';
	if (typeof font_store === "undefined" || typeof font_store[json.name] === "undefined") {
		styleBig += "font-size: " + (rawZoomFactor * 12.0) + "pt; font-family: sans-serif;"
	} else {
		styleBig += "font-size: " + (rawZoomFactor * 12.0) + "pt; font-family: " + font_store[json.name] + ", sans-serif;"
	}

	var styleSmall = 'position:fixed; z-index:-1; border:1px solid black; padding:10px; background:#DDDDDD; width:314px; height:150px; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; white-space: nowrap;';
	if (typeof font_store === "undefined" || typeof font_store[json.name] === "undefined") {
		styleSmall += "font-size: " + (rawZoomFactor * 12.0) + "pt; font-family: sans-serif;"
	} else {
		styleSmall += "font-size: " + (rawZoomFactor * 12.0) + "pt; font-family: " + font_store[json.name] + ", sans-serif;"
	}

	var styleRight = 'position:fixed; z-index:-1; border:1px solid black; padding:10px; background:#DDDDDD; width:5%; height:87%; opacity:0; visibility:hidden; -webkit-transition:opacity 500ms ease-out; -moz-transition:opacity 500ms ease-out; -o-transition:opacity 500ms ease-out; transition:opacity 500ms ease-out; overflow:auto; overflow-y:scroll; white-space: nowrap;';
	if (typeof font_store === "undefined" || typeof font_store[json.name] === "undefined") {
		styleRight += "font-size: " + (rawZoomFactor * 12.0) + "pt; font-family: sans-serif;"
	} else {
		styleRight += "font-size: " + (rawZoomFactor * 12.0) + "pt; font-family: " + font_store[json.name] + ", sans-serif;"
	}
	
	switch (json.type.C) {
		case "pdbf.json.MultiplotChart":
			if (!phantomJS) {
				var fullscreen = getFullscreenDiv();
				container.appendChild(fullscreen);
				fullscreen.addEventListener("click", function() {
					if (containerOver == null) {
						containerOver = document.createElement('div');
						containerOver.setAttribute('style', styleBig);
						containerOver.id = json.name + "Big";
						containerOver.className = "centerhv";
						buildContainerChartBig(json, containerOver, true);
					}
					containerOver.style.visibility = 'visible';
					containerOver.style['z-index'] = 9;
					containerOver.style.opacity = 1;
					$("svg").css('display', 'none');
					$("svg").css('height');
					$("svg").css('display', 'initial');// HACK for redraw of
					// SVG
				});
			}
			container.setAttribute('style', style);
			if (json.type.I.customImage == null) {
				buildContainerMultiplotChart(container, json, zoomFactor, style, containerOver);
				if (json.type.I.name != null && json.type.I.name != "") {
					namedContainers[json.type.I.name] = {
						type : "MultiplotChart",
						elem : undefined
					}; // TODO:
				}
			}
			break;
		case "pdbf.json.Chart":
			if (!phantomJS) {
				var fullscreen = getFullscreenDiv();
				var compare = getCompareDiv();
				var setting = getSettingDiv();
				container.appendChild(fullscreen);

				if (contains(json.type.I.query, JSON_TABLE)) {
					container.appendChild(compare);
					container.appendChild(setting);
				}

				fullscreen.addEventListener("click", function() {
					if (containerOver == null) {
						containerOver = document.createElement('div');
						containerOver.setAttribute('style', styleBig);
						containerOver.id = json.name + "Big";
						containerOver.className = "centerhv";
						buildContainerChartBig(json, containerOver, true);
					}
					containerOver.style.visibility = 'visible';
					containerOver.style['z-index'] = 9;
					containerOver.style.opacity = 1;
					$("svg").css('display', 'none');
					$("svg").css('height');
					$("svg").css('display', 'initial');// HACK for redraw of
					// SVG
				});

				compare.addEventListener("click", function() {
					if (containerOverCompare == null) {
						containerOverCompare = document.createElement('div');
						containerOverCompare.setAttribute('style', styleBig);
						containerOverCompare.id = json.name + "Compare";
						containerOverCompare.className = "centerhv";
						buildContainerChartCompare(json, containerOverCompare, true);
					}
					containerOverCompare.style.visibility = 'visible';
					containerOverCompare.style['z-index'] = 9;
					containerOverCompare.style.opacity = 1;
					$("svg").css('display', 'none');
					$("svg").css('height');
					$("svg").css('display', 'initial');// HACK for redraw of
					// SVG
				});

				setting.addEventListener("click", function() {
					if (containerOverSetting == null) {
						containerOverSetting = document.createElement('div');
						containerOverSetting.setAttribute('style', styleBig);
						containerOverSetting.id = json.name + "Setting";
						containerOverSetting.className = "centerhv";
						buildContainerSettings(json, containerOverSetting, true);
					}
					containerOverSetting.style.visibility = 'visible';
					containerOverSetting.style['z-index'] = 9;
					containerOverSetting.style.opacity = 1;
					$("svg").css('display', 'none');
					$("svg").css('height');
					$("svg").css('display', 'initial');// HACK for redraw of
					// SVG
				});
			}
			container.setAttribute('style', style);
			if (json.type.I.customImage == null) {
				buildContainerChart(container, json, zoomFactor, style, containerOver);
				if (json.type.I.name != null && json.type.I.name != "") {
					namedContainers[json.type.I.name] = {
						type : "Chart",
						elem : json.chartInPage,
						opt : json.options
					};
				}
			}
			break;
		case "pdbf.json.DataTable":
			if (phantomJS) {
				var text = buildDataTable(container, json, zoomFactor, style, containerOver);
				if (text != undefined) {
					json.text = text;
				}
			}
			if (!phantomJS) {
				container.addEventListener("click", function() {
					if (containerOver == null) {
						containerOver = document.createElement('div');
						containerOver.setAttribute('style', styleBig);
						containerOver.id = json.name + "Big";
						containerOver.className = "centerhv";
						buildContainerTableBig(json, containerOver);
					}
					containerOver.style.visibility = 'visible';
					containerOver.style['z-index'] = 9;
					containerOver.style.opacity = 1;
				});
			}
			style += 'cursor: pointer;';
			container.setAttribute('style', style);
			break;
		case "pdbf.json.DataText":
			if (phantomJS) {
				var text = buildDataText(container, json, zoomFactor, style, containerOver);
				if (text != undefined) {
					json.text = text;
				}
			}
			if (json.type.I.linkTo != null && json.type.I.linkTo != "") {
				container.addEventListener("mouseover", function() {
					var o = namedContainers[json.type.I.linkTo];
					if (o == undefined) {
						alert("Error! There is no element with name \"" + json.type.I.linkTo + "\"");
					}
					switch (o.type) {
						case "Chart":
							o.elem.xgrids.add([ {
								value : json.type.I.linkSelector,
								text : json.type.I.linkLabel
							} ]);
							break;
						case "MultiplotChart":
						case "Pivot":
						default:
							alert("Error! linkTo currently only supports chart elements.")
							break;
					}
				});
				container.addEventListener("mouseout", function() {
					var o = namedContainers[json.type.I.linkTo];
					if (o == undefined) {
						alert("Error! There is no element with name \"" + json.type.I.linkTo + "\"");
					}
					switch (o.type) {
						case "Chart":
							o.elem.xgrids.remove({
								value : json.type.I.linkSelector
							});
							break;
						case "MultiplotChart":
						case "Pivot":
						default:
							alert("Error! linkTo currently only supports chart elements.")
							break;
					}
				});
			}
			// Fallthrough
		case "pdbf.json.Text":
			if (!phantomJS) {
				container.addEventListener("click", function() {
					if (containerOver == null) {
						containerOver = document.createElement('div');
						containerOver.setAttribute('style', styleBig);
						containerOver.id = json.name + "Big";
						containerOver.className = "centerhv";
						buildContainerTableBig(json, containerOver);
					}
					containerOver.style.visibility = 'visible';
					containerOver.style['z-index'] = 9;
					containerOver.style.opacity = 1;
				});
			}
			style += 'cursor: pointer;';
			container.setAttribute('style', style);
			break;
		case "pdbf.json.JSON":
			if (!phantomJS) {
				container.addEventListener("click", function() {
					if (containerOver == null) {
						containerOver = document.createElement('div');
						containerOver.setAttribute('style', styleBig);
						containerOver.id = json.name + "Big";
						containerOver.className = "centerhv";
						buildContainerJsonView(json, containerOver, undefined, useTextCompare);
					}
					containerOver.style.visibility = 'visible';
					containerOver.style['z-index'] = 9;
					containerOver.style.opacity = 1;
				});
			}
			style += 'cursor: pointer;';
			container.setAttribute('style', style);
			break;
		case "pdbf.json.Pivot":
			if (!phantomJS) {
				var fullscreen = getFullscreenDiv();
				container.appendChild(fullscreen);
				fullscreen.addEventListener("click", function() {
					if (containerOver == null) {
						containerOver = document.createElement('div');
						containerOver.setAttribute('style', styleBig);
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
			if (json.type.I.customImage == null) {
				buildContainerPivot(container, json, zoomFactor, style, containerOver);
				if (json.type.I.name != null && json.type.I.name != "") {
					namedContainers[json.type.I.name] = {
						type : "Pivot",
						elem : undefined
					}; // TODO:
				}
				// Check if Pivot table fits into the div. If not then decrease
				// the font-size until it fits or until we reach a negative zoomFactor
				var container = $(container).children().last().children();
				var cur = 0.1;
				container.css('font-size', cur + "pt");
				var width = container.width();
				var height = container.height();
				while ((container.width() == width && container.height() == height) && cur <= zoomFactor * 12.0) {
					cur = cur + 0.1;
					$(container).css('font-size', cur + "pt");
				}
				cur = cur - 0.1;
				$(container).css('font-size', cur + "pt");
			}
			break;
		default:
			alert("Unknown type: " + json.type.C);
			break;
	}
	toc("Display time for " + json.name);
}

function buildContainerChartBig(json, containerOver, initial) {
	containerOver.updateData = function() {
		json.jsonBig.type.I.query = ref.editor.getValue();
		containerOver.update();
	};
	containerOver.update = function() {
		json.jsonBig.type.I.logScale = logScale.checked;
		json.jsonBig.type.I.includeZero = includeZero.checked;
		if (json.type.I.chartType == 'Line' || json.type.I.chartType == 'line') {
			json.jsonBig.type.I.drawPoints = drawPoints.checked;
			json.jsonBig.type.I.fillGraph = fillGraph.checked;
		}
		json.jsonBig.type.I.showRangeSelector = showRangeSelector.checked;
		
		json.chartdataBig = getChartData(json.jsonBig);
		json.resultBig = json.chartdataBig.res;
		if (json.chartdataBig.error != undefined) {
			error.innerHTML = 'Query status: Error! ' + json.chartdataBig.error;
			containerOptions.style.visibility = 'hidden';
			containerChart.style.visibility = 'hidden';
			return;
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
			containerChart.style.visibility = 'visible';
		}
		
		var optionsBig = getChartOptions(json.jsonBig, rawZoomFactor, json.chartdataBig.values, containerContent);
		
		if (logScale.checked) {
			includeZero.disabled = true;
		} else {
			includeZero.disabled = false;
		}
		if (includeZero.checked) {
			logScale.disabled = true;
		} else {
			logScale.disabled = false;
		}
		
		json.chart = c3.generate(optionsBig);
	};
	
	var viewerContainer = document.getElementById("viewerContainer");
	var tip = "Tip: Scroll to zoom the graph. Click and drag to pan the graph.<br/>";
	json.jsonBig = jQuery.extend(true, {}, json);
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip, [ json ], containerOver.updateData, 'graph', true);
	var containerContent = ref.containerContent;
	var containerChart = ref.containerChart;
	var containerOptions = ref.options;
	var error = ref.error;
	
	var logScale = getCheckbox('LogScale (Y-Axis)', containerOptions);
	logScale.addEventListener('change', containerOver.update);
	logScale.checked = json.jsonBig.type.I.logScale;
	
	json.jsonBig.type.I.showRangeSelector = true;
	
	var includeZero = getCheckbox('IncludeZero', containerOptions);
	includeZero.addEventListener('change', containerOver.update);
	includeZero.checked = json.jsonBig.type.I.includeZero;
	
	if (json.jsonBig.type.I.chartType == 'Line' || json.jsonBig.type.I.chartType == 'line') {
		var fillGraph = getCheckbox('FillGraph', containerOptions);
		fillGraph.addEventListener('change', containerOver.update);
		fillGraph.checked = json.jsonBig.type.I.fillGraph;
		
		var drawPoints = getCheckbox('DrawPoints', containerOptions);
		drawPoints.addEventListener('change', containerOver.update);
		drawPoints.checked = json.jsonBig.type.I.drawPoints;
	}
	
	var showRangeSelector = getCheckbox('ShowRangeSelector', containerOptions);
	showRangeSelector.addEventListener('change', containerOver.update);
	showRangeSelector.checked = json.jsonBig.type.I.showRangeSelector;
	
	containerOver.update();
}


function buildContainerChart(container, json, zoomFactor, style, containerOver, newDatasource) {
	var chart = document.createElement('div');
	chart.setAttribute('style', 'width:100%; height:100%;');
	container.appendChild(chart);

	var chartdata;

	if(newDatasource) {
		if(json.compareResult == undefined) {
			chartdata = getChartData(json, true);
			if (chartdata.error != undefined) {
				alert(chartdata.error + '\nWhere: ' + json.name + '\nQuery was: ' + json.type.I.query);
				return;
			}

			json.compareResult = chartdata;
		} else {
			chartdata = json.compareResult;
		}
	}else {
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
	}

	style = "background: white;" + style;
	container.setAttribute('style', style);

	var options = getChartOptions(json, zoomFactor, chartdata, chart);

	json.options = options;

	json.chartInPage = c3.generate(options);
}

function buildContainerChartCompare(json, containerOver, initial) {
	var viewerContainer = document.getElementById("viewerContainer");
	viewerContainer.appendChild(containerOver);

	var styleParent = 'position: fixed; z-index: 9; border: 1px solid black; padding: 10px; width: 49%; height: 87%; '
		+ 'opacity: 1; visibility: visible; transition: opacity 500ms ease-out; overflow-x: auto; overflow-y: scroll; white-space: nowrap;';

	var style = 'width: 48%; height: 80%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; text-align: left; white-space: normal;';

	var containerLeft = document.createElement('div');

	// Closing
	var containerClose = getClosingTitle(containerOver);
	containerOver.appendChild(containerClose);

	// Charts
	containerLeft.setAttribute('style', styleParent);
	containerOver.appendChild(containerLeft);

	// Left Graph (Original)
	buildContainerChart(containerLeft, json, zoomFactor, style, containerOver); //  + " float:left;"

	// Set Right Graph, if a file is given
	var containerRight = document.createElement('div');
	containerRight.setAttribute('style', styleParent);
	containerRight.id = "right";
	containerOver.appendChild(containerRight);

	if(foundDatasource) {
		// Right Graph
		if(initial) {
			json["compareDB"] = JSON_COMPARE_TABLE;
			json["compareResult"] = json.result;
			json["compareResult"] = undefined;
			json["compareFile"] = "jsons";
		}

		var containerSource = document.createElement('span');
		var source = 'Source for this Graph: ';

		if(foundDatasource) {
			buildContainerChart(containerRight, json, zoomFactor, style + "float:right;", containerOver, true);
			source += "are json files";
		}

		containerSource.innerHTML = source;
		containerRight.appendChild(containerSource);

		createDropField("right", json, containerOver, true, "chart");
		//createFileSelector(containerRight, json, containerOver, true, "chart");
	}

	// Create Drag & Drop Field
	else {
		checkFileAPI();

		var styleRed = 'width:100%; height:100%; background:red; text-align:center; vertical-align:middle';

		// Div File
		var containerFileDrop = document.createElement("div");
		containerFileDrop.id = "files";
		containerFileDrop.setAttribute('style', style);
		containerFileDrop.innerHTML = "<br><br>You can drag & drop your own files here<br>";

		containerRight.appendChild(containerFileDrop);

		createDropField("files", json, containerOver, true, "chart");
		//createFileSelector(containerRight, json, containerOver, true, "chart");

		containerRight.setAttribute('style',  "background: white;" + style + "float:right;");
	}


	// Switch additive input
	var buttonAdd = document.createElement('input');
	buttonAdd.type = 'button';
	buttonAdd.value = 'Addtitive Input';
	buttonAdd.setAttribute('style', 'font-size:inherit;');
	buttonAdd.addEventListener('click', function() {
		additive = !additive;

		if(additive)
			console.log("Enabled additive mode");
		else
			console.log("Disabled additive mode");
	});
	// TODO find the rigt position
	// containerOver.appendChild(buttonAdd);

	fixOverlaySize();
}

function buildContainerSettings(json, containerOver, initial) {
	var viewerContainer = document.getElementById("viewerContainer");
	viewerContainer.appendChild(containerOver);

	var styleParent = 'position: fixed; z-index: 9; border: 1px solid black; padding: 10px; width: 49%; height: 97%; '
		+ 'opacity: 1; visibility: visible; transition: opacity 500ms ease-out; overflow-x: auto; overflow-y: scroll; white-space: nowrap;';

	var style = 'width: 48%; height: 90%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; text-align: left; white-space: normal;';

	var containerLeft = document.createElement('div');
	var containerRight = document.createElement('div');

	// Closing
	var containerClose = getClosingTitle(containerOver);
	containerOver.appendChild(containerClose);

	// Left
	containerLeft.setAttribute('style', styleParent+ "float:left;");
	containerLeft.innerHTML = bold("JSON Files given by the author") + "<br>";
	containerLeft.id = "left";
	containerOver.appendChild(containerLeft);

	// File Left Container with available JSON Files
	var results;
	var content = "";

	var originalJsons = {};
	var originalNames = [];
//	var newJsons = {};
	var newNames = [];

	try {
		results = alasqlQuery("SELECT * FROM " + JSON_TABLE + "  ORDER BY " + JSON_FILENAME + "  ASC;");
	}catch (e) {
		return {
			error: e.message
		};
	}

	for(i = 0; i < results.length; i++) {
		var val = results[i];
		var name = val[JSON_FILENAME];

		var container = document.createElement('div');
		container.id = json + "compareLeft" + i;

		// TODO open window
		container.addEventListener('click', function() {
			// TODO
		});

		var preparedVal = prepareJson(name, val);
		container.innerHTML = preparedVal;

		containerLeft.appendChild(container);

		originalJsons[name] = val;
		originalNames.push(name);
	}

	// Right
	containerRight.setAttribute('style', styleParent+ "float:right;");
	containerRight.innerHTML = bold("JSON Files you inserted") + "<br>";
	containerRight.innerHTML += "You can drag & drop your own files here" + "<br>";
	containerRight.id = "right";
	containerOver.appendChild(containerRight);

	createDropField("right", json, containerOver, true, "settings");
	// createFileSelector(containerRight, json, containerOver, true, "settings");

	// File Right Container with available JSON Files
	content = "";

	try {
		results = alasqlQuery("SELECT * FROM " + JSON_COMPARE_TABLE + "  ORDER BY " + JSON_FILENAME + "  ASC;");
	}catch (e) {
		return {
			error: e.message
		};
	}

	for(var i = 0; i < results.length; i++) {
		val = results[i];
		name = val[JSON_FILENAME];

		container = document.createElement('div');
		container.id = json + "compareRight" + i;

		// TODO
		container.addEventListener('click', function() {
			// TODO
		});

		var coloredVal = compareJsons(originalJsons, name, val);
		newNames.push(name);

		container.innerHTML += coloredVal;
		containerRight.appendChild(container);
	}

	var missingNames=[], extraNames=[], n;

	for(i = 0; i < originalNames.length; i++) {
		n = originalNames[i];

		if(newNames.indexOf(n) == -1) {
			missingNames.push(n);
		}
	}

	for(i = 0; i < newNames.length; i++) {
		n = newNames[i];

		if(originalNames.indexOf(n) == -1) {
			extraNames.push(n);
		}
	}

	for(i = 0; i < missingNames.length; i++) {
		if(i == 0)
			containerRight.innerHTML += "<br>" + bold("Items that are missing in your files:") + "<br>";

		n = missingNames[i];
		container = document.createElement('div');
		container.id = json + "missing" + i;

		// TODO
		container.addEventListener('click', function() {
			// TODO
		});

		container.innerHTML += bold(n) + "<br>";
		containerRight.appendChild(container);
	}

	for(i = 0; i < extraNames.length; i++) {
		if(i == 0)
			containerRight.innerHTML += "<br>" + bold("Items that are only in your files:") + "<br>";

		n = extraNames[i];
		container = document.createElement('div');
		container.id = json + "extra" + i;

		// TODO
		container.addEventListener('click', function() {
			// TODO
		});

		container.innerHTML += bold(n) + "<br>";
		containerRight.appendChild(container);
	}

	// Button for additive method
	var buttonAdd = document.createElement('input');
	buttonAdd.type = 'button';
	buttonAdd.value = 'Addtitive Input';
	buttonAdd.setAttribute('style', 'font-size:inherit;');
	buttonAdd.addEventListener('click', function() {
		additive = !additive;

		if(additive)
			console.log("Enabled additive mode");
		else
			console.log("Disabled additive mode");
	});
	containerOver.appendChild(buttonAdd);

	// Button for deletion
	var buttonDel = document.createElement('input');
	buttonDel.type = 'button';
	buttonDel.value = 'Delete inserted Files';
	buttonDel.setAttribute('style', 'font-size:inherit;');
	buttonDel.addEventListener('click', function() {
		console.log("Deleting inserted files");
		var queryDrop = "DROP TABLE " + JSON_COMPARE_TABLE + ";\n";
		var queryCreate = "CREATE TABLE " + JSON_COMPARE_TABLE + ";\n";

		alasqlQuery(queryDrop + queryCreate);

		while (containerOver.firstChild) {
			containerOver.removeChild(containerOver.firstChild);
		}
		buildContainerSettings(json, containerOver, initial);
	});
	containerOver.appendChild(buttonDel);


	containerLeft.setAttribute('style',  "background: white;" + style + "float:left;");
	containerRight.setAttribute('style',  "background: white;" + style + "float:right;");

	fixOverlaySize();
}

function buildContainerJsonView(json, containerOver, name, textCompare, similarityValue) {
	var viewerContainer = document.getElementById("viewerContainer");
	viewerContainer.appendChild(containerOver);

	var styleParent = 'position: fixed; z-index: 9; border: 1px solid black; padding: 10px; width: 32%; height: 97%; '
		+ 'opacity: 1; visibility: visible; transition: opacity 500ms ease-out; overflow-x: auto; overflow-y: scroll; white-space: nowrap;';

	var style = 'width: 31.3%; height: 92%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; text-align: left; white-space: normal;';

	var containerLeft = document.createElement('div');
	var containerRight = document.createElement('div');
	var containerDiff = document.createElement('div');

	// Closing
	var containerClose = getClosingTitle(containerOver);
	containerOver.appendChild(containerClose);

	// Left
	containerLeft.setAttribute('style', styleParent + "float:left;");
	containerLeft.innerHTML = bold("JSON File given by the author") + "<br>";
	containerLeft.id = "left";
	containerOver.appendChild(containerLeft);

	// Right
	containerRight.setAttribute('style', styleParent + "float:left;");
	containerRight.innerHTML = bold("JSON File you have given") + "<br>";
	containerRight.id = "right";
	containerOver.appendChild(containerRight);

	// JSON Diff
	containerDiff.setAttribute('style', styleParent + "float:right;");
	containerDiff.innerHTML = bold("JSON Difference") + "<br>";
	containerDiff.id = "diff";
	containerOver.appendChild(containerDiff);

	var jsonName;
	if(name !== undefined)
		jsonName = name;
	else
		jsonName = deleteExtension(json.type.I.query, ".json");

	// Get Left
	var originalJson = "";
	var foundLeft = true;

	try {
		originalJson = getJson(jsonName, JSON_TABLE);
	} catch (e) {
		foundLeft = false;
	}

	// Get Right
	var compareJson = "";
	var foundRight = true;

	try {
		compareJson = getJson(jsonName, JSON_COMPARE_TABLE);
	} catch (e) {
		foundRight = false;
	}

	// Difference
	if(typeof(originalJson) != undefined)
		delete originalJson[JSON_FILENAME];
	if(typeof(compareJson) != undefined)
		delete compareJson[JSON_FILENAME];

	var originalJsonString = JSON.stringify(originalJson);
	var compareJsonString = JSON.stringify(compareJson);

	var diffs = dmp.diff_main(originalJsonString, compareJsonString, false);
	var pretty = dmp.diff_prettyHtml(diffs);


	var levenshtein = dmp.diff_levenshtein(diffs);
	var dsimilarity = 100 - (levenshtein / Math.max(originalJsonString.length, compareJsonString.length) * 100);

	if(distanceWithoutBrackets) {
		var s1 = replaceAll(replaceAll(originalJsonString, "{", ""), "}", "");
		var s2 = replaceAll(replaceAll(compareJsonString,  "{", ""), "}", "");

		levenshtein = dmp.diff_levenshtein(dmp.diff_main(s1, s2, false));
		dsimilarity = 100 - (levenshtein / Math.max(s1.length, s2.length) * 100);
	}

	var inputLeft = bold("was not found");
	var inputRight = bold("was not found");
	var inputDiff = "";

	var left = removeJsonName(originalJson);
	var right = removeJsonName(compareJson);

	inputLeft = prepareJsonBig(jsonName, originalJson);
	inputRight = prepareJsonBig(jsonName, compareJson);
	inputDiff = adjustColor(prepareJsonBig(jsonName, pretty, true));

	similarityValue = typeof(similarityValue) === 'undefined' ? 0 : similarityValue;

	if(foundLeft && foundRight) { // Add the slider
		var distance = document.createElement('div');
		var sim = object_similarity(originalJson, compareJson);
		//distance.innerHTML = "Similarity: " + sim + "%";
		distance.innerHTML = "Use the Slider below, to change Error Tolerance";
		containerDiff.appendChild(distance);

		var compareSlider = document.createElement('input');
		compareSlider.type = 'range';
		compareSlider.id = 'slider';
		compareSlider.min = 0;
		compareSlider.max = 100;
		compareSlider.value = similarityValue;
		compareSlider.addEventListener('change', function() {
			similarityValue = compareSlider.value;

			frame.srcdoc=createDiffHTML(left, right, similarityValue, useTextDiff);

			if(similarityValue == 0)
				description.innerHTML = " Highlight all changes";
			else
				description.innerHTML = " Only highlight changes with a deviation of more than " + similarityValue + " %";
		});
		containerDiff.appendChild(compareSlider);

		var description = document.createElement('div');
		if(similarityValue == 0)
			description.innerHTML = " Highlight all changes";
		else
			description.innerHTML = " Only highlight changes with a deviation of more than " + similarityValue + " %";
		containerDiff.appendChild(description);

		var emptyLine = document.createElement('div');
		emptyLine.innerHTML = "<p><br></p>";
		containerDiff.appendChild(emptyLine);
	}

	containerLeft.innerHTML += inputLeft;
	containerRight.innerHTML += inputRight;

	if(textCompare) {
		containerDiff.innerHTML += inputDiff;
	}
	else if(foundRight && foundLeft) {
		// TODO TODO TODO ugly workaround
		// can be solved be importing jsondiffpatch.js
		// but this is somwhow complicated
		var frame = document.createElement('iframe');
		frame.name="targetframe";
		frame.allowTransparency="true";
		frame.scrolling="yes";
		frame.frameborder="0";
		frame.srcdoc=createDiffHTML(left, right, similarityValue, useTextDiff);
		frame.height = "84%";
		frame.width = "99%";
		containerDiff.appendChild(frame);

		var emptyLine = document.createElement('div');
		emptyLine.innerHTML = "<p><br></p>";
		containerDiff.appendChild(emptyLine);
	}
	else {
		containerDiff.innerHTML += "You can drag & drop your own files here";
		containerRight.innerHTML += "You can drag & drop your own files here";
	}

	// Style
	createDropField("left", json, containerOver, true, "jsonView");
	createDropField("right", json, containerOver, true, "jsonView");
	createDropField("diff", json, containerOver, true, "jsonView");
	containerLeft.setAttribute('style', "background: white;" + style + "float:left;");
	containerRight.setAttribute('style', "background: white;" + style);
	containerDiff.setAttribute('style', "background: white;" + style + "float:right;");

	if(foundLeft) {
		// Button for copy (left)
		var buttonCopyLeft = document.createElement('input');
		buttonCopyLeft.type = 'button';
		buttonCopyLeft.value = 'Copy to clipboard';
		buttonCopyLeft.setAttribute('style', 'font-size:inherit;');
		buttonCopyLeft.addEventListener('click', function () {
			copyToClipboard(JSON.stringify(originalJson))
		});
		containerLeft.appendChild(buttonCopyLeft);
	}

	if(foundRight) {
		// Button for copy (right)
		var buttonCopyRight = document.createElement('input');
		buttonCopyRight.type = 'button';
		buttonCopyRight.value = 'Copy to clipboard';
		buttonCopyRight.setAttribute('style', 'font-size:inherit;');
		buttonCopyRight.addEventListener('click', function() {
			copyToClipboard(JSON.stringify(compareJson))
		});
		containerRight.appendChild(buttonCopyRight);
	}

	if(JSON.stringify(originalJson) != JSON.stringify(compareJson)
		&& JSON.stringify(compareJson) != '\"\"') { // TODO always this?
		// Button for copy (diff)
		var buttonCopyDiff = document.createElement('input');
		buttonCopyDiff.type = 'button';
		buttonCopyDiff.value = 'Enlarge';
		buttonCopyDiff.setAttribute('style', 'font-size:inherit;');
		buttonCopyDiff.addEventListener('click', function() {
			while (containerOver.firstChild) {
				containerOver.removeChild(containerOver.firstChild);
			}

			buildContainerDiff(json, containerOver, originalJson, compareJson, textCompare, false, similarityValue);
		});
		containerDiff.appendChild(buttonCopyDiff);
	}

	fixOverlaySize();
}

function buildContainerLevenshtein(json, containerOver, name, textCompare) {

	var container = document.createElement('div');
	container.style = 'width: 45%; height: 60%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; text-align: left; white-space: normal;';

	container.innerHTML =
		bold("Levenshtein Distance:") +
		"<p>The Levenshtein distance is a string metric for measuring the difference between two sequences." +
		"Informally, the Levenshtein distance between two words is the minimum number of single-character edits<" +
		"(i.e. insertions, deletions or substitutions) required to change one word into the other.<br>" +
		"Levenshtein distance may also be referred to as edit distance," +
		"although that may also denote a larger family of distance metrics." +
		"It is closely related to pairwise string alignments.<br>" +
		"(from Wikipedia 14.06.2016)</p><br>" +
		bold("Similarity:") +
		"<p>100 - (levenshtein(s1, s2) / Math.max(s1.length, s2.length) * 100);</p><br>";

	containerOver.appendChild(container);

	// Button for return
	var buttonReturn = document.createElement('input');
	buttonReturn.type = 'button';
	buttonReturn.value = 'Return';
	buttonReturn.setAttribute('style', 'font-size:inherit;');
	buttonReturn.addEventListener('click', function() {
		while (containerOver.firstChild) {
			containerOver.removeChild(containerOver.firstChild);
		}

		buildContainerJsonView(json, containerOver, undefined, textCompare);
	});
	container.appendChild(buttonReturn);

	fixOverlaySize();
}

function buildContainerDiff(json, containerOver, originalJson, compareJson, textCompare, fromSettings, similarityValue) {
	//var niceDiff = createDiffHTML(left, right);

	var viewerContainer = document.getElementById("viewerContainer");
	viewerContainer.appendChild(containerOver);

	var styleParent = 'position: fixed; z-index: 9; border: 1px solid black; padding: 10px; width: 97%; height: 97%; '
		+ 'opacity: 1; visibility: visible; transition: opacity 500ms ease-out; overflow-x: auto; overflow-y: scroll; white-space: nowrap;';

	var style = 'width: 97%; height: 90%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; text-align: left; white-space: normal;';

	var container = document.createElement('div');

	var left = JSON.stringify(originalJson);
	var right = JSON.stringify(compareJson);

	// Closing
	var containerClose = getClosingTitle(containerOver);
	containerOver.appendChild(containerClose);

	// Left
	container.setAttribute('style', styleParent);
	container.innerHTML = bold("JSON Differences") + "<br>";
	container.id = "left";
	containerOver.appendChild(container);

	var distance = document.createElement('div');
	var sim = object_similarity(originalJson, compareJson);
	//distance.innerHTML = "Similarity: " + sim + "%";
	distance.innerHTML = "Use the Slider below, to change Error Tolerance";
	container.appendChild(distance);

	similarityValue = typeof(similarityValue) === 'undefined' ? 0 : similarityValue;

	var compareSlider = document.createElement('input');
	compareSlider.type = 'range';
	compareSlider.id = 'slider';
	compareSlider.min = 0;
	compareSlider.max = 100;
	compareSlider.value = similarityValue;
	compareSlider.addEventListener('change', function() {
		similarityValue = compareSlider.value;
		frame.srcdoc=createDiffHTML(left, right, similarityValue, useTextDiff);

		if(similarityValue == 0)
			description.innerHTML = " Highlight all changes";
		else
			description.innerHTML = " Only highlight changes with a deviation of more than " + similarityValue + " %";
	});
	container.appendChild(compareSlider);

	var description = document.createElement('div');
	if(similarityValue == 0)
		description.innerHTML = " Highlight all changes";
	else
		description.innerHTML = " Only highlight changes with a deviation of more than " + similarityValue + " %";
	container.appendChild(description);

	var emptyLine = document.createElement('div');
	emptyLine.innerHTML = "<p><br></p>";
	container.appendChild(emptyLine);

	var frame = document.createElement('iframe');
	frame.name="targetframe" + left;
	frame.allowTransparency="true";
	frame.scrolling="yes";
	frame.frameborder="0";
	frame.srcdoc=createDiffHTML(left, right, similarityValue, useTextDiff);
	frame.height = "87%";
	frame.width = "99%";
	container.appendChild(frame);

	var emptyLine2 = document.createElement('div');
	emptyLine2.innerHTML = "<p><br></p>";
	container.appendChild(emptyLine2);

	if(true) { // TODO always this?
		// Button for copy (diff)
		var buttonCopyDiff = document.createElement('input');
		buttonCopyDiff.type = 'button';
		buttonCopyDiff.value = 'Return';
		buttonCopyDiff.setAttribute('style', 'font-size:inherit;');
		buttonCopyDiff.addEventListener('click', function() {
			while (containerOver.firstChild) {
				containerOver.removeChild(containerOver.firstChild);
			}

			if(fromSettings)
				buildContainerSettings(json, containerOver);
			else
				buildContainerJsonView(json, containerOver, undefined, textCompare, similarityValue);
		});
		container.appendChild(buttonCopyDiff);
	}

	createDropField("left", json, containerOver, true, "jsonView");
	container.setAttribute('style', "background: white;" + style);

	fixOverlaySize();
}

function createDiffHTML(left, right, similarity, textDiff) {
	textDiff = typeof(textDiff) === 'undefined' ? 60 : textDiff;

	var minifiedHead = "<!DOCTYPE html>" +
		"\n" + "<html>" +
		"\n" + "<head>" +
		"\n" + "<script src=\"jsondiffpatch.min.js\"></script>" +
		"\n" + "<script src=\"jsondiffpatch-formatters.min.js\"></script>" +
		"\n" + "<script src=\"diff_match_patch.js\"></script>" +
		"\n" + "<link rel=\"stylesheet\" href=\"html.css\" type=\"text/css\" />" +
		"\n" + "<link rel=\"stylesheet\" href=\"annotated.css\" type=\"text/css\" />" +
		"\n" + "</head>";

	var normalHead = "<!DOCTYPE html>" +
		"\n" + "<html>" +
		"\n" + "<head>" +
		"\n" + "<script src=\"data/jsondiffpatch.min.js\"></script>" +
		"\n" + "<script src=\"data/jsondiffpatch-formatters.min.js\"></script>" +
		"\n" + "<script src=\"data/diff_match_patch.js\"></script>" +
		"\n" + "<link rel=\"stylesheet\" href=\"data/html.css\" type=\"text/css\" />" +
		"\n" + "<link rel=\"stylesheet\" href=\"data/annotated.css\" type=\"text/css\" />" +
		"\n" + "</head>";

	var additionalJavaScript = "" +
		"\n" + "delta = cleanDelta(delta);";

	var additionalFunctions = "" +
		"\n" + "function deviation(x, y) {" +
		"\n" + "  return Math.abs((x-y)/x * 100);" +
		"\n" + "}" + "\n" +
		"\n" + "function levenshtein(x, y) {" +
		"\n" + "  var s1 = JSON.stringify(x);" +
		"\n" + "  var s2 = JSON.stringify(y);" +
		"\n" + "  var lev = dmp.diff_levenshtein(dmp.diff_main(s1, s2, false));" +
		"\n" + "  return 100 - (lev / Math.max(s1.length, s2.length) * 100);" +
		"\n" + "}" + "\n" +
		// x is the old value
		// y is the new value
		// z is given (= 0) if there is no new value
		//
		// if only x is given, there is no old value
		"\n" + "function cleanDelta(delta, is_array) {" +
		"\n" + "  var similarity = " + similarity + ";" +
		"\n" + "  if(is_array) {" +
		"\n" + "    var i = 0, len = (Object.keys(delta).length -1);" +
		"\n" + "    for(i = 0; i < len / 2; i++) { " +
		"\n" + "      var z1 = delta[i], z2 = delta['_' + i];" +
		"\n" + "      if(typeof(z1) === 'undefined' || typeof(z2) === 'undefined') " +
		"\n" + "        continue;" +
		"\n" +
		"\n" + "      var x1 = z1[0], x2 = z2[0]; " +
		"\n" + "      if(typeof(x1) === 'number' && typeof(x2) === 'number') { "+
		"\n" + "        if(deviation(x1, x2) <= " + 'similarity' + ") {" +
		"\n" + "          delete delta[i]; delete(delta['_' + i]); " +
		"\n" + "        }" +
		"\n" + "      }" +
		"\n" + "      else if(typeof(x1) === 'string' && typeof(x2) === 'string') {" +
		"\n" + "        if(levenshtein(x1, x2) <= " + 'similarity' + ") {" +
		"\n" + "          delete delta[i]; delete(delta['_' + i]); " +
		"\n" + "        }" +
		"\n" + "      }" +
		"\n" + "      else if(typeof(x1) === 'object' && typeof(x2) === 'object' ) {" +	// Array
		"\n" + "        cleanDelta(delta[key], true);" +
		"\n" + "      }" +
		"\n" + "      else if(typeof(x1) === 'undefined' && typeof(x2) === 'undefined' ) {" +	// Nested
		"\n" + "        cleanDelta(delta[key]);" +
		"\n" + "      }" +
		"\n" + "      else if(typeof(x) === 'object' && typeof(y) === 'undefined') { " +
		"\n" + "        cleanDelta(delta[key]); " +
		"\n" + "      }" +
		"\n" + "    }" +
		"\n" + "  } " +
		"\n" + "  else { "	+
		"\n" + "    for(var key in delta) {" +
		"\n" + "      var element = delta[key];" +
		"\n" + "      var x = element['0'], y = element['1'], z = element['2'];" +
		"\n" + "      if(typeof(x) === 'number' && typeof(y) === 'number' && typeof(z) === 'undefined' ) {" +
		"\n" + "        if(deviation(x, y) <= " + 'similarity' + ") {" +
		"\n" + "          delete delta[key]; " +
		"\n" + "        }"	+
		"\n" + "      }"	+
		"\n" + "      else if(typeof(x) === 'string' && typeof(y) === 'string' && typeof(z) === 'undefined' ) {" +
		"\n" + "        if(levenshtein(x, y) <= " + 'similarity' + ") {" +
		"\n" + "          delete delta[key]; " +
		"\n" + "        }" +
		"\n" + "      }" +
		"\n" + "      else if(typeof(x) === 'object' && typeof(y) === 'object' && typeof(z) === 'undefined' ) {" +	// Array
		"\n" + "        cleanDelta(delta[key], true);" +
		"\n" + "      }" +
		"\n" + "      else if(typeof(x) === 'undefined' && typeof(y) === 'undefined' && typeof(z) === 'undefined' ) {" +	// Nested
		"\n" + "        cleanDelta(delta[key]);" +
		"\n" + "      }"  +
		"\n" + "      else if(typeof(x) === 'object' && typeof(y) === 'undefined') { " +
		"\n" + "        cleanDelta(delta[key]); " +
		"\n" + "      }" +
		"\n" + "    }" +
		"\n" + "  }" +
		"\n" + "  return delta;" +
		"\n" + "}";

	var additionalDiffSettings = "" +
		"\n" + "var customDiff = jsondiffpatch.create({" +
		"\n" + "  textDiff: {" +
		"\n" + "    minLength: " + textDiff +
		"\n" + "  }," +
		"\n" + "  arrays: {" +
		"\n" + "    detectMove: true," +
		"\n" + "    includeValueOnMove: false" +
		"\n" + "  }" +
		"\n" + "});";

	var body = "\n" + "<body>" +
		"\n" + "<div id=\"visual\"></div>" +
		"\n" + "<hr/>" +
		"\n" + "<div id=\"annotated\"></div>" +
		"\n" + "<script>" + "\n" +
		"\n" + "var left = " + (left) + ";" + "\n" +
		"\n" + "var right = " + (right) + ";" + "\n" +
		"\n" + "var sim = 0;" +
		"\n" +  additionalDiffSettings +
		"\n" + "var delta = customDiff.diff(left, right);" +
		"\n" + "var dmp = new diff_match_patch();" +
		"\n" +  additionalJavaScript +
		"\n" + "document.getElementById(\"visual\").innerHTML = jsondiffpatch.formatters.html.format(delta, left);" +
		"\n" + "document.getElementById(\"annotated\").innerHTML = jsondiffpatch.formatters.annotated.format(delta, left);" +
		"\n" +  additionalFunctions + "\n" +
		"\n" + "</script>" +
		"\n" + "</body>" +
		"\n" + "</html>";

	//console.log(minifiedHead + body);

	if(endsWith(getScriptPath(), "data"))
		return minifiedHead + body;
	else
		return normalHead + body;
}

function deviation(x, y) {
	return Math.abs((x-y)/x * 100);
}

function levenshtein_distance(x, y) {
	var s1 = JSON.stringify(x);
	var s2 = JSON.stringify(y);
	var lev = dmp.diff_levenshtein(dmp.diff_main(s1, s2, false));
	return (lev / Math.max(s1.length, s2.length) * 100);
}

function object_similarity(left, right) {
	var sim = 100 - object_deviation(left, right)
	return Number(sim).toFixed(2);
}

function object_deviation(left, right) {
	var obj = {}, n_keys = 0, key;
	for(key in  left) { obj[key] =  left[key]; }
	for(key in right) { obj[key] = right[key]; }
	for(key in   obj) { n_keys++;}

	var sim = 100*n_keys;

	for(key in left) {
		var l_element = left[key];
		var r_element = right[key];

		if(typeof(r_element) === 'undefined') {
			sim -= 100;
		}
		else if(typeof(r_element) !== typeof(l_element)) {
			sim -= 100;
		}
		else if(typeof(r_element) === 'number') {
			sim -= Math.min(deviation(l_element, r_element), 100);
		}
		else if(typeof(r_element) === 'string') {
			sim -= Math.min(levenshtein_distance(l_element, r_element), 100);
		}
		else if(typeof(r_element) === 'object') {
			sim -= object_deviation(l_element, r_element);
		}

	}

	return deviation(n_keys*100, sim);
}

function adjustColor(str) {
	var green_toReplace = '#e6ffe6';
	var red_toReplace   = '#ffe6e6';

	var green_correct = '#33ff33';
	var red_correct   = '#ff3333';

	str = replaceAll(str, green_toReplace, green_correct);
	str = replaceAll(str, red_toReplace, red_correct);

	return str;
}

function getJson(name, table) {
	var q =  "SELECT * FROM " + table + " WHERE " + JSON_FILENAME + " = '" + name + "';";
	var results;

	try {
		results = alasqlQuery(q);
	} catch (e) {
		alert(e.message);
		return;
	}

	if (results.length == 0) {
		throw new JsonException("not found");
	}
	if (results[0] instanceof Array) {
		throw new JsonException("multiple");
	}

	return results[0];
}

function JsonException(message) {
	this.message = message;
	this.name = "JsonException";
}


function increaseFontSize(str, size) {
	str = "<font size=\"+" + size + "\">" + str + "</font>";
	return str;
}

function removeJsonName(str) {
	if(JSON.stringify(str) == "")
		return str;

	delete str[JSON_FILENAME];
	return JSON.stringify(str);
}

function prepareJson(name, val, withoutName) {
	delete val[JSON_FILENAME];

	var content = "<br>" + "<p style=\"font-family:'Bitstream Vera Sans Mono', 'DejaVu Sans Mono', Monaco, Courier, " +
		"monospace;font-size:12px;margin:0;padding:0;display:inline-block;\">" + JSON.stringify(val) + "</p>" + "<br>";

	if(withoutName)
		return content;
	else
		return "<br>" + bold(name) + content;
}

function prepareJsonBig(name, val, diffed) {
	if(val == "" || val === undefined)
		return "";

	return "<br>" + bold(name) + "<br>" + expandJson(JSON.stringify(val), diffed) + "<br>";
}

function compareJsons(originalJsons, name, val) {
	delete val[JSON_FILENAME];
	var content = JSON.stringify(val);
	var color = "black";

	// Is it given by the author?
	if(originalJsons[name] == undefined)
		color = "orange";

	// Is the same JSON String?
	else if(JSON.stringify(originalJsons[name]) === content)
		color = "green";

	// Nah, it must be something else
	else
		color = "red";

	content = prepareJson(name, val, true);

	var colored = "<font color=\"" + color + "\">" + content + "</font>";

	return "<br>" + bold(name) + colored;
}

function expandJson(str, diffed) {
	var spacesToAdd = 4;
	var spaces = 0;
	var output = "";
	var inArray = false;

	if(diffed) {
		str = str.substring(1, str.length-1);
		str = replaceAll(str, "\\\"", "\"");
	}

	for (var i = 0, len = str.length; i < len; i++) {
		var char = str[i];

		if (char === '{' || char === '[') {
			spaces += spacesToAdd;
			output += char + "<br>";
			output = addSpaces(output, spaces);
		}
		else if(char === ','){
			output += char + "<br>";
			output = addSpaces(output, spaces);
		}
		else if(char === '}' || char === ']') {
			spaces -= spacesToAdd;
			output += "<br>" + addSpaces(char, spaces, true);
		}
		else {
			output += char;
		}
	}
	return output + "<br>&nbsp;";
}


function checkFileAPI() {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		reader = new FileReader();
		return true;
	} else {
		alert('The File APIs are not fully supported by your browser. Fallback required.');
		return false;
	}
}

function createDropField(containerID, json, containerOver, initial, settings) {
	var target = document.getElementById(containerID);

	target.addEventListener("dragover", function(event) {
		event.preventDefault();
	}, false);

	target.addEventListener("drop", function(event) {

		// cancel default actions
		event.preventDefault();

		var files = event.dataTransfer.files;
		var i = 0, len = files.length;


		if (len < 1) {
//			alert("You need to drop at least one File!");
		} else if(len >= 1) {
			console.log("You dropped " + len + " file(s)");

			if(!additive) {
				console.log("Resetting Tables");
				var queryDrop = "DROP TABLE " + JSON_COMPARE_TABLE + ";\n";
				var queryCreate = "CREATE TABLE " + JSON_COMPARE_TABLE + ";\n";

				alasqlQuery(queryDrop + queryCreate);
			}

			readFiles(files, 0, len, json, containerOver, true, settings);
		}
	}, false);
}

function createFileSelector(containerTarget, json, containerOver, initial, settings) {
	// File Selector
	var containerFileSelect = document.createElement('input');
	containerFileSelect.type =  "file";
	containerFileSelect.id = "fileSelection";
	containerTarget.appendChild(containerFileSelect);
	containerFileSelect.onchange = function (event) {
		checkFileAPI();

		var filePath = this;
		if(filePath.files && filePath.files[0]) {

			if(!additive) {
				var queryDrop = "DROP TABLE " + JSON_COMPARE_TABLE + ";\n";
				var queryCreate = "CREATE TABLE " + JSON_COMPARE_TABLE + ";\n";

				alasqlQuery(queryDrop + queryCreate);
			}

			readFiles(filePath.files, 0, filePath.files.length, json, containerOver, true, settings);
		}//end if html5 filelist support
		else if(filePath && false) { //fallback to IE 6-8 support via ActiveX TODO multiple files, later
			alert("Your browser does not support HTML5");
			/*
			try {
				reader = new ActiveXObject("Scripting.FileSystemObject");
				var fileSelected = reader.OpenTextFile(filePath, 1); //ActiveX File Object
				file_content[number_files] = fileSelected.ReadAll(); //text contents of file
				file_extension[number_files] = fileSelected.getExtension();
				fileSelected.Close(); //close file "input stream"

				foundDatasource = true;

				while (containerOver.firstChild) {
					containerOver.removeChild(containerOver.firstChild);
				}

				buildContainerChartCompare(json, containerOver, true)
			} catch (e) {
				if (e.number == -2146827859) {
					alert('Unable to access local files due to browser security settings. ' +
						'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' +
						'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"');
				}
			}
			*/
		} else {
			alert("Your browser does not support HTML5");
		}


	}
}

function readFiles(files, current, len, json, containerOver, initial, settings) {
	if (current >= 0 && current < len) { // if we still have files left
		var file = files[current];
		current++;
		reader = new FileReader();

		reader.onload = function (e) {
			var file_content = e.target.result;
			var file_name  = file.name;
			var file_type = file.type;
			var file_size = file.size;
			var file_extension = getFileExtension(file_name);

			var query = "INSERT INTO " + JSON_COMPARE_TABLE + " VALUES @";
			query += normalizeJson(file_content, file.name);

			// TODO currently only json files
			if(contains(file_name, ".json"))
				alasqlQuery(query);
			else
				alert("Only .json files are supported, Your input: ." + file_extension);

			if(current == len) {
				foundDatasource = true;

				while (containerOver.firstChild) {
					containerOver.removeChild(containerOver.firstChild);
				}

				if(settings == "settings")
					buildContainerSettings(json, containerOver, initial);
				else if(settings == "chart")
					buildContainerChartCompare(json, containerOver, initial);
				else if(settings == "jsonView")
					buildContainerJsonView(json, containerOver, undefined, useTextCompare);
			}
		};

		reader.readAsText(file);
		readFiles(files, current, len, json, containerOver, initial, settings);
	}
}

function normalizeJson(json, name) {

	json = replaceAll(json, "[", "@[");

	if(!contains(json, "{") || !contains(json, "}")) {
		if(!json.trim().match("^{"))
			return "\"" + json + "\"";
		else
			return json;
	}

	json = json.trim();

	while(!json.match("}$")) {
		json = json.substring(0, json.length-1);
	}

	json = json.substring(0, json.length-1);
	json += ", \"" + JSON_FILENAME + "\": \"" + deleteExtension(name, ".json") + "\"}";

	return json;
}

function copyToClipboard(text) {
	window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

function addSpaces(str, x, before) {
	for(var i = 0; i < x; i++) {
		if(before)
			str = "&nbsp;" + str;
		else
			str += "&nbsp;";
	}
	return str;
}

function getScriptPath() {
	var scripts = document.getElementsByTagName('SCRIPT');
	var path = '';
	if(scripts && scripts.length>0) {
		for(var i in scripts) {
			if(scripts[i].src && scripts[i].src.match(/\/main\.js$/)) {
				path = scripts[i].src.replace(/(.*)\/main\.js$/, '$1');
				break;
			}

		}
	}
	return path;
};

function buildDataText(container, json, zoomFactor, style, containerOver) {
	var results;
	try {
		results = alasqlQuery(json.type.I.query);
	} catch (e) {
		alert(e.message);
		return;
	}
	var error;
	if (results.length == 0) {
		alert("Query \"" + json.type.I.query + "\" returns empty result!");
		return;
	}
	if (results[0] instanceof Array) {
		alert("Query \"" + json.type.I.query + "\" contains multiple statements!");
		return;
	}
	var c = 0;
	for ( var key in results[0]) {
		c++;
	}
	
	if (c == 0) {
		alert("Query \"" + json.type.I.query + "\" returns no columns!");
		return;
	}
	
	var tmp = "";
	for ( var r in results) {
		if (c > 1) {
			tmp += "(";
		}
		var trunc = false;
		for ( var key in results[r]) {
			tmp += results[r][key] + ", ";
			trunc = true;
		}
		if (trunc) {
			tmp = tmp.substring(0, tmp.length - 2);
		}
		if (c > 1) {
			tmp += "), ";
		}
	}
	if (c > 1) {
		tmp = tmp.substring(0, tmp.length - 2);
	}
	return tmp;
}

function buildDataTable(container, json, zoomFactor, style, containerOver) {
	var results;
	try {
		results = alasqlQuery(json.type.I.query);
	} catch (e) {
		alert(e.message);
		return;
	}
	var error;
	if (results.length == 0) {
		alert("Query \"" + json.type.I.query + "\" returns empty result!");
		return;
	}
	if (results[0] instanceof Array) {
		alert("Query \"" + json.type.I.query + "\" contains multiple statements!");
		return;
	}
	
	var vmode = json.type.I.verticalLines.trim();
	var hmodeh = json.type.I.horizontalLinesHeader.trim();
	var hmode = json.type.I.horizontalLinesBody.trim();
	
	var count = 0;
	for ( var key in results[0]) {
		++count;
	}
	
	if (count === 0) {
		alert("Query \"" + json.type.I.query + "\" returns no columns!");
		return;
	}
	
	// vertical lines
	var c = 0;
	var tmp = "\\begin{tabular}[t]{";
	if (vmode === "a" || vmode === "o" || vmode === "i" || vmode === "n") {
		for ( var key in results[0]) {
			if (vmode === "n") {
				tmp += "c";
			} else if (c === 0) {
				if (vmode === "a" || vmode === "o") {
					tmp += "|c";
				} else {
					tmp += "c";
				}
			} else {
				if (vmode === "a" || vmode === "i") {
					tmp += "|c";
				} else {
					tmp += "c";
				}
			}
			++c;
		}
		if (vmode === "a" || vmode === "o") {
			tmp += "|}";
		} else {
			tmp += "}";
		}
	} else {
		tmp += vmode + "}";
	}
	
	// header
	if (hmodeh === "a" || hmodeh === "o" || hmodeh === "i" || hmodeh === "n") {
		if (hmodeh === "a" || hmodeh === "o") {
			tmp += "\\firsthline ";
		}
	} else {
		var pattern = hmodeh.split(" ");
		if (pattern.length != 2) {
			alert("Format string is too short! Must contain exactly 2 format specifications. Format string was: " + hmodeh);
			return;
		}
		var first = pattern[0].split('');
		var firsth = true;
		for (var i = 0; i < first.length; ++i) {
			switch (first[i]) {
				case 'h':
					if (firsth) {
						tmp += "\\firsthline";
						firsth = false;
					} else {
						tmp += "\\hline"
					}
					break;
				case 'b':
					break;
				default:
					alert("Unknown format character found! Format string was: " + hmodeh);
					return;
			}
		}
		tmp += " ";
	}
	for ( var key in results[0]) {
		tmp += "\\textbf{" + key + "}&";
	}
	tmp = tmp.substring(0, tmp.length - 1) + "\\\\";
	if (hmodeh === "a" || hmodeh === "o" || hmodeh === "i" || hmodeh === "n") {
		if (hmodeh === "a" || hmodeh === "i") {
			tmp += "\\hline ";
		}
	} else {
		var pattern = hmodeh.split(" ");
		var second = pattern[1].split('');
		for (var i = 0; i < second.length; ++i) {
			switch (second[i]) {
				case 'h':
					tmp += "\\hline";
					break;
				case 'b':
					break;
				default:
					alert("Unknown format character found! Format string was: " + hmodeh);
					return;
			}
		}
		tmp += " ";
	}
	
	// body
	var pattern = hmode.split(" ");
	var i = 0;
	c = 0;
	for ( var r in results) {
		for ( var key in results[r]) {
			tmp += results[r][key] + "&";
		}
		tmp = tmp.substring(0, tmp.length - 1) + "\\\\";
		if (hmode === "a" || (hmode === "i" && c !== results.length - 1) || (hmode === "o" && c === results.length - 1)) {
			tmp += "\\hline ";
		} else if (hmode !== "a" && hmode !== "i" && hmode !== "o" && hmode !== "n") {
			var format = pattern[i++ % pattern.length].split('');
			for (var j = 0; j < format.length; ++j) {
				switch (format[j]) {
					case 'h':
						tmp += "\\hline";
						break;
					case 'b':
						break;
					default:
						alert("Unknown format character found! Format string was: " + hmodeh);
						return;
				}
			}
			tmp += " ";
		}
		++c;
	}
	tmp += "\\end{tabular}";
	
	return tmp;
}

function buildContainerPivotBig(json, containerOver, initial) {
	var basetextsize = 8;
	
	var updateData = function() {
		json.jsonBig.type.I.queryB = ref.editor.getValue();
		// TODO: save pivot table settings (aggr, aggrAtt, renderer)
		var r = getPivotTableData(json.jsonBig, true);
		json.resultBig = r.res;
		if (r.error != undefined) {
			error.innerHTML = 'Query status: Error! ' + r.error;
			containerOptions.style.visibility = 'hidden';
			containerChart.style.visibility = 'hidden';
			return;
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
			containerChart.style.visibility = 'visible';
		}
		
		var aggr = r.aggr;
		var aggrName = r.aggrName;
		var aggrAtt = r.aggrAttribute;
		
		$(containerContent).pivotUI(r.res, {
			aggregator : aggr
		}, true);
	};
	
	var viewerContainer = document.getElementById("viewerContainer");
	json.jsonBig = jQuery.extend(true, {}, json);
	var tip = "Tip: Drag and drop attributes to the row/column area.<br/>";
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip, [ json ], updateData, 'pivot table', false);
	
	var containerContent = ref.containerContent;
	var containerControl = ref.containerControl;
	var containerChart = ref.containerChart;
	var containerOptions = ref.options;
	var editor = ref.editor;
	var error = ref.error;
	editor.setValue(prettifySQL(json.jsonBig.type.I.queryB));
	
	var r = getPivotTableData(json.jsonBig, true);
	json.resultBig = r.res;
	if (r.error != undefined) {
		error.innerHTML = 'Query status: Error! ' + r.error;
		containerOptions.style.visibility = 'hidden';
		containerChart.style.visibility = 'hidden';
		return;
	} else {
		error.innerHTML = 'Query status: OK';
		containerOptions.style.visibility = 'visible';
		containerChart.style.visibility = 'visible';
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
	
	containerOver.update = updateData;
	containerOver.updateData = updateData;
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
	if ($.pivotUtilities.aggregators[aggrName] == undefined) {
		alert("Aggregator \"" + aggrName + "\" is not defined! Where: " + json.name);
	}
	var aggr = $.pivotUtilities.aggregators[aggrName]([ aggrAtt ]);
	var unused = [];
	for ( var key in r.res[0]) {
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
	container.getElementsByClassName("pvtTable")[0].setAttribute('style', 'width: 100%; height: 100%;');
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
		
		if (err == undefined) {
			try {
				getTableFromResults(results, containerContent);
			} catch (e) {
				err = e.message;
			}
		}
		
		if (err != undefined) {
			error.innerHTML = 'Query status: Error! ' + err;
			containerOptions.style.visibility = 'hidden';
			containerChart.style.visibility = 'hidden';
			return;
		} else {
			error.innerHTML = 'Query status: OK';
			containerOptions.style.visibility = 'visible';
			containerChart.style.visibility = 'visible';
		}
	};
	
	var viewerContainer = document.getElementById("viewerContainer");
	var tip = 'Tip: Click on the attributes to change the sorting.';
	json.jsonBig = jQuery.extend(true, {}, json);
	var ref = prepopulateContainerOver(containerOver, viewerContainer, tip, [ json ], update, 'table', false);
	
	var containerContent = ref.containerContent;
	var containerOptions = ref.options;
	var containerChart = ref.containerChart;
	var error = ref.error;
	
	var err;
	try {
		var results = alasqlQuery(json.jsonBig.type.I.queryB);
		json.resultBig = results;
	} catch (e) {
		err = e.message;
	}
	if (err != undefined) {
		error.innerHTML = 'Query status: Error! ' + err;
		containerOptions.style.visibility = 'hidden';
		containerChart.style.visibility = 'hidden';
		return;
	} else {
		error.innerHTML = 'Query status: OK';
		containerOptions.style.visibility = 'visible';
		containerChart.style.visibility = 'visible';
	}
	
	ref.editor.setValue(prettifySQL(json.jsonBig.type.I.queryB));
	
	getTableFromResults(results, containerContent);
	
	containerOver.update = function() {
		
	};
	
	containerOver.updateData = update;
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
	
	var leftArr;
	if (json.type.I.leftArr === "auto") {
		if (json.type.I.yUnitName != "") {
			leftArr = [ {
				text : json.type.I.yUnitName,
				c : yCount
			} ];
		} else {
			leftArr = [];
		}
	} else {
		try {
			leftArr = JSON.parse(json.type.I.leftArr);
		} catch (e) {
			alert("Parsing of leftArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.leftArr);
		}
	}
	
	var rightArr;
	if (json.type.I.rightArr === "auto") {
		rightArr = [];
		for (var i = 0; i < yValues.length; ++i) {
			rightArr[rightArr.length] = {
				text : yValues[i],
				c : 1
			};
		}
	} else {
		try {
			rightArr = JSON.parse(json.type.I.rightArr);
		} catch (e) {
			alert("Parsing of rightArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.rightArr);
		}
	}
	
	var topArr;
	if (json.type.I.topArr === "auto") {
		topArr = [];
		for (var i = 0; i < xValues.length; ++i) {
			topArr[topArr.length] = {
				text : xValues[i],
				c : 1
			};
		}
	} else {
		try {
			topArr = JSON.parse(json.type.I.topArr);
		} catch (e) {
			alert("Parsing of topArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.topArr);
		}
	}
	
	var bottomArr;
	if (json.type.I.bottomArr === "auto") {
		if (json.type.I.xUnitName != "") {
			bottomArr = [ {
				text : json.type.I.xUnitName,
				c : xCount
			} ];
		} else {
			bottomArr = [];
		}
	} else {
		try {
			bottomArr = JSON.parse(json.type.I.bottomArr);
		} catch (e) {
			alert("Parsing of bottomArr for " + json.name + " failed!\nError: " + e.message + "\nValue: " + json.type.I.bottomArr);
		}
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
	
	// TODO: right now only labels of one line height are supported!
	var fontbasesize = 15;
	var left = leftArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var right = rightArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var top = topArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var bottom = bottomArr.length != 0 ? fontbasesize * zoomFactor * 1.6 : 0;
	var options = getChartOptions(json, zoomFactor, {});
	var legend = options.legend.show ? fontbasesize * zoomFactor * 1.6 : 0;
	var inner = document.createElement('table');
	var charts = [];
	inner.setAttribute('style', 'height: 100%; width: 100%; border-collapse: collapse; text-align:center;');
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
		if (left != 0 && y == nextLeft) {
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
			if (json.result[x + y * Math.max(xCount, yCount)] == undefined) {
				chartdata = getChartData(json);
				if (chartdata.error != undefined) {
					alert(json.name + " has error:\n" + chartdata.error);
				}
				chartdata = chartdata.values;
				json.result[x + y * Math.max(xCount, yCount)] = chartdata;
			} else {
				chartdata = json.result[x + y * Math.max(xCount, yCount)];
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
		if (right != 0 && y == nextRight) {
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
		td.setAttribute('colspan', xCount);
		
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
	for ( var key in res[0]) {
		columns[columns.length] = {
			data : key,
			title : key
		};
	}
	
	$(table).dataTable({
		data : res,
		columns : columns,
		destroy : true
	});
}

function getTableFromResults(results, container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	
	if (typeof (results) == 'number') {
		var span = document.createElement('span');
		span.setAttribute('style', 'text-decoration: underline; font-weight: bold;');
		span.innerHTML = 'Result for Query:';
		container.appendChild(span);
		container.appendChild(getSpacer());
		var span = document.createElement('span');
		span.innerHTML = 'Query executed successfully.';
		container.appendChild(span);
	} else {
		for (var i = 0; i < results.length; ++i) {
			if (typeof (results[i]) == 'number') {
				var span = document.createElement('span');
				span.setAttribute('style', 'text-decoration: underline; font-weight: bold;');
				span.innerHTML = 'Result for Query' + (i + 1) + ':';
				container.appendChild(span);
				container.appendChild(getSpacer());
				var span = document.createElement('span');
				span.innerHTML = 'Query executed successfully.';
				container.appendChild(span);
				container.appendChild(getSpacer());
			} else if (results[i] instanceof Array) {
				var span = document.createElement('span');
				span.setAttribute('style', 'text-decoration: underline; font-weight: bold;');
				span.innerHTML = 'Result for Query' + (i + 1) + ':';
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
				span.setAttribute('style', 'text-decoration: underline; font-weight: bold;');
				span.innerHTML = 'Result for Query:';
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
			span.setAttribute('style', 'text-decoration: underline; font-weight: bold;');
			span.innerHTML = 'Result for Query:<br/>No rows returned.';
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
					fit : false
				},
			},
			y : {
				label : json.type.I.yUnitName,
				tick : {
					fit : false
				},
			},
			y2 : {
				tick : {
					fit : false
				}
			}
		},
		zoom : {
			enabled : true,
			rescale : false
		},
		point : {
			show : json.type.I.drawPoints
		},
		subchart : {
			show : json.type.I.showRangeSelector
		},
		completeScale : zoomFactor,
		legend : {
			position : 'bottom'
		},
		onresize : function() {
			$(chart).css('max-height', "100%");
			this.api.resize({
				height : $(chart).height(),
				width : $(chart).width()
			});
		},
	};
	
	jQuery.extend(true, options, defaultChartOptions);
	
	try {
		var addOpt = JSON.parse(json.type.I.options);
	} catch (e) {
		alert('Parsing of options for ' + json.name + ' failed. \nDid you forgot to enclose every field and value by ", or did your TeX program replace " by \'\'?\nRemember that the correct JSON String syntax is: "key": "value"\n JSON String was:\n' + json.type.I.options);
	}
	jQuery.extend(true, options, addOpt);
	
	if (options.axis.x.label == '') {
		delete options.axis.x.label;
	}
	if (options.axis.y.label == '') {
		delete options.axis.y.label;
	}
	if (json.type.I.includeZero) {
		options.axis.y.min = 0;
	}
	
	var defaultformat = function(v) {
		return (v || v === 0) ? +v : "";
	};
	var funcsave = options.axis.y.tick.format;
	funcsave = typeof funcsave == "function" ? optionsBig.axis.y.tick.format : defaultformat;
	if (json.type.I.logScale) {
		options.axis.y.tick.format = function(d) {
			return funcsave(+Math.exp(d).toFixed(2));
		};
	}
	
	switch (json.type.I.chartType) {
		case 'Line':
		case 'line':
			if (json.type.I.fillGraph) {
				options.data.type = 'area';
			} else {
				options.data.type = 'line';
			}
			break;
		case 'Bar':
		case 'bar':
			options.data.type = 'bar';
			break;
		case 'SignaturePlot':
		case 'signatureplot':
		case 'compareToBest':
		case 'comparetobest':
			try {
				options.data = compareToBest([ options.data ]);
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
	
	if (values.json != undefined && (isNaN(values.json[0][values.x])) && (options == undefined || options.axis == undefined || options.axis.x == undefined || options.axis.x.type == undefined)) {
		if (isValidDate(values.json[0][values.x])) {
			options.axis.x.type = "timeseries";
		} else {
			options.axis.x.type = "category";
		}
	}
	
	if (!($(chart).parent().children().last()[0] instanceof HTMLStyleElement)) {
		// add scoped css
		var css = document.createElement('style');
		css.setAttribute('scoped', 'scoped');
		$(chart).parent().append(css);
		var cssText;
		cssText += '.c3-line {																	'
		cssText += 'stroke-width: ' + (zoomFactor) + 'px; 										'
		cssText += '}																			'
		cssText += '.c3-circle._expanded_ {														'
		cssText += ' 	stroke-width: ' + (zoomFactor) + 'px;									'
		cssText += ' 	stroke: white; 															'
		cssText += ' }																			'
		cssText += ' .c3-selected-circle {														'
		cssText += ' 	fill: white;															'
		cssText += ' 	stroke-width: ' + (2 * zoomFactor) + 'px; 								'
		cssText += ' }																			'
		cssText += ' .c3-target.c3-focused path.c3-line, .c3-target.c3-focused path.c3-step {	'
		cssText += '	 stroke-width: ' + (2 * zoomFactor) + 'px; 								'
		cssText += ' }																			'
		cssText += ' .c3-legend-background {													'
		cssText += '	 opacity: 0.75;															'
		cssText += ' 	 fill: white;															'
		cssText += ' 	 stroke: lightgray;														'
		cssText += ' 	 stroke-width: ' + (zoomFactor) + '; 									'
		cssText += ' }																			';
		css.innerHTML = cssText;
	}

	// TODO this should be done somehow in a different way
	if(options.data.values != undefined) {
		options.data = options.data.values;
	}
	
	return options;
}

function prepopulateContainerOver(containerOver, viewerContainer, tip, jsonArr, update, f, fixed) {
	var json = jsonArr[0]; // pass by reference
	var containerChart = document.createElement('div');
	var style;
	if (fixed) {
		style = 'width:66%; height:95%; -moz-border-radius: 1%; -webkit-border-radius: 1%; border-radius: 1%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; vertical-align:top; white-space: normal;';
	} else {
		style = '-moz-border-radius: 1%; -webkit-border-radius: 1%; border-radius: 1%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; vertical-align:top; white-space: normal;';
	}
	containerChart.setAttribute('style', style);
	
	var containerControl = document.createElement('div');
	containerControl.setAttribute('style', 'width:30%; -moz-border-radius: 1%; -webkit-border-radius: 1%; border-radius: 1%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; text-align: left; white-space: normal;');
	
	var containerSwitch = document.createElement('div');
	containerSwitch.setAttribute('style', 'margin-bottom:5px; display: inline-block; vertical-align:top;');
	containerControl.appendChild(containerSwitch);
	
	containerControl.appendChild(getSpacer());
	containerControl.appendChild(getSpacer());
	
	var containerTip = document.createElement('div');
	containerTip.setAttribute('style', 'font-weight: bold;');
	containerTip.innerHTML = tip;
	containerControl.appendChild(containerTip);
	
	containerControl.appendChild(getSpacer());
	
	var header = document.createElement('span');
	header.innerHTML = '<span style="text-decoration:underline;">SQL Query for ' + f + ':</span><br />Tip: Press CTRL-Space for autocomplete.<br />Tip: Click outside of the editor area to execute a query.';
	containerControl.appendChild(header);
	
	var textareaWrapper = document.createElement('div');
	containerControl.appendChild(textareaWrapper);
	textareaWrapper.setAttribute('style', 'border: 1px solid black; margin-top: 3px; margin-bottom: 3px;');
	
	var textarea = document.createElement('textarea');
	textareaWrapper.appendChild(textarea);
	
	var def = document.createElement('input');
	def.type = 'button';
	def.value = 'Restore Default';
	def.setAttribute('style', 'font-size:inherit; white-space: normal;');
	def.addEventListener('click', function() {
		delete json.jsonBig;
		json.jsonBig = jQuery.extend(true, {}, json);
		
		while (containerOver.firstChild) {
			containerOver.removeChild(containerOver.firstChild);
		}
		switch (json.type.C) {
			case "pdbf.json.MultiplotChart":
			case "pdbf.json.Chart":
				buildContainerChartBig(json, containerOver, true);
				break;
			case "pdbf.json.Text":
			case "pdbf.json.DataText":
			case "pdbf.json.DataTable":
				buildContainerTableBig(json, containerOver);
				break;
			case "pdbf.json.Pivot":
				buildContainerPivotBig(json, containerOver, true);
				break;
		}
	});
	containerControl.appendChild(def);
	
	containerControl.appendChild(getSpacer());
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
	download.setAttribute('style', 'font-size:inherit; white-space: normal;');
	download.addEventListener('click', function() {
		var cols = [];
		for ( var key in json.resultBig[0]) {
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
		containerChartSub.setAttribute('style', 'width:100%; height:100%; max-height:100%; z-index:9999');
		containerChart.appendChild(containerChartSub);
	}
	
	var containerClose = document.createElement('div');
	containerClose.innerHTML = 'Click here to close this window (or press Escape) [X]';
	containerClose.setAttribute('style', 'float:right; cursor: pointer; font-weight: bold;');
	addClickCloseHandler(containerClose, containerOver);
	containerOver.appendChild(containerClose);
	
	var containerLabel = document.createElement('span');
	containerLabel.innerHTML = 'Switch representation:<br />';
	containerSwitch.appendChild(containerLabel);
	
	if (json.type.C != 'pdbf.json.Pivot') {
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
		containerSwitch.appendChild(document.createTextNode(' '));
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
	containerSwitch.appendChild(document.createTextNode(' '));
	
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
	editor.setValue(prettifySQL(json.type.I.query));
	editor.on('blur', update);
	$(".CodeMirror-cursor").text("");
	
	if (json.type.C == 'pdbf.json.MultiplotChart') {
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
		
		var multiControl = document.createElement('div');
		multiControl.setAttribute('style', 'text-decoration: underline; display: inline-block; margin-bottom: 7px;');
		multiControl.innerHTML = 'Multiplot Control:<br />';
		var selectX = document.createElement('select');
		selectX.setAttribute('style', 'display:inline-block; margin-bottom:3px;');
		for (var x = 0; x < json.type.I.xCount; ++x) {
			var option = document.createElement('option');
			option.innerHTML = xValues[x];
			selectX.appendChild(option);
		}
		multiControl.appendChild(selectX);
		var br = document.createElement('br');
		multiControl.appendChild(br);
		var selectY = document.createElement('select');
		selectY.setAttribute('style', 'display:inline-block; margin-bottom:3px;');
		for (var y = 0; y < json.type.I.yCount; ++y) {
			var option = document.createElement('option');
			option.innerHTML = yValues[y];
			selectY.appendChild(option);
		}
		multiControl.appendChild(selectY);
		
		containerControl.appendChild(document.createElement('br'));
		containerControl.appendChild(multiControl);
		
		var selectArr = [];
		for (var x = 0; x < json.type.I.xCount; ++x) {
			selectArr[xValues[x]] = [];
			for (var y = 0; y < json.type.I.yCount; ++y) {
				var cellquery = json.type.I.query;
				var yFirst = json.type.I.yFirst;
				if (yFirst) {
					cellquery = cellquery.replace("?", yValues[y]);
					cellquery = cellquery.replace("?", xValues[x]);
				} else {
					cellquery = cellquery.replace("?", xValues[x]);
					cellquery = cellquery.replace("?", yValues[y]);
				}
				selectArr[xValues[x]][yValues[y]] = cellquery;
			}
		}
		
		$(selectX).change(function() {
			var x = $(selectX).val();
			var y = $(selectY).val();
			json.jsonBig.type.I.query = selectArr[x][y];
			json.jsonBig.type.I.queryB = selectArr[x][y];
			editor.setValue(prettifySQL(json.jsonBig.type.I.query));
			containerOver.updateData();
		});
		
		$(selectY).change(function() {
			var x = $(selectX).val();
			var y = $(selectY).val();
			json.jsonBig.type.I.query = selectArr[x][y];
			json.jsonBig.type.I.queryB = selectArr[x][y];
			editor.setValue(prettifySQL(json.jsonBig.type.I.query));
			containerOver.updateData();
		});
		
		var x = $(selectX).val();
		var y = $(selectY).val();
		json.jsonBig.type.I.query = selectArr[x][y];
		json.jsonBig.type.I.queryB = selectArr[x][y];
		editor.setValue(prettifySQL(json.jsonBig.type.I.query));
	}
	
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

function getChartData(json, newDatasource) {
	var results;
	var query = json.type.I.query.trim();

	if(contains(query, JSON_TABLE)) {
		query = query.substring(0, query.length-1);
		query += "  ORDER BY " + JSON_FILENAME + "  ASC;"
	}

	if(newDatasource) {
		query = replaceAll(query, JSON_TABLE, JSON_COMPARE_TABLE);
	}

	try {
		results = alasqlQuery(query);
	}catch (e) {
		return {
			error: e.message
		};
	}

	var error;
	if (results.length == 0) {
		return {
			error : "Query \"" + query + "\" returns empty result!"
		};

	}
	if (results[0] instanceof Array) {
		return {
			error : "Query \"" + query+ "\" contains multiple statements!"
		};
	}
	var columns = [];
	for ( var key in results[0]) {
		columns[columns.length] = key;
	}
	var ret = {
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

	// logscale
	if (json.type.I.logScale == true) {
		for (var i = 0; i < ret.values.json.length; i++) {
			var logscaleValues = ret.values.json[i];
			for (var series = 0; series < ret.values.keys.value.length; ++series) {
				var logId = ret.values.keys.value[series];
				if (logId == ret.values.x) {
					continue;
				}
				var logVal = logscaleValues[logId];

				if (isNaN(logVal)) {
					throw "Error! Logscale is active and chart contains negative values!";
				}

				ret.values.json[i][logId] = Math.log(logVal);
			}
		}
	}

	return ret;
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
		var rows = JSON.parse(json.type.I.rows);
	} catch (e) {
		return {
			error : 'Parsing of rows for ' + (isBig ? json.name + 'Big' : json.name) + ' failed. \nDid you forgot to enclose every row by ", or did you TeX program replace " by \'\'?\n JSON String was:\n' + json.type.I.rows
		};
	}
	try {
		var cols = JSON.parse(json.type.I.cols);
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
	fullscreen.setAttribute('style', 'z-index:4; position:absolute; opacity:0.3; -webkit-transition:opacity 200ms ease-out; -moz-transition:opacity 200ms ease-out; -o-transition:opacity 200ms ease-out; transition:opacity 200ms ease-out;');
	fullscreen.innerHTML = "<img style=\"width:" + 17 * rawZoomFactor + "px; height:" + 17 * rawZoomFactor + "px;\" src=\"data:image/png;base64,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\"/>";
	$(fullscreen).hover(function() {
		this.style.opacity = 0.8;
	}, function() {
		this.style.opacity = 0.3;
	});
	return fullscreen;
}

function getCompareDiv() {
	var compare = document.createElement('div');
	var rawZoomFactor = PDFViewerApplication.pdfViewer._currentScale;
	compare.setAttribute('style', 'z-index:4; position:absolute; left: 10%; opacity:0.3; -webkit-transition:opacity 200ms ease-out; -moz-transition:opacity 200ms ease-out; -o-transition:opacity 200ms ease-out; transition:opacity 200ms ease-out;');
	compare.innerHTML = "<img style=\"width:" + 17 * rawZoomFactor + "px; height:" + 17 * rawZoomFactor + "px;\" src=\"data:image/png;base64,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\"/>";
	$(compare).hover(function () {
		this.style.opacity = 0.8;
	}, function () {
		this.style.opacity = 0.3;
	});
	return compare;
}

function getSettingDiv() {
	var setting = document.createElement('div');
	var rawZoomFactor = PDFViewerApplication.pdfViewer._currentScale;
	setting.setAttribute('style', 'z-index:4; position:absolute; left: 20%; opacity:0.3; -webkit-transition:opacity 200ms ease-out; -moz-transition:opacity 200ms ease-out; -o-transition:opacity 200ms ease-out; transition:opacity 200ms ease-out;');
	setting.innerHTML = "<img style=\"width:" + 17 * rawZoomFactor + "px; height:" + 17 * rawZoomFactor + "px;\" src=\"data:image/png;base64,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\"/>";
	$(setting).hover(function () {
		this.style.opacity = 0.8;
	}, function () {
		this.style.opacity = 0.3;
	});
	return setting;
	/*
	 var setting = document.createElement('input');
	 setting.type = "file";
	 setting.onchange = function (event) {
	 alert(this.value);
	 }
	 setting.setAttribute('style', 'z-index:4; position:absolute; left: 20%;');
	 return setting;
	 */
}

function GRUBBS_FILTER(arr, alpha) {
	var arr = arr.slice();
	if (!Array.isArray(arr)) {
		throw new Error("Argument of GRUBBS_FILTER is not an array!");
	}
	if (alpha == undefined) {
		var alpha = 0.05;
	}
	while (true) {
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
		var margin_of_error = MARGIN_OF_ERROR(arr);
		var avg = MEAN(arr);
		if (Z > ZCrit && margin_of_error / avg > 0.025) {
			arr.splice(Zindex, 1);
		} else {
			break;
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

function CONF_INT(arr, alpha) {
	if (!Array.isArray(arr)) {
		throw new Error("Argument of CONF_INT is not an array!");
	}
	var MOE = alasql.fn.MARGIN_OF_ERROR(arr, alpha); // TODO: maybe remove
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

function compareToBest(valuesArr) {
	var values = valuesArr[0]; // Call by reference
	if (values.keys == undefined)
		return values;
	var keys = values.keys.value;
	if (values.finished) {
		return values;
	}
	if (keys.length > 1) {
		throw new Error("compareToBest does only support one attribute");
	}
	values.x = "x";
	var aname = keys[0];
	keys[keys.length] = "x";
	var runtimes = values.json;
	
	if (Array.isArray(runtimes[0][aname])) {
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
	} else {
		var runtime_count = runtimes.length;
		var means = [];
		var min;
		var min_int;
		
		// calculate mean of each experiment, search minimum of conf. int. lower
		// bounds
		for (var i = 0; i < runtime_count; ++i) {
			var cur = runtimes[i][aname];
			means[i] = cur;
			var ci = [ cur, cur ];
			if (min_int == undefined || ci[0] < min_int[0]) {
				min = i;
				min_int = ci;
			}
		}
		
		var distance = []; // distance from best experiment
		
		for (var i = 0; i < runtime_count; ++i) {
			distance[i] = means[i] - min_int[1];
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
}

// TODO improve
function deleteExtension(str, ext) {
	if(contains(str, ext))
		return str.substring(0, str.length - ext.length);

	return str;
}

function logFile(value) {
	if(!logFileFounds)
		return;

	console.log("Found new Datasource");
//	console.log("----");
}

function getFileExtension(fileName) {
	var re = /(?:\.([^.]+))?$/; // To get the extension
	return replaceAll(re.exec(fileName)[1],",", "");
}

function bold(str) {
	return "<b>" + str + "</b>"
}

function alasqlQuery(q) {
//	console.log("Executing " + q);
	var results = alasql(q);
//	console.log(results);
	return results;
}

function getClosingTitle(containerOver) {
	var containerClose = document.createElement('div');
	containerClose.innerHTML = 'Click here to close this window (or press Escape) [X]';
	containerClose.setAttribute('style', 'cursor: pointer; font-weight: bold;');
	addClickCloseHandler(containerClose, containerOver);
	return containerClose;
}
function isInt(x) {
	var y = parseInt(x, 10);
	return !isNaN(y) && x == y && x.toString() == y.toString();
}

function prettifySQL(sql) {
	return sql; // TODO: Currently we dont support pretty printing sql because
	// pretty printing of alasql breaks quoted literals
}
