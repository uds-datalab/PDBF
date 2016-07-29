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

var graphs = {}

function createGraph(json, edgeList, canvasId, phantomJS, display) {
	var edges = edgeList.split(",");
	var degreeList = {};
	var g = new Graph();
	for(var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		var node1 = edge.split("_")[0];
		var node2 = edge.split("_")[1];
		if (node1 in degreeList) {
			degreeList[node1].push(node2);
		}
		else {
			degreeList[node1] = [node2];
		}
		if (node2 in degreeList) {
			degreeList[node2].push(node1);
		}
		else {
			degreeList[node2] = [node1];
		}
		if(display) {
		    g.addEdge(node1, node2);
		}
	}
	if(display) {
        var layouter = new Graph.Layout.Spring(g);
        layouter.layout();
        var renderer;
        if(canvasId == "canvas"+json.type.I.graphID) {
                renderer = new Graph.Renderer.Raphael(canvasId, g, (json.type.I.x2 - json.type.I.x1 + 0.001) * 1000,
                        (json.type.I.y1 - json.type.I.y2 + 0.001) * 1000 * 1.40, canvasId, true);
                graphs[canvasId] = renderer;
        }
        else {
            var width;
            var height;
            if(canvasId == "canvasRight"+json.type.I.graphID || canvasId == "canvasLeft"+json.type.I.graphID+"Comapre" || canvasId == "canvasLeft"+json.type.I.graphID+"SavedComparison"){
                width = document.getElementById(document.getElementById(canvasId).parentElement.getAttribute("id")).offsetWidth;
                height = document.getElementById(document.getElementById(canvasId).parentElement.getAttribute("id")).offsetHeight;
                width = width - width/10;
                height = height - height/10;
            }
            else{
                width = document.getElementById(json.name+"SliderWrapper").offsetWidth;
                height = document.getElementById(json.name+"SliderWrapper").offsetHeight;
            }

            renderer = new Graph.Renderer.Raphael(canvasId, g, width, height, canvasId, true);
        }
        renderer.draw();

        if(phantomJS) {
            var svg = document.getElementById(canvasId).firstChild;
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            var viewBox = "0 0 "+document.getElementById("container").offsetWidth/4+" "+document.getElementById("container").offsetHeight/4;
            console.log(viewBox);
            svg.setAttribute("viewBox", viewBox);
            svg.setAttribute("preserveAspectRatio","xMaxYMax");
            svg.setAttribute("background-size", "contain");
        }
    }
	return degreeList;
}

function showDegree(ellipse) {
    var para = document.getElementById("para"+ellipse.getAttribute("id"));
    var cy = ellipse.getAttribute("cy");
    var cx = ellipse.getAttribute("cx");
    para.style.position = 'absolute';
    para.style.top = cy;
    var canvasRight = eval(ellipse.getAttribute("canvasRight"));
    if(canvasRight) {
        para.style.left = (screen.width/2000) + cx;
    }
    else{
        para.style.left = cx;
    }
    para.style.backgroundColor = "#FFFFCC";
    para.style.border = "thin solid black";
    para.style.display = '';
}

function hideDegree(ellipse) {
    var para = document.getElementById("para"+ellipse.getAttribute("id"));
    para.style.display = "none";
}

function toggle(canvasId, nodeID, ellipse, neighbours) {
    var canvas = document.getElementById(canvasId);
	var para = document.createElement('p');
	para.id = "para"+canvasId+"_"+nodeID;
	para.innerHTML = "Degree " + neighbours.length + "<br>" + "Connected to " + neighbours;
	canvas.appendChild(para);
	para.style.display = "none";
	ellipse.setAttribute('onmouseover', "showDegree(this);");
	ellipse.setAttribute('onmouseout', "hideDegree(this);");
}

function displayDegreeOnHover(canvasId, degreeList, canvasRight) {
	for(var nodeID in degreeList) {
		var ellipse = document.getElementById(canvasId+"_"+nodeID);
		var neighbours = degreeList[nodeID];
		ellipse.setAttribute("canvasRight", canvasRight);
		toggle(canvasId, nodeID, ellipse, neighbours);
	}
}

function b64toBlob(b64Data, contentType) {
	var binary = atob(b64Data.replace(/\s/g, ''));
	var len = binary.length;
	var buffer = new ArrayBuffer(len);
	var array = new Uint8Array(buffer);
	for (var i = 0; i < len; i++) {
	 array[i] = binary.charCodeAt(i);
	}             
	var blob = new Blob( [array], { type: contentType });
	return blob;
}

