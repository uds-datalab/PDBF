nomove = false;
function consumeEvent(evt) {
	nomove = true;
}

// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) {window.performance = {now:Date.now}}
function tic () {tictime = performance.now()}
function toc(msg) {
	var dt = performance.now()-tictime;
	console.log((msg||'toc') + ": " + dt + "ms");
}

function replaceAll(str, s, r) {
	return str.split(s).join(r);
}

//Load the database
tic();
var tmp = UTF8ArrToStr(base64DecToArr(db_base64));
var tmp2 = dbjson_base64;
toc("Base64 decode time for DB");
tic();
if (tmp2 != "") {
	alasql.databases = JSON.parse(tmp2);
}
alasql(tmp);
toc("DB load time");

//Load config.json
var json;
json = JSON.parse(UTF8ArrToStr(base64DecToArr(json_base64)));
var pageOverlays = [];
for (i = 0; i < json.length; ++i) {
	parse(json[i]);
}
function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
}
function parse(json) {
	page = json.type.I.page;
	pageOverlay = pageOverlays[page];
	if (typeof pageOverlay == 'undefined') {
		pageOverlay = [];
		pageOverlays[page] = pageOverlay;
	}
	pageOverlay[pageOverlay.length] = json;
}
function display(json, page) {
	var zoomFactor = PDFViewerApplication.pdfViewer._currentScale * json.type.I.zoom;
	tic();
	var container = document.createElement('div');
	container.id = json.name;
	container.className = "overlay";
	var style = "z-index: 8; position: absolute; width:" + (json.type.I.x2 - json.type.I.x1) * 100 + "%; height:" + (json.type.I.y1 - json.type.I.y2) * 100 + "%; left:" + json.type.I.x1 * 100 + "%; bottom:" + json.type.I.y2 * 100 + "%;";
	
	switch(json.type.C) {
		case "pdbf.common.LineChart":
		case "pdbf.common.BarChart":
			try {
				var results = alasql(json.type.I.query);
				if (results.length == 0) {
					alert("Query \"" + json.type.I.query + "\" returns empty result!");
					return;
				}
				if (results[0] instanceof Array) {
					alert("Query \"" + json.type.I.query + "\" returns multiple statements!");
					return;
				}
				var values = [];
				var columns = [];
				for (key in results[0]) {
					columns[columns.length] = replaceAll(key, '_', ' ');
				}
				
				var curmain = results[0];
				var count = -1;
				for (key in curmain) {
					++count;
				
					//Try to parse as Number
					var next = false;
					for (var i=0; i<results.length; i++) {
						if (next) break;
						var cur = results[i];
						var val;
						if (count == 0) {
							val = [];
						} else {
							val = values[i];
						}
						var tmp;
						if (typeof(cur[key]) == "string") {
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
				
					//Try to parse as Date
					if (next) {
						next = false;
						for (var i=0; i<results.length; i++) {
							if (next) break;
							var cur = results[i];
							var val;
							if (count == 0) {
								val = [];
							} else {
								val = values[i];
							}
							var tmp;
							if (typeof(cur[key]) == "string") {
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
						alert("Parsing of " + json.name + " failed!");
						return;
					}
				
				}
				
				var options = { labels: columns, logscale: json.type.I.ylogScale , animatedZooms: true, labelsSeparateLines: true, legend: "always", axisLabelFontSize: 14, xAxisHeight: 14, axisLabelWidth: 52, titleHeight: 18, xLabelHeight: 18, yLabelWidth: 18, xlabel: json.type.I.xUnitName, ylabel: json.type.I.yUnitName, labelsDivStyles: { 'text-align': 'right', 'background': 'none', 'font-size': 14 }, axes: { x: { pixelsPerLabel: 50, logscale: json.type.I.xlogScale }, y: { pixelsPerLabel: 30 } }, labelsSeparateLines: true, gridLineWidth: 0.3, axisLineWidth: 0.3, highlightCircleSize: 2, strokeWidth: 1 };
				var addOpt = JSON.parse(json.type.I.options);
				function mergeAintoB(a, b) {
					for(var key in a){
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
				options.labelsDivStyles['font-size'] = options.labelsDivStyles['font-size'] * zoomFactor;
				options.gridLineWidth = options.gridLineWidth * zoomFactor;
				options.highlightCircleSize = options.highlightCircleSize * zoomFactor;
				options.strokeWidth = options.strokeWidth * zoomFactor;
				options.axisLineWidth = options.axisLineWidth * zoomFactor;
				if (options.xlabel == '') options.xlabel = undefined;
				if (options.ylabel == '') options.ylabel = undefined;
				if (options.axes.x.logscale == false) 
					options.axes.x.logscale = true;

				style = "background: white;" + style;
				container.setAttribute('style', style);
				page.appendChild(container);
				var g = new Dygraph(container, values, options );
			} catch(e) {
				alert(e);
			}
			break;
		case "pdbf.common.Text":
			container.addEventListener("click", function(){editor.setValue(json.type.I.query); execEditorContents();});
			container.setAttribute('style', style);
			page.appendChild(container);
			break;
		default:
			alert("Unknown: " + json.type.C);
			break;
	}
	toc("Display time for " + json.name);
}
function overlay(pageNr) {
	if (typeof pageOverlays[pageNr] != 'undefined') {
		var page = document.getElementById("pageContainer" + pageNr);
		for (var i = 0; i < pageOverlays[pageNr].length; ++i) {
			display(pageOverlays[pageNr][i], page)
		}
	}
}

//GUI.js
var execBtn = document.getElementById('execute');
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');

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
		var results = alasql(commands);
		toc("Executing SQL");
		
		tic();
		var tmp = "Result:<br/>";
		if (typeof(results) == 'number') {
			tmp += "Query executed successfully.<br/>";
		} else {
			for (var i=0; i<results.length; ++i) {
				if (typeof(results[i]) == 'number') {
					tmp += "Query executed successfully.<br/>";
				} else if (typeof(results[i][0]) != 'undefined') {
					tmp += '<table border="1" id="res' +i+ '" style="border-collapse: collapse; margin-top:1px; margin-bottom:2px;">'
					tmp += tableCreate(results[i]);
					tmp += '</table>';
				} else {
					tmp += '<table border="1" id="res' +i+ '" style="border-collapse: collapse; margin-top:1px; margin-bottom:2px;">'
					tmp += tableCreate(results);
					tmp += '</table>';
					break;
				}
			}
			if (results.length == 0) {
				tmp += 'No rows returned';
			}
		}
		outputElm.innerHTML = tmp;
		toc("Displaying results");
/*
		TODO:
 		tic();
		if (typeof(results) == 'number') {
			outputElm.innerHTML = "Result:<br/>Query executed successfully.<br/>";
		} else {
			outputElm.innerHTML = 'Result:<br/>';
			for (var i=0; i<results.length; ++i) {
				if (typeof(results[i]) == 'number') {
					outputElm.appendChild() = "Query executed successfully.<br/>";
				} else if (typeof(results[i][0]) != 'undefined') {
					outputElm.appendChild()'<table border="1" id="res' +i+ '" style="border-collapse: collapse; margin-top:1px; margin-bottom:2px;"></table>'
					var res = document.getElementById("res" + i);
					s[++j] = tableCreate(results[i], res);
				} else {
					outputElm.appendChild()'<table border="1" id="res' +i+ '" style="border-collapse: collapse; margin-top:1px; margin-bottom:2px;"></table>'
					var res = document.getElementById("res" + i);
					s[++j] = tableCreate(results, res);
					break;
				}
			}
			if (results.length == 0) {
				outputElm.innerHTML = 'No rows returned';
			}
			tmp += s.join('');
		}
		toc("Displaying results"); */
	}
	catch(e) {
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
		keys = [];
		for(key in res[0]) {
			s[++j] = '<th>';
			s[++j] = key;
			keys[keys.length] = key;
		};
		
		res.forEach(function(row){
			s[++j] = '<tr>';
			for(var i=0; i<keys.length; ++i) {
				s[++j] = '<td>';
				s[++j] = (typeof row[keys[i]] == 'undefined' ? '' : row[keys[i]]);
			};
		});
	}
	return s.join('');
}

function execEditorContents () {
	noerror();
	document.getElementById("SQLQuery").style.visibility='visible';
	execute (editor.getValue() + ';');
}

var editor = CodeMirror.fromTextArea(commandsElm, {
	mode: "text/x-sql",
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
	lineWrapping: true,
    matchBrackets: true,
	viewportMargin: Infinity,
	extraKeys: {"Ctrl-Space": "autocomplete"}
});
var cm = document.getElementsByClassName("CodeMirror")[0];
cm.addEventListener('mousedown', consumeEvent);
cm.addEventListener('mouseup', consumeEvent);

            var mydragg = function(){
                return {
                    move : function(divid,xpos,ypos,container){
						divid.style.left = xpos + 'px';
						divid.style.top = ypos + 'px';
                    },
                    startMoving : function(divid,container,evt){
						if (nomove) {
							nomove = false;
							return;
						}
						evt = evt || window.event;
                        var posX = evt.clientX,
                            posY = evt.clientY,
                        divTop = divid.style.top,
                        divLeft = divid.style.left,
                        eWi = parseInt(divid.style.width),
                        eHe = parseInt(divid.style.height),
                        cWi = parseInt(document.getElementById(container).style.width),
                        cHe = parseInt(document.getElementById(container).style.height);
                        document.getElementById(container).style.cursor='move';
                        divTop = divTop.replace('px','');
                        divLeft = divLeft.replace('px','');
                        var diffX = posX - divLeft,
                            diffY = posY - divTop;
                        document.onmousemove = function(evt){
                            evt = evt || window.event;
                            var posX = evt.clientX,
                                posY = evt.clientY,
                                aX = posX - diffX,
                                aY = posY - diffY;
                                if (aX < 0) aX = 0;
                                if (aY < 0) aY = 0;
                                if (aX + eWi > cWi) aX = cWi - eWi;
                                if (aY + eHe > cHe) aY = cHe -eHe;
                            mydragg.move(divid,aX,aY,container);
                        }
                    },
                    stopMoving : function(container){
                        var a = document.createElement('script');
                        document.getElementById(container).style.cursor='default';
                        document.onmousemove = function(){}
                    },
                }
            }();
			
debugmode = 0;			
window.addEventListener('keydown', function keydown(evt) {
	if (evt.keyCode == 81) { //81 == 0x51 == 'Q'
		list = document.getElementsByClassName("overlay");
		if (debugmode == 3) {
			for (var i=list.length-1; i>=0; --i) {
				list[i].setAttribute('class', 'overlay');
			}
			debugmode = 0;
		} else if (debugmode == 0) {
			for (var i=list.length-1; i>=0; --i) {
				list[i].setAttribute('class', 'overlay debug');
			}
			debugmode = 1;
		} else if (debugmode == 1) {
			for (var i=list.length-1; i>=0; --i) {
				if (list[i].children.length > 0) {
					list[i].children[0].setAttribute('class', 'hide');
					list[i].setAttribute('style', list[i].getAttribute('style').substring(18, list[i].getAttribute('style').length));
				}
			}
			debugmode = 2;
		} else {
			for (var i=list.length-1; i>=0; --i) {
				if (list[i].children.length > 0) {
					list[i].children[0].setAttribute('class', '');
					list[i].setAttribute('style', 'background: white;' + list[i].getAttribute('style'));
				}
				list[i].setAttribute('class', 'overlay hide');
			}
			debugmode = 3;
		}
	}
});