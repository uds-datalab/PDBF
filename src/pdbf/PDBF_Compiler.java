package pdbf;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import pdbf.compilers.HTML_PDF_Compiler;
import pdbf.compilers.Pre_Compiler;
import pdbf.compilers.TAR_Compiler;
import pdbf.compilers.VM_Compiler;
import pdbf.misc.MinifyResources;
import pdbf.misc.Tools;

public class PDBF_Compiler {

    // Debug Flag. Cannot be changed by User
    public static boolean includeRes = true;

    private static void showHelp() {
	System.out
		.println("Usage:\n"
			+ "java -jar pdbf.jar LaTeX_file [options]\n"
			+ "Possible options:\n"
			+ "--no-pdf-protection : Disables the protection of the pdf part of the PDBF file\n"
			+ "OR\n"
			+ "java -jar pdbf.jar --vm  PDBF_File.html VM_File.ova\n"
			+ "OR\n"
			+ "java -jar pdbf.jar --tar  PDBF_File.html TAR_File.tar\n"
			+ "For further help visit: https://github.com/uds-datalab/PDBF");
	System.exit(0);
    }

    public static void compile(String[] args) {
	if (includeRes) {
	    MinifyResources.main(args);
	}
	Pre_Compiler.main(args);
	HTML_PDF_Compiler.main(args);
    }

    public static void main(String[] args) {
	// Apache PDFBox uses the Logger class and we need to configure it
	BasicConfigurator.configure();
	Logger.getRootLogger().setLevel(Level.ERROR);

	//
	Pre_Compiler.suffix = Tools.getOS();

	String version = null;
	try {
	    version = FileUtils.readFileToString(new File(Tools.getBaseDir()
		    + "VERSION.md"));
	} catch (IOException e1) {
	    e1.printStackTrace();
	    System.exit(-1);
	}

	// Check for updates
	try {
	    URL url = new URL(
		    "https://raw.githubusercontent.com/uds-datalab/PDBF/gh-pages/VERSION.md");
	    String currentVersion = IOUtils.toString(url.openStream(),
		    StandardCharsets.UTF_8);
	    if (!version.equals(currentVersion)) {
		System.err
			.println(currentVersion
				+ " of PDBF compiler available.\n"
				+ "Please visit https://github.com/uds-datalab/PDBF and download the latest version\n");
	    }
	} catch (Throwable t) {
	    // Do nothing
	}

	// To minimize the possibility that i forget to turn off includeRes
	// before building a release ;)
	if (!includeRes) {
	    System.out.println("!!!!Warning!!!! includeRes is off");
	}
	// Get current time to measure the time it takes to complete the task
	long begin = System.currentTimeMillis();

	if (args[0].equalsIgnoreCase("--version")) {
	    System.out
		    .println("PDBF "
			    + version
			    + "\nVisit https://github.com/uds-datalab/PDBF for more information");
	    System.exit(0);
	} else if (args[0].equalsIgnoreCase("--help")) {
	    showHelp();
	} else if (args[0].equalsIgnoreCase("--tar") && args.length == 3) {
	    TAR_Compiler.main(args);
	    System.exit(0);
	} else if (args[0].equalsIgnoreCase("--vm") && args.length == 3) {
	    VM_Compiler.main(args);
	    System.exit(0);
	} else if (args.length == 1) {
	    Pre_Compiler.pdfProtect = true;
	    compile(args);
	} else if (args.length == 2
		&& args[1].equalsIgnoreCase("--no-pdf-protection")) {
	    Pre_Compiler.pdfProtect = false;
	    compile(args);
	}

	System.out.println("Finished!");
	System.out.println("Took " + (System.currentTimeMillis() - begin)
		+ "ms");
    }
}
