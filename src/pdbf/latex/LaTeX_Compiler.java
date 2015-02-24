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

	try {
	    ProcessBuilder pb = new ProcessBuilder(pathToLaTeXScript, "--pdf", latex.getAbsolutePath());
	    pb.inheritIO();
	    //pb.redirectError(Redirect.INHERIT);
	    Process p = pb.start();
	    p.waitFor();
	} catch (Exception e) {
	    e.printStackTrace();
	}
	
	//TODO: generate images and then run latex again
    }

}
