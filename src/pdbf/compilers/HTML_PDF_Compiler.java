package pdbf.compilers;

import java.io.File;
import java.io.FileWriter;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map.Entry;

import org.apache.commons.io.FileUtils;

import pdbf.PDBF_Compiler;
import pdbf.misc.Tools;

/*
 * Composes all auxiliary files together to one final hybrid HTML/PDF file
 */
public class HTML_PDF_Compiler {

    public static String pdfHTML_Header = "%ª«¬­<!DOCTYPE html><html dir=\"ltr\" mozdisallowselectionprint moznomarginboxes>"
	    + "<head><meta charset=\"utf-8\"><script>\n" + "1337 0 obj\n" + "stream\n" + "</script>\n";

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
			+ "<link rel=\"stylesheet\" href=\"c3.css\"/>" + "<script src=\"lz-string.js\"></script>" + "<script src=\"base64.js\"></script>"
			+ "<script src=\"d3.js\"></script>" + "<script src=\"alasql.js\"></script>" + "<script src=\"codemirror-compressed.js\"></script>"
			+ "<script src=\"c3.js\"></script>" + "<script src=\"excanvas.compiled.js\"></script>"
			+ "<script src=\"diff_match_patch.js\"></script>" + "<script src=\"jquery-3.0.0-beta1.min.js\"></script>"
			+ "<script src=\"pivot.js\"></script>" + "<script src=\"jquery-ui-1.9.2.custom.min.js\"></script>"
			+ "<script src=\"jquery.dataTables.js\"></script>" + "<script src=\"main.js\"></script>" + "<script src=\"preMain.js\"></script>"
			+ "<script src=\"jstat.js\"></script>" + "" + "<script src=\"compatibility.js\"></script>" + "<script src=\"l10n.js\"></script>"
			+ "<script src=\"pdf.js\"></script>" + "<script src=\"pdf.worker.js\"></script>" + "<script src=\"viewer.js\"></script>" 
			+ "<script src=\"raphael-min.js\"></script>" + "<script src=\"dracula_graffle.js\"></script>"
			+ "<script src=\"dracula_graph.js\"></script>";
		}
	    String all = FileUtils.readFileToString(new File(baseDirData + "all"), Tools.utf8);
	    String preload = FileUtils.readFileToString(new File(baseDir + "pdbf-preload"));
	    String json = FileUtils.readFileToString(new File(baseDir + "pdbf-config.json"), Tools.utf8);

	    HashMap<Integer, String> attachments = new Pre_Compiler().getEncodedAttachments();
	    HashMap<Integer, String> attachmentFileNames = new Pre_Compiler().getAttachmentFileNames();
	    for(int attachmentID = 0; attachmentID < attachments.size(); attachmentID++) {    
	    	json = json.replace("\"base64encodedFile\":" + "\"" + attachmentID + "\"",
		    		"\"base64encodedFile\":" + "\"" + attachments.get(attachmentID) + "\"");
		    json = json.replace("\"fileName\":" + "\"" + attachmentID + "\"",
		    		"\"fileName\":" + "\"" + attachmentFileNames.get(attachmentID) + "\"");
	    }
	    
	    HashMap<Integer, String> graphs = new Pre_Compiler().getGraphs();
	    for(Entry<Integer, String> entry : graphs.entrySet()) {
	    	int graphID = entry.getKey();
	    	String edgeList = entry.getValue();
	    	json = json.replace("\"edgeList\":" + "\"" + graphID + "\"",
		    		"\"edgeList\":" + "\"" + edgeList + "\"");   	
	    }
	    
	    HashMap<Integer, String> customImageGraphs = new Pre_Compiler().getCustomImageGraphs();
	    for(Entry<Integer, String> entry : customImageGraphs.entrySet()) {
	    	int graphID = entry.getKey();
	    	String base64encodedFile = entry.getValue();
	    	json = json.replace("\"base64encodedFile\":" + "\"" + graphID + "\"",
		    		"\"base64encodedFile\":" + "\"" + base64encodedFile + "\"");   	
	    }
	    
	    File file = new File(baseDir + "pdbf-config.json");
		FileWriter fileWriter = new FileWriter(file);
		fileWriter.write(json);
		fileWriter.flush();
		fileWriter.close();
		json = Tools.encodeFileToBase64Binary(new File(baseDir + "pdbf-config.json"));

		String pdfcontent = FileUtils.readFileToString(new File(pdfname), StandardCharsets.ISO_8859_1);
		if (pdfcontent.toLowerCase().contains("</script>")) {
			System.err.println("The generated pdf cannot be used to generate a pdbf document!"
					+ " Try to either change some content in your tex file or try to " + "add \\pdfcompresslevel=8 to your tex file.");
			System.exit(1);
		}
		StringBuilder sb = new StringBuilder(pdfcontent);
		String pdfToPort = sb.toString();
		FileUtils.writeStringToFile(new File("pdfToPort.pdf"), pdfToPort, StandardCharsets.ISO_8859_1);

		viewer = viewerHEAD + "pdf_base64 = \"" + Tools.encodeFileToBase64Binary(new File(pdfname.substring(0, pdfname.length() - 4) + "Embed.pdf"))
		    + "\";\r\n" + "db_base64 = \"\";\r\n" + "json_base64 = \"" + json + "\";\r\n" + "pdf_to_port = \"" + Tools.encodeFileToBase64Binary(new File("pdfToPort.pdf"))
		    + "\";\r\n" + "dbjson_base64 = \"" + Tools.escapeSpecialChars(new File(baseDir + "pdbf-db.json")) + "\";\r\n" + preload + "\r\n"
		    + (PDBF_Compiler.includeRes ? (all + "\r\n") : ("")) + add + viewerTAIL;

	    String insert = pdfHTML_Header + viewer + "<script>\n" + "endstream\n" + "endobj\n";

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
