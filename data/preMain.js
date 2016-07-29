'use strict';
$(function() {
	var a = document.body.lastChild;
	var b = $("#mozPrintCallback-shim").get(0);
	while (a != b) {
		$(a).remove();
		a = document.body.lastChild;
	}

	var a = document.body.parentElement.lastChild;
	var b = document.body;
	while (a != b) {
		$(a).remove();
		a = document.body.parentElement.lastChild;
	}
});

// Load the database
tic();
var tmp = UTF8ArrToStr(base64DecToArr(db_base64));
var tmp2 = dbjson_base64;

if (tmp2 != "") {
	if (typeof notCompressed != 'undefined') {
		alasql.databases = JSON.parse(tmp2);
	} else {
		alasql.databases = JSON.parse(LZString.decompressFromBase64(tmp2));
	}
}

if (tmp != "") {
	alasql(tmp);
}
toc("DB load time");

var rawZoomFactor;
var zoomFactor;
var init = true;

$(window).resize(fixOverlaySize);

// Load pdbf-config.json
var json = JSON.parse(UTF8ArrToStr(base64DecToArr(json_base64)));
var pageOverlays = [];
for (var i = 0; i < json.length; ++i) {
	parse(json[i]);
}

function parse(json) {
	if (window[json.name]) {
		json.result = window[json.name];
	}
	var page = json.type.I.page;
	var pageOverlay = pageOverlays[page];
	if (typeof pageOverlay == 'undefined') {
		pageOverlay = [];
		pageOverlays[page] = pageOverlay;
	}
	pageOverlay[pageOverlay.length] = json;
}

// function alert(e) {
// var a;
// }

function savePDBF() {
    var link = document.createElement("a");
    var page = document.getElementById("pageContainer" + 1);
    page.appendChild(link);
    var linkText = document.createTextNode("save PDBF");
    link.appendChild(linkText);
    link.id = "savePDBF";
    link.style = "position: absolute; top:10%; left:10%; color:blue;";
    link.href = "";
    link.download = "file.html";
    link.addEventListener('click', function() {
          var source = document.getElementsByTagName('html')[0].outerHTML;
          var encodedSource = btoa(unescape(encodeURIComponent(source))) + pdf_to_port;
          var contentType = 'application/octet-stream';
          var url = "data:"+contentType+";base64,"+encodedSource;
          var downloadLink = document.getElementById("savePDBF");
          downloadLink.href = url;
    }, false);
}

function overlay(pageNr) {
	if (init) {
		rawZoomFactor = 0.8;// PDFViewerApplication.pdfViewer._currentScale;
		init = false;
	}
    //savePDBF();
	if (typeof pageOverlays[pageNr] != 'undefined') {
		var page = document.getElementById("pageContainer" + pageNr);
		for (var i = 0; i < pageOverlays[pageNr].length; ++i) {
			var json = pageOverlays[pageNr][i];
			zoomFactor = PDFViewerApplication.pdfViewer._currentScale * (json.type.I.fontsize/12.0);
			display(json, page, false);
		}
	}
}