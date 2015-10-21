package pdbf.tests;

import static org.junit.Assert.fail;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.apache.commons.io.FileUtils;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;

import pdbf.common.Tools;

public class CompileAndCheckIT {
    // TODO: write test for database with ugly "\"values\""

    @Rule
    public TimeTestWatcher watcher = new TimeTestWatcher();

    public class TimeTestWatcher extends TestWatcher {
	private long startTime;

	protected void starting(Description description) {
	    startTime = System.currentTimeMillis();
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
	System.out.println("" + Math.round(p*10000)/100 + "%");
	double errorThreshold = 0.10;
	if (p >= errorThreshold) {
	    System.out.println("Failed! Too much difference to reference picture");
	}
	return p < errorThreshold; // More than 10% difference? Something must be really
			 // wrong. TODO: decrease this further if similarity on
			 // linux gets better
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

    public static void comparePages(String htmlDir, String htmlName) throws IOException, InterruptedException {
	CreateReferencePictures.processes.clear();
	CreateReferencePictures.deleteList.clear();
	// Create current images
	CreateReferencePictures.getReferencePicturesPages(htmlDir, htmlName, baseDir);
	for (Process p : CreateReferencePictures.processes) {
	    p.waitFor();
	    if (p.exitValue() != 0) {
		throw new IllegalStateException();
	    }
	}
	for (File f : CreateReferencePictures.deleteList) {
	    f.delete();
	}
	// Compare current images to reference images
	File dir = new File(baseDir);
	for (File file : dir.listFiles()) {
	    String name = file.getName();
	    if (name.startsWith(htmlName) && name.endsWith(".png")) {
		//TODO: use a thread pool!
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

    public static void compareOverlays(String htmlDir, String htmlName) throws IOException, InterruptedException {
	CreateReferencePictures.processes.clear();
	CreateReferencePictures.deleteList.clear();
	// Create current images
	CreateReferencePictures.getReferencePicturesOverlays(htmlDir, htmlName, baseDir);
	for (Process p : CreateReferencePictures.processes) {
	    p.waitFor();
	    if (p.exitValue() != 0) {
		throw new IllegalStateException("Child process returned error!");
	    }
	}
	for (File f : CreateReferencePictures.deleteList) {
	    f.delete();
	}
	// Compare current images to reference images
	File dir = new File(baseDir);
	for (File file : dir.listFiles()) {
	    String name = file.getName();
	    if (name.startsWith(htmlName) && name.endsWith(".png")) {
		//TODO: use a thread pool!
		BufferedImage i1 = ImageIO.read(file);
		BufferedImage i2 = ImageIO.read(new File(refDir + file.getName()));
		System.out.print(file.getName() + " error percentage: ");
		if (!compareImages(i1, i2)) {
		    fail();
		}
		file.delete();
	    }
	}
    }

    @Test(timeout = 600000)
    public void documentation() throws IOException, InterruptedException {
	File f = new File(baseDir + "pdbf-doc.html");
	f.delete();
	compile(baseDir, "pdbf-doc.tex");
	if (!f.exists()) {
	    fail();
	}
	comparePages(baseDir, "pdbf-doc.html");
	compareOverlays(baseDir, "pdbf-doc.html");
    }

    @Test(timeout = 600000)
    public void minimal() throws IOException, InterruptedException {
	File f = new File(baseDir + "minimal.html");
	f.delete();
	compile(baseDir, "minimal.tex");
	if (!f.exists()) {
	    fail();
	}
	comparePages(baseDir, "minimal.html");
	compareOverlays(baseDir, "minimal.html");
    }

    @Test(timeout = 600000)
    public void noPDBF() throws IOException, InterruptedException {
	File f = new File(testDir + "no_pdbf.html");
	f.delete();
	compile(testDir, "no_pdbf.tex");
	new File(testDir + "no_pdbf.aux").delete();
	new File(testDir + "no_pdbf.log").delete();
	if (!f.exists()) {
	    fail();
	}
	comparePages(testDir, "no_pdbf.html");
	compareOverlays(testDir, "no_pdbf.html");
	new File(testDir + "no_pdbf.html").delete();
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
