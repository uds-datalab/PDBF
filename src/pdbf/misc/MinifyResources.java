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

	String command[] = { "java", "-jar", baseDirData + "google-closure-compiler-20160208.jar", baseDirData + "alasql.js", baseDirData + "base64.js",
		baseDirData + "lz-string.js", baseDirData + "d3.js", baseDirData + "c3.js", baseDirData + "excanvas.compiled.js",
		baseDirData + "diff_match_patch.js", baseDirData + "jquery-3.0.0-beta1.min.js", baseDirData + "pivot.js",
		baseDirData + "jquery-ui-1.9.2.custom.min.js", baseDirData + "l10n.js", baseDirData + "viewer.js", baseDirData + "main.js",
		baseDirData + "preMain.js", baseDirData + "compatibility.js", baseDirData + "jstat.js", baseDirData + "pdf.js",
		baseDirData + "jquery.dataTables.js", baseDirData + "codemirror-compressed.js", "--js_output_file", baseDirData + "all.js", "--language_in",
		"ECMASCRIPT5", "--compilation_level", "WHITESPACE_ONLY", "--charset", "UTF-8" };

	try {
	    new File(baseDirData + "all.js").delete();
	    ProcessBuilder pb = new ProcessBuilder(Arrays.asList(command));
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("Google closure compiler exited with error!");
		System.exit(1);
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}

	new File(baseDirData + "all.css").delete();
	String cssFiles[] = { baseDirData + "viewer.css", baseDirData + "pivot.css", baseDirData + "jquery.dataTables.css", baseDirData + "codemirror.css",
		baseDirData + "c3.css" };
	for (String cssFile : cssFiles) {
	    try {
		String out = FileUtils.readFileToString(new File(cssFile), Tools.utf8);
		FileUtils.writeStringToFile(new File(baseDirData + "all.css"), out, Tools.utf8, true);
	    } catch (IOException e) {
		e.printStackTrace();
		System.exit(1);
	    }
	}

	String command2[] = { "java", "-jar", baseDirData + "yuicompressor-2.4.7.jar", "-o", "all.css", baseDirData + "all.css" };

	try {
	    ProcessBuilder pb = new ProcessBuilder(Arrays.asList(command2));
	    pb.directory(new File(baseDirData));
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("YUI compressor exited with error!");
		System.exit(1);
	    }
	} catch (Exception e) {
	    e.printStackTrace();
	}

	try {
	    String allJS = FileUtils.readFileToString(new File(baseDirData + "all.js"), Tools.utf8);
	    // TODO: for unknown reasons pdfworkerjs breaks on minification with
	    // the google closure compiler
	    String pdfworkerJS = FileUtils.readFileToString(new File(baseDirData + "pdf.worker.js"), Tools.utf8);
	    String allCSS = FileUtils.readFileToString(new File(baseDirData + "all.css"), Tools.utf8);

	    String out = pdfworkerJS + "\n" + allJS + "\n" + "</script><style>" + allCSS + "</style>";
	    new File(baseDirData + "all").delete();
	    FileUtils.writeStringToFile(new File(baseDirData + "all"), out, Tools.utf8, false);
	} catch (IOException e) {
	    e.printStackTrace();
	    System.exit(1);
	}
    }
}