var edgeLists = {};
var graphJsons = {};
var chartJsons = {};


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
	var containerOverSavedComparison = document.getElementById(json.name + "SavedComparison");

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
		case "pdbf.json.Graph":
		    graphJsons[json.type.I.graphID] = json;
			if(json.type.I.customImage == null) {
				if(!phantomJS) {
	                var compare = getCompareDiv();
					container.appendChild(compare);
					var savedComparison = getSavedComparisonDiv("graph");
					container.appendChild(savedComparison);
				}
				var graphId = json.type.I.graphID;
				var canvas = document.createElement('div');
				var canvasId = "canvas"+graphId;
				canvas.id = canvasId;
				canvas.style.width = "100%";
				canvas.style.height = "100%";
				container.appendChild(canvas);
				var edgeList = json.type.I.edgeList;
				edgeLists["left"+graphId] = edgeList;
				var degreeList = createGraph(json, edgeList, canvasId, phantomJS, true);
				if(!phantomJS) {
					displayDegreeOnHover(canvasId, degreeList, false);
					compare.addEventListener("click", function() {
						if (containerOverCompare == null) {
							containerOverCompare = document.createElement('div');
							containerOverCompare.setAttribute('style', styleBig);
							containerOverCompare.id = json.name + "Compare";
							containerOverCompare.className = "centerhv";
							buildContainerGraph(json, containerOverCompare, true, phantomJS);
						}
						containerOverCompare.style.visibility = 'visible';
						containerOverCompare.style['z-index'] = 9;
						containerOverCompare.style.opacity = 1;
						$("svg").css('display', 'none');
						$("svg").css('height');
						$("svg").css('display', 'initial');// HACK for redraw of
						// SVG
					});
	                if(containerOverSavedComparison == null) {
	                    containerOverSavedComparison = document.createElement('div');
	                    containerOverSavedComparison.setAttribute('style', styleBig);
	                    containerOverSavedComparison.id = json.name + "SavedComparison";
	                    containerOverSavedComparison.className = "centerhv";
	                    buildContainerGraph(json, containerOverSavedComparison, false, phantomJS);
	                }
	                var initial = true;
	                savedComparison.addEventListener("click", function() {
						var savedGraphs = document.getElementById(json.name+"ImageSlider").children;
	                    slideImages(json, initial);
	                    initial = false;
	                    if(savedGraphs.length > 0) {
	                        document.getElementById("removeComparisonGraph_"+graphId).disabled = false;
	                    }
	                    else {
	                        document.getElementById("removeComparisonGraph_"+graphId).disabled = true;
	                    }
					    containerOverSavedComparison.style.visibility = 'visible';
	                    containerOverSavedComparison.style['z-index'] = 9;
	                    containerOverSavedComparison.style.opacity = 1;
	                    $("svg").css('display', 'none');
	                    $("svg").css('height');
	                    $("svg").css('display', 'initial');// HACK for redraw of
					});
				}
			}
			/*
			else{
				var base64encodedFile = json.type.I.base64encodedFile;
				console.log(base64encodedFile);
				var fileFormat = json.type.I.customImage.split(".").pop();
				var contentType = "";
				switch(fileFormat) {
				case "png":
					contentType = "image/png";
					break;
				case "jpg":
					contentType = "image/jpg";
					break;
				case "jpeg":
					contentType = "image/jpeg";
					break;
				default:
					break;
				}
				var blob = b64toBlob(base64encodedFile, contentType);
				var url = URL.createObjectURL(blob);
				var image = document.createElement("img");
				image.src = url;
				container.appendChild(image);
			}
			*/
			container.setAttribute('style', style);
			break;
			
		case "pdbf.json.Attachment":
	        var base64encodedFile = json.type.I.base64encodedFile;
	        var fileName = json.type.I.fileName;
	        var target = json.type.I.target;
	        if(target === "download") {
	            var container1 = document.createElement('a');
	            container1.id = "attachment"+json.type.I.attachmentID;
	            container1.download = fileName;
	            container.appendChild(container1);
	            container.title = fileName;
	            container.href = "#";
	            container.addEventListener("click",
	                function (event) {
	                    var contentType = 'application/octet-stream';
	                    var blob = b64toBlob(base64encodedFile, contentType);
	                    var blobUrl = URL.createObjectURL(blob);
	                    var downloadLink = document.getElementById("attachment"+json.type.I.attachmentID);
	                    downloadLink.href = blobUrl;
	                    downloadLink.click();
	                },
	                false);
	            style += ("cursor: pointer;");
	        }
	        else if(target === "view") {
	            var container1 = document.createElement('a');
	            container1.id = "attachment"+json.type.I.attachmentID;
	            container1.target = "_blank";
	            container.appendChild(container1);
	            var fileFormat = fileName.split(".").pop();
	            var contentType = "";

	            switch(fileFormat) {
	                case "png":
	                    contentType = "image/png";
	                    break;
	                case "jpg":
	                    contentType = "image/jpg";
	                    break;
	                case "jpeg":
	                    contentType = "image/jpeg";
	                    break;
	                case "txt":
	                    contentType = "text/plain";
	                    break;
	                case "pdf":
	                    contentType = "application/pdf";
	                    break
	                case "html":
	                    contentType = "text/html";
	                default:
	                    break;
	            }

	            container.addEventListener("click",
	                function (event) {
	                    if(contentType == "application/pdf") {
	                        var url = "data:"+contentType+";base64,"+base64encodedFile;
	                    }
	                    else{
	                        var blob = b64toBlob(base64encodedFile, contentType);
	                        var url = URL.createObjectURL(blob);
	                    }
	                    var viewLink = document.getElementById("attachment"+json.type.I.attachmentID);
	                    viewLink.href = url;
	                    viewLink.click();
	                },
	                false);
	            style += ("cursor: pointer;");
	        }
	        container.setAttribute('style', style);
	        break;
	        
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

