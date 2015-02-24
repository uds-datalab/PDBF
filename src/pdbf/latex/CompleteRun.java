package pdbf.latex;

import pdbf.html.HTML_Compiler;

public class CompleteRun {

    public static void main(String[] args) {
	LaTeX_Compiler.main(args);
	HTML_Compiler.main(args);
	System.out.println("Finished!");
    }
    
}
