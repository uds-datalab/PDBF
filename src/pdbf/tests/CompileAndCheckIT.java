package pdbf.tests;

import static org.junit.Assert.fail;

import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import javax.activation.FileDataSource;
import javax.imageio.ImageIO;

import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.io.FileUtils;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.apache.pdfbox.preflight.PreflightDocument;
import org.apache.pdfbox.preflight.ValidationResult;
import org.apache.pdfbox.preflight.ValidationResult.ValidationError;
import org.apache.pdfbox.preflight.exception.SyntaxValidationException;
import org.apache.pdfbox.preflight.parser.PreflightParser;

import pdbf.common.Tools;
import pdbf.html.CompleteRun_HTML;
import pdbf.vm.VM_Compiler;

public class CompileAndCheckIT {
    // TODO: write test for database with ugly "\"values\""

    @Rule
    public TimeTestWatcher watcher = new TimeTestWatcher();

    public class TimeTestWatcher extends TestWatcher {
	private long startTime;

	protected void starting(Description description) {
	    System.out.println("Starting test: " + description.getMethodName());
	    startTime = System.currentTimeMillis();
	    if (!CompleteRun_HTML.includeRes) {
		System.out.println("Test failed because includeRes is off!");
		fail();
	    }
	}

	protected void finished(Description description) {
	    long elapsed = System.currentTimeMillis() - startTime;
	    String testName = description.getMethodName();
	    System.out.println(String.format("Test %s took %d ms.", testName, elapsed));
	}
    };

    public static String baseDir = new File(Tools.getBaseDir()).getParent() + File.separator;
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String refDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "referenceImages" + File.separator;

    public static boolean compareImages(BufferedImage i1, BufferedImage i2) {
	int height = i1.getHeight();
	int width = i1.getWidth();
	if (height != i2.getHeight()) {
	    return false;
	}
	if (width != i2.getWidth()) {
	    return false;
	}
	int sum = 0;
	for (int y = 0; y < height; y++) {
	    for (int x = 0; x < width; x++) {
		int color1 = i1.getRGB(x, y);
		int color2 = i2.getRGB(x, y);
		int r1 = (color1 & 0xFF0000) >> 16;
		int r2 = (color2 & 0xFF0000) >> 16;
		int g1 = (color1 & 0x00FF00) >> 8;
		int g2 = (color2 & 0x00FF00) >> 8;
		int b1 = (color1 & 0x0000FF);
		int b2 = (color2 & 0x0000FF);
		sum += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
	    }
	}
	double n = width * height * 3;
	double p = sum / n / 255.0;
	System.out.println("" + Math.round(p * 10000) / 100.0 + "%");
	double errorThreshold = 0.03;
	if (p >= errorThreshold) {
	    System.out.println("Failed! Too much difference to reference picture");
	}
	return p < errorThreshold; // More than 3% difference? Something must
				   // be really wrong. 
    }

    public static void compile(String texDir, String texName) throws IOException, InterruptedException {
	ProcessBuilder pb = new ProcessBuilder("java", "-jar", baseDir + "pdbf.jar", texName);
	pb.directory(new File(texDir));
	pb.inheritIO();
	Process p = pb.start();
	p.waitFor();
	if (p.exitValue() != 0) {
	    fail();
	}
    }

    public static void compareImages(String jsName, String htmlDir, String htmlName) throws IOException, InterruptedException {
	Tools.processes.clear();
	Tools.deleteList.clear();
	// Create current images
	Tools.runJsFile(jsName, htmlDir, htmlName, baseDir);
	for (Process p : Tools.processes) {
	    p.waitFor();
	    if (p.exitValue() != 0) {
		throw new IllegalStateException();
	    }
	}
	for (File f : Tools.deleteList) {
	    f.delete();
	}
	// Compare current images to reference images
	File dir = new File(baseDir);
	for (File file : dir.listFiles()) {
	    String name = file.getName();
	    if (name.startsWith(htmlName) && name.endsWith(".png")) {
		// TODO: use a thread pool!
		BufferedImage i1 = ImageIO.read(file);
		BufferedImage i2 = ImageIO.read(new File(refDir + name));
		System.out.print(file.getName() + " error percentage: ");
		if (!compareImages(i1, i2)) {
		    fail();
		}
		file.delete();
	    }
	}
    }

