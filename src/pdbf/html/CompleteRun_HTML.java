package pdbf.html;

import java.io.File;

import pdbf.latex.LaTeX_Compiler;

public class CompleteRun_HTML {

    public static void main(String[] args) {
	LaTeX_Compiler.main(args);
	HTML_Compiler.main(args);
	
	new File("dim.json").delete();
	new File("config.json").delete();
	new File("db.sql").delete();
	new File("db.json").delete();
	new File("null.png").delete();
	
	new File("test.aux").delete();
	new File("test.log").delete();
	new File("test.synctex.gz").delete();
	
	new File("beamer_test.aux").delete();
	new File("beamer_test.log").delete();
	new File("beamer_test.nav").delete();
	new File("beamer_test.out").delete();
	new File("beamer_test.snm").delete();
	new File("beamer_test.toc").delete();
	new File("beamer_test.synctex.gz").delete();
	
	System.out.println("Finished!");
    }
    
}
