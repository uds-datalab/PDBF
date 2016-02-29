package pdbf.tests;

import java.io.File;
import java.util.regex.Pattern;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import pdbf.misc.Tools;

public class CreateReferencePictures {

    public static String baseDir = Tools.getBaseDir();
    public static String refDir = baseDir + "referenceImages" + File.separator;
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String suffix = Tools.getOS();

    public static void main(String[] args) {
	try {
	    // Apache PDFBox uses the Logger class and we need to configure it
	    BasicConfigurator.configure();
	    Logger.getRootLogger().setLevel(Level.ERROR);

	    String[] documents = { "charts", "pdbf-doc", "minimal", "no_pdbf" };
	    String[] documentsDir = { testDir, baseDir, baseDir, testDir };

	    for (int i = 0; i < documents.length; i++) {
		CompileAndCheckIT.compile(documentsDir[i], documents[i] + ".tex");
		Tools.runJsFile("capturePages.js", documentsDir[i], documents[i] + ".html", refDir);
		Tools.runJsFile("captureOverlays.js", documentsDir[i], documents[i] + ".html", refDir);
	    }

	    for (Process p : Tools.processes) {
		p.waitFor();
		if (p.exitValue() != 0) {
		    throw new IllegalStateException("Phantomjs exited with error!");
		}
	    }

	    // Clean up
	    for (File f : Tools.deleteList) {
		f.delete();
	    }
	    new File(testDir + "no_pdbf.aux").delete();
	    new File(testDir + "no_pdbf.log").delete();
	    new File(testDir + "no_pdbf.html").delete();
	    new File(testDir + "charts.html").delete();
	    for (String s : new File(testDir).list()) {
		if (Pattern.matches("Overlay\\d+(Tmp|).(pdf|json|data)", s)) {
		    new File(testDir + s).delete();
		}
	    }
	    for (String s : new File(baseDir).list()) {
		if (Pattern.matches("Overlay\\d+(Tmp|).(pdf|json|data)", s)) {
		    new File(baseDir + s).delete();
		}
	    }
	    new File(testDir + "dummy.pdf").delete();
	    new File(testDir + "pdbf.sty").delete();
	    System.out.println("Finished!");
	} catch (Throwable t) {
	    t.printStackTrace();
	    System.exit(1);
	}
    }

}
