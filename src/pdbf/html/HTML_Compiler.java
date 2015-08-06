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
	    String viewerHEAD = FileUtils.readFileToString(new File("data/template-head-alasql.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File("data/template-tail-alasql.html"), Tools.utf8);
	    String add;
	    if (CompleteRun_HTML.includeRes) {
		add = "</script>";
	    } else {
		add = "</script> <link rel=\"stylesheet\" href=\"viewer.css\"/>" + "<link rel=\"stylesheet\" href=\"pivot.css\"/>" + "<link rel=\"stylesheet\" href=\"codemirror.css\"/>" + "<link rel=\"stylesheet\" href=\"jquery.dataTables.css\"/>" + "<link rel=\"stylesheet\" href=\"c3.css\"/>" + "" + "<script src=\"base64.js\"></script>" + "<script src=\"d3.js\"></script>" + "<script src=\"alasql.js\"></script>" + "<script src=\"codemirror-compressed.js\"></script>"
			+ "<script src=\"c3.js\"></script>" + "<script src=\"excanvas.compiled.js\"></script>" + "<script src=\"diff_match_patch.js\"></script>" + "<script src=\"jquery-1.11.2.min.js\"></script>" + "<script src=\"pivot.js\"></script>" + "<script src=\"jquery-ui-1.9.2.custom.min.js\"></script>" + "<script src=\"jquery.dataTables.js\"></script>" + "<script src=\"main.js\"></script>" + "<script src=\"preMain.js\"></script>" + "<script src=\"jstat.js\"></script>" + ""
			+ "<script src=\"compatibility.js\"></script>" + "<script src=\"l10n.js\"></script>" + "<script src=\"../build/pdf.js\"></script>" + "<script src=\"../build/pdf.worker.js\"></script>" + "<script src=\"viewer.js\"></script>";
	    }
	    String all = FileUtils.readFileToString(new File("data/all"), Tools.utf8);
	    String preload = FileUtils.readFileToString(new File("pdbf-preload"));
	    viewer = viewerHEAD + "pdf_base64 = \"" + Tools.encodeFileToBase64Binary(new File(pdfname)) + "\";\r\n" + "db_base64 = \"" + Tools.encodeFileToBase64Binary(new File("pdbf-db.sql")) + "\";\r\n" + "json_base64 = \"" + Tools.encodeFileToBase64Binary(new File("pdbf-config.json")) + "\";\r\n" + "dbjson_base64 = \"" + Tools.escapeSpecialChars(new File("pdbf-db.json")) + "\";\r\n" + preload + "\r\n" + (CompleteRun_HTML.includeRes ? (all + "\r\n") : ("")) + add + viewerTAIL;
	    //TODO: use here also script instead of comment
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
	    
	    //Delete static pdf to avoid confusion
	    new File(basename + ".pdf").delete();
	} catch (Exception e) {
	    e.printStackTrace();
	}

    }

}