function getSavedComparisonDiv(type) {
    var savedComparison = document.createElement('div');
    var left;
    if(type == "graph") {
        left = "15%";
    }
    else if(type == "chart") {
        left = "30%";
    }
	var rawZoomFactor = PDFViewerApplication.pdfViewer._currentScale;
	savedComparison.setAttribute('style', 'z-index:4; position:absolute; left: '+left+'; opacity:0.3; -webkit-transition:opacity 200ms ease-out; -moz-transition:opacity 200ms ease-out; -o-transition:opacity 200ms ease-out; transition:opacity 200ms ease-out;');
	savedComparison.innerHTML = "<img style=\"width:" + 17 * rawZoomFactor + "px; height:" + 17 * rawZoomFactor + "px;\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAkklEQVR4Ae3WMQ6CQBSE4f80K/HsJgjhXIgCnTo2Vq5Ls2Mhef90FHwJyUvgL4qODKzoYws9jef1V1TY5CAGtLGO6tZNYKY6vVd+7gMCOHDmhipXvI/EBdWvfB8nZFrhPkYrMJN1R9ZlPfYPBPAMoBoIQDsAAggggOXXvy29FWjJapiQaSMJvhEds+HjtCSiyNgLtMH2dRdtN/AAAAAASUVORK5CYII=\"/>";
	$(savedComparison).hover(function () {
		this.style.opacity = 0.8;
	}, function () {
		this.style.opacity = 0.3;
	});
	return savedComparison;
}

function getCloseDiv(json) {
	var close = document.createElement('div');
	close.id = "closeDiv_"+json.type.I.graphID;
	var rawZoomFactor = PDFViewerApplication.pdfViewer._currentScale;
	close.setAttribute('style', 'z-index:4; position:absolute; right: 5%; opacity:0.3; -webkit-transition:opacity 200ms ease-out; -moz-transition:opacity 200ms ease-out; -o-transition:opacity 200ms ease-out; transition:opacity 200ms ease-out;');
	close.innerHTML = "<img style=\"width:" + 25 * rawZoomFactor + "px; height:" + 25 * rawZoomFactor + "px;\" src=\"data:image/png;base64,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\"/>";
    close.setAttribute("onmouseover", "closeDivMouseOver(this);");
    close.setAttribute("onmouseout", "closeDivMouseOut(this);");
	return close;
}

function closeDivMouseOver(closeDiv) {
    closeDiv.style.opacity = 1.0;
}

function closeDivMouseOut(closeDiv) {
    closeDiv.style.opacity = 0.5;
}

