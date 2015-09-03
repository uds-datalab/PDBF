package pdbf.html;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class MinifyResources {
	
    public static void main(String[] args) {
	String command[] = {"java", "-jar", "data/compiler.jar", "data/d3.js", "data/c3.js", 
		"data/excanvas.compiled.js", "data/diff_match_patch.js",
		"data/jquery-1.11.2.min.js", "data/pivot.js", "data/jquery-ui-1.9.2.custom.min.js",
		"data/l10n.js", "data/viewer.js", "data/main.js", "data/preMain.js",
		"data/compatibility.js", "data/jstat.js", "data/pdf.js", 
		"--js_output_file", "data/all", "--language_in", "ECMASCRIPT5", "--compilation_level", 
		"WHITESPACE_ONLY", "--charset", "UTF-8"}; 
	
	try {
	    ProcessBuilder pb = new ProcessBuilder(Arrays.asList(command));
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}
	
	try {
	    String all = FileUtils.readFileToString(new File("data/all"), Tools.utf8);
	    String lz = FileUtils.readFileToString(new File("data/lz-string.min.js"), Tools.utf8);
	    String base64JS = FileUtils.readFileToString(new File("data/base64.js"), Tools.utf8);
	    String datatablesJS = FileUtils.readFileToString(new File("data/jquery.dataTables.js"), Tools.utf8);
	    String alasqlJS = FileUtils.readFileToString(new File("data/alasql.js"), Tools.utf8);
	    String codemirrorJS = FileUtils.readFileToString(new File("data/codemirror-compressed.js"), Tools.utf8);
	    String pdfworkerJS = FileUtils.readFileToString(new File("data/pdf.worker.js"), Tools.utf8);
	    String viewerCSS = FileUtils.readFileToString(new File("data/viewer.css"), Tools.utf8);
	    String pivotCSS = FileUtils.readFileToString(new File("data/pivot.css"), Tools.utf8);
	    String datatablesCSS = FileUtils.readFileToString(new File("data/jquery.dataTables.css"), Tools.utf8);
	    String codemirrorCSS = FileUtils.readFileToString(new File("data/codemirror.css"), Tools.utf8);
	    String c3CSS = FileUtils.readFileToString(new File("data/c3.css"), Tools.utf8);
	    
	    String out = pdfworkerJS + base64JS + alasqlJS + "\n" + all + "\n" + codemirrorJS + datatablesJS + lz + "</script><style>" + viewerCSS + pivotCSS + codemirrorCSS + datatablesCSS + c3CSS + "</style>";
	    FileUtils.writeStringToFile(new File("data/all"), out, Tools.utf8, false);
	} catch (IOException e) {
	    e.printStackTrace();
	}
	//TODO: Minify HTML and css
    }

}
