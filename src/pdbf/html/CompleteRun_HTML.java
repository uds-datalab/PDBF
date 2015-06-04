package pdbf.html;

import java.io.File;

import pdbf.latex.LaTeX_Compiler;

public class CompleteRun_HTML {

    public static boolean includeRes = true;
    
    public static void main(String[] args) {
	long begin = System.currentTimeMillis();
	
	if (includeRes) {
	    MinifyResources.main(args);
	}
	
	LaTeX_Compiler.main(args);
	HTML_Compiler.main(args);

	new File("dim.json").delete();
	new File("config.json").delete();
	new File("db.sql").delete();
	new File("db.json").delete();
	new File("null.png").delete();
	new File("preload").delete();

	System.out.println("Finished!");
	System.out.println("Took " + (System.currentTimeMillis() - begin) + "ms");
    }

}