function buildContainerGraph(json, containerOver, compare, PhantomJS) {

	var viewerContainer = document.getElementById("viewerContainer");
	viewerContainer.appendChild(containerOver);

	var styleParent = 'position: fixed; z-index: 9; border: 1px solid black; padding: 10px; width: 45%; height: 80%; '
		+ 'opacity: 1; visibility: visible; transition: opacity 500ms ease-out; overflow-x: auto; overflow-y: scroll; white-space: nowrap;';

	var style = 'width: 45%; height: 85%; padding:2%; background:white; margin:1%; margin-top:2em; display: inline-block; text-align: left; white-space: normal;';

	var containerClose = getClosingTitle(containerOver);
	containerOver.appendChild(containerClose);

	var containerLeft = document.createElement('div');
	containerLeft.setAttribute('style', styleParent);
	containerLeft.id = "left";
	containerLeft.style.background = "white";
	containerOver.appendChild(containerLeft);

	var graphId = json.type.I.graphID;
	var canvas = document.createElement('div');
	var canvasId;

	if(compare) {
	    canvasId = "canvasLeft"+graphId+"Comapre";
	}
	else{
	    canvasId = "canvasLeft"+graphId+"SavedComparison";
	}
	canvas.id = canvasId;
	containerLeft.appendChild(canvas);
	var edgeList = json.type.I.edgeList;
	var degreeList = createGraph(json, edgeList, canvasId, PhantomJS, true);
	displayDegreeOnHover(canvasId, degreeList, false);

	var containerRight = document.createElement('div');
    containerRight.setAttribute('style',  "background: white; overflow-x: auto; overflow-y: scroll;" + style + "float:right;");
	containerRight.id = "right";
	containerOver.appendChild(containerRight);

    if(compare) {
        checkFileAPI();
        graphFileSelector(json, containerRight);
        var containerRed = getContainerRed(graphId);
        containerRight.appendChild(containerRed);
       }
    else {
        getRemoveComparisonButton(json, containerRight, "graph");
        var sliderWrapper = getSliderWrapperDiv(json, containerRight);
        var imageSlider = getImageSliderDiv(json, sliderWrapper);
        var spanPrev = document.createElement("span");
        spanPrev.id = json.name+"prevImg";
        var spanNext = document.createElement("span");
        spanNext.id = json.name+"nextImg";
        var spanPrevStyle = "position:absolute; top: 50%; height: 50px; width: 30px; opacity: 0.6; background: #000 no-repeat center; left: 0px;";
        var spanNextStyle = "position:absolute; top: 50%; height: 50px; width: 30px; opacity: 0.6; background: #000 no-repeat center; right: 0px;";
        spanPrev.style = spanPrevStyle;
        spanNext.style = spanNextStyle;
        spanPrev.innerHTML = "<img style=\"width:" + "30" + "px; height:" + "50" + "px;\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAvCAIAAACdXSa5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAEKSURBVFhH7dG9jkRQGMbxvVqVcAls6xK09AoXwHUQCo2PxszuzqxynhyvCbHOhz3FJHP+hbznFb8IH5bujKgnI+rJiHo6Kdq2TdOuk6LrujTtOiOCS5IkCAI6b1MWwVVVNU3TOI602qYmgivL8peV5zlttymIM3dnYTj6lLKiJIekRDxfFIUMh8TizN1YQg4JxDWHQcihQxEPoyzLfpbiOKZ73A7FT1bTNN9L/xXnfN8fhmEWoyiiLTfxnwHa9/0XKwxD2h4nFpESKiUioF3XXVl8VFZEnue1bXthcVAFEcmgaiJ6org6jkPbVcoiAlrXdZqmdN52RkRA/3xB9DIiJyPqyYh6ekfRsh4giVKH57ju4gAAAABJRU5ErkJggg==\"/>";
        spanNext.innerHTML = "<img style=\"width:" + "30" + "px; height:" + "50" + "px;\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAsCAIAAAAB9bSZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAADzSURBVEhL7dA7CoNAFIXhrNZKdAma1iXYam/hAnQdihY2PhrzjmUO4wgS7sxcITbBvxpGzsfgyfpFh0J3KHQ7K7ZtyxMjpeK6rjwxopUgCJIk4UO0Mo7jNE1VVTEhWsnz/C0qy5ID0QqW2L9EHEj3d/mQUkFrqCgKDaRT0Aw9RRrIoCAssddDZgXFcfxYyrIM0JfFVe5LTdOcRfKbiKVEUTQTwzD4vi9vV5mVMAxvor7vSQIZFA6BdAqIq6jrOg2BlAqIi6htW8/z5K0iWtlEIEJxHAdjPoHot6RpWtc1k0C0gufwCbSnsrVDoTsUun9TLOsDFZIfRlBNnxAAAAAASUVORK5CYII=\"/>";
        sliderWrapper.appendChild(spanPrev);
        sliderWrapper.appendChild(spanNext);
    }
	fixOverlaySize();
}

