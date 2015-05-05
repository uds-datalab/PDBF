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
toc("Base64 decode time for DB");
tic();
if (tmp2 != "") {
	alasql.databases = JSON.parse(tmp2);
}
if (tmp != "") {
	alasqlQuery(tmp);
}
toc("DB load time");

var rawZoomFactor;
var zoomFactor;
var init = true;

$(window).resize(fixOverlaySize);

// Load config.json
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

function overlay(pageNr) {
	if (init) {
		rawZoomFactor = 1.25;// PDFViewerApplication.pdfViewer._currentScale;
		init = false;
	}

	if (typeof pageOverlays[pageNr] != 'undefined') {
		var page = document.getElementById("pageContainer" + pageNr);
		for (var i = 0; i < pageOverlays[pageNr].length; ++i) {
			var json = pageOverlays[pageNr][i];
			zoomFactor = PDFViewerApplication.pdfViewer._currentScale * json.type.I.zoom;
			display(json, page, false);
		}
	}
}