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
	System.out.println("Minifying resources...");
	String baseDir = new File("").getAbsolutePath() + File.separator;
	String baseDirData = baseDir + "data" + File.separator;
	String suffix = Tools.getOS();

	String command[] = { "java", "-jar", baseDirData + "google-closure-compiler-20160208.jar", baseDirData + "alasql.js", baseDirData + "base64.js",
		baseDirData + "lz-string.js", baseDirData + "d3.js", baseDirData + "c3.js", baseDirData + "excanvas.compiled.js",
		baseDirData + "diff_match_patch.js", baseDirData + "jquery-3.0.0-beta1.min.js", baseDirData + "pivot.js",
		baseDirData + "jquery-ui-1.9.2.custom.min.js", baseDirData + "l10n.js", baseDirData + "viewer.js", baseDirData + "main.js",
		baseDirData + "preMain.js", baseDirData + "compatibility.js", baseDirData + "jstat.js", baseDirData + "pdf.js",
		baseDirData + "jquery.dataTables.js", "--js_output_file", baseDirData + "all.js", "--language_in", "ECMASCRIPT5", "--compilation_level",
		"WHITESPACE_ONLY", "--charset", "UTF-8" };

	try {
	    new File(baseDirData + "all.js").delete();
	    String raphaelMinJS = FileUtils.readFileToString(new File(baseDirData + "raphael-min.js"), Tools.utf8);
	   	//String jQueryJS = FileUtils.readFileToString(new File(baseDirData + "jquery-1.4.2.min.js"), Tools.utf8);
		String draculaGraffleJS = FileUtils.readFileToString(new File(baseDirData + "dracula_graffle.js"), Tools.utf8);
	   	String draculaGraph = FileUtils.readFileToString(new File(baseDirData + "dracula_graph.js"), Tools.utf8);
	    // TODO: for unknown reasons pdfworkerjs breaks on minification with
	    // the google closure compiler
	    String pdfworkerJS = FileUtils.readFileToString(new File(baseDirData + "pdf.worker.js"), Tools.utf8);
	    // TODO: for unknown reasons codemirror breaks on minification with
	    // google closure compiler (the blinking cursor contains strange character)
	    String codemirror = FileUtils.readFileToString(new File(baseDirData + "codemirror-compressed.js"), Tools.utf8);

	    ProcessBuilder pb = new ProcessBuilder(Arrays.asList(command));
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		System.err.println("Google closure compiler exited with error!");
		System.exit(1);
	    }

	    String allJS = FileUtils.readFileToString(new File(baseDirData + "all.js"), Tools.utf8);
	    FileUtils.writeStringToFile(new File(baseDirData + "all.js"), pdfworkerJS + "\n" + codemirror + "\n" + allJS +
	    		"\n" + raphaelMinJS + "\n"  + draculaGraffleJS + "\n" + draculaGraph, Tools.utf8);
	    } catch (Exception e) {
	    e.printStackTrace();
	    System.exit(1);
	}

	// Combine all css files to all.css
	new File(baseDirData + "all.css").delete();
	String cssFiles[] = { baseDirData + "viewer.css", baseDirData + "pivot.css", baseDirData + "jquery.dataTables.css", baseDirData + "codemirror.css",
		baseDirData + "c3.css" };
	for (String cssFile : cssFiles) {
	    try {
		String out = FileUtils.readFileToString(new File(cssFile), Tools.utf8);
		FileUtils.writeStringToFile(new File(baseDirData + "all.css"), out + "\n", Tools.utf8, true);
	    } catch (IOException e) {
		e.printStackTrace();
		System.exit(1);
	    }
	}

	// Compress css files
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
	    System.exit(1);
	}

	// Compress javascript files
	try {
	    ProcessBuilder pb = new ProcessBuilder(baseDir + "external-tools" + File.separator + "phantomjs-" + suffix, baseDir + "external-tools"
		    + File.separator + "compress.js");
	    pb.inheritIO();
	    pb.directory(new File(baseDirData));
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}

	// Combine js and css to one file
	try {
	    String allJS = FileUtils.readFileToString(new File(baseDirData + "all.js"), Tools.utf8);
	    String allCSS = FileUtils.readFileToString(new File(baseDirData + "all.css"), Tools.utf8);

	    String out = allJS + "</script><style>" + allCSS + "</style>";
	    new File(baseDirData + "all").delete();
	    FileUtils.writeStringToFile(new File(baseDirData + "all"), out, Tools.utf8, false);
	} catch (IOException e) {
	    e.printStackTrace();
	    System.exit(1);
	}
	new File(baseDirData + "all.css").delete();
	new File(baseDirData + "all.js").delete();
	System.out.println("Done");
    }
}