function getSliderWrapperDiv(json, containerRight) {
    var sliderWrapper = document.getElementById(json.name+"SliderWrapper");
    if(sliderWrapper == null) {
        sliderWrapper = document.createElement("div");
        sliderWrapper.id = json.name+"SliderWrapper";
        var sliderWrapperStyle = "overflow: hidden; position:relative; height:100%; width:100%; top:auto;";
        sliderWrapper.style =  sliderWrapperStyle;
        containerRight.appendChild(sliderWrapper);
    }
    return sliderWrapper;
}

function getImageSliderDiv(json, sliderWrapper) {
    var imageSlider = document.getElementById(json.name+"ImageSlider");
    if(imageSlider == null) {
        imageSlider = document.createElement("ul");
        var imageSliderStyle = "position: relative; height: auto; list-style: none; overflow: hidden; float: left; margin:0px;";
        imageSlider.style =  imageSliderStyle;
        imageSlider.id = json.name+"ImageSlider";
        sliderWrapper.appendChild(imageSlider);
    }
    return imageSlider;
}

var ul;
var listItems;
var imageNumber;
var imageWidth;
var prev, next;
var currentPostion = 0;
var currentImage = 0;

function slideImages(json, initial){
	ul = document.getElementById(json.name+"ImageSlider");
    listItems = ul.children;
	imageNumber = listItems.length;
	
	if(imageNumber > 0) {
        imageWidth = listItems[0].children[0].clientWidth;
	}
	ul.style.width = parseInt(imageWidth * imageNumber) + 'px';

	if(!initial) {
	    if(currentImage == listItems.length) {
	        prev.click();
	    }
	}

    if(initial) {
        prev = document.getElementById(json.name+"prevImg");
        next = document.getElementById(json.name+"nextImg");
        prev.setAttribute("onclick", "clickPrev(this);");
        next.setAttribute("onclick", "clickNext(this);");
    }
}

function clickPrev(prev) {
    if (currentImage == 0){
		slideTo(imageNumber - 1);
	}
	else{
		slideTo(currentImage - 1);
	}
}

function clickNext(next) {
	if (currentImage == imageNumber - 1){
		slideTo(0);
	}
	else{
		slideTo(currentImage + 1);
	}
}

function animate(opts){
	var start = new Date;
	var id = setInterval(function(){
		var timePassed = new Date - start;
		var progress = timePassed / opts.duration;
		if (progress > 1){
			progress = 1;
		}
		var delta = opts.delta(progress);
		opts.step(delta);
		if (progress == 1){
			clearInterval(id);
			opts.callback();
		}
	}, opts.delay || 17);
}

function slideTo(imageToGo){
	var direction;
	var numOfImageToGo = Math.abs(imageToGo - currentImage);
	direction = currentImage > imageToGo ? 1 : -1;
	currentPostion = -1 * currentImage * imageWidth;
	var opts = {
		duration:1000,
		delta:function(p){return p;},
		step:function(delta){
			ul.style.left = parseInt(currentPostion + direction * delta * imageWidth * numOfImageToGo) + 'px';
		},
		callback:function(){currentImage = imageToGo;}
	};
	animate(opts);
}

function getContainerRed(graphId) {
	document.getElementById("graphFileSelector_"+graphId).disabled = false;
	document.getElementById("saveComparisonGraph_"+graphId).disabled = true;
	var containerRed = document.createElement("div");
	containerRed.id = "containerRed"+graphId;
	var styleRed = 'width:100%; height:100%; background:red; text-align:center; vertical-align:middle';
	containerRed.setAttribute('style', styleRed);
	return containerRed;
}

function showGraphFileFormatAlert() {
	alert("Only .txt file format is supported with each tab seperated nodeID pair on each line representing an edge; \n" +
		"nodeA <tab> nodeB \n" +
		"nodeB <tab> nodeC \n" +
		"nodeA <tab> nodeC \n" +
		". \n" +
		". \n" +
		".");
}