    public static void checkHTML(String htmlDir, String htmlName) throws IOException, InterruptedException {
	compareImages("capturePages.js", htmlDir, htmlName);
	compareImages("captureOverlays.js", htmlDir, htmlName);
    }
    
    public static void checkPDF(String pdfDir, String pdfName) throws IOException {
	ValidationResult result = null;

	FileDataSource fd = new FileDataSource(pdfDir + pdfName);
	PreflightParser parser = new PreflightParser(fd);
	try {
	    parser.parse();

	    PreflightDocument document = parser.getPreflightDocument();

	    result = document.getResult();
	    document.close();

	} catch (SyntaxValidationException e) {
	    result = e.getResult();
	}

	if (result.isValid()) {
	    System.out.println("Finished checkPDF successfully");
	} else {
	    System.out.println("The file is not valid, error(s) :");
	    for (ValidationError error : result.getErrorsList()) {
		System.out.println(error.getErrorCode() + " : " + error.getDetails());
	    }
	    fail();
	}
    }

    public static void checkTAR(String tarDir, String tarName) throws IOException {
	String tarFile = tarDir + tarName;
	TarArchiveInputStream tis = new TarArchiveInputStream(new BufferedInputStream(new FileInputStream(tarFile)));
	while (tis.getNextEntry() != null) {
	    byte data[] = new byte[8192];
	    while (tis.read(data) != -1) {
		// Do nothing
	    }
	}
	tis.close();
	System.out.println("Finished checkTAR successfully");
    }

    public static void documentTest(String baseDir, String baseName, boolean withVM) throws IOException, InterruptedException {
	File f = new File(baseDir + baseName + ".html");
	File f2 = new File(baseDir + baseName + ".pdf");
	File f3 = new File(baseDir + baseName + ".ova");
	f.delete();
	f2.delete();
	f3.delete();
	compile(baseDir, baseName + ".tex");
	if (!f.exists()) {
	    fail();
	}
	if (withVM) {
	    String[] args = { "", baseDir + baseName + ".html", CompileAndCheckIT.baseDir + "vldb-Invaders.ova" };
	    VM_Compiler.main(args);
	    f.delete();
	    FileUtils.moveFile(f3, f);
	}
	checkHTML(baseDir, baseName + ".html");
	FileUtils.moveFile(f, f2);
	checkPDF(baseDir, baseName + ".pdf");
	FileUtils.moveFile(f2, f);
	new File(baseDir + ".aux").delete();
	new File(baseDir + ".log").delete();
	new File(baseDir + ".out").delete();
	new File(baseDir + ".toc").delete();
    }

    @Test(timeout = 600000)
    public void documentation() throws IOException, InterruptedException {
	documentTest(baseDir, "pdbf-doc", true);
	checkTAR(baseDir, "pdbf-doc.html");
    }

    @Test(timeout = 600000)
    public void minimal() throws IOException, InterruptedException {
	documentTest(baseDir, "minimal", false);
    }

    @Test(timeout = 600000)
    public void noPDBF() throws IOException, InterruptedException {
	documentTest(testDir, "no_pdbf", false);
	new File(testDir + "no_pdbf.html").delete();
	new File(testDir + "pdbf.sty").delete();
	new File(testDir + "dummy.png").delete();
    }

    @Test(timeout = 300000)
    public void compileOtherDir() throws IOException, InterruptedException {
	// Create Folder and copy tex file
	String otherFolder = baseDir + "otherFolder" + File.separator;
	new File(otherFolder).mkdirs();
	FileUtils.copyFile(new File(baseDir + "minimal.tex"), new File(otherFolder + "minimal.tex"));
	compile(otherFolder, "minimal.tex");
	if (!new File(otherFolder + "minimal.html").exists()) {
	    fail();
	}
	// Delete test folder and contents
	FileUtils.deleteDirectory(new File(otherFolder));
    }

}
