package pdbf.html;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class MinifyResources {
	
    public static void main(String[] args) {
	String command[] = {"java", "-jar", "lib/compiler.jar", "out/web/d3.js", "out/web/c3.js", 
		"out/web/excanvas.compiled.js", "out/web/diff_match_patch.js",
		"out/web/jquery-1.11.2.min.js", "out/web/pivot.js", "out/web/jquery-ui-1.9.2.custom.min.js",
		"out/web/l10n.js", "out/web/viewer.js", "out/web/main.js", "out/web/preMain.js",
		"out/web/compatibility.js", "out/web/jstat.js",
		"--js_output_file", "out/web/all", "--language_in", "ECMASCRIPT5", "--compilation_level", 
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
	    String all = FileUtils.readFileToString(new File("out/web/all"), Tools.utf8);
	    
	    String base64JS = FileUtils.readFileToString(new File("out/web/base64.js"), Tools.utf8);
	    String pdfJS = FileUtils.readFileToString(new File("out/build/pdf.js"), Tools.utf8);
	    String datatablesJS = FileUtils.readFileToString(new File("out/web/jquery.dataTables.js"), Tools.utf8);
	    String alasqlJS = FileUtils.readFileToString(new File("out/web/alasql.js"), Tools.utf8);
	    String codemirrorJS = FileUtils.readFileToString(new File("out/web/codemirror-compressed.js"), Tools.utf8);
	    String pdfworkerJS = FileUtils.readFileToString(new File("out/build/pdf.worker.js"), Tools.utf8);
	    String viewerCSS = FileUtils.readFileToString(new File("out/web/viewer.css"), Tools.utf8);
	    String pivotCSS = FileUtils.readFileToString(new File("out/web/pivot.css"), Tools.utf8);
	    String datatablesCSS = FileUtils.readFileToString(new File("out/web/jquery.dataTables.css"), Tools.utf8);
	    String codemirrorCSS = FileUtils.readFileToString(new File("out/web/codemirror.css"), Tools.utf8);
	    String c3CSS = FileUtils.readFileToString(new File("out/web/c3.css"), Tools.utf8);
	    
	    String out = pdfJS + pdfworkerJS + base64JS + alasqlJS + "\n" + all + "\n" + codemirrorJS + datatablesJS + "</script><style>" + viewerCSS + pivotCSS + codemirrorCSS + datatablesCSS + c3CSS + "</style>";
	    FileUtils.writeStringToFile(new File("out/web/all"), out, Tools.utf8, false);
	} catch (IOException e) {
	    e.printStackTrace();
	}
	//TODO: Minify HTML and css
    }

}