function getEdgeList(graphFile) {
	var edges = graphFile.split("\n");
	var edgeList = "";
	for(i = 0; i < edges.length; i++) {
		var e = edges[i];
		if(e.length > 1 && e.search(".+(\t).+") != -1 && e.split("\t").length == 2) {
			var node1 = e.split("\t")[0].trim();
			var node2 = e.split("\t")[1].trim();
			if(edgeList.indexOf(node1+"_"+node2) == -1 || edgeList.indexOf(node2+"_"+node1) == -1) {
				if(edgeList == "") {
					edgeList += (node1+"_"+node2);
				}
				else{
					edgeList += (","+node1+"_"+node2);
				}
			}
			else{
				return -1;
			}
		}
	}
	return edgeList;
}

function removeGraphComparison(removeButton) {
     var graphId = removeButton.getAttribute("id").split("_")[1];
     var json = graphJsons[graphId];
     var imageSlider = document.getElementById(json.name+"ImageSlider");
     var imageToRemove = imageSlider.children[currentImage];
     imageSlider.removeChild(imageToRemove);
     slideImages(json, false);
     var savedGraphs = document.getElementById(json.name+"ImageSlider").children;
     if(savedGraphs.length == 0) {
         document.getElementById("removeComparisonGraph_"+graphId).disabled = true;
     }
 }

 function removeChartComparison(removeButton) {
     var overlayName = removeButton.getAttribute("id").split("_")[1];
     var json = chartJsons[overlayName];
     var imageSlider = document.getElementById(json.name+"ImageSlider");
     var imageToRemove = imageSlider.children[currentImage];
     imageSlider.removeChild(imageToRemove);
     slideImages(json, false);
 }

function getRemoveComparisonButton(json, containerRight, mode) {
    var removeButton = document.createElement('button');
    removeButton.innerHTML = "remove this comparison";
    containerRight.appendChild(removeButton);
    removeButton.style.float = "right";
    containerRight.appendChild(removeButton);
    if(mode == "graph") {
        var graphId = json.type.I.graphID;
        removeButton.id = "removeComparisonGraph_"+graphId;
        removeButton.setAttribute("onclick", "removeGraphComparison(this);");
	}
	else if(mode == "chart") {
        var overlayName = json.name;
        removeButton.id = "removeComparisonChart_"+overlayName;
        removeButton.setAttribute("onclick", "removeChartComparison(this);");
	}
}

function saveGraphComparison(saveButton) {
    var graphId = saveButton.getAttribute("id").split("_")[1];
    var json = graphJsons[graphId];
    var savedGraphs = document.getElementById(json.name+"ImageSlider").children;
    var rightGraphEdgeList = edgeLists["right"+graphId];
    var sliderWrapper = getSliderWrapperDiv(json, "");
    var imageSlider = getImageSliderDiv(json, sliderWrapper);
    var listItem = document.createElement("li");
    listItem.id = "li";
    listItem.style = "position: relative; float: left; width: 100% height: 100%";
    imageSlider.appendChild(listItem);
    var canvas = document.createElement('div');
    var canvasId = "graph"+graphId+"savedGraph"+(savedGraphs.length-1);
    canvas.id = canvasId;
    listItem.appendChild(canvas);
    var edgeList = rightGraphEdgeList;
    var degreeList = createGraph(json, edgeList, canvasId, false, true);
    displayDegreeOnHover(canvasId, degreeList, true);
    var next = document.getElementById(json.name+"nextImg");
    if(imageSlider.children.length == 1) {
        next.click();
    }
    saveButton.disabled = true;
}

function saveChartComparison(saveButton) {
    var overlayName = saveButton.getAttribute("id").split("_")[1];
    var chart = document.getElementById("rightCompare"+overlayName).children[1].cloneNode(true);
    var json = chartJsons[overlayName];
    var sliderWrapper = getSliderWrapperDiv(json, "");
    var imageSlider = getImageSliderDiv(json, sliderWrapper);
    var listItem = document.createElement("li");
    listItem.id = "li";
    listItem.style = "position: relative; float: left; width: 100% height: 100%";
    imageSlider.appendChild(listItem);
    listItem.appendChild(chart);
    var next = document.getElementById(json.name+"nextImg");
    if(imageSlider.children.length == 1) {
        next.click();
    }
    saveButton.disabled = true;
}

