package pdbf.html;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class HTML_Compiler {

    public static DecimalFormat df = new DecimalFormat("0000000000");

    public static void main(String[] args) {
	System.out.println("Compiling HTML...");

	String a = new File(args[0]).getName();
	String filename = a.substring(0, a.length() - 4);
	String basename = args[0].substring(0, args[0].length() - 4);
	String pdfname = filename + ".pdf";
	String outfile = basename + ".html";

	try {
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File("out/web/templateHEADalasql.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File("out/web/templateTAILalasql.html"), Tools.utf8);
	    if (CompleteRun_HTML.includeRes) {
		viewerTAIL += "</script>";
	    } else {
		viewerTAIL += "</script> <link rel=\"stylesheet\" href=\"viewer.css\"/>" + "<link rel=\"stylesheet\" href=\"pivot.css\"/>" + "<link rel=\"stylesheet\" href=\"codemirror.css\"/>" + "<link rel=\"stylesheet\" href=\"jquery.dataTables.css\"/>" + "<link rel=\"stylesheet\" href=\"c3.css\"/>" + "" + "<script src=\"base64.js\"></script>" + "<script src=\"d3.js\"></script>" + "<script src=\"alasql.js\"></script>" + "<script src=\"codemirror-compressed.js\"></script>"
			+ "<script src=\"c3.js\"></script>" + "<script src=\"excanvas.compiled.js\"></script>" + "<script src=\"diff_match_patch.js\"></script>" + "<script src=\"jquery-1.11.2.min.js\"></script>" + "<script src=\"pivot.js\"></script>" + "<script src=\"jquery-ui-1.9.2.custom.min.js\"></script>" + "<script src=\"jquery.dataTables.js\"></script>" + "<script src=\"main.js\"></script>" + "<script src=\"preMain.js\"></script>" + "<script src=\"jstat.js\"></script>" + ""
			+ "<script src=\"compatibility.js\"></script>" + "<script src=\"l10n.js\"></script>" + "<script src=\"../build/pdf.js\"></script>" + "<script src=\"../build/pdf.worker.js\"></script>" + "<script src=\"viewer.js\"></script>";
	    }
	    String all = FileUtils.readFileToString(new File("out/web/all"), Tools.utf8);
	    String preload = FileUtils.readFileToString(new File("preload"));
	    viewer = viewerHEAD + "pdf_base64 = \"" + Tools.encodeFileToBase64Binary(new File(pdfname)) + "\";\r\n" + "db_base64 = \"" + Tools.encodeFileToBase64Binary(new File("db.sql")) + "\";\r\n" + "json_base64 = \"" + Tools.encodeFileToBase64Binary(new File("config.json")) + "\";\r\n" + "dbjson_base64 = \"" + Tools.escapeQuotes(new File("db.json")) + "\";\r\n" + preload + "\r\n" + (CompleteRun_HTML.includeRes ? (all + "\r\n") : ("")) + viewerTAIL;
	    String insert1 = "%<!DOCTYPE html><html dir=\"ltr\" mozdisallowselectionprint moznomarginboxes>" + "<head><meta charset=\"utf-8\"><!--\n";
	    String insert2 = "1337 0 obj\n" + "stream\n" + "-->\n" + viewer + "<!--\n" + "endstream\n" + "endobj\n";
	    StringBuilder sb = new StringBuilder(FileUtils.readFileToString(new File(pdfname), StandardCharsets.ISO_8859_1));
	    int pdfmarker = sb.indexOf("%PDF-");
	    int pdfmarkerend = sb.indexOf("\n", pdfmarker);
	    sb.insert(pdfmarkerend + 1, insert2);
	    sb.insert(pdfmarkerend + 1, insert1);

	    // Fix xref
	    int offset = (insert1.length() + insert2.length());
	    int b = sb.lastIndexOf("\nxref\n") + "\nxref\n".length();
	    int e;
	    int x;
	    // skip first entry
	    b = sb.indexOf("\n", b + 1) + 1;
	    e = sb.indexOf(" ", b);
	    try {
		while (true) {
		    b = sb.indexOf("\n", b + 1) + 1;
		    e = sb.indexOf(" ", b);
		    String tmp = sb.substring(b, e);
		    x = Integer.parseInt(tmp);
		    sb.replace(b, e, df.format(x + offset));
		}
	    } catch (NumberFormatException ex) {
	    }

	    b = sb.indexOf("startxref\n") + "startxref\n".length();
	    e = sb.indexOf("\n", b);
	    x = Integer.parseInt(sb.substring(b, e));
	    sb.replace(b, e, "" + (x + offset));

	    FileUtils.writeStringToFile(new File(outfile), sb.toString(), StandardCharsets.ISO_8859_1);
	} catch (Exception e) {
	    e.printStackTrace();
	}

    }

    // TODO: htmlentities problem
    // function load() {
    // var pageSource = new XMLSerializer().serializeToString(document);
    // var begin = pageSource.indexOf("%PDF-");
    // var end = pageSource.lastIndexOf("%%EOF");
    // pdfstring = pageSource.substring(begin, end+5);
    //
    // var entities = [
    // ['apos', '\''],
    // ['amp', '&'],
    // ['lt', '<'],
    // ['gt', '>'],
    // ['quot', '\"']
    // ];
    //
    // for (var i = 0, max = entities.length; i < max; ++i)
    // pdfstring = pdfstring.replace(new RegExp('&'+entities[i][0]+';', 'g'),
    // entities[i][1]);
    //
    // var bla = pdfstring.split("\n");
    // for (var i=0; i<bla.length; ++i) {
    // if (bla[i].indexOf("&") != -1 && bla[i].indexOf(";") != -1)
    // console.log(bla[i]);
    // }
    //
    // PDFViewerApplication.open(strToUTF8Arr(pdfstring), 0);
    // }

}
