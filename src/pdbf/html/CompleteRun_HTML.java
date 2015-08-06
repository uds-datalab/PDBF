package pdbf.html;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;

import pdbf.latex.LaTeX_Compiler;
import pdbf.vm.VM_Compiler;

public class CompleteRun_HTML {

    public static boolean includeRes = true;
    
    public static void main(String[] args) {
	if (LaTeX_Compiler.OS.contains("win")) {
	    LaTeX_Compiler.suffix = "win";
	} else if (LaTeX_Compiler.OS.contains("mac")) {
	    LaTeX_Compiler.suffix = "mac";
	} else if (LaTeX_Compiler.OS.contains("nix") || LaTeX_Compiler.OS.contains("nux") || LaTeX_Compiler.OS.contains("aix")) {
	    LaTeX_Compiler.suffix = "unix";
	} else {
	    System.err.println("Sorry, your operating system is not supported!");
	    System.exit(-1);
	}

	if (args[0].equalsIgnoreCase("--help") || args.length > 3 || args.length < 1) {
	    System.out.println("Usage:\tjava -jar PDBF.jar LaTeX_file\nOR\n\tjava -jar PDBF.jar --vm  PDBF_File.html VM_File.ova\nFor further help visit: https://github.com/uds-datalab/PDBF");
	    System.exit(0);
	}
	
	if (args[0].equalsIgnoreCase("--version")) {
	    try {
		System.out.println("PDBF "+FileUtils.readFileToString(new File("VERSION.md"))+"\nhttps://github.com/uds-datalab/PDBF");
	    } catch (IOException e) {
		e.printStackTrace();
	    }
	    System.exit(0);
	}
	
	if (args[0].equalsIgnoreCase("--vm")) {
	    VM_Compiler.main(args);
	    System.exit(0);
	}
	
	long begin = System.currentTimeMillis();
	
	if (includeRes) {
	    MinifyResources.main(args);
	}
	
	LaTeX_Compiler.main(args);
	HTML_Compiler.main(args);

	new File("pdbf-dim.json").delete();
	new File("pdbf-config.json").delete();
	new File("pdbf-db.sql").delete();
	new File("pdbf-db.json").delete();
	new File("null.png").delete();
	new File("pdbf-preload").delete();

	System.out.println("Finished!");
	System.out.println("Took " + (System.currentTimeMillis() - begin) + "ms");
    }

}
