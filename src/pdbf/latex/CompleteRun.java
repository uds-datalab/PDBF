package pdbf.latex;

import pdbf.html.HTML_Compiler;

public class CompleteRun {

    public static void main(String[] args) {
	System.out.println("Compile LaTeX...");
	LaTeX_Compiler.main(args);
	System.out.println("Compile HTML...");
	HTML_Compiler.main(args);
	System.out.println("Finished!");
    }
    
}
