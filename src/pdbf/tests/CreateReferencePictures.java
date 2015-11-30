package pdbf.tests;

import java.io.File;
import java.io.IOException;

import pdbf.common.Tools;

public class CreateReferencePictures {

    public static String baseDir = new File(Tools.getBaseDir()).getParent() + File.separator;
    public static String refDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "referenceImages" + File.separator;
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String suffix = Tools.getOS();

    public static void main(String[] args) throws InterruptedException, IOException {
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

	for (File f : Tools.deleteList) {
	    f.delete();
	}
	new File(testDir + "no_pdbf.aux").delete();
	new File(testDir + "no_pdbf.log").delete();
	new File(testDir + "no_pdbf.html").delete();
	new File(testDir + "charts.html").delete();
	for (int i = 0; i < 72; ++i) {
	    new File(testDir + "Overlay" + (i + 1) + ".png").delete();
	}
	for (int i = 0; i < 72; ++i) {
	    new File(baseDir + "Overlay" + (i + 1) + ".png").delete();
	}
	new File(testDir + "dummy.png").delete();
	new File(testDir + "pdbf.sty").delete();
	System.out.println("Finished!");
    }
}