function getSaveComparisonButton(json, container, mode) {
    var saveButton = document.createElement('button');
    saveButton.innerHTML = "save this comparison";
    container.appendChild(saveButton);
    saveButton.style.float = "right";
    if(mode == "graph") {
        var graphId = json.type.I.graphID;
        saveButton.id = "saveComparisonGraph_"+graphId;
        saveButton.setAttribute("onclick", "saveGraphComparison(this);");
	}
	else if(mode == "chart") {
        var overlayId = json.name;
        saveButton.id = "saveComparisonChart_"+overlayId;
        saveButton.setAttribute("onclick", "saveChartComparison(this);");
	}
}

function chooseFile(event) {
    var filePath = event;
    var containerRight = event.parentElement;
    var fileContent = ""; //placeholder for text output
    var containerRight = event.parentElement;
    var graphId = event.getAttribute("id").split("_")[1];
    var json = graphJsons[graphId];
    if(filePath.files && filePath.files[0]) {
        reader.onload = function (e) {
            fileContent = e.target.result;
            var fileName =  filePath.files[0].name;
            var fileExtension = getFileExtension(fileName);
            if(fileExtension !== "txt") {
                showGraphFileFormatAlert();
            }
            else{
                generateRightGraph(fileContent, json, containerRight);
            }
        };//end onload()
        reader.readAsText(filePath.files[0]);
    }//end if html5 filelist support
    else if(ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
        try {
            reader = new ActiveXObject("Scripting.FileSystemObject");
            var file = reader.OpenTextFile(filePath, 1); //ActiveX File Object
            fileContent = file.ReadAll(); //text contents of file
            var fileExtension = file.getExtension();
            file.Close(); //close file "input stream"
            if(fileExtension !== "txt") {
                showGraphFileFormatAlert();
            }
            else{
                generateRightGraph(fileContent, json, containerRight);
            }
        } catch (e) {
            if (e.number == -2146827859) {
                alert('Unable to access local files due to browser security settings. ' +
                    'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' +
                    'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"');
            }
        }
    }
    else { //this is where you could fallback to Java Applet, Flash or similar
        return false;
    }
}

function graphFileSelector(json, containerRight) {
	var containerFileSelect = document.createElement('input');
	containerFileSelect.type =  "file";
	containerFileSelect.id = "graphFileSelector_"+json.type.I.graphID;
	containerRight.appendChild(containerFileSelect);
	getGraphSimilarityFunction(containerRight);
	getSaveComparisonButton(json, containerRight, "graph");
	containerFileSelect.setAttribute("onchange", "chooseFile(this);");
}

function closeDivClick(closeDiv){
    var graphId = closeDiv.getAttribute("id").split("_")[1];
    var json = graphJsons[graphId];
    var canvasRight = document.getElementById("canvasRight"+graphId);
    var containerRight = closeDiv.parentElement;
    containerRight.removeChild(canvasRight);
    var containerRed = getContainerRed(graphId);
    containerRight.appendChild(containerRed);
    containerRight.removeChild(closeDiv);
    var fileSelector = document.getElementById("graphFileSelector_"+graphId);
    fileSelector.value = '';
    document.getElementById(json.name+"Compare").style.background = "#DDDDDD";
}

function generateRightGraph(fileContent, json, containerRight) {
	var graphId = json.type.I.graphID;
	var edgeList = getEdgeList(fileContent);
	if(edgeList != -1) {
		edgeLists["right"+graphId] = edgeList;
	    var canvas = document.createElement('div');
		var canvasId = "canvasRight"+graphId;
		canvas.id = canvasId;
		var containerRed = document.getElementById("containerRed"+graphId);
	    containerRight.removeChild(containerRed);
	    var closeDiv = getCloseDiv(json);
	    containerRight.appendChild(closeDiv);
	    closeDiv.setAttribute("onclick", "closeDivClick(this);");
		containerRight.appendChild(canvas);
		var degreeList = createGraph(json, edgeList, canvasId, false, true);
		displayDegreeOnHover(canvasId, degreeList, true);
		getGraphSimilarityScore(json, degreeList);
		document.getElementById("graphFileSelector_"+graphId).disabled = true;
		document.getElementById("saveComparisonGraph_"+graphId).disabled = false;
	}
	else{
	    var fileSelector = document.getElementById("graphFileSelector_"+graphId);
	    fileSelector.value = '';
	}
	
}

function getGraphSimilarityFunction(containerRight) {
	var formulaLink = document.createElement('a');
	formulaLink.innerHTML = "similarity function";
	containerRight.appendChild(formulaLink);
	formulaLink.target = "_blank";
	formulaLink.href = "data:image/png;base64,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";
}

