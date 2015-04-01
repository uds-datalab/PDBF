package pdbf.html;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;

public class MinifyResources {

    public static void main(String[] args) {
	String command[] = {"java", "-jar", "lib/compiler.jar", "out/web/base64.js", "out/web/compatibility.js", "out/web/dygraphs.js", "out/web/alasql.js", 
		"out/web/excanvas.compiled.js", "out/web/diff_match_patch.js",
		"out/web/jquery-1.11.2.min.js", "out/web/pivot.js", "out/web/jquery-ui-1.9.2.custom.min.js",
		"out/web/l10n.js", "out/web/viewer.js", "out/web/preMain.js", "out/web/main.js",
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
	    String pdfJS = FileUtils.readFileToString(new File("out/build/pdf.js"), Tools.utf8);
	    String codemirrorJS = FileUtils.readFileToString(new File("out/web/codemirror-compressed.js"), Tools.utf8);
	    String pdfworkerJS = FileUtils.readFileToString(new File("out/build/pdf.worker.js"), Tools.utf8);
	    String viewerCSS = FileUtils.readFileToString(new File("out/web/viewer.css"), Tools.utf8);
	    String pivotCSS = FileUtils.readFileToString(new File("out/web/pivot.css"), Tools.utf8);
	    String codemirrorCSS = FileUtils.readFileToString(new File("out/web/codemirror.css"), Tools.utf8);
	    String out = pdfJS + pdfworkerJS + codemirrorJS + "</script><style>" + viewerCSS + pivotCSS + codemirrorCSS + "</style>";
	    FileUtils.writeStringToFile(new File("out/web/all"), out, Tools.utf8, true);
	} catch (IOException e) {
	    e.printStackTrace();
	}
	//TODO: Minify HTML and css
    }

}
