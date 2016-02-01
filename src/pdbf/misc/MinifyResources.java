package pdbf.misc;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import org.apache.commons.io.FileUtils;

/*
 * Compiles a minimal version of the javascript files that are included in PDBF files. Uses the google closure compiler
 */
public class MinifyResources {

    public static void main(String[] args) {
	String baseDirData = Tools.getBaseDirData();

	String command[] = { "java", "-jar", baseDirData + "compiler.jar", baseDirData + "d3.js", baseDirData + "c3.js", baseDirData + "excanvas.compiled.js",
		baseDirData + "diff_match_patch.js", baseDirData + "jquery-1.11.2.min.js", baseDirData + "pivot.js",
		baseDirData + "jquery-ui-1.9.2.custom.min.js", baseDirData + "l10n.js", baseDirData + "viewer.js", baseDirData + "main.js",
		baseDirData + "preMain.js", baseDirData + "compatibility.js", baseDirData + "jstat.js", baseDirData + "pdf.js", "--js_output_file",
		baseDirData + "all", "--language_in", "ECMASCRIPT5", "--compilation_level", "WHITESPACE_ONLY", "--charset", "UTF-8" };

	try {
	    ProcessBuilder pb = new ProcessBuilder(Arrays.asList(command));
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("Google closure compiler exited with error!");
		System.exit(-1);
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}

	try {
	    // TODO: for unknown reasons some files break when we minify them.
	    // Therefore we include them without minification
	    String all = FileUtils.readFileToString(new File(baseDirData + "all"), Tools.utf8);
	    String lz = FileUtils.readFileToString(new File(baseDirData + "lz-string.min.js"), Tools.utf8);
	    String base64JS = FileUtils.readFileToString(new File(baseDirData + "base64.js"), Tools.utf8);
	    String datatablesJS = FileUtils.readFileToString(new File(baseDirData + "jquery.dataTables.js"), Tools.utf8);
	    String alasqlJS = FileUtils.readFileToString(new File(baseDirData + "alasql.js"), Tools.utf8);
	    String codemirrorJS = FileUtils.readFileToString(new File(baseDirData + "codemirror-compressed.js"), Tools.utf8);
	    String pdfworkerJS = FileUtils.readFileToString(new File(baseDirData + "pdf.worker.js"), Tools.utf8);
	    String viewerCSS = FileUtils.readFileToString(new File(baseDirData + "viewer.css"), Tools.utf8);
	    String pivotCSS = FileUtils.readFileToString(new File(baseDirData + "pivot.css"), Tools.utf8);
	    String datatablesCSS = FileUtils.readFileToString(new File(baseDirData + "jquery.dataTables.css"), Tools.utf8);
	    String codemirrorCSS = FileUtils.readFileToString(new File(baseDirData + "codemirror.css"), Tools.utf8);
	    String c3CSS = FileUtils.readFileToString(new File(baseDirData + "c3.css"), Tools.utf8);

	    String out = lz + pdfworkerJS + base64JS + alasqlJS + "\n" + all + "\n" + codemirrorJS + "\n" + datatablesJS + "</script><style>" + viewerCSS
		    + pivotCSS + codemirrorCSS + datatablesCSS + c3CSS + "</style>";
	    FileUtils.writeStringToFile(new File(baseDirData + "all"), out, Tools.utf8, false);
	} catch (IOException e) {
	    e.printStackTrace();
	}
	// TODO: Minify HTML and css
    }

}
