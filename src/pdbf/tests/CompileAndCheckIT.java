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
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.pdfbox.preflight.PreflightDocument;
import org.apache.pdfbox.preflight.ValidationResult;
import org.apache.pdfbox.preflight.ValidationResult.ValidationError;
import org.apache.pdfbox.preflight.exception.SyntaxValidationException;
import org.apache.pdfbox.preflight.parser.PreflightParser;

import pdbf.PDBF_Compiler;
import pdbf.misc.Tools;

public class CompileAndCheckIT {
    // TODO: write test for database with ugly "\"values\""

    static {
	// Apache PDFBox uses the Logger class and we need to configure it
	BasicConfigurator.configure();
	Logger.getRootLogger().setLevel(Level.ERROR);
    }

    @Rule
    public TimeTestWatcher watcher = new TimeTestWatcher();

    public class TimeTestWatcher extends TestWatcher {
	private long startTime;

	protected void starting(Description description) {
	    System.out.println("Starting test: " + description.getMethodName());
	    startTime = System.currentTimeMillis();
	    if (!PDBF_Compiler.includeRes) {
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

    public static String baseDir = Tools.getBaseDir();
    public static String testDir = baseDir + "src" + File.separator + "pdbf" + File.separator + "tests" + File.separator;
    public static String refDir = baseDir + "referenceImages" + File.separator;

    public static void compareImages(BufferedImage i1, BufferedImage i2) {
	int height = i1.getHeight();
	int width = i1.getWidth();
	if (height != i2.getHeight()) {
	    fail("Failed! Height of picture does not match height of the reference picture");
	}
	if (width != i2.getWidth()) {
	    fail("Failed! Width of picture does not match width of the reference picture");
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
	    // More than 3% difference? Something must be really wrong.
	    fail("Failed! Too much difference to reference picture");
	}
    }

    public static void compile(String texDir, String texName) throws IOException, InterruptedException {
	ProcessBuilder pb = new ProcessBuilder("java", "-jar", baseDir + "pdbf.jar", texName);
	pb.directory(new File(texDir));
	pb.inheritIO();
	Process p = pb.start();
	p.waitFor();
	if (p.exitValue() != 0) {
	    fail("PDBF compiler exited with error!");
	}
    }

    public static void compareImages(String jsName, String htmlDir, String htmlName) throws IOException, InterruptedException {
	Tools.processes.clear();
	Tools.deleteList.clear();
	// Clear old images
	File dir = new File(baseDir);
	for (File file : dir.listFiles()) {
	    String name = file.getName();
	    if (name.startsWith(htmlName) && name.endsWith(".png")) {
		file.delete();
	    }
	}
	// Create current images
	Tools.runJsFile(jsName, htmlDir, htmlName, baseDir);
	for (Process p : Tools.processes) {
	    p.waitFor();
	    if (p.exitValue() != 0) {
		for (Process p2 : Tools.processes) {
		    p2.destroy();
		}
		fail("Phantomjs exited with error!");
	    }
	}
	for (File f : Tools.deleteList) {
	    f.delete();
	}
	// Compare current images to reference images
	for (File file : dir.listFiles()) {
	    String name = file.getName();
	    if (name.startsWith(htmlName) && name.endsWith(".png")) {
		// TODO: use a thread pool!
		BufferedImage i1 = ImageIO.read(file);
		BufferedImage i2 = ImageIO.read(new File(refDir + name));
		System.out.print(file.getName() + " error percentage: ");
		compareImages(i1, i2);
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
	    System.err.println("The file is not valid, error(s) :");
	    for (ValidationError error : result.getErrorsList()) {
		System.err.println(error.getErrorCode() + " : " + error.getDetails());
		fail(error.getErrorCode() + " : " + error.getDetails());
	    }
	    fail("PDF file not valid, but no validation error was output");
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
	    fail("Compile failed");
	}
	if (withVM) {
	    ProcessBuilder pb = new ProcessBuilder("java", "-jar", baseDir + "pdbf.jar", "--vm", baseDir + baseName + ".html", CompileAndCheckIT.baseDir + "vldb-Invaders.ova");
	    pb.directory(new File(baseDir));
	    pb.inheritIO();
	    Process p = pb.start();
	    p.waitFor();
	    if (p.exitValue() != 0) {
		fail("PDBF compiler exited with error!");
	    }
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

    @Test(timeout = 1800000)
    public void documentation() throws IOException, InterruptedException {
	documentTest(baseDir, "pdbf-doc", true);
	checkTAR(baseDir, "pdbf-doc.html");
    }

    @Test(timeout = 1800000)
    public void minimal() throws IOException, InterruptedException {
	documentTest(baseDir, "minimal", false);
    }

    @Test(timeout = 1800000)
    public void charts() throws IOException, InterruptedException {
	documentTest(testDir, "charts", false);
    }

    @Test(timeout = 1800000)
    public void noPDBF() throws IOException, InterruptedException {
	documentTest(testDir, "no_pdbf", false);
	new File(testDir + "no_pdbf.html").delete();
	new File(testDir + "pdbf.sty").delete();
	new File(testDir + "dummy.pdf").delete();
    }

    @Test(timeout = 1800000)
    public void compileOtherDir() throws IOException, InterruptedException {
	// Create Folder and copy tex file
	String otherFolder = baseDir + "otherFolder" + File.separator;
	new File(otherFolder).mkdirs();
	FileUtils.copyFile(new File(baseDir + "minimal.tex"), new File(otherFolder + "minimal.tex"));
	documentTest(otherFolder, "minimal", false);
	if (!new File(otherFolder + "minimal.html").exists()) {
	    fail("Compile failed");
	}
	// Delete test folder and contents
	FileUtils.deleteDirectory(new File(otherFolder));
    }

}
