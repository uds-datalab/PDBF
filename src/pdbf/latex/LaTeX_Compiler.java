package pdbf.latex;

import java.io.File;

public class LaTeX_Compiler {

    private static final String pathToTexWorks = "C:\\Program Files (x86)\\MiKTeX 2.9\\miktex\\bin\\texworks.exe";

    public static void main(String[] args) {
	if (args.length != 1) {
	    System.out
		    .println("Usage: Java_Compiler.jar pathToPDF "
			    + System.lineSeparator()
			    + "Assuming that the config.json file is in the same folder");
	    System.exit(-1);
	}
	String latexPath = args[0];
	File latex = new File(latexPath);
	if (!latex.exists()) {
	    System.err.println("Error: Source PDF file does not exist!");
	    System.exit(-1);
	}
	
	try {
	    Process p = Runtime.getRuntime().exec(pathToTexWorks + " " + latex);
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}
	// sp to mm -> 5,36346435546875e-6
    }

}
