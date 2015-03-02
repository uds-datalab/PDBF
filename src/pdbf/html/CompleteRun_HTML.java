package pdbf.html;

import java.io.File;

import pdbf.latex.LaTeX_Compiler;

public class CompleteRun_HTML {

    public static void main(String[] args) {
	LaTeX_Compiler.main(args);
	HTML_Compiler.main(args);
	//new File("dim.json").delete();
	//new File("config.json").delete();
	//new File("db.sql").delete();
	//new File("null.png").delete();
	System.out.println("Finished!");
    }
    
}
