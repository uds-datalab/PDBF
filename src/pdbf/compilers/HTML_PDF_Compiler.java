package pdbf.compilers;

import java.io.File;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.FileUtils;

import pdbf.PDBF_Compiler;
import pdbf.misc.Tools;

/*
 * Composes all auxiliary files together to one final hybrid HTML/PDF file
 */
public class HTML_PDF_Compiler {

    public static String pdfHTML_Header = "%ª«¬­<!DOCTYPE html><html dir=\"ltr\" mozdisallowselectionprint moznomarginboxes>"
	    + "<head><meta charset=\"utf-8\"><script>\n" + "1337 0 obj\n" + "stream\n";

    public static void main(String[] args) {
	String baseDir = Tools.getBaseDir();
	String baseDirData = Tools.getBaseDirData();

	System.out.println("Compiling HTML...");

	String a = new File(args[0]).getName();
	String filename = a.substring(0, a.length() - 4);
	String basename = args[0].substring(0, args[0].length() - 4);
	String pdfname = baseDir + filename + ".pdf";
	String outfile = basename + ".html";

	try {
	    String viewer;
	    String viewerHEAD = FileUtils.readFileToString(new File(baseDirData + "template-head-alasql.html"), Tools.utf8);
	    String viewerTAIL = FileUtils.readFileToString(new File(baseDirData + "template-tail-alasql.html"), Tools.utf8);
	    String add;
	    if (PDBF_Compiler.includeRes) {
		add = "</script>";
	    } else {
		add = "</script> <link rel=\"stylesheet\" href=\"viewer.css\"/>" + "<link rel=\"stylesheet\" href=\"pivot.css\"/>"
			+ "<link rel=\"stylesheet\" href=\"codemirror.css\"/>" + "<link rel=\"stylesheet\" href=\"jquery.dataTables.css\"/>"
			+ "<link rel=\"stylesheet\" href=\"c3.css\"/>" + "<script src=\"lz-string.min.js\"></script>" + "<script src=\"base64.js\"></script>"
			+ "<script src=\"d3.js\"></script>" + "<script src=\"alasql.js\"></script>" + "<script src=\"codemirror-compressed.js\"></script>"
			+ "<script src=\"c3.js\"></script>" + "<script src=\"excanvas.compiled.js\"></script>"
			+ "<script src=\"diff_match_patch.js\"></script>" + "<script src=\"jquery-1.11.2.min.js\"></script>"
			+ "<script src=\"pivot.js\"></script>" + "<script src=\"jquery-ui-1.9.2.custom.min.js\"></script>"
			+ "<script src=\"jquery.dataTables.js\"></script>" + "<script src=\"main.js\"></script>" + "<script src=\"preMain.js\"></script>"
			+ "<script src=\"jstat.js\"></script>" + "" + "<script src=\"compatibility.js\"></script>" + "<script src=\"l10n.js\"></script>"
			+ "<script src=\"pdf.js\"></script>" + "<script src=\"pdf.worker.js\"></script>" + "<script src=\"viewer.js\"></script>";
	    }
	    String all = FileUtils.readFileToString(new File(baseDirData + "all"), Tools.utf8);
	    String preload = FileUtils.readFileToString(new File(baseDir + "pdbf-preload"));
	    viewer = viewerHEAD + "pdf_base64 = \"" + Tools.encodeFileToBase64Binary(new File(pdfname.substring(0, pdfname.length() - 4) + "Embed.pdf"))
		    + "\";\r\n" + "db_base64 = \"\";\r\n" + "json_base64 = \"" + Tools.encodeFileToBase64Binary(new File(baseDir + "pdbf-config.json"))
		    + "\";\r\n" + "dbjson_base64 = \"" + Tools.escapeSpecialChars(new File(baseDir + "pdbf-db.json")) + "\";\r\n" + preload + "\r\n"
		    + (PDBF_Compiler.includeRes ? (all + "\r\n") : ("")) + add + viewerTAIL;
	    String insert = pdfHTML_Header + "</script>\n" + viewer + "<script>\n" + "endstream\n" + "endobj\n";
	    String pdfcontent = FileUtils.readFileToString(new File(pdfname), StandardCharsets.ISO_8859_1);
	    if (pdfcontent.toLowerCase().contains("</script>")) {
		System.err.println("The generated pdf cannot be used to generate a pdbf document!"
			+ " Try to either change some content in your tex file or try to " + "add \\pdfcompresslevel=8 to your tex file.");
		System.exit(1);
	    }
	    StringBuilder sb = new StringBuilder(pdfcontent);
	    int pdfmarker = sb.indexOf("%PDF-");
	    int pdfmarkerend = sb.indexOf("\n", pdfmarker);
	    sb.insert(pdfmarkerend + 1, insert);

	    int offset = insert.length();
	    Tools.fixXref(sb, offset);

	    FileUtils.writeStringToFile(new File(outfile), sb.toString(), StandardCharsets.ISO_8859_1);

	    Pre_Compiler.cleanup(filename);
	} catch (Exception e) {
	    e.printStackTrace();
	}

    }
}
