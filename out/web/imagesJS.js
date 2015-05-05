//redirect alerts to console
function alert(e) {
	throw new Error(e);
}

// Load dim.json
var json;
json = JSON.parse(UTF8ArrToStr(base64DecToArr(dim_base64)));
tmpw = json.width / 655 / 60;
tmph = json.height / 655 / 60;

function replaceAll(str, s, r) {
	return str.split(s).join(r);
}

// Load the database
var tmp = UTF8ArrToStr(base64DecToArr(db_base64));
var tmp2 = dbjson_base64;

if (tmp2 != "") {
	alasql.databases = JSON.parse(tmp2);
}

if (tmp != "") {
	alasql(tmp);
}

// Load config.json
json = JSON.parse(UTF8ArrToStr(base64DecToArr(json_base64)));
var width = (json.type.I.x2 - json.type.I.x1);
var height = (json.type.I.y1 - json.type.I.y2);
outw = tmpw * width;
outh = tmph * height;

$(document.body).css('width', outw);
$(document.body).css('height', outh);

var pageOverlays = [];
parse(json);

function parse(json) {
	page = 0;
	pageOverlay = pageOverlays[page];
	if (typeof pageOverlay == 'undefined') {
		pageOverlay = [];
		pageOverlays[page] = pageOverlay;
	}
	pageOverlay[pageOverlay.length] = json;
}

var zoomFactor = json.type.I.zoom * 1.30 * json.type.I.quality;
var rawZoomFactor = json.type.I.zoom * 1.30 * json.type.I.quality;

function overlay() {
	document.body.innerHTML = '';
	var pageNr = 0;
	for (var i = 0; i < pageOverlays[pageNr].length; ++i) {
		var json = pageOverlays[pageNr][i];
		display(json, document.body, true);
	}
}