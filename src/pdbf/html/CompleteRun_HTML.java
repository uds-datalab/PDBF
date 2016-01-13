package pdbf.html;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import pdbf.common.Tools;
import pdbf.latex.LaTeX_Compiler;
import pdbf.vm.VM_Compiler;

public class CompleteRun_HTML {

    public static boolean includeRes = true;

    public static void main(String[] args) {
	BasicConfigurator.configure();
	Logger.getRootLogger().setLevel(Level.ERROR);

	LaTeX_Compiler.suffix = Tools.getOS();

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

	if (!includeRes) {
	    System.out.println("!!!!Warning!!!! includeRes is off");
	}

	if (args.length > 4 || args.length < 1
		|| args[0].equalsIgnoreCase("--help")) {
	    System.out
		    .println("Usage:\n"
			    + "java -jar pdbf.jar LaTeX_file [options]\n"
			    + "Possible options:\n"
			    + "--no-pdf-protection : Disables the protection of the pdf part of the PDBF file\n"
			    + "OR\n"
			    + "java -jar pdbf.jar --vm  PDBF_File.html VM_File.ova\n"
			    + "For further help visit: https://github.com/uds-datalab/PDBF");
	    System.exit(0);
	}

	if (args[0].equalsIgnoreCase("--version")) {
	    System.out
		    .println("PDBF "
			    + version
			    + "\nVisit https://github.com/uds-datalab/PDBF for more information");
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

	System.out.println("Finished!");
	System.out.println("Took " + (System.currentTimeMillis() - begin)
		+ "ms");
    }

}
