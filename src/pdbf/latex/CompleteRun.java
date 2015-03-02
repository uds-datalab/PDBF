package pdbf.latex;

import java.io.File;

import pdbf.html.HTML_Compiler;

public class CompleteRun {

    public static void main(String[] args) {
	LaTeX_Compiler.main(args);
	HTML_Compiler.main(args);
	new File("dim.json").delete();
	new File("config.json").delete();
	new File("db.sql").delete();
	System.out.println("Finished!");
    }
    
}
