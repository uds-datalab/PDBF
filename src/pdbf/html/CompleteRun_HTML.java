package pdbf.html;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;

import pdbf.common.Tools;
import pdbf.latex.LaTeX_Compiler;
import pdbf.vm.VM_Compiler;

public class CompleteRun_HTML {

    public static boolean includeRes = true;
    
    public static void main(String[] args) {
	String baseDir = Tools.getBaseDir();
	
	LaTeX_Compiler.suffix = Tools.getOS();
	
	if (!includeRes) {
	    System.out.println("!!!!Warning!!!! includeRes is off");
	}

	if (args.length > 3 || args.length < 1 || args[0].equalsIgnoreCase("--help")) {
	    System.out.println("Usage:\tjava -jar pdbf.jar LaTeX_file\nOR\n\tjava -jar pdbf.jar --vm  PDBF_File.html VM_File.ova\nFor further help visit: https://github.com/uds-datalab/PDBF");
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
	
	new File(baseDir + "pdbf-dim.json").delete();
	new File(baseDir + "pdbf-config.json").delete();
	new File(baseDir + "pdbf-db.sql").delete();
	new File(baseDir + "pdbf-db.json").delete();
	new File(baseDir + "pdbf-preload").delete();
	
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

	new File(baseDir + "pdbf-dim.json").delete();
	new File(baseDir + "pdbf-config.json").delete();
	new File(baseDir + "pdbf-db.sql").delete();
	new File(baseDir + "pdbf-db.json").delete();
	new File(baseDir + "pdbf-preload").delete();

	System.out.println("Finished!");
	System.out.println("Took " + (System.currentTimeMillis() - begin) + "ms");
    }

}
