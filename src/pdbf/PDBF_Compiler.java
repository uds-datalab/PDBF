package pdbf;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.apache.commons.cli.AlreadySelectedException;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.OptionGroup;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import pdbf.compilers.HTML_PDF_Compiler;
import pdbf.compilers.Pre_Compiler;
import pdbf.compilers.TAR_Compiler;
import pdbf.compilers.VM_Compiler;
import pdbf.misc.Tools;

public class PDBF_Compiler {

    // This flag indicates if all js and css files from data folder are included
    // in the compiled PDBF document
    public static boolean includeRes = true;

    public static void main(String[] args) throws AlreadySelectedException {
	// Apache PDFBox uses the Logger class and we need to configure it
	BasicConfigurator.configure();
	Logger.getRootLogger().setLevel(Level.ERROR);

	// Get name of the operating system
	Pre_Compiler.suffix = Tools.getOS();

	String version = null;
	try {
	    version = FileUtils.readFileToString(new File(Tools.getBaseDir() + "VERSION.md"));
	} catch (IOException e1) {
	    e1.printStackTrace();
	    System.exit(1);
	}

	// Check for updates
	try {
	    URL url = new URL("https://raw.githubusercontent.com/uds-datalab/PDBF/gh-pages/VERSION.md");
	    String currentVersion = IOUtils.toString(url.openStream(), StandardCharsets.UTF_8);
	    if (!version.equals(currentVersion)) {
		System.err.println(currentVersion + " of PDBF compiler available.\n"
			+ "Please visit https://github.com/uds-datalab/PDBF and download the latest version\n");
	    }
	} catch (Throwable t) {
	    // Do nothing
	}

	// Get current time to measure the time it takes to complete the task
	long begin = System.currentTimeMillis();

	// Parse command line
	CommandLineParser parser = new DefaultParser();
	HelpFormatter formatter = new HelpFormatter();
	Options options = new Options();
	OptionGroup optionsGroup = new OptionGroup();
	options.addOptionGroup(optionsGroup);
	optionsGroup.addOption(Option.builder("c").longOpt("compile").numberOfArgs(1).argName("LaTeX_File.tex")
		.desc("Compile a tex file to a PDBF document. This is the default option.").build());
	options.addOption("npp", "no-pdf-protection", false,
		"Disables the write protection of the pdf part of the PDBF document. Can only be used with the compile option.");
	options.addOption("nir", "no-include-res", false, "Disables the inclusion of all js and css files."
		+ " Produces a PDBF document that can only be opened when placed in the data folder of the PDBF framework."
		+ " Can only be used with the compile option.");
	optionsGroup.addOption(Option.builder("t").longOpt("tar").numberOfArgs(2).argName("PDBF_File.html> <TAR_File.tar")
		.desc("Appends a tar archive to an existing PDBF document.").build());
	options.addOption("v", "version", false, "Display version number");
	options.addOption("h", "help", false, "Display this help message");

	try {
	    // Parse the command line arguments
	    CommandLine line = parser.parse(options, args, false);
	    if (line.hasOption("no-pdf-protection")) {
		System.out.println("no-pdf-protection set");
		Pre_Compiler.pdfProtect = false;
	    } else {
		Pre_Compiler.pdfProtect = true;
	    }

	    if (line.hasOption("no-include-res")) {
		includeRes = false;
	    } else {
		includeRes = true;
	    }

	    if (line.hasOption("version")) {
		System.out.println("PDBF " + version + "\nVisit https://github.com/uds-datalab/PDBF for more information");
		System.exit(0);
	    } else if (line.hasOption("help")) {
		formatter.printHelp("java -jar pdbf.jar [options]", options);
	    } else if (line.hasOption("tar")) {
		TAR_Compiler.main(line.getOptionValues("tar"));
	    } else if (line.hasOption("vm")) {
		VM_Compiler.main(line.getOptionValues("vm"));
	    } else if (line.hasOption("compile")) {
		Pre_Compiler.main(line.getOptionValues("compile"));
		HTML_PDF_Compiler.main(line.getOptionValues("compile"));
	    } else if (args.length == 1) {
		Pre_Compiler.main(args);
		HTML_PDF_Compiler.main(args);
	    } else {
		formatter.printHelp("java -jar pdbf.jar [options]", options);
		System.exit(0);
	    }
	    System.out.println("Finished!");
	    System.out.println("Took " + (System.currentTimeMillis() - begin) + "ms");
	    System.exit(0);
	} catch (ParseException exp) {
	    System.out.println(exp.getMessage());
	    formatter.printHelp("java -jar pdbf.jar [options]", options);
	}
    }
}