function intersection(a, b)
{
  var result = [];
  while( a.length > 0 && b.length > 0 )
  {
     if (a[0] < b[0] ) {
        a.shift();
     }
     else if (a[0] > b[0] ){
        b.shift();
     }
     else {
        result.push(a.shift());
        b.shift();
     }
  }
  return result.length;
}


function getGraphSimilarityScore(json, rightGraphDegreeList) {
	var graphId = json.type.I.graphID;
	var leftGraphEdgeList = edgeLists["left"+graphId];
    var leftGraphDegreeList = createGraph(json, leftGraphEdgeList, "", false, false);
	var N_B = Object.keys(rightGraphDegreeList).length;
	var N_A = Object.keys(leftGraphDegreeList).length;
	var AminB = 0;
	var leftSum = 0;
	for(var node in leftGraphDegreeList) {
		if(node in rightGraphDegreeList) {
			var i_AB = 0;
			var neighborsLeft = leftGraphDegreeList[node];
			var neighborsRight = rightGraphDegreeList[node];
			for(var i=0; i < neighborsLeft.length; i++) {
				var neighbor = neighborsLeft[i];
				if(neighborsRight.indexOf(neighbor) != -1) {
					i_AB++;
				}
			}
			var i_A = neighborsLeft.length;
			leftSum += (i_AB/i_A);
		}
		else{
			AminB++;
		}
	}
	var leftEq = (1/(2*N_A))*(leftSum)*(1-(AminB/N_A))*intersection(Object.keys(leftGraphDegreeList), Object.keys(rightGraphDegreeList))/N_B;

	var BminA = 0;
	var rightSum = 0;
	for(var node in rightGraphDegreeList) {
		if(node in leftGraphDegreeList) {
			var i_BA = 0;
			var neighborsRight = rightGraphDegreeList[node];
			var neighborsLeft = leftGraphDegreeList[node];
			for(var i=0; i < neighborsRight.length; i++) {
				var neighbor = neighborsRight[i];
				if(neighborsLeft.indexOf(neighbor) != -1) {
					i_BA++;
				}
			}
			var i_B = neighborsRight.length;
			rightSum += (i_BA/i_B);
		}
		else{
			BminA++;
		}
	}
	var rightEq = (1/(2*N_B))*(rightSum)*(1-(BminA/N_B))*intersection(Object.keys(leftGraphDegreeList), Object.keys(rightGraphDegreeList))/N_A;

	var sim = leftEq + rightEq;
	var pct_sim = Math.max(0, sim*100);
	alert("% similarity = " + pct_sim);
	if(pct_sim > 75) {
		document.getElementById(json.name+"Compare").style.background = "green";
	}
	else{
		document.getElementById(json.name+"Compare").style.background = "red";
	}
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
		console.log(aggr);
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

/*
document.addEventListener("mousewheel", mouseWheelEvent);

function mouseWheelEvent(event) {
	try{
		if(event.ctrlKey) {
			setTimeout(function() {
				zoomGraphs();
			}, 1);
		}
	}
	catch(e) {

	}
}
*/

function zoomGraphs() {
	for(var i = 0; i < Object.keys(edgeLists).length; i++) {
		var canvasId = "canvas"+i;
		var graph = document.getElementById(canvasId);
		var width = graph.clientWidth;
		var height = graph.clientHeight;
		var graphSvg = graph.firstChild;
		var renderer = graphs[canvasId];
		graphSvg.setAttribute("width", width);
		graphSvg.setAttribute("height", height);
		renderer.width = width;
		renderer.height = height;
		renderer.draw();
		var ellipses = graphSvg.getElementsByTagName("ellipse");
		var texts = graphSvg.getElementsByTagName("text");
		for(var j = 0; j < ellipses.length; j++) {
			var ellipse = ellipses[j];
			var text = texts[j];
			var rx = ellipse.getAttribute("rx");
			var cx = ellipse.getAttribute("cx");
			var ry = ellipse.getAttribute("ry");
			var cy = ellipse.getAttribute("cy");
			ellipse.setAttribute("rx", parseInt(rx)*zoomFactor);
			ellipse.setAttribute("ry", parseInt(ry)*zoomFactor);
			text.setAttribute("x", cx);
			text.setAttribute("y", cy);
		}
	}
}

