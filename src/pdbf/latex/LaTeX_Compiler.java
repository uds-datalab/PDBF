package pdbf.latex;

import java.io.File;
import java.lang.ProcessBuilder.Redirect;

public class LaTeX_Compiler {

    private static final String pathToLaTeXScript = "texify.exe";

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

	System.out.println("Compiling LaTeX (1/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(pathToLaTeXScript, "--pdf", "--quiet", latex.getAbsolutePath());
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}
	
	//TODO: generate images
	
	System.out.println("Compiling LaTeX (2/2)...");
	try {
	    ProcessBuilder pb = new ProcessBuilder(pathToLaTeXScript, "--pdf", "--quiet", latex.getAbsolutePath());
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}
    }

}
