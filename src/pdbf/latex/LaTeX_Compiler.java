package pdbf.latex;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import pdbf.common.Chart;
import pdbf.common.Overlay;
import pdbf.common.Tools;
import pdbf.common.Visualization;
import pdbf.common.VisualizationTypeAdapter;

public class LaTeX_Compiler {

    private static final String[] pathToLaTeXScript = { "texify.exe", "--pdf", "--quiet" };
    private static String OS = System.getProperty("os.name").toLowerCase();

    public static void main(String[] args) {
	String suffix = null;
	if (OS.contains("win")) {
	    suffix = "win";
	} else if (OS.contains("mac")) {
	    suffix = "mac";
	} else if (OS.contains("nix") || OS.contains("nux") || OS.contains("aix")) {
	    suffix = "unix";
	} else {
	    System.err.println("Sorry, your operating system is not supported!");
	    System.exit(-1);
	}

	if (args.length != 1) {
	    System.out.println("Usage: Java_Compiler.jar pathToPDF " + System.lineSeparator() + "Assuming that the config.json file is in the same folder");
	    System.exit(-1);
	}
	String latexPath = args[0];
	File latex = new File(latexPath);
	if (!latex.exists()) {
	    System.err.println("Error: Source PDF file does not exist!");
	    System.exit(-1);
	}

	ArrayList<String> commands = new ArrayList<String>(Arrays.asList(pathToLaTeXScript));
	commands.add(latex.getAbsolutePath());

	String base = FilenameUtils.getBaseName(latex.getName());
	new File(base + ".aux").delete();
	new File(base + ".log").delete();
	new File(base + ".out").delete();
	new File(base + ".pdf").delete();
	new File(base + ".synctex.gz").delete();
	
	//TODO: clean working dir after work!
	
	System.out.println("Compiling LaTeX (1/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(commands);
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}

	System.out.println("Generating Images...");
	// Read JSON
	GsonBuilder builder = new GsonBuilder();
	builder.registerTypeAdapter(Visualization.class, new VisualizationTypeAdapter());
	Gson gson = builder.create();
	Overlay[] overlays = null;
	try {
	    String json = FileUtils.readFileToString(new File("config.json"), Tools.utf8);
	    overlays = gson.fromJson(json, Overlay[].class);
	} catch (Exception e) {
	    e.printStackTrace();
	}
	if (overlays == null) {
	    System.err.println("Error: Deserialization failed!");
	    System.exit(-1);
	}
	// Split
	ArrayList<Process> processes = new ArrayList<Process>(overlays.length);
	for (int i = 0; i < overlays.length; ++i) {
	    if (!(overlays[i].type instanceof Chart)) {
		continue;
	    }
	    try {
		String viewer;
		String viewerHEAD = FileUtils.readFileToString(new File("templateHEADimages.html"), Tools.utf8);
		String viewerTAIL = FileUtils.readFileToString(new File("templateTAILimages.html"), Tools.utf8);
		viewer = viewerHEAD + 
			"dim_base64 = \"" + Tools.encodeFileToBase64Binary(new File("dim.json")) + "\";\r\n" + 
			"json_base64 = \"" + Tools.encodeStringToBase64Binary(gson.toJson(overlays[i])) + "\";\r\n" + 
			"db_base64 = \"" + Tools.encodeFileToBase64Binary(new File("db.sql")) + "\";\r\n" + 
			viewerTAIL;
		FileUtils.writeStringToFile(new File("" + i + ".html"), viewer, Tools.utf8);
	    } catch (Exception e) {
		e.printStackTrace();
	    }
	    try {
		ProcessBuilder pb = new ProcessBuilder("external-tools/phantomjs-" + suffix, "capture.js", "" + i + ".html");
		pb.inheritIO();
		Process p = pb.start();
		processes.add(p);
	    } catch (Exception e) {
		e.printStackTrace();
	    }
	}

	for (Process p : processes) {
	    try {
		p.waitFor();
	    } catch (InterruptedException e) {
		e.printStackTrace();
	    }
	}

	System.out.println("Compiling LaTeX (2/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(commands);
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

}
